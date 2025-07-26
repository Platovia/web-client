/**
 * API client for FastAPI backend communication
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_VERSION = '/api/v1';

interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  is_active: boolean;
  is_verified: boolean;
  last_login: string | null;
  created_at: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

interface Company {
  id: string;
  name: string;
  description?: string;
  contact_info?: any;
  subscription_tier: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Restaurant {
  id: string;
  company_id: string;
  name: string;
  description?: string;
  address?: any;
  contact_info?: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface RestaurantCreateRequest {
  name: string;
  description?: string;
  address?: any;
  contact_info?: any;
}

interface RestaurantUpdateRequest {
  name?: string;
  description?: string;
  address?: any;
  contact_info?: any;
  is_active?: boolean;
}

interface RestaurantListResponse {
  restaurants: Restaurant[];
  total: number;
}

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL + API_VERSION;
  }

  private getAuthHeader(): HeadersInit {
    const token = this.getAccessToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const headers = {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
        ...options.headers,
      };
      
      console.log('Making API request:', { url, headers: { ...headers, Authorization: (headers as any).Authorization ? 'Bearer [REDACTED]' : 'None' } });
      
      const response = await fetch(url, {
        headers,
        ...options,
      });

      console.log('API response status:', response.status, response.statusText);

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        try {
          const errorData = await response.json();
          console.log('API error data:', errorData);
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch {
          // If parsing fails, use the status text
          errorMessage = response.statusText || errorMessage;
        }
        return { error: errorMessage };
      }

      const data = await response.json();
      console.log('API success data:', data);
      return { data };
    } catch (error) {
      console.error('API request failed:', error);
      return { 
        error: error instanceof Error ? error.message : 'Network error occurred' 
      };
    }
  }

  // Token management
  getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('access_token');
  }

  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('refresh_token');
  }

  setTokens(tokens: AuthTokens): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('access_token', tokens.access_token);
    localStorage.setItem('refresh_token', tokens.refresh_token);
  }

  clearTokens(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('companyName');
    localStorage.removeItem('userName');
  }

  async refreshAccessToken(): Promise<boolean> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return false;

    const response = await this.makeRequest<AuthTokens>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (response.data) {
      this.setTokens(response.data);
      return true;
    }

    this.clearTokens();
    return false;
  }

  // Authentication endpoints
  async login(credentials: LoginRequest): Promise<ApiResponse<{ user: User; tokens: AuthTokens }>> {
    const response = await this.makeRequest<{ user: User; tokens: AuthTokens }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.data) {
      this.setTokens(response.data.tokens);
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userEmail', response.data.user.email);
      localStorage.setItem('userName', response.data.user.full_name);
    }

    return response;
  }

  async register(userData: RegisterRequest): Promise<ApiResponse<{ user: User; tokens: AuthTokens }>> {
    const response = await this.makeRequest<{ user: User; tokens: AuthTokens }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (response.data) {
      this.setTokens(response.data.tokens);
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userEmail', response.data.user.email);
      localStorage.setItem('userName', response.data.user.full_name);
    }

    return response;
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.makeRequest<User>('/auth/me');
  }

  async logout(): Promise<void> {
    this.clearTokens();
  }

  // Company endpoints
  async createCompany(companyData: { name: string; description?: string }): Promise<ApiResponse<Company>> {
    return this.makeRequest<Company>('/companies', {
      method: 'POST',
      body: JSON.stringify(companyData),
    });
  }

  async getUserCompanies(): Promise<ApiResponse<{ companies: Company[], total: number }>> {
    return this.makeRequest<{ companies: Company[], total: number }>('/companies');
  }

  // Restaurant endpoints
  async createRestaurant(companyId: string, restaurantData: RestaurantCreateRequest): Promise<ApiResponse<Restaurant>> {
    return this.makeRequest<Restaurant>(`/companies/${companyId}/restaurants`, {
      method: 'POST',
      body: JSON.stringify(restaurantData),
    });
  }

  async getCompanyRestaurants(companyId: string): Promise<ApiResponse<RestaurantListResponse>> {
    return this.makeRequest<RestaurantListResponse>(`/companies/${companyId}/restaurants`);
  }

  async getRestaurant(restaurantId: string): Promise<ApiResponse<Restaurant>> {
    return this.makeRequest<Restaurant>(`/restaurants/${restaurantId}`);
  }

  async updateRestaurant(restaurantId: string, updateData: RestaurantUpdateRequest): Promise<ApiResponse<Restaurant>> {
    return this.makeRequest<Restaurant>(`/restaurants/${restaurantId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  async deleteRestaurant(restaurantId: string): Promise<ApiResponse<{ message: string }>> {
    return this.makeRequest<{ message: string }>(`/restaurants/${restaurantId}`, {
      method: 'DELETE',
    });
  }

  async activateRestaurant(restaurantId: string): Promise<ApiResponse<Restaurant>> {
    return this.makeRequest<Restaurant>(`/restaurants/${restaurantId}/activate`, {
      method: 'POST',
    });
  }

  async deactivateRestaurant(restaurantId: string): Promise<ApiResponse<Restaurant>> {
    return this.makeRequest<Restaurant>(`/restaurants/${restaurantId}/deactivate`, {
      method: 'POST',
    });
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<{ status: string; version: string }>> {
    return this.makeRequest<{ status: string; version: string }>('/health');
  }
}

export const apiClient = new ApiClient();

// Type exports for use in components
export type { 
  User, 
  Company, 
  Restaurant, 
  RestaurantCreateRequest, 
  RestaurantUpdateRequest, 
  RestaurantListResponse, 
  AuthTokens, 
  LoginRequest, 
  RegisterRequest, 
  ApiResponse 
}; 