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
  currency_code: string;
  locale: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface RestaurantCreateRequest {
  name: string;
  description?: string;
  address?: any;
  contact_info?: any;
  currency_code?: string;
  locale?: string;
}

interface RestaurantUpdateRequest {
  name?: string;
  description?: string;
  address?: any;
  contact_info?: any;
  currency_code?: string;
  locale?: string;
  is_active?: boolean;
}

interface RestaurantListResponse {
  restaurants: Restaurant[];
  total: number;
}

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price?: number;
  category?: string;
  allergens?: string[];
  is_available: boolean;
  image_url?: string;
  is_vegetarian?: boolean;
  is_vegan?: boolean;
  is_gluten_free?: boolean;
}

interface Menu {
  id: string;
  restaurant_id: string;
  name: string;
  qr_code_url?: string;
  qr_code_data?: string;
  template_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface MenuCreateRequest {
  name: string;
  template_id?: string;
}

interface MenuUpdateRequest {
  name?: string;
  template_id?: string;
  is_active?: boolean;
}

interface MenuListResponse {
  menus: Menu[];
  total: number;
}

interface MenuImageUploadResponse {
  id: string;
  menu_id: string;
  image_url: string;
  image_filename: string;
  upload_order: number;
  created_at: string;
}

interface MenuImageListResponse {
  images: MenuImageUploadResponse[];
  total: number;
}

interface QRCodeGenerateRequest {
  regenerate?: boolean;
  expires_in_days?: number;
}

interface QRCodeResponse {
  qr_code_url: string;
  qr_code_data: string;
  public_menu_url: string;
  token?: string;
  expires_at?: string;
}

interface OCRJobCreateRequest {
  image_urls: string[];
  processing_options?: { [key: string]: any };
}

interface OCRJobResponse {
  job_id: string;
  status: string;
  total_images: number;
  processed_images: number;
  progress_percentage: number;
  created_at: string;
  processing_started_at?: string;
  processing_completed_at?: string;
  error_message?: string;
}

interface OCRResultResponse {
  id: string;
  image_url: string;
  raw_text?: string;
  structured_data?: { [key: string]: any };
  confidence_score?: string;
  is_manually_corrected: boolean;
  corrected_text?: string;
  correction_notes?: string;
  extraction_method?: string;
}

interface OCRResultListResponse {
  results: OCRResultResponse[];
  total: number;
}

interface OCRResultUpdateRequest {
  corrected_text?: string;
  correction_notes?: string;
}

interface MenuItemCreateRequest {
  name: string;
  description?: string;
  price?: number;
  category?: string;
  allergens?: string[];
  is_available?: boolean;
  image_url?: string;
}

interface MenuItemUpdateRequest {
  name?: string;
  description?: string;
  price?: number;
  category?: string;
  allergens?: string[];
  is_available?: boolean;
  image_url?: string;
}

interface MenuStats {
  total_items: number;
  active_items: number;
  categories: string[];
  average_price?: number;
  last_updated: string;
}

interface PublicMenuResponse {
  menu: {
    id: string;
    name: string;
    restaurant: {
      id: string;
      name: string;
      description?: string;
      address?: any;
      contact_info?: any;
      logo_url?: string;
      currency_code?: string;
      locale?: string;
    } | null;
    template_id?: string;
    created_at: string;
    updated_at: string;
  };
  menu_items: MenuItem[];
  access_info: {
    token: string;
    access_count: number;
    accessed_at: string;
  };
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatResponse {
  response: string;
  context?: string;
}

interface ChatSession {
  id: string;
  menu_id: string;
  session_token: string;
  ip_address?: string;
  created_at: string;
  last_activity: string;
}

interface ChatSessionResetRequest {
  ip_address?: string;
}

interface ChatSessionResetResponse {
  old_session_id: string;
  new_session: ChatSession;
  message: string;
}

interface ChatMessageResponse {
  user_message: string;
  bot_response: string;
  response_source: string;
  session_id: string;
  timestamp: string;
}

interface ChatHistoryMessage {
  id: string;
  message: string;
  response?: string;
  type: string;
  timestamp: string;
}

interface ChatHistoryResponse {
  session_id: string;
  messages: ChatHistoryMessage[];
  total_messages: number;
}

interface MenuWithDetails {
  id: string;
  restaurant_id: string;
  name: string;
  qr_code_url?: string;
  qr_code_data?: string;
  template_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  restaurant: {
    id: string;
    name: string;
    description?: string;
    address?: any;
    contact_info?: any;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  };
  stats: {
    total_items: number;
    active_items: number;
    categories: string[];
    average_price?: number;
    last_updated: string;
  };
  image?: string;
}

interface MenuWithDetailsListResponse {
  menus: MenuWithDetails[];
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
      
