import { useState, useCallback, useRef, useEffect } from 'react';

const useFetch = (config = {}) => {
  const {
    // Default configuration
    baseURL = '',
    defaultHeaders = {},
    timeout = 10000,
    retries = 0,
    retryDelay = 1000,
    cache = false,
    deduplication = true,
  } = config;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);
  const cacheRef = useRef(new Map());
  const requestsRef = useRef(new Map()); // For deduplication

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Helper function to create cache key
  const createCacheKey = (url, options) => {
    return `${url}-${JSON.stringify(options)}`;
  };

  // Helper function to delay for retries
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // Main fetch function
  const fetchRequest = useCallback(
    async (url, options = {}) => {
      // Cancel previous request if exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new AbortController
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      // Build full URL
      const fullURL = baseURL ? `${baseURL}${url}` : url;
      

      // Create cache key
      const cacheKey = createCacheKey(fullURL, options);

      // Check for existing request (deduplication)
      if (deduplication && requestsRef.current.has(cacheKey)) {
        return requestsRef.current.get(cacheKey);
      }

      // Check cache first
      if (cache && cacheRef.current.has(cacheKey)) {
        const cachedData = cacheRef.current.get(cacheKey);
        setData(cachedData);
        return { data: cachedData, ok: true, status: 200 };
      }

      // Prepare request options
      const requestOptions = {
        signal: abortController.signal,
        headers: {
          'Content-Type': 'application/json',
          ...defaultHeaders,
          ...options.headers,
        },
        ...options,
      };

      // Set loading state
      setLoading(true);
      setError(null);

      // Create the promise for the request
      const requestPromise = (async () => {
        let lastError = null;

        // Retry logic
        for (let attempt = 0; attempt <= retries; attempt++) {
          try {
            // Add timeout wrapper
            const timeoutPromise = new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Request timeout')), timeout)
            );

            const fetchPromise = fetch(fullURL, requestOptions);

            const response = await Promise.race([fetchPromise, timeoutPromise]);

            // Parse response
            let responseData = null;
            const contentType = response.headers.get('content-type');

            if (contentType && contentType.includes('application/json')) {
              responseData = await response.json();
            } else {
              responseData = await response.text();
            }

            const result = {
              data: responseData,
              ok: response.ok,
              status: response.status,
              statusText: response.statusText,
              headers: Object.fromEntries(response.headers.entries()),
            };

            if (response.ok) {
              // Success - update states
              setData(responseData);
              setError(null);

              // Cache if enabled
              if (cache && (options.method === 'GET' || !options.method)) {
                cacheRef.current.set(cacheKey, responseData);
              }

              return result;
            } else {
              // HTTP error
              const error = new Error(
                `HTTP ${response.status}: ${response.statusText}`
              );
              error.status = response.status;
              error.statusText = response.statusText;
              error.data = responseData;
              throw error;
            }
          } catch (err) {
            lastError = err;

            // Don't retry if request was aborted
            if (err.name === 'AbortError') {
              throw err;
            }

            // Don't retry on the last attempt
            if (attempt === retries) {
              break;
            }

            // Wait before retry
            if (retryDelay > 0) {
              await delay(retryDelay * (attempt + 1)); // Exponential backoff
            }
          }
        }

        // All retries failed
        throw lastError;
      })();

      // Store request for deduplication
      if (deduplication) {
        requestsRef.current.set(cacheKey, requestPromise);
      }

      try {
        const result = await requestPromise;
        return result;
      } catch (err) {
        // Handle different error types
        let errorMessage = 'An unexpected error occurred';
        let errorType = 'UNKNOWN_ERROR';

        if (err.name === 'AbortError') {
          errorMessage = 'Request was cancelled';
          errorType = 'CANCELLED';
        } else if (err.message === 'Request timeout') {
          errorMessage = 'Request timed out';
          errorType = 'TIMEOUT';
        } else if (err.status) {
          errorMessage = `HTTP ${err.status}: ${err.statusText}`;
          errorType = 'HTTP_ERROR';
        } else if (err.message.includes('fetch')) {
          errorMessage = 'Network error - please check your connection';
          errorType = 'NETWORK_ERROR';
        } else {
          errorMessage = err.message;
        }

        const errorObject = {
          message: errorMessage,
          type: errorType,
          status: err.status || null,
          data: err.data || null,
          originalError: err,
        };

        setError(errorObject);
        setData(null);

        return {
          data: null,
          ok: false,
          status: err.status || 0,
          error: errorObject,
        };
      } finally {
        setLoading(false);
        // Clean up request reference
        if (deduplication) {
          requestsRef.current.delete(cacheKey);
        }
      }
    },
    [
      baseURL,
      defaultHeaders,
      timeout,
      retries,
      retryDelay,
      cache,
      deduplication,
    ]
  );

  // Convenience methods
  const get = useCallback(
    (url, options = {}) => {
      return fetchRequest(url, { ...options, method: 'GET' });
    },
    [fetchRequest]
  );

  const post = useCallback(
    (url, data, options = {}) => {
      return fetchRequest(url, {
        ...options,
        method: 'POST',
        body: typeof data === 'string' ? data : JSON.stringify(data),
      });
    },
    [fetchRequest]
  );

  const put = useCallback(
    (url, data, options = {}) => {
      return fetchRequest(url, {
        ...options,
        method: 'PUT',
        body: typeof data === 'string' ? data : JSON.stringify(data),
      });
    },
    [fetchRequest]
  );

  const del = useCallback(
    (url, options = {}) => {
      return fetchRequest(url, { ...options, method: 'DELETE' });
    },
    [fetchRequest]
  );

  const patch = useCallback(
    (url, data, options = {}) => {
      return fetchRequest(url, {
        ...options,
        method: 'PATCH',
        body: typeof data === 'string' ? data : JSON.stringify(data),
      });
    },
    [fetchRequest]
  );

  // Cancel current request
  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  // Clear cache
  const clearCache = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  // Reset state
  const reset = useCallback(() => {
    cancel();
    setData(null);
    setLoading(false);
    setError(null);
  }, [cancel]);

  return {
    // State
    data,
    loading,
    error,

    // Methods
    fetchRequest,
    get,
    post,
    put,
    delete: del,
    patch,
    cancel,
    clearCache,
    reset,

    // Computed states
    isLoading: loading,
    isError: !!error,
    isSuccess: !loading && !error && data !== null,
    isIdle: !loading && !error && data === null,
  };
};

export default useFetch;
