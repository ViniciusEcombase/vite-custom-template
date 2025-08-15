// supabase/functions/analyze-reviews/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};
// Configuration constants
const FULL_ANALYSIS_THRESHOLD_DAYS = 30;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;
serve(async (req) => {
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders,
    });
  }
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Method not allowed',
      }),
      {
        status: 405,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
  try {
    // Validate environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!supabaseUrl || !supabaseServiceKey || !geminiApiKey) {
      throw new Error('Missing required environment variables');
    }
    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
    // Parse request body
    const { variant_id } = await req.json().catch(() => ({}));
    if (!variant_id) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'variant_id is required',
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }
    // Step 1: Fetch unanalyzed reviews for this variant
    const unanalyzedReviews = await fetchUnanalyzedReviews(
      supabase,
      variant_id
    );
    if (!unanalyzedReviews || unanalyzedReviews.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No new reviews to analyze',
          variant_id: variant_id,
          processed: 0,
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }
    // Step 2: Analyze individual reviews (AI call for each new review)
    const analyzedReviews = await analyzeIndividualReviews(
      unanalyzedReviews,
      geminiApiKey
    );
    // Step 3: Get existing summary data
    const existingSummary = await getExistingSummary(supabase, variant_id);
    // Step 4: Decide between incremental update or full re-analysis
    const needsFullAnalysis = shouldPerformFullAnalysis(
      existingSummary,
      analyzedReviews.length
    );
    let finalSummary;
    let processType;
    if (needsFullAnalysis) {
      // Step 5a: Perform full analysis
      const allReviews = await fetchAllAnalyzedReviews(supabase, variant_id);
      finalSummary = await performFullAnalysis(
        [...allReviews, ...analyzedReviews],
        geminiApiKey
      );
      processType = 'full';
    } else {
      // Step 5b: Perform incremental analysis
      finalSummary = await performIncrementalAnalysis(
        existingSummary,
        analyzedReviews,
        geminiApiKey
      );
      processType = 'incremental';
    }
    // Step 6: Update database with all changes in a transaction
    await updateDatabaseWithResults(
      supabase,
      variant_id,
      analyzedReviews,
      finalSummary,
      existingSummary,
      processType === 'full'
    );
    return new Response(
      JSON.stringify({
        success: true,
        message: `Analysis completed (${processType})`,
        variant_id: variant_id,
        reviews_processed: analyzedReviews.length,
        overall_sentiment: finalSummary.sentiment,
        analysis_type: processType,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Internal server error',
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
// Step 1: Fetch unanalyzed reviews
async function fetchUnanalyzedReviews(supabase, variant_id) {
  const { data, error } = await supabase
    .from('product_reviews')
    .select('id, variant_id, rating, title, content, created_at')
    .eq('variant_id', variant_id)
    .eq('is_analyzed', false)
    .order('created_at', {
      ascending: true,
    });
  if (error) {
    throw new Error(`Failed to fetch unanalyzed reviews: ${error.message}`);
  }
  return data || [];
}
// Step 2: Analyze individual reviews with AI
async function analyzeIndividualReviews(reviews, apiKey) {
  const analyzedReviews = [];
  for (const review of reviews) {
    try {
      const analysis = await analyzeIndividualReviewWithRetry(review, apiKey);
      analyzedReviews.push({
        ...review,
        ai_sentiment: analysis.sentiment,
        ai_themes: analysis.themes,
        ai_confidence: analysis.confidence,
      });
    } catch (error) {
      console.error(`Failed to analyze review ${review.id}:`, error);
      // Mark as failed but continue processing
      analyzedReviews.push({
        ...review,
        ai_sentiment: null,
        ai_themes: null,
        ai_confidence: 0,
      });
    }
  }
  return analyzedReviews;
}
async function analyzeIndividualReviewWithRetry(review, apiKey) {
  let lastError;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await analyzeIndividualReview(review, apiKey);
    } catch (error) {
      lastError = error;
      if (attempt < MAX_RETRIES) {
        await sleep(RETRY_DELAY * attempt);
      }
    }
  }
  throw lastError;
}
async function analyzeIndividualReview(review, apiKey) {
  const prompt = `Analyze this single product review and extract sentiment and themes.

Review:
Title: ${review.title || 'No title'}
Rating: ${review.rating}/5
Content: ${review.content}

Provide analysis as JSON:

{
  "sentiment": 7.5,
  "themes": ["Fast shipping", "Good quality", "Poor packaging"],
  "confidence": 0.85
}

Requirements:
- sentiment: 0-10 scale (0=very negative, 10=very positive)
- themes: 2-4 specific themes mentioned (both positive and negative)
- confidence: 0-1 scale for analysis confidence

Respond with ONLY the JSON object.`;
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 300,
        },
      }),
    }
  );
  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }
  const json = await response.json();
  const aiText = json.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!aiText) {
    throw new Error('Empty response from Gemini API');
  }
  const jsonMatch = aiText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('No JSON found in AI response');
  }
  const parsed = JSON.parse(jsonMatch[0]);
  // Validate and sanitize
  const sentiment = Math.max(0, Math.min(10, parsed.sentiment || 5));
  const category =
    sentiment <= 3 ? 'negative' : sentiment <= 6 ? 'neutral' : 'positive';
  return {
    sentiment,
    themes: Array.isArray(parsed.themes) ? parsed.themes.slice(0, 4) : [],
    confidence: Math.max(0, Math.min(1, parsed.confidence || 0.5)),
    category,
  };
}
// Step 3: Get existing summary
async function getExistingSummary(supabase, variant_id) {
  const { data, error } = await supabase
    .from('ai_review_summaries')
    .select('*')
    .eq('variant_id', variant_id)
    .single();
  if (error && error.code !== 'PGRST116') {
    throw new Error(`Failed to fetch existing summary: ${error.message}`);
  }
  return data;
}
// Step 4: Decision logic for full vs incremental
function shouldPerformFullAnalysis(existingSummary, newReviewsCount) {
  // No existing summary = first time analysis
  if (!existingSummary) return true;
  // Check if it's been more than 30 days since last full analysis
  if (existingSummary.last_full_analysis_at) {
    const lastFullAnalysis = new Date(existingSummary.last_full_analysis_at);
    const daysSinceFullAnalysis =
      (Date.now() - lastFullAnalysis.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceFullAnalysis >= FULL_ANALYSIS_THRESHOLD_DAYS) {
      return true;
    }
  }
  // Otherwise, use incremental
  return false;
}
// Step 5a: Full analysis
async function fetchAllAnalyzedReviews(supabase, variant_id) {
  const { data, error } = await supabase
    .from('product_reviews')
    .select(
      'id, variant_id, rating, title, content, created_at, ai_sentiment, ai_themes, ai_confidence'
    )
    .eq('variant_id', variant_id)
    .eq('is_analyzed', true)
    .not('ai_sentiment', 'is', null);
  if (error) {
    throw new Error(`Failed to fetch analyzed reviews: ${error.message}`);
  }
  return data || [];
}
async function performFullAnalysis(allReviews, apiKey) {
  const validReviews = allReviews.filter((r) => r.ai_sentiment !== null);
  if (validReviews.length === 0) {
    return {
      sentiment: 5,
      summary: 'No valid reviews to analyze',
      positiveThemes: [],
      negativeThemes: [],
      confidence: 0,
    };
  }
  // Calculate basic stats
  const avgSentiment =
    validReviews.reduce((sum, r) => sum + r.ai_sentiment, 0) /
    validReviews.length;
  // Collect all themes
  const allThemes = validReviews
    .flatMap((r) => r.ai_themes || [])
    .filter((theme) => typeof theme === 'string' && theme.length > 0);
  // Create summary with AI
  const reviewsSample = validReviews
    .slice(0, 20) // Use sample to avoid token limits
    .map(
      (r) =>
        `Rating: ${r.rating}/5, Sentiment: ${r.ai_sentiment}/10, Themes: [${
          r.ai_themes?.join(', ') || ''
        }]`
    )
    .join('\n');
  const prompt = `Create a comprehensive summary for a product based on all review analyses.

Review Statistics:
- Total reviews: ${validReviews.length}
- Average sentiment: ${avgSentiment.toFixed(1)}/10
- Sample analyses:
${reviewsSample}

Create a summary in JSON format:

{
  "sentiment": ${avgSentiment.toFixed(1)},
  "summary": "Comprehensive summary of customer feedback...",
  "positiveThemes": ["Top positive themes"],
  "negativeThemes": ["Top negative themes"],
  "confidence": 0.9
}

Respond with ONLY the JSON object.`;
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 800,
          },
        }),
      }
    );
    if (response.ok) {
      const json = await response.json();
      const aiText = json.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      const jsonMatch = aiText?.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          sentiment: avgSentiment,
          summary: parsed.summary || 'Product analysis completed',
          positiveThemes: Array.isArray(parsed.positiveThemes)
            ? parsed.positiveThemes.slice(0, 5)
            : [],
          negativeThemes: Array.isArray(parsed.negativeThemes)
            ? parsed.negativeThemes.slice(0, 5)
            : [],
          confidence: Math.max(0, Math.min(1, parsed.confidence || 0.7)),
        };
      }
    }
  } catch (error) {
    console.warn('AI summary generation failed, using fallback');
  }
  // Fallback to rule-based summary
  return createRuleBasedSummary(validReviews, avgSentiment);
}
// Step 5b: Incremental analysis
async function performIncrementalAnalysis(existingSummary, newReviews, apiKey) {
  if (!existingSummary) {
    throw new Error('No existing summary for incremental analysis');
  }
  const validNewReviews = newReviews.filter((r) => r.ai_sentiment !== null);
  if (validNewReviews.length === 0) {
    // Return existing summary if no valid new reviews
    return {
      sentiment: existingSummary.overall_sentiment || 5,
      summary: existingSummary.summary_text || 'No new valid reviews',
      positiveThemes: existingSummary.positive_themes || [],
      negativeThemes: existingSummary.negative_themes || [],
      confidence: existingSummary.analysis_confidence,
    };
  }
  // Calculate weighted sentiment
  const existingCount = existingSummary.total_reviews;
  const newCount = validNewReviews.length;
  const totalCount = existingCount + newCount;
  const newSentimentSum = validNewReviews.reduce(
    (sum, r) => sum + r.ai_sentiment,
    0
  );
  const weightedSentiment =
    (existingSummary.sentiment_sum + newSentimentSum) / totalCount;
  // Use AI to merge insights
  const newThemes = validNewReviews.flatMap((r) => r.ai_themes || []);
  const newReviewsSample = validNewReviews
    .slice(0, 5)
    .map((r) => `Rating: ${r.rating}/5, Sentiment: ${r.ai_sentiment}/10`)
    .join('\n');
  const prompt = `Update an existing product review summary with new reviews.

EXISTING SUMMARY (${existingCount} reviews):
- Sentiment: ${existingSummary.overall_sentiment}/10
- Summary: ${existingSummary.summary_text}
- Positive themes: [${existingSummary.positive_themes?.join(', ') || ''}]
- Negative themes: [${existingSummary.negative_themes?.join(', ') || ''}]

NEW REVIEWS (${newCount} reviews):
- New weighted sentiment: ${weightedSentiment.toFixed(1)}/10
- Sample new reviews:
${newReviewsSample}
- New themes: [${newThemes.join(', ')}]

Create updated summary in JSON:

{
  "sentiment": ${weightedSentiment.toFixed(1)},
  "summary": "Updated summary incorporating new feedback...",
  "positiveThemes": ["Updated positive themes"],
  "negativeThemes": ["Updated negative themes"],
  "confidence": 0.8
}

Respond with ONLY the JSON object.`;
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 600,
          },
        }),
      }
    );
    if (response.ok) {
      const json = await response.json();
      const aiText = json.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      const jsonMatch = aiText?.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          sentiment: weightedSentiment,
          summary:
            parsed.summary ||
            existingSummary.summary_text ||
            'Updated analysis',
          positiveThemes: Array.isArray(parsed.positiveThemes)
            ? parsed.positiveThemes.slice(0, 5)
            : [],
          negativeThemes: Array.isArray(parsed.negativeThemes)
            ? parsed.negativeThemes.slice(0, 5)
            : [],
          confidence: Math.max(0, Math.min(1, parsed.confidence || 0.7)),
        };
      }
    }
  } catch (error) {
    console.warn('AI incremental analysis failed, using rule-based fallback');
  }
  // Fallback to rule-based update
  return createIncrementalRuleBasedSummary(
    existingSummary,
    validNewReviews,
    weightedSentiment
  );
}
// Step 6: Database transaction
async function updateDatabaseWithResults(
  supabase,
  variant_id,
  analyzedReviews,
  summary,
  existingSummary,
  isFullAnalysis
) {
  // Start transaction-like operations
  // 1. Update individual reviews with AI analysis
  for (const review of analyzedReviews) {
    const { error: reviewError } = await supabase
      .from('product_reviews')
      .update({
        ai_sentiment: review.ai_sentiment,
        ai_themes: review.ai_themes,
        ai_confidence: review.ai_confidence,
        is_analyzed: true,
      })
      .eq('id', review.id);
    if (reviewError) {
      console.error(`Failed to update review ${review.id}:`, reviewError);
    }
  }
  // 2. Calculate new aggregated statistics
  const validNewReviews = analyzedReviews.filter(
    (r) => r.ai_sentiment !== null
  );
  const newSentimentSum = validNewReviews.reduce(
    (sum, r) => sum + r.ai_sentiment,
    0
  );
  const newReviewIds = analyzedReviews.map((r) => r.id);
  // Update sentiment distribution
  const newDistribution = validNewReviews.reduce(
    (dist, r) => {
      const category =
        r.ai_sentiment <= 3
          ? 'negative'
          : r.ai_sentiment <= 6
          ? 'neutral'
          : 'positive';
      dist[category]++;
      return dist;
    },
    {
      positive: 0,
      neutral: 0,
      negative: 0,
    }
  );
  // Update theme counts
  const newThemeCounts = {};
  validNewReviews.forEach((r) => {
    if (r.ai_themes) {
      r.ai_themes.forEach((theme) => {
        newThemeCounts[theme] = (newThemeCounts[theme] || 0) + 1;
      });
    }
  });
  // 3. Prepare summary data
  const summaryData = {
    variant_id: variant_id,
    summary_text: summary.summary,
    overall_sentiment: summary.sentiment,
    positive_themes: summary.positiveThemes,
    negative_themes: summary.negativeThemes,
    total_reviews_analyzed: existingSummary
      ? existingSummary.total_reviews_analyzed + validNewReviews.length
      : validNewReviews.length,
    reviews_analyzed_ids: existingSummary
      ? [...existingSummary.reviews_analyzed_ids, ...newReviewIds]
      : newReviewIds,
    sentiment_sum: existingSummary
      ? existingSummary.sentiment_sum + newSentimentSum
      : newSentimentSum,
    theme_counts: existingSummary
      ? mergeThemeCounts(existingSummary.theme_counts, newThemeCounts)
      : newThemeCounts,
    sentiment_distribution: existingSummary
      ? mergeSentimentDistribution(
          existingSummary.sentiment_distribution,
          newDistribution
        )
      : newDistribution,
    total_reviews: existingSummary
      ? existingSummary.total_reviews + validNewReviews.length
      : validNewReviews.length,
    analysis_confidence: summary.confidence,
    incremental_updates_count: isFullAnalysis
      ? 0
      : (existingSummary?.incremental_updates_count || 0) + 1,
    last_analyzed_at: new Date().toISOString(),
    last_full_analysis_at: isFullAnalysis
      ? new Date().toISOString()
      : existingSummary?.last_full_analysis_at,
    ai_model_used: 'gemini-2.0-flash-exp',
  };
  // 4. Upsert summary
  const { error: summaryError } = await supabase
    .from('ai_review_summaries')
    .upsert(summaryData, {
      onConflict: 'variant_id',
    });
  if (summaryError) {
    throw new Error(`Failed to save analysis summary: ${summaryError.message}`);
  }
}
// Utility functions
function createRuleBasedSummary(reviews, avgSentiment) {
  const themeFreq = {};
  reviews.forEach((r) => {
    if (r.ai_themes) {
      r.ai_themes.forEach((theme) => {
        themeFreq[theme] = (themeFreq[theme] || 0) + 1;
      });
    }
  });
  const sortedThemes = Object.entries(themeFreq).sort(([, a], [, b]) => b - a);
  const positiveThemes = sortedThemes
    .filter(
      ([theme]) =>
        theme.toLowerCase().includes('good') ||
        theme.toLowerCase().includes('great') ||
        theme.toLowerCase().includes('fast') ||
        theme.toLowerCase().includes('quality')
    )
    .slice(0, 3)
    .map(([theme]) => theme);
  const negativeThemes = sortedThemes
    .filter(
      ([theme]) =>
        theme.toLowerCase().includes('poor') ||
        theme.toLowerCase().includes('slow') ||
        theme.toLowerCase().includes('bad') ||
        theme.toLowerCase().includes('issue')
    )
    .slice(0, 3)
    .map(([theme]) => theme);
  return {
    sentiment: avgSentiment,
    summary: `Based on ${reviews.length} reviews, customers have mixed feedback about this product.`,
    positiveThemes,
    negativeThemes,
    confidence: 0.6,
  };
}
function createIncrementalRuleBasedSummary(
  existingSummary,
  newReviews,
  weightedSentiment
) {
  return {
    sentiment: weightedSentiment,
    summary:
      existingSummary.summary_text || 'Analysis updated with recent reviews',
    positiveThemes: existingSummary.positive_themes || [],
    negativeThemes: existingSummary.negative_themes || [],
    confidence: Math.min(existingSummary.analysis_confidence + 0.1, 1.0),
  };
}
function mergeThemeCounts(existing, newCounts) {
  const merged = {
    ...existing,
  };
  for (const [theme, count] of Object.entries(newCounts)) {
    merged[theme] = (merged[theme] || 0) + count;
  }
  return merged;
}
function mergeSentimentDistribution(existing, newDist) {
  return {
    positive: existing.positive + newDist.positive,
    neutral: existing.neutral + newDist.neutral,
    negative: existing.negative + newDist.negative,
  };
}
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