      // Don't set Content-Type for FormData - let browser handle it
      const isFormData = options.body instanceof FormData;
      const headers = {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...this.getAuthHeader(),
        ...options.headers,
      };
      
      // console.log('Making API request:', { url, headers: { ...headers, Authorization: (headers as any).Authorization ? 'Bearer [REDACTED]' : 'None' } });
      
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

  // Public menu endpoints (no authentication required)
  async getPublicMenu(token: string): Promise<ApiResponse<PublicMenuResponse>> {
    return this.makeRequest<PublicMenuResponse>(`/public/menu/${token}`);
  }

  async getPublicMenuItems(token: string): Promise<ApiResponse<{
    menu_id: string;
    menu_name: string;
    categories: { [key: string]: MenuItem[] };
    total_items: number;
  }>> {
    return this.makeRequest<{
      menu_id: string;
      menu_name: string;
      categories: { [key: string]: MenuItem[] };
      total_items: number;
    }>(`/public/menu/${token}/items`);
  }

  // Restaurant-specific menu access (requires knowing restaurant has active menu)
  async getRestaurantPublicInfo(restaurantId: string): Promise<ApiResponse<Restaurant>> {
    return this.makeRequest<Restaurant>(`/restaurants/${restaurantId}`);
  }

  // Menu management endpoints
  async createMenu(restaurantId: string, menuData: MenuCreateRequest): Promise<ApiResponse<Menu>> {
    return this.makeRequest<Menu>(`/menus/restaurants/${restaurantId}/menus`, {
      method: 'POST',
      body: JSON.stringify(menuData),
    });
  }

  async getRestaurantMenus(restaurantId: string): Promise<ApiResponse<MenuListResponse>> {
    return this.makeRequest<MenuListResponse>(`/menus/restaurants/${restaurantId}/menus`);
  }

  async getMenu(menuId: string): Promise<ApiResponse<Menu>> {
    return this.makeRequest<Menu>(`/menus/menus/${menuId}`);
  }

