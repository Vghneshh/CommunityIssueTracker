import axios from 'axios';

// Create axios instance with optimized configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api/issues',
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
  }
});

// Simple cache implementation
const cache = new Map();
const CACHE_DURATION = 60000; // 1 minute

// Request interceptor for caching GET requests
api.interceptors.request.use(
  (config) => {
    // Add timestamp for debugging
    config.metadata = { startTime: Date.now() };
    
    // Check cache for GET requests
    if (config.method === 'get') {
      const cacheKey = `${config.baseURL}${config.url}`;
      const cached = cache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        // Return cached response
        config.adapter = () => {
          return Promise.resolve({
            data: cached.data,
            status: 200,
            statusText: 'OK',
            headers: cached.headers,
            config,
            request: {}
          });
        };
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for caching and error handling
api.interceptors.response.use(
  (response) => {
    // Calculate request duration
    const duration = Date.now() - response.config.metadata.startTime;
    console.log(`API Request completed in ${duration}ms:`, {
      method: response.config.method?.toUpperCase(),
      url: response.config.url,
      status: response.status
    });
    
    // Cache successful GET responses
    if (response.config.method === 'get' && response.status === 200) {
      const cacheKey = `${response.config.baseURL}${response.config.url}`;
      cache.set(cacheKey, {
        data: response.data,
        headers: response.headers,
        timestamp: Date.now()
      });
      
      // Clean up old cache entries
      if (cache.size > 50) {
        const oldestKey = cache.keys().next().value;
        cache.delete(oldestKey);
      }
    }
    
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Calculate request duration
    const duration = Date.now() - originalRequest.metadata.startTime;
    console.error(`API Request failed after ${duration}ms:`, {
      method: originalRequest.method?.toUpperCase(),
      url: originalRequest.url,
      status: error.response?.status,
      message: error.message
    });
    
    // Retry logic for network errors
    if (!error.response && !originalRequest._retry) {
      originalRequest._retry = true;
      
      console.log('Retrying request after network error...');
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(api(originalRequest));
        }, 1000); // Retry after 1 second
      });
    }
    
    // Handle specific error cases
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 404:
          error.message = 'Resource not found';
          break;
        case 400:
          error.message = data.message || 'Invalid request data';
          break;
        case 429:
          error.message = 'Too many requests. Please try again later.';
          break;
        case 500:
          error.message = 'Server error. Please try again later.';
          break;
        default:
          error.message = data.message || `Request failed with status ${status}`;
      }
    } else if (error.code === 'ECONNABORTED') {
      error.message = 'Request timeout. Please check your connection.';
    } else if (!error.response) {
      error.message = 'Network error. Please check your connection.';
    }
    
    return Promise.reject(error);
  }
);

// Cache management functions
export const clearCache = () => {
  cache.clear();
  console.log('API cache cleared');
};

export const getCacheSize = () => cache.size;

export const getCacheKeys = () => Array.from(cache.keys());

// Utility function to invalidate cache for specific endpoints
export const invalidateCache = (pattern) => {
  const keysToDelete = [];
  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      keysToDelete.push(key);
    }
  }
  keysToDelete.forEach(key => cache.delete(key));
  console.log(`Invalidated ${keysToDelete.length} cache entries matching pattern: ${pattern}`);
};

// Health check function
export const healthCheck = async () => {
  try {
    const response = await api.get('/');
    return {
      status: 'healthy',
      latency: Date.now() - response.config.metadata.startTime,
      timestamp: Date.now()
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      timestamp: Date.now()
    };
  }
};

export default api;