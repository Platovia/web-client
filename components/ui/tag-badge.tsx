/**
 * Dynamic tag badge component that displays tags with proper styling
 */

import React from 'react';
import { Badge } from './badge';
import { getTagDisplayInfo, type TagDisplayInfo } from '@/lib/tags';
import { 
  Leaf, 
  Heart, 
  Wheat, 
  AlertTriangle, 
  Thermometer, 
  Flame,
  Award,
  Crown,
  TrendingUp,
  Sparkles,
  Star,
  Zap,
  TrendingDown,
  Seedling,
  ChefHat,
  Wind,
  Snowflake
} from 'lucide-react';

// Icon mapping
const ICON_MAP: Record<string, React.ComponentType<any>> = {
  Leaf,
  Heart,
  Wheat,
  AlertTriangle,
  Thermometer,
  Flame,
  Award,
  Crown,
  TrendingUp,
  Sparkles,
  Star,
  Zap,
  TrendingDown,
  Seedling,
  ChefHat,
  Wind,
  Snowflake,
};

interface TagBadgeProps {
  tagName: string;
  className?: string;
  showIcon?: boolean;
  size?: 'sm' | 'default' | 'lg';
}

export function TagBadge({ tagName, className = '', showIcon = true, size = 'default' }: TagBadgeProps) {
  const tagInfo = getTagDisplayInfo(tagName);
  
  if (!tagInfo) {
    // Fallback for unknown tags
    return (
      <Badge variant="outline" className={`text-gray-600 border-gray-600 ${className}`}>
        {tagName.replace(/_/g, ' ')}
      </Badge>
    );
  }

  const IconComponent = ICON_MAP[tagInfo.icon];
  const iconSize = size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4';

  return (
    <Badge
      variant="outline"
      className={`border-2 ${className}`}
      style={{
        borderColor: tagInfo.color,
        color: tagInfo.color,
      }}
      title={tagInfo.description}
    >
      {showIcon && IconComponent && (
        <IconComponent className={`${iconSize} mr-1`} />
      )}
      {tagInfo.display_name}
    </Badge>
  );
}

interface TagListProps {
  tags: string[];
  className?: string;
  showIcons?: boolean;
  maxTags?: number;
  size?: 'sm' | 'default' | 'lg';
}

export function TagList({ 
  tags, 
  className = '', 
  showIcons = true, 
  maxTags,
  size = 'default' 
}: TagListProps) {
  const displayTags = maxTags ? tags.slice(0, maxTags) : tags;
  const remainingCount = maxTags && tags.length > maxTags ? tags.length - maxTags : 0;

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {displayTags.map((tag) => (
        <TagBadge
          key={tag}
          tagName={tag}
          showIcon={showIcons}
          size={size}
        />
      ))}
      {remainingCount > 0 && (
        <Badge variant="outline" className="text-gray-500 border-gray-400">
          +{remainingCount} more
        </Badge>
      )}
    </div>
  );
}