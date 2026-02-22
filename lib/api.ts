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
  roles: string[];
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

interface UserUpdateRequest {
  first_name?: string;
  last_name?: string;
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

interface CompanyUpdateRequest {
  name?: string;
  description?: string;
  contact_info?: any;
  subscription_tier?: string;
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
  allergens?: string[]; // Legacy field
  dietary_info?: string[]; // Legacy field  
  tags?: string[]; // New tags system
  is_available: boolean;
  image_url?: string;
  is_vegetarian?: boolean; // Legacy field - derived from tags
  is_vegan?: boolean; // Legacy field - derived from tags
  is_gluten_free?: boolean; // Legacy field - derived from tags
}

interface TagDefinition {
  name: string;
  display_name: string;
  category: string;
  description: string;
  color: string;
  icon: string;
  is_system_tag: boolean;
}

interface Menu {
  id: string;
  restaurant_id: string;
  name: string;
  qr_code_url?: string;
  qr_code_data?: string;
  template_id: string;
  theme_config?: any;
  layout_config?: any;
  layout_status?: string;
  layout_version?: number;
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
  theme_config?: any;
  layout_config?: any;
  layout_status?: string;
  layout_version?: number;
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

interface ExtractedMenuImage {
  id: string;
  image_url: string;
  ai_description?: string;
  extraction_confidence?: number;
  is_assigned: boolean;
  assigned_to_item_id?: string;
  created_at?: string;
}

interface ExtractedImagesResponse {
  extracted_images: ExtractedMenuImage[];
  total_count: number;
  assigned_count: number;
  unassigned_count: number;
}

interface ImageAssignmentRequest {
  image_id: string;
}

interface ImageAssignmentResponse {
  success: boolean;
  message: string;
  item_id: string;
  image_id: string;
  image_url: string;
}

interface AutoMatchImagesResponse {
  success: boolean;
  message: string;
  results: {
    matched_count: number;
    total_images: number;
    total_items: number;
    matches: Array<{
      item_id: string;
      item_name: string;
      image_id: string;
      confidence: number;
    }>;
  };
}

interface MenuItemCreateRequest {
  version_id?: string;
  name: string;
  description?: string;
  price?: number;
  category?: string;
  allergens?: string[];
  tags?: string[];
  is_available?: boolean;
  image_url?: string;
}

interface MenuItemUpdateRequest {
  name?: string;
  description?: string;
  price?: number;
  category?: string;
  allergens?: string[];
  tags?: string[];
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
    theme_config?: any;
    layout_config?: any;
    layout_status?: string;
    layout_version?: number;
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
  responseTime?: number;
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
  response_time_ms?: number;
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

// Template types
interface TemplateDefinition {
  id: string;
  key: string;
  name: string;
  description?: string;
  default_theme?: any;
}

interface MenuTemplate {
  id: string;
  name: string;
  definition_key?: string;
  theme_config?: any;
  layout_config?: any;
  is_active: boolean;
  is_draft: boolean;
  created_at: string;
}

interface DesignTemplateMetadata {
  id: string;
  name: string;
  description?: string;
  company_id: string;
  owner_user_id?: string;
  created_at: string;
  updated_at: string;
  is_system: boolean;
}

interface DesignTemplate extends DesignTemplateMetadata {
  preset_layout: any;
  default_theme?: any;
}

// Billing interfaces
interface BillingSubscription {
  id: string;
  tier: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  provider: string;
  provider_subscription_id: string | null;
}

interface BillingUsage {
  usage: Record<string, number>;
  limits: Record<string, number>;
  tier: string;
}

interface BillingPlan {
  tier: string;
  price: number;
  limits: Record<string, number>;
  paddle_price_id: string | null;
}

interface CheckoutRequest {
  price_id: string;
  customer_email?: string;
  success_url?: string;
}

interface CheckoutResponse {
  checkout_url?: string;
  client_token?: string;
}

interface UpdatePlanRequest {
  price_id: string;
  proration_billing_mode?: string;
}

interface UpdatePlanResponse {
  action: 'updated' | 'checkout_required' | 'canceled' | 'no_change' | 'resumed';
  tier?: string;
  message: string;
  checkout_url?: string;
  client_token?: string;
}

// Onboarding interfaces
interface OnboardingSourceInput {
  url: string;
  category: 'menu' | 'context';
}

interface QuickSetupRequest {
  restaurant_name: string;
  sources: OnboardingSourceInput[];
}

interface QuickSetupResponse {
  restaurant_id: string;
  menu_id: string | null;
  source_ids: string[];
  embed_token: string;
  embed_snippet: string;
}

// Source management interfaces
interface RestaurantSource {
  id: string;
  restaurant_id: string;
  source_category: string;
  source_type: string;
  url?: string;
  file_url?: string;
  file_name?: string;
  file_type?: string;
  menu_id?: string;
  status: string;
  label?: string;
  is_active: boolean;
  raw_content?: string;
  structured_data?: { [key: string]: any };
  items_extracted?: number;
  error_message?: string;
  last_processed_at?: string;
  created_at: string;
  updated_at: string;
}

interface CreateSourceRequest {
  url: string;
  source_category: string;
  menu_id?: string;
  label?: string;
}

interface UpdateSourceRequest {
  label?: string;
  source_category?: string;
  is_active?: boolean;
}

// Menu version management interfaces
interface MenuVersion {
  id: string;
  menu_id: string;
  version_number: number;
  name?: string;
  status: string;
  source_ids?: any[];
  notes?: string;
  item_count: number;
  activated_at?: string;
  archived_at?: string;
  created_at: string;
  updated_at: string;
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

