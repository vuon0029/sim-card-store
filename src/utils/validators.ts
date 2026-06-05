import type { ValidationResult } from '../types';

const ALLOWED_CARRIERS = ['Viettel', 'Mobifone', 'Vinaphone'] as const;
const ALLOWED_CATEGORIES = ['Phong Thủy', 'Lộc Phát', 'Thần Tài', 'Số Đẹp', 'Giá Rẻ'] as const;

/**
 * Validates that a carrier string is one of the allowed values.
 */
export function validateCarrier(carrier: string): boolean {
  return (ALLOWED_CARRIERS as readonly string[]).includes(carrier);
}

/**
 * Validates that a category string is one of the allowed values.
 */
export function validateCategory(category: string): boolean {
  return (ALLOWED_CATEGORIES as readonly string[]).includes(category);
}

/**
 * Validates a SIM card input object, checking all required fields
 * and returning field-specific error messages.
 */
export function validateSimCard(data: unknown): ValidationResult {
  const errors: Record<string, string> = {};

  if (data === null || data === undefined || typeof data !== 'object') {
    return { valid: false, errors: { _form: 'Input must be an object' } };
  }

  const input = data as Record<string, unknown>;

  // Validate number
  if (input.number === undefined || input.number === null) {
    errors.number = 'Phải nhập số điện thoại';
  } else if (typeof input.number !== 'string' || input.number.trim() === '') {
    errors.number = 'Số điện thoại không hợp lệ';
  }

  // Validate carrier
  if (input.carrier === undefined || input.carrier === null) {
    errors.carrier = 'Phải chọn Nhà mạng';
  } else if (typeof input.carrier !== 'string') {
    errors.carrier = 'Nhà mạng không hợp lệ';
  } else if (!validateCarrier(input.carrier)) {
    errors.carrier = 'Nhà mạng phải thuộc danh sách: Viettel, Mobifone, Vinaphone';
  }

  // Validate category (optional, but if provided must be valid)
  if (input.category !== undefined && input.category !== null && input.category !== '') {
    if (typeof input.category !== 'string') {
      errors.category = 'Phải chọn danh mục';
    } else if (!validateCategory(input.category)) {
      errors.category = 'Danh mục phải thuộc danh sách: Phong Thủy, Lộc Phát, Thần Tài, Số Đẹp, Giá Rẻ';
    }
  }

  // Validate price
  if (input.price === undefined || input.price === null) {
    errors.price = 'Phải nhập giá tiền';
  } else if (typeof input.price !== 'number' || isNaN(input.price)) {
    errors.price = 'Giá tiền không hợp lệ';
  } else if (input.price <= 0) {
    errors.price = 'Giá tiền phải lớn hơn 0';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
