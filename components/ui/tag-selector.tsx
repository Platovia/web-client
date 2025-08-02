/**
 * Tag selector component for selecting multiple tags from predefined options
 */

import React, { useState, useEffect } from 'react';
import { Badge } from './badge';
import { Button } from './button';
import { Input } from './input';
import { TagList, TagBadge } from './tag-badge';
import { getTagsByCategory, getTagCategories, searchTags, type TagDisplayInfo } from '@/lib/tags';
import { X, Search, Plus } from 'lucide-react';

interface TagSelectorProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  className?: string;
  placeholder?: string;
  maxTags?: number;
}

export function TagSelector({ 
  selectedTags, 
  onTagsChange, 
  className = '',
  placeholder = "Search and select tags...",
  maxTags 
}: TagSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const categories = getTagCategories();
  
  // Get available tags based on category or search
  const getAvailableTags = (): TagDisplayInfo[] => {
    if (searchTerm) {
      return searchTags(searchTerm);
    }
    if (selectedCategory) {
      return getTagsByCategory(selectedCategory);
    }
    // Show dietary tags by default
    return getTagsByCategory('dietary');
  };

  const availableTags = getAvailableTags();

  const handleTagToggle = (tagName: string) => {
    if (selectedTags.includes(tagName)) {
      onTagsChange(selectedTags.filter(tag => tag !== tagName));
    } else {
      if (maxTags && selectedTags.length >= maxTags) {
        return; // Don't add if at max limit
      }
      onTagsChange([...selectedTags, tagName]);
    }
  };

  const handleRemoveTag = (tagName: string) => {
    onTagsChange(selectedTags.filter(tag => tag !== tagName));
  };

  return (
    <div className={`relative ${className}`}>
      {/* Selected tags display */}
      <div className="mb-2">
        <TagList 
          tags={selectedTags}
          size="sm"
        />
        {selectedTags.length === 0 && (
          <p className="text-sm text-gray-500">No tags selected</p>
        )}
      </div>

      {/* Add tags button */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="mb-2"
      >
        <Plus className="h-4 w-4 mr-1" />
        Add Tags
      </Button>

      {/* Tag selector dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-h-96 overflow-y-auto">
          {/* Search */}
          <div className="mb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={placeholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Category filter */}
          {!searchTerm && (
            <div className="mb-3">
              <div className="flex flex-wrap gap-1">
                <Button
                  type="button"
                  variant={selectedCategory === '' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory('')}
                >
                  All
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category}
                    type="button"
                    variant={selectedCategory === category ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category.replace('_', ' ')}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Available tags */}
          <div className="space-y-2">
            {availableTags.length === 0 ? (
              <p className="text-sm text-gray-500">No tags found</p>
            ) : (
              <div className="grid grid-cols-1 gap-1">
                {availableTags.map((tag) => (
                  <button
                    key={tag.name}
                    type="button"
                    onClick={() => handleTagToggle(tag.name)}
                    className={`flex items-center justify-between p-2 rounded-lg border-2 transition-colors ${
                      selectedTags.includes(tag.name)
                        ? 'bg-blue-50 border-blue-200'
                        : 'hover:bg-gray-50 border-gray-200'
                    }`}
                    disabled={maxTags && !selectedTags.includes(tag.name) && selectedTags.length >= maxTags}
                  >
                    <div className="flex items-center">
                      <TagBadge 
                        tagName={tag.name} 
                        size="sm"
                        className="mr-2"
                      />
                      <span className="text-xs text-gray-500">{tag.description}</span>
                    </div>
                    {selectedTags.includes(tag.name) && (
                      <X className="h-4 w-4 text-blue-600" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Close button */}
          <div className="mt-3 flex justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              Done
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}