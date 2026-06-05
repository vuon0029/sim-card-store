import { describe, it, expect } from 'vitest';
import { parseCSV, parseJSON } from './bulkParser';

describe('parseCSV', () => {
  it('parses valid CSV with all fields', () => {
    const csv = `number,carrier,category,price,description
0986888666,Viettel,Phong Thủy,5000000,Số đẹp phong thủy
0912345678,Mobifone,Lộc Phát,3000000,`;

    const result = parseCSV(csv);

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(2);
    expect(result.errors).toHaveLength(0);
    expect(result.data[0]).toEqual({
      number: '0986888666',
      carrier: 'Viettel',
      category: 'Phong Thủy',
      price: 5000000,
      description: 'Số đẹp phong thủy',
    });
    expect(result.data[1]).toEqual({
      number: '0912345678',
      carrier: 'Mobifone',
      category: 'Lộc Phát',
      price: 3000000,
    });
  });

  it('handles CSV without description column', () => {
    const csv = `number,carrier,category,price
0986888666,Viettel,Phong Thủy,5000000`;

    const result = parseCSV(csv);

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(1);
    expect(result.data[0]).toEqual({
      number: '0986888666',
      carrier: 'Viettel',
      category: 'Phong Thủy',
      price: 5000000,
    });
  });

  it('returns error for empty content', () => {
    const result = parseCSV('');

    expect(result.success).toBe(false);
    expect(result.data).toHaveLength(0);
    expect(result.errors[0].message).toContain('empty');
  });

  it('returns error for missing required headers', () => {
    const csv = `number,carrier
0986888666,Viettel`;

    const result = parseCSV(csv);

    expect(result.success).toBe(false);
    expect(result.errors[0].message).toContain('Missing required headers');
    expect(result.errors[0].message).toContain('category');
    expect(result.errors[0].message).toContain('price');
  });

  it('reports row-level errors for invalid data', () => {
    const csv = `number,carrier,category,price,description
0986888666,Viettel,Phong Thủy,5000000,Valid
,Mobifone,Lộc Phát,3000000,Missing number
0912345678,Vinaphone,Số Đẹp,,Missing price`;

    const result = parseCSV(csv);

    expect(result.success).toBe(false);
    expect(result.data).toHaveLength(1);
    expect(result.errors).toHaveLength(2);
    expect(result.errors[0].row).toBe(3);
    expect(result.errors[0].message).toContain('number is required');
    expect(result.errors[1].row).toBe(4);
    expect(result.errors[1].message).toContain('price');
  });

  it('handles quoted fields with commas', () => {
    const csv = `number,carrier,category,price,description
"0986,888,666",Viettel,Phong Thủy,5000000,"Số đẹp, phong thủy"`;

    const result = parseCSV(csv);

    expect(result.success).toBe(true);
    expect(result.data[0].number).toBe('0986,888,666');
    expect(result.data[0].description).toBe('Số đẹp, phong thủy');
  });

  it('rejects price <= 0', () => {
    const csv = `number,carrier,category,price
0986888666,Viettel,Phong Thủy,-100`;

    const result = parseCSV(csv);

    expect(result.success).toBe(false);
    expect(result.errors[0].message).toContain('price must be greater than 0');
  });

  it('skips empty lines', () => {
    const csv = `number,carrier,category,price
0986888666,Viettel,Phong Thủy,5000000

0912345678,Mobifone,Lộc Phát,3000000`;

    const result = parseCSV(csv);

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(2);
  });
});

describe('parseJSON', () => {
  it('parses valid JSON array', () => {
    const json = JSON.stringify([
      { number: '0986888666', carrier: 'Viettel', category: 'Phong Thủy', price: 5000000, description: 'Số đẹp' },
      { number: '0912345678', carrier: 'Mobifone', category: 'Lộc Phát', price: 3000000 },
    ]);

    const result = parseJSON(json);

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(2);
    expect(result.errors).toHaveLength(0);
    expect(result.data[0]).toEqual({
      number: '0986888666',
      carrier: 'Viettel',
      category: 'Phong Thủy',
      price: 5000000,
      description: 'Số đẹp',
    });
    expect(result.data[1]).toEqual({
      number: '0912345678',
      carrier: 'Mobifone',
      category: 'Lộc Phát',
      price: 3000000,
    });
  });

  it('returns error for empty content', () => {
    const result = parseJSON('');

    expect(result.success).toBe(false);
    expect(result.errors[0].message).toContain('empty');
  });

  it('returns error for invalid JSON', () => {
    const result = parseJSON('not json');

    expect(result.success).toBe(false);
    expect(result.errors[0].message).toContain('Invalid JSON format');
  });

  it('returns error if JSON is not an array', () => {
    const result = parseJSON('{"number": "0986888666"}');

    expect(result.success).toBe(false);
    expect(result.errors[0].message).toContain('must be an array');
  });

  it('reports row-level errors for invalid objects', () => {
    const json = JSON.stringify([
      { number: '0986888666', carrier: 'Viettel', category: 'Phong Thủy', price: 5000000 },
      { number: '', carrier: 'Mobifone', category: 'Lộc Phát', price: 3000000 },
      { number: '0912345678', carrier: 'Vinaphone', category: 'Số Đẹp', price: -100 },
    ]);

    const result = parseJSON(json);

    expect(result.success).toBe(false);
    expect(result.data).toHaveLength(1);
    expect(result.errors).toHaveLength(2);
    expect(result.errors[0].row).toBe(2);
    expect(result.errors[0].message).toContain('number is required');
    expect(result.errors[1].row).toBe(3);
    expect(result.errors[1].message).toContain('price must be greater than 0');
  });

  it('handles non-object entries in array', () => {
    const json = JSON.stringify([
      { number: '0986888666', carrier: 'Viettel', category: 'Phong Thủy', price: 5000000 },
      'invalid string',
      null,
    ]);

    const result = parseJSON(json);

    expect(result.success).toBe(false);
    expect(result.data).toHaveLength(1);
    expect(result.errors).toHaveLength(2);
    expect(result.errors[0].row).toBe(2);
    expect(result.errors[1].row).toBe(3);
  });

  it('handles price as string in JSON', () => {
    const json = JSON.stringify([
      { number: '0986888666', carrier: 'Viettel', category: 'Phong Thủy', price: '5000000' },
    ]);

    const result = parseJSON(json);

    expect(result.success).toBe(true);
    expect(result.data[0].price).toBe(5000000);
  });
});
