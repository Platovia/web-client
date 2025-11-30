import type { MenuItem } from "@/lib/api";

export interface RestaurantInfo {
  id: string;
  name: string;
  description?: string;
  logo_url?: string;
  currency_code?: string;
  locale?: string;
}

export interface MenuThemeConfig {
  colors?: {
    primary?: string;
    surface?: string;
    background?: string;
    text?: string;
    price?: string;
  };
  radii?: {
    card?: number;
  };
  layout?: {
    density?: "comfortable" | "compact";
  };
}

export interface MenuRendererProps {
  templateId?: string;
  restaurant: RestaurantInfo;
  items: MenuItem[];
  themeConfig?: MenuThemeConfig | null;
  categories: string[];
  selectedCategory: string;
  searchQuery: string;
  onChangeCategory: (category: string) => void;
  onChangeSearch: (query: string) => void;
  formatPrice?: (price: number) => string;
  resolveImageUrl?: (url?: string) => string;
}


