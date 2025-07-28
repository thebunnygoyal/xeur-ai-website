// Database types (matching Prisma schema)
export interface User {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

export interface WaitlistEntry {
  id: string;
  email: string;
  name: string | null;
  gameTypes: string[];
  experience: Experience;
  status: Status;
  source: string | null;
  priority: number;
  createdAt: Date;
  updatedAt: Date;
  userId: string | null;
}

export interface ContactForm {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  type: ContactType;
  status: Status;
  response: string | null;
  respondedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  userId: string | null;
}

export interface Newsletter {
  id: string;
  email: string;
  name: string | null;
  isActive: boolean;
  preferences: any | null;
  source: string | null;
  createdAt: Date;
  updatedAt: Date;
  userId: string | null;
}

export interface InvestmentInquiry {
  id: string;
  name: string;
  email: string;
  company: string | null;
  position: string | null;
  investmentSize: string | null;
  message: string;
  status: Status;
  fundType: string | null;
  timeline: string | null;
  response: string | null;
  respondedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AlphaApplication {
  id: string;
  email: string;
  name: string;
  experience: Experience;
  gameTypes: string[];
  platforms: string[];
  background: string | null;
  portfolio: string | null;
  motivation: string;
  status: ApplicationStatus;
  score: number;
  feedback: string | null;
  approvedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PartnershipInquiry {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  website: string | null;
  partnerType: PartnershipType;
  description: string;
  proposedValue: string | null;
  status: Status;
  response: string | null;
  respondedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Analytics {
  id: string;
  event: string;
  page: string | null;
  data: any | null;
  userAgent: string | null;
  ipAddress: string | null;
  timestamp: Date;
}

// Enums
export type Role = 'USER' | 'ADMIN' | 'FOUNDER';
export type Experience = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'PROFESSIONAL';
export type Status = 'PENDING' | 'APPROVED' | 'REJECTED' | 'RESPONDED' | 'ARCHIVED';
export type ApplicationStatus = 'PENDING' | 'REVIEWING' | 'APPROVED' | 'REJECTED' | 'WAITLISTED';
export type ContactType = 'GENERAL' | 'TECHNICAL' | 'PARTNERSHIP' | 'INVESTMENT' | 'PRESS' | 'SUPPORT';
export type PartnershipType = 'TECHNOLOGY' | 'STRATEGIC' | 'DISTRIBUTION' | 'CONTENT' | 'ENTERPRISE' | 'ACADEMIC';

// Form types
export interface WaitlistFormData {
  email: string;
  name?: string;
  gameTypes: string[];
  experience: Experience;
  source?: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  type: ContactType;
}

export interface NewsletterFormData {
  email: string;
  name?: string;
  source?: string;
}

export interface InvestmentFormData {
  name: string;
  email: string;
  company?: string;
  position?: string;
  investmentSize?: string;
  message: string;
  fundType?: string;
  timeline?: string;
}

export interface AlphaApplicationFormData {
  email: string;
  name: string;
  experience: Experience;
  gameTypes: string[];
  platforms: string[];
  background?: string;
  portfolio?: string;
  motivation: string;
}

export interface PartnershipFormData {
  companyName: string;
  contactName: string;
  email: string;
  website?: string;
  partnerType: PartnershipType;
  description: string;
  proposedValue?: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  timestamp: string;
}

export interface ApiError {
  success: false;
  message: string;
  timestamp: string;
}

// Component props types
export interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

export interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  type?: 'text' | 'email' | 'password' | 'tel' | 'url';
  className?: string;
}

export interface SelectProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  error?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export interface TextareaProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  rows?: number;
  className?: string;
}

// Navigation types
export interface NavItem {
  label: string;
  href: string;
  isActive?: boolean;
}

// Team member types
export interface TeamMember {
  name: string;
  role: string;
  description: string;
  image?: string;
  linkedin?: string;
  github?: string;
  email?: string;
}

// AI Model types
export interface AIModel {
  name: string;
  status: 'Active' | 'Development' | 'Planned';
  function: string;
  specialty: string;
  timeline?: string;
}

// Partnership types
export interface Partnership {
  name: string;
  type: string;
  description: string;
  benefits?: string;
  logo?: string;
  url?: string;
}

// Milestone types
export interface Milestone {
  quarter: string;
  revenue: number;
  users: number;
  product: string;
  team: string;
  status: 'completed' | 'current' | 'upcoming' | 'planned';
}

// Analytics types
export interface AnalyticsEvent {
  event: string;
  page?: string;
  data?: Record<string, any>;
  timestamp?: Date;
}

// Investment types
export interface InvestmentRound {
  type: 'Pre-SEED' | 'SEED' | 'Series A' | 'Series B';
  amount: number;
  valuation: number;
  status: 'Planning' | 'Raising' | 'Closed';
  timeline?: string;
  useOfFunds?: {
    category: string;
    percentage: number;
    description: string;
  }[];
}

// Revenue stream types
export interface RevenueStream {
  name: string;
  description: string;
  percentage: number;
  yearThree: number;
  type: 'SaaS' | 'Transaction' | 'API' | 'Marketplace' | 'Enterprise';
}

// Market data types
export interface MarketData {
  tam: number;
  sam: number;
  som: number;
  growth: number;
  description: string;
}

// Competitive analysis types  
export interface Competitor {
  name: string;
  strengths: string[];
  weaknesses: string[];
  marketShare?: number;
  funding?: number;
}

// Feature comparison types
export interface FeatureComparison {
  feature: string;
  xeurAi: boolean | string;
  competitors: Record<string, boolean | string>;
}

// Validation types
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
}

export interface ValidationSchema {
  [key: string]: ValidationRule;
}

// Toast notification types
export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

// Theme types
export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  fonts: {
    heading: string;
    body: string;
    mono: string;
  };
}

// Export utility types
export type GameType = typeof import('../lib/utils').gameTypes[number];
export type ExperienceLevel = typeof import('../lib/utils').experienceLevels[number];
export type Platform = typeof import('../lib/utils').platforms[number];
export type ContactTypeOption = typeof import('../lib/utils').contactTypes[number];