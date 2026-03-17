import axios, { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';

// Backend standard response structure (Global Result)
export interface ApiResult<T = any> {
  data: T;
  success: boolean;
  isSuccess: boolean; // For PascalCase compatibility
  message: string | null;
  errors: string[] | null;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5294/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Add JWT Token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const authStorage = localStorage.getItem('auth-storage');
    const token = authStorage ? JSON.parse(authStorage).state.token : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Global Result and Global Errors
api.interceptors.response.use(
  (response: AxiosResponse) => {
    const result = response.data as ApiResult;
    
    // Check for standard result object (handle both success and isSuccess)
    const success = result && (typeof result.success === 'boolean' ? result.success : result.isSuccess);
    
    if (result && typeof success === 'boolean') {
      if (!success) {
        return Promise.reject({
          message: result.message || 'Bir hata oluştu.',
          errors: result.errors || [],
          status: response.status
        });
      }
      // Return the unwrapped data payload
      return { ...response, data: result.data };
    }
    
    return response;
  },
  (error: AxiosError) => {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data as ApiResult;

      if (status === 401) {
        // useAuthStore.getState().logout(); // Optional proactive logout
      }

      return Promise.reject({
        message: data?.message || 'Sunucu hatası oluştu.',
        errors: data?.errors || [],
        status
      });
    }
    
    return Promise.reject({
      message: 'Ağ bağlantısı hatası oluştu.',
      errors: [],
      status: 0
    });
  }
);

export default api;
