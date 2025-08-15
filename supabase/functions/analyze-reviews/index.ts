// supabase/functions/analyze-reviews/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Types
interface Review {
  id: string;
  variant_id: string;
  rating: number;
  title?: string;
  content: string;
  created_at: string;
}

interface AIAnalysisResult {
  sentiment: number;
  summary: string;
  positiveThemes: string[];
  negativeThemes: string[];
}


const geminiApiKey = 'AIzaSyC7P0lTXzCsj604mv9oPiFwRxaRWgChGyQ'

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!supabaseUrl || !supabaseServiceKey || !geminiApiKey) {
      throw new Error('Missing required environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const body = await req.json().catch(() => ({}));
    const { variant_id } = body;

    let query = supabase
      .from('product_reviews')
      .select('id, variant_id, rating, title, content, created_at')
      .eq('is_analyzed', false);

    if (variant_id) query = query.eq('variant_id', variant_id);

    const { data: unanalyzedReviews, error: fetchError } = await query;
    if (fetchError) throw new Error(fetchError.message);
    if (!unanalyzedReviews || unanalyzedReviews.length === 0) {
      return new Response(JSON.stringify({ success: true, message: 'No new reviews to analyze', processed: 0 }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const reviewsByVariant = unanalyzedReviews.reduce((acc, review) => {
      if (!acc[review.variant_id]) acc[review.variant_id] = [];
      acc[review.variant_id].push(review);
      return acc;
    }, {} as Record<string, Review[]>);

    const results = [];
    let totalProcessed = 0;

    for (const variantId of Object.keys(reviewsByVariant)) {
      const reviews = reviewsByVariant[variantId];

      try {
        const reviewsText = reviews
          .map(r => `${r.title ? `Title: ${r.title}\n` : ''}Rating: ${r.rating}/5\nReview: ${r.content}`)
          .join('\n\n---\n\n');

        const aiAnalysis = await callGeminiAI(reviewsText, geminiApiKey);

        const reviewIds = reviews.map(r => r.id);
        await saveAnalysisResults(supabase, variantId, aiAnalysis, reviewIds);

        const { error: updateError } = await supabase
          .from('product_reviews')
          .update({ is_analyzed: true })
          .in('id', reviewIds);
        if (updateError) throw updateError;

        results.push({ variant_id: variantId, reviews_analyzed: reviews.length, sentiment: aiAnalysis.sentiment, success: true });
        totalProcessed += reviews.length;

      } catch (error) {
        results.push({ variant_id: variantId, reviews_analyzed: reviews.length, error: error.message, success: false });
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Analysis completed',
      total_variants: Object.keys(reviewsByVariant).length,
      total_reviews_processed: totalProcessed,
      results
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});

async function callGeminiAI(reviewsText: string, apiKey: string): Promise<AIAnalysisResult> {
  const prompt = `You are an expert variant analyst. Analyze these customer reviews and provide insights.

Reviews to analyze:
${reviewsText}

You must respond with ONLY a valid JSON object in this exact format (no other text):

{
  "sentiment": 7.5,
  "summary": "Overall customers are satisfied with the variant quality but have concerns about shipping times and packaging.",
  "positiveThemes": ["Excellent quality", "Good value for money", "Easy to use"],
  "negativeThemes": ["Slow shipping", "Poor packaging", "Limited features"]
}`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt }
            ]
          }
        ]
      })
    }
  );

  if (!res.ok) throw new Error(`Gemini API error: ${res.status}`);
  const json = await res.json();
  const aiText = json.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!aiText) throw new Error('Invalid response from Gemini API');

  try {
    const parsed = JSON.parse(aiText.match(/\{[\s\S]*\}/)?.[0]!);
    if (!parsed.sentiment || !parsed.summary || !parsed.positiveThemes || !parsed.negativeThemes) {
      throw new Error('Missing fields in AI response');
    }
    return parsed;
  } catch {
    throw new Error('Failed to parse AI response as JSON');
  }
}


async function saveAnalysisResults(supabase: any, variantId: string, analysis: AIAnalysisResult, reviewIds: string[]) {
  const { data: existingSummary, error: fetchError } = await supabase
    .from('ai_review_summaries')
    .select('*')
    .eq('variant_id', variantId)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

  const summaryData = {
    variant_id: variantId,
    summary_text: analysis.summary,
    overall_sentiment: analysis.sentiment,
    positive_themes: analysis.positiveThemes,
    negative_themes: analysis.negativeThemes,
    total_reviews_analyzed: existingSummary ? existingSummary.total_reviews_analyzed + reviewIds.length : reviewIds.length,
    reviews_analyzed_ids: existingSummary ? [...existingSummary.reviews_analyzed_ids, ...reviewIds] : reviewIds,
    last_analyzed_at: new Date().toISOString(),
    ai_model_used: 'gemini-2.5-flash'
  };

  if (existingSummary) {
    await supabase.from('ai_review_summaries').update(summaryData).eq('variant_id', variantId);
  } else {
    await supabase.from('ai_review_summaries').insert(summaryData);
  }
}
