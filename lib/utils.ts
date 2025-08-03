import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Resolve image URL to include backend server URL if it's a relative path
 */
export function resolveImageUrl(imageUrl: string | null | undefined): string | undefined {
  if (!imageUrl) return undefined
  
  // If it's already a full URL, return as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl
  }
  
  // If it's a relative path starting with /uploads/, prepend backend URL
  if (imageUrl.startsWith('/uploads/')) {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    return `${API_BASE_URL}${imageUrl}`
  }
  
  // For other relative paths, return as is
  return imageUrl
}