      // Handle empty responses (e.g., 204 No Content from DELETE)
      const text = await response.text();
      if (!text) {
        return { data: undefined as unknown as T };
      }
      const data = JSON.parse(text);
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

  async updateCurrentUser(updateData: UserUpdateRequest): Promise<ApiResponse<User>> {
    return this.makeRequest<User>('/auth/me', {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  async forgotPassword(email: string): Promise<ApiResponse<{ message: string }>> {
    return this.makeRequest<{ message: string }>(`/auth/forgot-password?email=${encodeURIComponent(email)}`, {
      method: 'POST',
    });
  }

  async resetPassword(token: string, newPassword: string): Promise<ApiResponse<{ message: string }>> {
    return this.makeRequest<{ message: string }>(`/auth/reset-password?token=${encodeURIComponent(token)}&new_password=${encodeURIComponent(newPassword)}`, {
      method: 'POST',
    });
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

  async getCompany(companyId: string): Promise<ApiResponse<Company>> {
    return this.makeRequest<Company>(`/companies/${companyId}`);
  }

  async updateCompany(companyId: string, updateData: CompanyUpdateRequest): Promise<ApiResponse<Company>> {
    return this.makeRequest<Company>(`/companies/${companyId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
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
  async getPublicMenu(token: string, menuId?: string): Promise<ApiResponse<PublicMenuResponse>> {
    if (menuId) {
      // For design editor, get menu data by menu ID (requires auth)
      return this.makeRequest<PublicMenuResponse>(`/menus/${menuId}/public-data`);
    }
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

  async uploadMenuFiles(menuId: string, formData: FormData): Promise<ApiResponse<any>> {
    const headers = {
      ...this.getAuthHeader(),
    };
    return this.makeRequest<any>(`/menus/menus/${menuId}/files`, {
      method: 'POST',
      body: formData,
      headers: headers, // Let browser set Content-Type for FormData
    });
  }

  async uploadCustomImageForItem(menuId: string, itemId: string, formData: FormData): Promise<ApiResponse<any>> {
    const headers = {
      ...this.getAuthHeader(),
    };
    return this.makeRequest<any>(`/menus/${menuId}/items/${itemId}/upload-custom-image`, {
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

  async getMenuStats(menuId: string, versionId?: string): Promise<ApiResponse<MenuStats>> {
    const params = versionId ? `?version_id=${versionId}` : '';
    return this.makeRequest<MenuStats>(`/menus/${menuId}/stats${params}`);
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

  async getMenuItems(menuId: string, versionId?: string): Promise<ApiResponse<{ items: MenuItem[]; total: number }>> {
    const params = versionId ? `?version_id=${versionId}` : '';
    return this.makeRequest<{ items: MenuItem[]; total: number }>(`/menus/${menuId}/items${params}`);
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

  async getMenuItemCategories(menuId: string, versionId?: string): Promise<ApiResponse<{ categories: string[] }>> {
    const params = versionId ? `?version_id=${versionId}` : '';
    return this.makeRequest<{ categories: string[] }>(`/menus/${menuId}/items/categories${params}`);
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

  async getLatestOCRJobForMenu(menuId: string): Promise<ApiResponse<OCRJobResponse>> {
    return this.makeRequest<OCRJobResponse>(`/ocr/menus/${menuId}/ocr/jobs/latest`);
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

  async streamChatMessage(
    qrToken: string,
    sessionId: string,
    message: string
  ): Promise<{ response: Response; reader: ReadableStreamDefaultReader<Uint8Array> | null }> {
    const url = `${this.baseUrl}/chat/public/${qrToken}/sessions/${sessionId}/stream`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...this.getAuthHeader(),
    };
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ message, use_cache: true }),
    });
    const reader = response.body ? response.body.getReader() : null;
    return { response, reader };
  }

  async streamChatMessageWithStatus(
    qrToken: string,
    sessionId: string,
    message: string
  ): Promise<{ response: Response; reader: ReadableStreamDefaultReader<Uint8Array> | null }> {
    const url = `${this.baseUrl}/chat/public/${qrToken}/sessions/${sessionId}/stream-with-status`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...this.getAuthHeader(),
    };
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ message, use_cache: true }),
    });
    const reader = response.body ? response.body.getReader() : null;
    return { response, reader };
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

  // Template definition endpoints
  async listTemplateDefinitions(): Promise<ApiResponse<{ definitions: TemplateDefinition[] }>> {
    return this.makeRequest<{ definitions: TemplateDefinition[] }>(`/menus/templates/definitions`)
  }

  // Menu template endpoints
  async listMenuTemplates(menuId: string): Promise<ApiResponse<{ templates: MenuTemplate[] }>> {
    return this.makeRequest<{ templates: MenuTemplate[] }>(`/menus/${menuId}/templates`)
  }

  async createMenuTemplate(menuId: string, payload: { name?: string; definition_key?: string; theme_config?: any; layout_config?: any }): Promise<ApiResponse<{ id: string }>> {
    return this.makeRequest<{ id: string }>(`/menus/${menuId}/templates`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  }

  async publishMenuTemplate(menuId: string, templateId: string, setActive: boolean): Promise<ApiResponse<{ success: boolean }>> {
    const qs = setActive ? '?set_active=true' : '?set_active=false'
    return this.makeRequest<{ success: boolean }>(`/menus/${menuId}/templates/${templateId}/publish${qs}`, {
      method: 'POST',
    })
  }

  async listDesignTemplates(companyId: string): Promise<ApiResponse<{ templates: DesignTemplateMetadata[]; total: number }>> {
    const params = new URLSearchParams()
    params.append('company_id', companyId)
    return this.makeRequest<{ templates: DesignTemplateMetadata[]; total: number }>(`/menus/design-templates?${params.toString()}`)
  }

  async createDesignTemplate(payload: { company_id: string; name: string; description?: string; layout_config: any; theme_config?: any }): Promise<ApiResponse<DesignTemplate>> {
    return this.makeRequest<DesignTemplate>('/menus/design-templates', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  }

  async getDesignTemplate(templateId: string): Promise<ApiResponse<DesignTemplate>> {
    return this.makeRequest<DesignTemplate>(`/menus/design-templates/${templateId}`)
  }

  async updateDesignTemplate(templateId: string, payload: { name?: string; description?: string; layout_config?: any; theme_config?: any }): Promise<ApiResponse<DesignTemplate>> {
    return this.makeRequest<DesignTemplate>(`/menus/design-templates/${templateId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  }

  async deleteDesignTemplate(templateId: string): Promise<ApiResponse<{ success: boolean }>> {
    return this.makeRequest<{ success: boolean }>(`/menus/design-templates/${templateId}`, {
      method: 'DELETE',
    })
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

  async getChatAnalytics(menuId?: string): Promise<ApiResponse<any>> {
    const params = menuId ? `?menu_id=${menuId}` : '';
    return this.makeRequest<any>(`/chat/admin/analytics/overview${params}`);
  }

  async getRestaurantChatAnalytics(restaurantId: string, days?: number): Promise<ApiResponse<any>> {
    const params = days ? `?days=${days}` : '';
    return this.makeRequest<any>(`/analytics/restaurants/${restaurantId}/chat-analytics${params}`);
  }

  async getMenuChatAnalytics(menuId: string, days?: number): Promise<ApiResponse<any>> {
    const params = days ? `?days=${days}` : '';
    return this.makeRequest<any>(`/analytics/menus/${menuId}/chat-analytics${params}`);
  }

  // Tag management endpoints
  async getAvailableTags(category?: string): Promise<ApiResponse<{ tags: TagDefinition[]; total: number }>> {
    const params = category ? `?category=${category}` : '';
    return this.makeRequest<{ tags: TagDefinition[]; total: number }>(`/tags/${params}`);
  }

  async getTagCategories(): Promise<ApiResponse<string[]>> {
    return this.makeRequest<string[]>('/tags/categories');
  }

  async validateTags(tags: string[]): Promise<ApiResponse<{
    valid_tags: string[];
    invalid_tags: string[];
    total_tags: number;
    valid_count: number;
    invalid_count: number;
  }>> {
    return this.makeRequest<{
      valid_tags: string[];
      invalid_tags: string[];
      total_tags: number;
      valid_count: number;
      invalid_count: number;
    }>(`/tags/validate?tags=${tags.join(',')}`);
  }

  async getTagDefinition(tagName: string): Promise<ApiResponse<TagDefinition>> {
    return this.makeRequest<TagDefinition>(`/tags/${tagName}`);
  }

  // Image matching endpoints
  async getExtractedImages(menuId: string): Promise<ApiResponse<ExtractedImagesResponse>> {
    return this.makeRequest<ExtractedImagesResponse>(`/menus/${menuId}/extracted-images`);
  }

  async assignImageToItem(menuId: string, itemId: string, imageId: string): Promise<ApiResponse<ImageAssignmentResponse>> {
    return this.makeRequest<ImageAssignmentResponse>(`/menus/${menuId}/items/${itemId}/assign-image`, {
      method: 'POST',
      body: JSON.stringify({ image_id: imageId }),
    });
  }

  async removeImageFromItem(menuId: string, itemId: string): Promise<ApiResponse<{ success: boolean; message: string; item_id: string }>> {
    return this.makeRequest<{ success: boolean; message: string; item_id: string }>(`/menus/${menuId}/items/${itemId}/image`, {
      method: 'DELETE',
    });
  }

  async autoMatchImages(menuId: string, versionId?: string): Promise<ApiResponse<AutoMatchImagesResponse>> {
    const params = versionId ? `?version_id=${versionId}` : '';
    return this.makeRequest<AutoMatchImagesResponse>(`/menus/${menuId}/auto-match-images${params}`, {
      method: 'POST',
    });
  }

  async triggerImageExtraction(menuId: string, versionId?: string): Promise<ApiResponse<{ success: boolean; message: string; extracted_count: number }>> {
    const params = versionId ? `?version_id=${versionId}` : '';
    return this.makeRequest<{ success: boolean; message: string; extracted_count: number }>(`/menus/${menuId}/extract-images${params}`, {
      method: 'POST',
    });
  }

  // AI Image Generation endpoints
  async generateImageForItem(menuId: string, itemId: string): Promise<ApiResponse<{
    success: boolean;
    message: string;
    image_id?: string;
    image_url?: string;
    search_query?: string;
    match_confidence?: number;
    match_reasoning?: string;
    unsplash_credit?: {
      photographer: string;
      photographer_url: string;
      unsplash_url: string;
    };
  }>> {
    return this.makeRequest<{
      success: boolean;
      message: string;
      image_id?: string;
      image_url?: string;
      search_query?: string;
      match_confidence?: number;
      match_reasoning?: string;
      unsplash_credit?: {
        photographer: string;
        photographer_url: string;
        unsplash_url: string;
      };
    }>(`/menus/${menuId}/items/${itemId}/generate-image`, {
      method: 'POST',
    });
  }

  async regenerateImageForItem(menuId: string, itemId: string): Promise<ApiResponse<{
    success: boolean;
    message: string;
    image_id?: string;
    image_url?: string;
    search_query?: string;
    match_confidence?: number;
    match_reasoning?: string;
    unsplash_credit?: {
      photographer: string;
      photographer_url: string;
      unsplash_url: string;
    };
  }>> {
    return this.makeRequest<{
      success: boolean;
      message: string;
      image_id?: string;
      image_url?: string;
      search_query?: string;
      match_confidence?: number;
      match_reasoning?: string;
      unsplash_credit?: {
        photographer: string;
        photographer_url: string;
        unsplash_url: string;
      };
    }>(`/menus/${menuId}/items/${itemId}/regenerate-image`, {
      method: 'POST',
    });
  }

  async deleteExtractedImage(menuId: string, imageId: string): Promise<ApiResponse<{
    success: boolean;
    message: string;
  }>> {
    return this.makeRequest<{
      success: boolean;
      message: string;
    }>(`/menus/${menuId}/extracted-images/${imageId}`, {
      method: 'DELETE',
    });
  }

  // Source management endpoints
  async createSource(restaurantId: string, data: CreateSourceRequest): Promise<ApiResponse<RestaurantSource>> {
    return this.makeRequest<RestaurantSource>(`/restaurants/${restaurantId}/sources`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getRestaurantSources(restaurantId: string, category?: string): Promise<ApiResponse<RestaurantSource[]>> {
    const params = category ? `?category=${category}` : '';
    return this.makeRequest<RestaurantSource[]>(`/restaurants/${restaurantId}/sources${params}`);
  }

  async getMenuSources(menuId: string): Promise<ApiResponse<RestaurantSource[]>> {
    return this.makeRequest<RestaurantSource[]>(`/menus/${menuId}/sources`);
  }

  async getSource(sourceId: string): Promise<ApiResponse<RestaurantSource>> {
    return this.makeRequest<RestaurantSource>(`/sources/${sourceId}`);
  }

  async updateSource(sourceId: string, data: UpdateSourceRequest): Promise<ApiResponse<RestaurantSource>> {
    return this.makeRequest<RestaurantSource>(`/sources/${sourceId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteSource(sourceId: string): Promise<ApiResponse<void>> {
    return this.makeRequest<void>(`/sources/${sourceId}`, {
      method: 'DELETE',
    });
  }

  async processSource(sourceId: string): Promise<ApiResponse<RestaurantSource>> {
    return this.makeRequest<RestaurantSource>(`/sources/${sourceId}/process`, {
      method: 'POST',
    });
  }

  async uploadSourceDocument(
    restaurantId: string,
    file: File,
    metadata: { source_category: string; menu_id?: string; label?: string }
  ): Promise<ApiResponse<RestaurantSource>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('source_category', metadata.source_category);
    if (metadata.menu_id) {
      formData.append('menu_id', metadata.menu_id);
    }
    if (metadata.label) {
      formData.append('label', metadata.label);
    }

    const headers = {
      ...this.getAuthHeader(),
    };
    return this.makeRequest<RestaurantSource>(`/restaurants/${restaurantId}/sources/upload`, {
      method: 'POST',
      body: formData,
      headers: headers,
    });
  }

  // Menu version management endpoints
  async getMenuVersions(menuId: string): Promise<ApiResponse<MenuVersion[]>> {
    return this.makeRequest<MenuVersion[]>(`/menus/${menuId}/versions`);
  }

  async getDraftVersion(menuId: string): Promise<ApiResponse<MenuVersion>> {
    return this.makeRequest<MenuVersion>(`/menus/${menuId}/versions/draft`);
  }

  async getActiveVersion(menuId: string): Promise<ApiResponse<MenuVersion>> {
    return this.makeRequest<MenuVersion>(`/menus/${menuId}/versions/active`);
  }

  async getVersionItems(menuId: string, versionId: string): Promise<ApiResponse<MenuItem[]>> {
    return this.makeRequest<MenuItem[]>(`/menus/${menuId}/versions/${versionId}/items`);
  }

  async acceptDraft(menuId: string): Promise<ApiResponse<MenuVersion>> {
    return this.makeRequest<MenuVersion>(`/menus/${menuId}/versions/draft/accept`, {
      method: 'POST',
    });
  }

  async acceptVersion(menuId: string, versionId: string): Promise<ApiResponse<MenuVersion>> {
    return this.makeRequest<MenuVersion>(`/menus/${menuId}/versions/${versionId}/accept`, {
      method: 'POST',
    });
  }

  async restoreVersion(menuId: string, versionId: string): Promise<ApiResponse<MenuVersion>> {
    return this.makeRequest<MenuVersion>(`/menus/${menuId}/versions/${versionId}/restore`, {
      method: 'POST',
    });
  }

  async discardDraft(menuId: string): Promise<ApiResponse<void>> {
    return this.makeRequest<void>(`/menus/${menuId}/versions/draft`, {
      method: 'DELETE',
    });
  }

  async discardVersion(menuId: string, versionId: string): Promise<ApiResponse<void>> {
    return this.makeRequest<void>(`/menus/${menuId}/versions/${versionId}`, {
      method: 'DELETE',
    });
  }

  async updateVersion(menuId: string, versionId: string, data: { name?: string }): Promise<ApiResponse<MenuVersion>> {
    return this.makeRequest<MenuVersion>(`/menus/${menuId}/versions/${versionId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async compileSources(menuId: string): Promise<ApiResponse<{ status: string; source_count: number }>> {
    return this.makeRequest<{ status: string; source_count: number }>(`/menus/${menuId}/sources/compile`, {
      method: 'POST',
    });
  }

  // Onboarding endpoints
  async quickSetup(data: QuickSetupRequest): Promise<ApiResponse<QuickSetupResponse>> {
    return this.makeRequest<QuickSetupResponse>('/onboarding/quick-setup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Billing endpoints
  async getSubscription(): Promise<ApiResponse<BillingSubscription>> {
    return this.makeRequest<BillingSubscription>('/billing/subscription');
  }

  async getUsage(): Promise<ApiResponse<BillingUsage>> {
    return this.makeRequest<BillingUsage>('/billing/usage');
  }

  async getPlans(): Promise<ApiResponse<{ plans: BillingPlan[] }>> {
    return this.makeRequest<{ plans: BillingPlan[] }>('/billing/plans');
  }

  async createCheckout(data: CheckoutRequest): Promise<ApiResponse<CheckoutResponse>> {
    return this.makeRequest<CheckoutResponse>('/billing/checkout', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async cancelSubscription(): Promise<ApiResponse<{ message: string }>> {
    return this.makeRequest<{ message: string }>('/billing/cancel', {
      method: 'POST',
    });
  }

  async updatePlan(data: UpdatePlanRequest): Promise<ApiResponse<UpdatePlanResponse>> {
    return this.makeRequest<UpdatePlanResponse>('/billing/update-plan', {
      method: 'POST',
      body: JSON.stringify(data),
    });
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
  CompanyUpdateRequest,
  Restaurant,
  RestaurantCreateRequest,
  RestaurantUpdateRequest,
  RestaurantListResponse,
  AuthTokens,
  LoginRequest,
  RegisterRequest,
  UserUpdateRequest,
  ApiResponse,
  MenuItem,
  Menu,
  DesignTemplate,
  DesignTemplateMetadata,
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
  TagDefinition,
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
  CurrencyListResponse,
  ExtractedMenuImage,
  ExtractedImagesResponse,
  ImageAssignmentRequest,
  ImageAssignmentResponse,
  AutoMatchImagesResponse,
  RestaurantSource,
  CreateSourceRequest,
  UpdateSourceRequest,
  MenuVersion,
  OnboardingSourceInput,
  QuickSetupRequest,
  QuickSetupResponse,
  BillingSubscription,
  BillingUsage,
  BillingPlan,
  CheckoutRequest,
  CheckoutResponse,
  UpdatePlanRequest,
  UpdatePlanResponse
}; 
