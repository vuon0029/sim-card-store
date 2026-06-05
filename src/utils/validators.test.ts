import { describe, it, expect } from 'vitest';
import { validateCarrier, validateCategory, validateSimCard } from './validators';

describe('validateCarrier', () => {
  it('returns true for valid carriers', () => {
    expect(validateCarrier('Viettel')).toBe(true);
    expect(validateCarrier('Mobifone')).toBe(true);
    expect(validateCarrier('Vinaphone')).toBe(true);
  });

  it('returns false for invalid carriers', () => {
    expect(validateCarrier('viettel')).toBe(false);
    expect(validateCarrier('Unknown')).toBe(false);
    expect(validateCarrier('')).toBe(false);
    expect(validateCarrier('Viettel ')).toBe(false);
  });
});

describe('validateCategory', () => {
  it('returns true for valid categories', () => {
    expect(validateCategory('Phong Thủy')).toBe(true);
    expect(validateCategory('Lộc Phát')).toBe(true);
    expect(validateCategory('Thần Tài')).toBe(true);
    expect(validateCategory('Số Đẹp')).toBe(true);
    expect(validateCategory('Giá Rẻ')).toBe(true);
  });

  it('returns false for invalid categories', () => {
    expect(validateCategory('phong thủy')).toBe(false);
    expect(validateCategory('Invalid')).toBe(false);
    expect(validateCategory('')).toBe(false);
  });
});

describe('validateSimCard', () => {
  it('returns valid for a correct input', () => {
    const result = validateSimCard({
      number: '0986 888 666',
      carrier: 'Viettel',
      category: 'Phong Thủy',
      price: 1000000,
    });
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual({});
  });

  it('returns valid with optional description', () => {
    const result = validateSimCard({
      number: '0986 888 666',
      carrier: 'Mobifone',
      category: 'Lộc Phát',
      price: 500000,
      description: 'Số đẹp giá tốt',
    });
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual({});
  });

  it('returns errors for missing required fields', () => {
    const result = validateSimCard({});
    expect(result.valid).toBe(false);
    expect(result.errors.number).toBeDefined();
    expect(result.errors.carrier).toBeDefined();
    expect(result.errors.category).toBeDefined();
    expect(result.errors.price).toBeDefined();
  });

  it('returns error for empty number', () => {
    const result = validateSimCard({
      number: '  ',
      carrier: 'Viettel',
      category: 'Phong Thủy',
      price: 1000000,
    });
    expect(result.valid).toBe(false);
    expect(result.errors.number).toBeDefined();
  });

  it('returns error for invalid carrier', () => {
    const result = validateSimCard({
      number: '0986 888 666',
      carrier: 'InvalidCarrier',
      category: 'Phong Thủy',
      price: 1000000,
    });
    expect(result.valid).toBe(false);
    expect(result.errors.carrier).toBeDefined();
    expect(result.errors.number).toBeUndefined();
  });

  it('returns error for invalid category', () => {
    const result = validateSimCard({
      number: '0986 888 666',
      carrier: 'Viettel',
      category: 'InvalidCategory',
      price: 1000000,
    });
    expect(result.valid).toBe(false);
    expect(result.errors.category).toBeDefined();
  });

  it('returns error for non-positive price', () => {
    const result = validateSimCard({
      number: '0986 888 666',
      carrier: 'Viettel',
      category: 'Phong Thủy',
      price: 0,
    });
    expect(result.valid).toBe(false);
    expect(result.errors.price).toBeDefined();
  });

  it('returns error for negative price', () => {
    const result = validateSimCard({
      number: '0986 888 666',
      carrier: 'Viettel',
      category: 'Phong Thủy',
      price: -100,
    });
    expect(result.valid).toBe(false);
    expect(result.errors.price).toBeDefined();
  });

  it('returns form error for null input', () => {
    const result = validateSimCard(null);
    expect(result.valid).toBe(false);
    expect(result.errors._form).toBeDefined();
  });

  it('returns form error for non-object input', () => {
    const result = validateSimCard('string');
    expect(result.valid).toBe(false);
    expect(result.errors._form).toBeDefined();
  });

  it('returns errors only for invalid fields', () => {
    const result = validateSimCard({
      number: '0986 888 666',
      carrier: 'Invalid',
      category: 'Phong Thủy',
      price: 1000000,
    });
    expect(result.valid).toBe(false);
    expect(result.errors.carrier).toBeDefined();
    expect(result.errors.number).toBeUndefined();
    expect(result.errors.category).toBeUndefined();
    expect(result.errors.price).toBeUndefined();
  });
});
