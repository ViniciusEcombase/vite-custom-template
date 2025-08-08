import { useState, useCallback, useRef, useEffect } from 'react';

const useFetch = (config = {}) => {
  const {
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

  const abortControllerRef = useRef(null); // Used only for manual cancellation
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

  const createCacheKey = (url, options) => {
    return `${url}-${JSON.stringify(options)}`;
  };

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const fetchRequest = useCallback(
    async (url, options = {}) => {
      const abortController = new AbortController();
      const signal = abortController.signal;

      // Save for external cancellation
      abortControllerRef.current = abortController;

      const fullURL = baseURL ? `${baseURL}${url}` : url;
      const cacheKey = createCacheKey(fullURL, options);

      if (deduplication && requestsRef.current.has(cacheKey)) {
        return requestsRef.current.get(cacheKey);
      }

      if (cache && cacheRef.current.has(cacheKey)) {
        const cachedData = cacheRef.current.get(cacheKey);
        setData(cachedData);
        return { data: cachedData, ok: true, status: 200 };
      }

      const requestOptions = {
        signal,
        headers: {
          'Content-Type': 'application/json',
          ...defaultHeaders,
          ...options.headers,
        },
        ...options,
      };

      setLoading(true);
      setError(null);

      const requestPromise = (async () => {
        let lastError = null;

        for (let attempt = 0; attempt <= retries; attempt++) {
          try {
            const timeoutPromise = new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Request timeout')), timeout)
            );

            const fetchPromise = fetch(fullURL, requestOptions);
            const response = await Promise.race([fetchPromise, timeoutPromise]);

            let responseData = null;
            const contentType = response.headers.get('content-type');

            if (contentType?.includes('application/json')) {
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
              setData(responseData);
              setError(null);

              if (cache && (options.method === 'GET' || !options.method)) {
                cacheRef.current.set(cacheKey, responseData);
              }

              return result;
            } else {
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

            if (err.name === 'AbortError') throw err;
            if (attempt === retries) break;

            if (retryDelay > 0) {
              await delay(retryDelay * (attempt + 1));
            }
          }
        }

        throw lastError;
      })();

      if (deduplication) {
        requestsRef.current.set(cacheKey, requestPromise);
      }

      try {
        const result = await requestPromise;
        return result;
      } catch (err) {
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
    (url, options = {}) => fetchRequest(url, { ...options, method: 'GET' }),
    [fetchRequest]
  );

  const post = useCallback(
    (url, data, options = {}) =>
      fetchRequest(url, {
        ...options,
        method: 'POST',
        body: typeof data === 'string' ? data : JSON.stringify(data),
      }),
    [fetchRequest]
  );

  const put = useCallback(
    (url, data, options = {}) =>
      fetchRequest(url, {
        ...options,
        method: 'PUT',
        body: typeof data === 'string' ? data : JSON.stringify(data),
      }),
    [fetchRequest]
  );

  const del = useCallback(
    (url, options = {}) => fetchRequest(url, { ...options, method: 'DELETE' }),
    [fetchRequest]
  );

  const patch = useCallback(
    (url, data, options = {}) =>
      fetchRequest(url, {
        ...options,
        method: 'PATCH',
        body: typeof data === 'string' ? data : JSON.stringify(data),
      }),
    [fetchRequest]
  );

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  const clearCache = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  const reset = useCallback(() => {
    cancel();
    setData(null);
    setLoading(false);
    setError(null);
  }, [cancel]);

  return {
    data,
    loading,
    error,

    fetchRequest,
    get,
    post,
    put,
    delete: del,
    patch,
    cancel,
    clearCache,
    reset,

    isLoading: loading,
    isError: !!error,
    isSuccess: !loading && !error && data !== null,
    isIdle: !loading && !error && data === null,
  };
};

export default useFetch;
