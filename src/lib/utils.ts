import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwindcss-merge';

// Utility function to merge Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format date function
export function formatDate(date: Date | string) {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Format relative time
export function formatRelativeTime(date: Date | string) {
  const d = new Date(date);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
  };

  for (const [unit, seconds] of Object.entries(intervals)) {
    const interval = Math.floor(diffInSeconds / seconds);
    if (interval >= 1) {
      return `${interval} ${unit}${interval === 1 ? '' : 's'} ago`;
    }
  }

  return 'Just now';
}

// Validate email function
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Generate slug from string
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// Truncate text
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

// Debounce function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Capitalize first letter
export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

// Format number with commas
export function formatNumber(num: number): string {
  return num.toLocaleString();
}

// Generate random ID
export function generateId(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Convert bytes to human readable format
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Check if string is URL
export function isUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

// Get initials from name
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// Sleep function for delays
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// API response helper
export function apiResponse<T>(
  success: boolean,
  data?: T,
  message?: string,
  status: number = 200
) {
  return Response.json(
    {
      success,
      data,
      message,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

// Error response helper
export function errorResponse(message: string, status: number = 400) {
  return apiResponse(false, null, message, status);
}

// Success response helper
export function successResponse<T>(data: T, message?: string) {
  return apiResponse(true, data, message, 200);
}

// Validation helpers
export const validators = {
  email: (email: string) => isValidEmail(email),
  required: (value: any) => value !== null && value !== undefined && value !== '',
  minLength: (value: string, min: number) => value.length >= min,
  maxLength: (value: string, max: number) => value.length <= max,
  url: (value: string) => isUrl(value),
};

// Common game types for XEUR.AI
export const gameTypes = [
  'Action/Adventure',
  'RPG',
  'Puzzle',
  'Racing',
  'Strategy',
  'Shooter',
  'Platformer',
  'Simulation',
  'Sports',
  'Fighting',
  'Horror',
  'Casual',
  'Educational',
  'Multiple genres',
  'Other',
] as const;

// Experience levels
export const experienceLevels = [
  'Beginner',
  'Intermediate',
  'Advanced',
  'Professional',
] as const;

// Platform options
export const platforms = [
  'PC',
  'Mobile (iOS)',
  'Mobile (Android)',
  'Web',
  'Web3',
  'Console',
  'VR/AR',
  'All platforms',
] as const;

// Contact types
export const contactTypes = [
  'General',
  'Technical',
  'Partnership',
  'Investment',
  'Press',
  'Support',
] as const;