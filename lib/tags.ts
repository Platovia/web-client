/**
 * Tag utility functions for the frontend
 */

export interface TagDisplayInfo {
  name: string;
  display_name: string;
  category: string;
  description: string;
  color: string;
  icon: string;
  is_system_tag: boolean;
}

// Predefined tag definitions (matches backend)
export const PREDEFINED_TAGS: Record<string, TagDisplayInfo> = {
  // Dietary tags
  vegetarian: {
    name: "vegetarian",
    display_name: "Vegetarian",
    category: "dietary",
    description: "Contains no meat or fish",
    color: "#16A34A",
    icon: "Leaf",
    is_system_tag: true
  },
  vegan: {
    name: "vegan",
    display_name: "Vegan",
    category: "dietary",
    description: "Contains no animal products",
    color: "#15803D",
    icon: "Heart",
    is_system_tag: true
  },
  gluten_free: {
    name: "gluten_free",
    display_name: "Gluten Free",
    category: "dietary",
    description: "Contains no gluten",
    color: "#2563EB",
    icon: "Wheat",
    is_system_tag: true
  },
  dairy_free: {
    name: "dairy_free",
    display_name: "Dairy Free",
    category: "dietary",
    description: "Contains no dairy products",
    color: "#7C3AED",
    icon: "AlertTriangle",
    is_system_tag: true
  },
  keto: {
    name: "keto",
    display_name: "Keto",
    category: "dietary",
    description: "Ketogenic diet friendly",
    color: "#DC2626",
    icon: "Zap",
    is_system_tag: true
  },
  low_carb: {
    name: "low_carb",
    display_name: "Low Carb",
    category: "dietary",
    description: "Low in carbohydrates",
    color: "#EA580C",
    icon: "TrendingDown",
    is_system_tag: true
  },
  halal: {
    name: "halal",
    display_name: "Halal",
    category: "dietary",
    description: "Prepared according to Islamic law",
    color: "#059669",
    icon: "Star",
    is_system_tag: true
  },
  kosher: {
    name: "kosher",
    display_name: "Kosher",
    category: "dietary",
    description: "Prepared according to Jewish law",
    color: "#0891B2",
    icon: "Star",
    is_system_tag: true
  },
  organic: {
    name: "organic",
    display_name: "Organic",
    category: "dietary",
    description: "Made with organic ingredients",
    color: "#65A30D",
    icon: "Seedling",
    is_system_tag: true
  },

  // Allergen tags
  contains_nuts: {
    name: "contains_nuts",
    display_name: "Contains Nuts",
    category: "allergen",
    description: "Contains tree nuts or peanuts",
    color: "#B45309",
    icon: "AlertTriangle",
    is_system_tag: true
  },
  contains_shellfish: {
    name: "contains_shellfish",
    display_name: "Contains Shellfish",
    category: "allergen",
    description: "Contains shellfish",
    color: "#BE185D",
    icon: "AlertTriangle",
    is_system_tag: true
  },
  contains_eggs: {
    name: "contains_eggs",
    display_name: "Contains Eggs",
    category: "allergen",
    description: "Contains eggs",
    color: "#A21CAF",
    icon: "AlertTriangle",
    is_system_tag: true
  },
  contains_soy: {
    name: "contains_soy",
    display_name: "Contains Soy",
    category: "allergen",
    description: "Contains soy products",
    color: "#7C2D12",
    icon: "AlertTriangle",
    is_system_tag: true
  },

  // Spice level tags
  mild: {
    name: "mild",
    display_name: "Mild",
    category: "spice_level",
    description: "Mild spice level",
    color: "#84CC16",
    icon: "Thermometer",
    is_system_tag: true
  },
  medium: {
    name: "medium",
    display_name: "Medium",
    category: "spice_level",
    description: "Medium spice level",
    color: "#EAB308",
    icon: "Thermometer",
    is_system_tag: true
  },
  spicy: {
    name: "spicy",
    display_name: "Spicy",
    category: "spice_level",
    description: "Hot and spicy",
    color: "#F97316",
    icon: "Flame",
    is_system_tag: true
  },
  very_spicy: {
    name: "very_spicy",
    display_name: "Very Spicy",
    category: "spice_level",
    description: "Very hot and spicy",
    color: "#DC2626",
    icon: "Flame",
    is_system_tag: true
  },

  // Preparation tags
  grilled: {
    name: "grilled",
    display_name: "Grilled",
    category: "preparation",
    description: "Cooked on a grill",
    color: "#78716C",
    icon: "Flame",
    is_system_tag: true
  },
  fried: {
    name: "fried",
    display_name: "Fried",
    category: "preparation",
    description: "Deep fried or pan fried",
    color: "#A16207",
    icon: "ChefHat",
    is_system_tag: true
  },
  baked: {
    name: "baked",
    display_name: "Baked",
    category: "preparation",
    description: "Baked in oven",
    color: "#92400E",
    icon: "ChefHat",
    is_system_tag: true
  },
  steamed: {
    name: "steamed",
    display_name: "Steamed",
    category: "preparation",
    description: "Cooked with steam",
    color: "#0E7490",
    icon: "Wind",
    is_system_tag: true
  },
  raw: {
    name: "raw",
    display_name: "Raw",
    category: "preparation",
    description: "Served raw or uncooked",
    color: "#475569",
    icon: "Leaf",
    is_system_tag: true
  },

  // Temperature tags
  hot: {
    name: "hot",
    display_name: "Hot",
    category: "temperature",
    description: "Served hot",
    color: "#EF4444",
    icon: "Thermometer",
    is_system_tag: true
  },
  cold: {
    name: "cold",
    display_name: "Cold",
    category: "temperature",
    description: "Served cold",
    color: "#3B82F6",
    icon: "Snowflake",
    is_system_tag: true
  },

  // Style tags
  signature: {
    name: "signature",
    display_name: "Signature Dish",
    category: "style",
    description: "Restaurant signature dish",
    color: "#F59E0B",
    icon: "Award",
    is_system_tag: true
  },
  chef_special: {
    name: "chef_special",
    display_name: "Chef's Special",
    category: "style",
    description: "Chef's special recommendation",
    color: "#8B5CF6",
    icon: "Crown",
    is_system_tag: true
  },
  popular: {
    name: "popular",
    display_name: "Popular",
    category: "style",
    description: "Popular among customers",
    color: "#10B981",
    icon: "TrendingUp",
    is_system_tag: true
  },
  new: {
    name: "new",
    display_name: "New",
    category: "style",
    description: "New menu item",
    color: "#06B6D4",
    icon: "Sparkles",
    is_system_tag: true
  }
};

