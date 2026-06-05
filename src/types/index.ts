import { Timestamp } from 'firebase/firestore';

export interface SimCard {
  id: string;
  number: string; // Full number with +84 prefix
  carrier: string;
  category: string;
  price: number; // Price in VND
  description?: string;
}

// Extended SimCard type for Firestore
export interface SimCardDocument {
  id: string;
  number: string;
  carrier: 'Viettel' | 'Mobifone' | 'Vinaphone';
  category: 'Phong Thủy' | 'Lộc Phát' | 'Thần Tài' | 'Số Đẹp' | 'Giá Rẻ';
  price: number;
  description?: string;
  createdAt: Timestamp;
}

// Input type for creating/updating (no id or createdAt)
export interface SimCardInput {
  number: string;
  carrier: string;
  category: string;
  price: number;
  description?: string;
}

// Validation result
export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>; // field -> error message
}

// Bulk operation results
export interface BulkResult {
  successCount: number;
  failedCount: number;
  failures: { index: number; errors: Record<string, string> }[];
}

// File parsing result
export interface ParseResult<T> {
  success: boolean;
  data: T[];
  errors: { row: number; message: string }[];
}

export interface CartItem {
  simCard: SimCard;
  addedAt: Date;
}

export interface InquiryForm {
  name: string;
  phone: string;
  email: string;
  idNumber: string; // Số Căn Cước Công Dân
  message?: string;
}

export type CarrierType = 'Viettel' | 'Mobifone' | 'Vinaphone' | 'All';

export type CategoryType = 'Phong Thủy' | 'Lộc Phát' | 'Thần Tài' | 'Số Đẹp' | 'Giá Rẻ' | 'All';

export type SortType = 'random' | 'price-asc' | 'price-desc' | 'newest' | 'oldest';

export type ViewType = 'card' | 'list';