  async updateMenu(menuId: string, updateData: MenuUpdateRequest): Promise<ApiResponse<Menu>> {
    return this.makeRequest<Menu>(`/menus/menus/${menuId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  async deleteMenu(menuId: string): Promise<ApiResponse<{ message: string }>> {
    return this.makeRequest<{ message: string }>(`/menus/menus/${menuId}`, {
      method: 'DELETE',
    });
  }

  async activateMenu(menuId: string): Promise<ApiResponse<Menu>> {
    return this.makeRequest<Menu>(`/menus/menus/${menuId}/activate`, {
      method: 'POST',
    });
  }

  async deactivateMenu(menuId: string): Promise<ApiResponse<Menu>> {
    return this.makeRequest<Menu>(`/menus/menus/${menuId}/deactivate`, {
      method: 'POST',
    });
  }

  async uploadMenuImages(menuId: string, formData: FormData): Promise<ApiResponse<MenuImageUploadResponse>> {
    const headers = {
      ...this.getAuthHeader(),
    };
    return this.makeRequest<MenuImageUploadResponse>(`/menus/menus/${menuId}/images`, {
      method: 'POST',
      body: formData,
      headers: headers, // Let browser set Content-Type for FormData
    });
  }

  async getMenuImages(menuId: string): Promise<ApiResponse<MenuImageListResponse>> {
    return this.makeRequest<MenuImageListResponse>(`/menus/menus/${menuId}/images`);
  }

  async deleteMenuImage(imageId: string): Promise<ApiResponse<{ message: string }>> {
    return this.makeRequest<{ message: string }>(`/menus/menu-images/${imageId}`, {
      method: 'DELETE',
    });
  }

  async getMenuStats(menuId: string): Promise<ApiResponse<MenuStats>> {
    return this.makeRequest<MenuStats>(`/menus/${menuId}/stats`);
  }

  async processMenu(menuId: string): Promise<ApiResponse<{ job_id: string; message: string }>> {
    return this.makeRequest<{ job_id: string; message: string }>(`/menus/${menuId}/process`, {
      method: 'POST',
    });
  }

  async reprocessMenu(menuId: string): Promise<ApiResponse<{ job_id: string; message: string }>> {
    return this.makeRequest<{ job_id: string; message: string }>(`/menus/${menuId}/reprocess`, {
      method: 'POST',
    });
  }

  async getProcessingStatus(menuId: string): Promise<ApiResponse<{ status: string; progress: number }>> {
    return this.makeRequest<{ status: string; progress: number }>(`/menus/${menuId}/processing-status`);
  }

  async getProcessedItems(menuId: string): Promise<ApiResponse<{ items: MenuItem[]; total: number }>> {
    return this.makeRequest<{ items: MenuItem[]; total: number }>(`/menus/${menuId}/processed-items`);
  }

  // Menu Item management endpoints
  async createMenuItem(menuId: string, itemData: MenuItemCreateRequest): Promise<ApiResponse<MenuItem>> {
    return this.makeRequest<MenuItem>(`/menus/${menuId}/items`, {
      method: 'POST',
      body: JSON.stringify(itemData),
    });
  }

  async getMenuItems(menuId: string): Promise<ApiResponse<{ items: MenuItem[]; total: number }>> {
    return this.makeRequest<{ items: MenuItem[]; total: number }>(`/menus/${menuId}/items`);
  }

  async getMenuItem(menuId: string, itemId: string): Promise<ApiResponse<MenuItem>> {
    return this.makeRequest<MenuItem>(`/menus/${menuId}/items/${itemId}`);
  }

  async updateMenuItem(menuId: string, itemId: string, updateData: MenuItemUpdateRequest): Promise<ApiResponse<MenuItem>> {
    return this.makeRequest<MenuItem>(`/menus/${menuId}/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  async deleteMenuItem(menuId: string, itemId: string): Promise<ApiResponse<{ message: string }>> {
    return this.makeRequest<{ message: string }>(`/menus/${menuId}/items/${itemId}`, {
      method: 'DELETE',
    });
  }

  async bulkCreateMenuItems(menuId: string, items: MenuItemCreateRequest[]): Promise<ApiResponse<{ items: MenuItem[]; total: number }>> {
    return this.makeRequest<{ items: MenuItem[]; total: number }>(`/menus/${menuId}/items/bulk`, {
      method: 'POST',
      body: JSON.stringify({ items }),
    });
  }

  async batchActivateMenuItems(menuId: string, itemIds: string[]): Promise<ApiResponse<{ message: string; updated_count: number }>> {
    return this.makeRequest<{ message: string; updated_count: number }>(`/menus/${menuId}/items/batch-activate`, {
      method: 'POST',
      body: JSON.stringify({ item_ids: itemIds }),
    });
  }

  async batchDeleteMenuItems(menuId: string, itemIds: string[]): Promise<ApiResponse<{ message: string; deleted_count: number }>> {
    return this.makeRequest<{ message: string; deleted_count: number }>(`/menus/${menuId}/items/batch-delete`, {
      method: 'POST',
      body: JSON.stringify({ item_ids: itemIds }),
    });
  }

  async approveMenuItem(menuId: string, itemId: string): Promise<ApiResponse<MenuItem>> {
    return this.makeRequest<MenuItem>(`/menus/${menuId}/items/${itemId}/approve`, {
      method: 'POST',
    });
  }

  async getMenuItemCategories(menuId: string): Promise<ApiResponse<{ categories: string[] }>> {
    return this.makeRequest<{ categories: string[] }>(`/menus/${menuId}/items/categories`);
  }

  // QR Code management endpoints
  async generateQRCode(menuId: string, options?: QRCodeGenerateRequest): Promise<ApiResponse<QRCodeResponse>> {
    return this.makeRequest<QRCodeResponse>(`/qr/menus/${menuId}/qr/generate`, {
      method: 'POST',
      body: JSON.stringify(options || {}),
    });
  }

  async getQRCodeInfo(menuId: string): Promise<ApiResponse<QRCodeResponse>> {
    return this.makeRequest<QRCodeResponse>(`/qr/menus/${menuId}/qr`);
  }

  async deactivateQRCode(menuId: string): Promise<ApiResponse<{ message: string }>> {
    return this.makeRequest<{ message: string }>(`/qr/menus/${menuId}/qr`, {
      method: 'DELETE',
    });
  }

  async downloadQRCode(filename: string): Promise<Response> {
    const url = `${this.baseUrl}/qr/download/${filename}`;
    const headers = {
      ...this.getAuthHeader(),
    };
    
    return fetch(url, { headers });
  }

  // OCR management endpoints
  async createOCRJob(menuId: string, jobData: OCRJobCreateRequest): Promise<ApiResponse<OCRJobResponse>> {
    return this.makeRequest<OCRJobResponse>(`/ocr/menus/${menuId}/ocr/jobs`, {
      method: 'POST',
      body: JSON.stringify(jobData),
    });
  }

  async getOCRJobStatus(jobId: string): Promise<ApiResponse<OCRJobResponse>> {
    return this.makeRequest<OCRJobResponse>(`/ocr/ocr/jobs/${jobId}`);
  }

  async processOCRJob(jobId: string): Promise<ApiResponse<{ message: string }>> {
    return this.makeRequest<{ message: string }>(`/ocr/ocr/jobs/${jobId}/process`, {
      method: 'POST',
    });
  }

  async getOCRJobResults(jobId: string): Promise<ApiResponse<OCRResultListResponse>> {
    return this.makeRequest<OCRResultListResponse>(`/ocr/ocr/jobs/${jobId}/results`);
  }

  async updateOCRResult(resultId: string, updateData: OCRResultUpdateRequest): Promise<ApiResponse<OCRResultResponse>> {
    return this.makeRequest<OCRResultResponse>(`/ocr/ocr/results/${resultId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  // Chat endpoints
  async createChatSession(qrToken: string): Promise<ApiResponse<ChatSession>> {
    return this.makeRequest<ChatSession>(`/chat/public/${qrToken}/sessions`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
  }

  async sendChatMessage(qrToken: string, sessionId: string, message: string): Promise<ApiResponse<ChatMessageResponse>> {
    return this.makeRequest<ChatMessageResponse>(`/chat/public/${qrToken}/sessions/${sessionId}/messages`, {
      method: 'POST',
      body: JSON.stringify({
        message,
        use_cache: true
      }),
    });
  }

  async resetChatSession(sessionId: string, resetData: ChatSessionResetRequest = {}): Promise<ApiResponse<ChatSessionResetResponse>> {
    return this.makeRequest<ChatSessionResetResponse>(`/chat/sessions/${sessionId}/reset`, {
      method: 'POST',
      body: JSON.stringify(resetData),
    });
  }

  async getChatHistory(sessionId: string, limit: number = 50): Promise<ApiResponse<ChatHistoryResponse>> {
    return this.makeRequest<ChatHistoryResponse>(`/chat/sessions/${sessionId}/history?limit=${limit}`, {
      method: 'GET',
    });
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<{ status: string; version: string }>> {
    return this.makeRequest<{ status: string; version: string }>('/health');
  }

  async getAllMenusWithDetails(): Promise<ApiResponse<MenuWithDetailsListResponse>> {
    // Get user's companies first, then get menus for the first company
    const companiesResponse = await this.getUserCompanies();
    if (companiesResponse.error || !companiesResponse.data?.companies?.length) {
      return { error: "No companies found" };
    }
    
    const firstCompany = companiesResponse.data.companies[0];
    return this.makeRequest<MenuWithDetailsListResponse>(`/companies/${firstCompany.id}/menus`);
  }

  async getRestaurantMenusWithDetails(restaurantId: string): Promise<ApiResponse<MenuWithDetailsListResponse>> {
    return this.makeRequest<MenuWithDetailsListResponse>(`/restaurants/${restaurantId}/menus/with-details`);
  }

  // Currency management
  async getCurrencies(): Promise<ApiResponse<CurrencyListResponse>> {
    return this.makeRequest<CurrencyListResponse>('/currencies');
  }

  async getPopularCurrencies(): Promise<ApiResponse<CurrencyListResponse>> {
    return this.makeRequest<CurrencyListResponse>('/currencies/popular');
  }

  // Analytics methods
  async getMenuAnalytics(menuId: string): Promise<ApiResponse<any>> {
    return this.makeRequest<any>(`/analytics/menus/${menuId}/analytics`);
  }

  async getAnalyticsOverview(restaurantId?: string): Promise<ApiResponse<any>> {
    const params = restaurantId ? `?restaurant_id=${restaurantId}` : '';
    return this.makeRequest<any>(`/analytics/menus/analytics/overview${params}`);
  }
}

// Currency-related interfaces
interface Currency {
  code: string;
  name: string;
  symbol: string;
}

interface CurrencyListResponse {
  currencies: Currency[];
  total: number;
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
  ApiResponse,
  MenuItem,
  Menu,
  MenuCreateRequest,
  MenuUpdateRequest,
  MenuListResponse,
  MenuImageUploadResponse,
  MenuImageListResponse,
  MenuItemCreateRequest,
  MenuItemUpdateRequest,
  MenuStats,
  QRCodeGenerateRequest,
  QRCodeResponse,
  OCRJobCreateRequest,
  OCRJobResponse,
  OCRResultResponse,
  OCRResultListResponse,
  OCRResultUpdateRequest,
  PublicMenuResponse,
  ChatMessage,
  ChatResponse,
  ChatSession,
  ChatSessionResetRequest,
  ChatSessionResetResponse,
  ChatMessageResponse,
  ChatHistoryMessage,
  ChatHistoryResponse,
  Currency,
  CurrencyListResponse
}; 