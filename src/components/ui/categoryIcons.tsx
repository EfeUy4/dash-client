import {
  Shirt,
  Watch,
  Gem,
  ShoppingBag,
  Footprints,
  Glasses,
  Package,
  LucideIcon,
} from "lucide-react";

interface CategoryIconProps {
  categoryName: string;
  size?: "sm" | "md" | "lg" | "xl";
  strokeWidth?: number;
  className?: string;
}

interface IconConfig {
  icon: LucideIcon;
  keywords: string[];
  gradient?: string;
  description?: string;
}

// Category configuration with icons, keywords, and metadata
const CATEGORY_CONFIG: Record<string, IconConfig> = {
  clothing: {
    icon: Shirt,
    keywords: [
      "clothing", "clothes", "apparel", "fashion", "wear", "garments", 
      "outfits", "tops", "bottoms", "dresses", "shirts", "pants", "jeans",
      "t-shirts", "sweaters", "jackets", "coats", "blouses", "skirts"
    ],
    gradient: "from-indigo-500 to-purple-600",
    description: "Discover premium contemporary clothing for every occasion"
  },
  
  shoes: {
    icon: Footprints,
    keywords: [
      "shoes", "shoe", "footwear", "sneakers", "boots", "sandals", 
      "heels", "flats", "loafers", "trainers", "slippers", "pumps",
      "oxfords", "moccasins", "clogs", "wedges", "stilettos"
    ],
    gradient: "from-amber-500 to-orange-600",
    description: "Step out in style with our footwear collection"
  },
  
  bags: {
    icon: ShoppingBag,
    keywords: [
      "bags", "bag", "handbags", "handbag", "purses", "purse", "backpacks", 
      "backpack", "totes", "tote", "clutches", "clutch", "satchels", "satchel",
      "luggage", "wallets", "wallet", "briefcases", "messenger", "crossbody"
    ],
    gradient: "from-slate-500 to-gray-600",
    description: "Carry elegance with luxury bags and purses"
  },
  
  jewelry: {
    icon: Gem,
    keywords: [
      "jewelry", "jewellery", "jewels", "gems", "necklaces", "necklace", 
      "rings", "ring", "earrings", "earring", "bracelets", "bracelet",
      "chains", "chain", "pendants", "pendant", "diamonds", "gold", "silver"
    ],
    gradient: "from-yellow-500 to-amber-600",
    description: "Sparkle with exquisite jewelry pieces"
  },
  
  watches: {
    icon: Watch,
    keywords: [
      "watches", "watch", "timepieces", "timepiece", "clocks", "clock",
      "smartwatches", "smartwatch", "chronograph", "digital", "analog"
    ],
    gradient: "from-blue-500 to-indigo-600",
    description: "Timeless pieces for the modern sophisticate"
  },
  
  accessories: {
    icon: Glasses,
    keywords: [
      "accessories", "accessory", "acc", "extras", "add-ons", "addons",
      "glasses", "eyewear", "sunglasses", "specs", "spectacles", "frames",
      "belts", "scarves", "hats", "caps", "ties", "cufflinks"
    ],
    gradient: "from-green-500 to-emerald-600",
    description: "Complete your look with curated accessories"
  }
};

// Size configurations
const SIZE_CONFIG = {
  sm: "w-4 h-4",
  md: "w-6 h-6", 
  lg: "w-8 h-8",
  xl: "w-12 h-12"
};

/**
 * Get category configuration by name
 */
export const getCategoryConfig = (categoryName: string): IconConfig => {
  const normalizedName = categoryName.toLowerCase().trim();
  
  // Direct match first
  if (CATEGORY_CONFIG[normalizedName]) {
    return CATEGORY_CONFIG[normalizedName];
  }
  
  // Keyword matching
  for (const [key, config] of Object.entries(CATEGORY_CONFIG)) {
    console.log(key)
    if (config.keywords.some(keyword => 
      normalizedName.includes(keyword) || keyword.includes(normalizedName)
    )) {
      return config;
    }
  }
  
  // Fallback
  return {
    icon: Package,
    keywords: [],
    gradient: "from-neutral-500 to-gray-600",
    description: `Explore our ${categoryName} collection`
  };
};

/**
 * Get category icon component
 */
export const getCategoryIcon = (
  categoryName: string, 
  size: keyof typeof SIZE_CONFIG = "lg",
  strokeWidth: number = 1
): React.ReactNode => {
  const config = getCategoryConfig(categoryName);
  const Icon = config.icon;
  
  return <Icon className={SIZE_CONFIG[size]} strokeWidth={strokeWidth} />;
};

/**
 * Get category gradient classes
 */
export const getCategoryGradient = (categoryName: string): string => {
  const config = getCategoryConfig(categoryName);
  return config.gradient || "from-neutral-500 to-gray-600";
};

/**
 * Get category description
 */
export const getCategoryDescription = (categoryName: string): string => {
  const config = getCategoryConfig(categoryName);
  return config.description || `Explore our ${categoryName} collection`;
};

/**
 * CategoryIcon React Component
 */
export const CategoryIcon: React.FC<CategoryIconProps> = ({
  categoryName,
  size = "lg",
  strokeWidth = 1,
  className = ""
}) => {
  const config = getCategoryConfig(categoryName);
  const Icon = config.icon;
  
  return (
    <Icon 
      className={`${SIZE_CONFIG[size]} ${className}`} 
      strokeWidth={strokeWidth} 
    />
  );
};

/**
 * Get all available categories
 */
export const getAvailableCategories = () => {
  return Object.keys(CATEGORY_CONFIG);
};

/**
 * Check if a category name matches any known category
 */
export const isKnownCategory = (categoryName: string): boolean => {
  const config = getCategoryConfig(categoryName);
  return config.icon !== Package;
};