/**
 * Get display information for a tag
 */
export function getTagDisplayInfo(tagName: string): TagDisplayInfo | null {
  return PREDEFINED_TAGS[tagName] || null;
}

/**
 * Get display information for multiple tags
 */
export function getTagsDisplayInfo(tags: string[]): TagDisplayInfo[] {
  return tags
    .map(tag => getTagDisplayInfo(tag))
    .filter((info): info is TagDisplayInfo => info !== null);
}

/**
 * Check if a tag is valid (exists in predefined tags)
 */
export function isValidTag(tagName: string): boolean {
  return tagName in PREDEFINED_TAGS;
}

/**
 * Get all tags in a specific category
 */
export function getTagsByCategory(category: string): TagDisplayInfo[] {
  return Object.values(PREDEFINED_TAGS).filter(tag => tag.category === category);
}

/**
 * Get all available categories
 */
export function getTagCategories(): string[] {
  const categories = new Set(Object.values(PREDEFINED_TAGS).map(tag => tag.category));
  return Array.from(categories);
}

/**
 * Filter tags by search term
 */
export function searchTags(searchTerm: string): TagDisplayInfo[] {
  const term = searchTerm.toLowerCase();
  return Object.values(PREDEFINED_TAGS).filter(tag => 
    tag.display_name.toLowerCase().includes(term) ||
    tag.description.toLowerCase().includes(term) ||
    tag.name.toLowerCase().includes(term)
  );
}