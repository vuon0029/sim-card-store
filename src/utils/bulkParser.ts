import type { SimCardInput, ParseResult } from '../types';

/**
 * Parses CSV content into SimCardInput objects.
 * Expected headers: number, carrier, category, price, description
 */
export function parseCSV(content: string): ParseResult<SimCardInput> {
  const data: SimCardInput[] = [];
  const errors: { row: number; message: string }[] = [];

  const trimmed = content.trim();
  if (!trimmed) {
    return { success: false, data: [], errors: [{ row: 0, message: 'Noi dung CSV trong' }] };
  }

  const lines = trimmed.split(/\r?\n/);
  if (lines.length < 2) {
    return { success: false, data: [], errors: [{ row: 0, message: 'CSV phai co dong tieu de va it nhat mot dong du lieu' }] };
  }

  const headerLine = lines[0];
  const headers = headerLine.split(',').map((h) => h.trim().toLowerCase());

  // Map Vietnamese headers to internal names
  const headerAliases: Record<string, string> = {
    'number': 'number',
    'so dien thoai': 'number',
    'carrier': 'carrier',
    'nha mang': 'carrier',
    'category': 'category',
    'loai so': 'category',
    'price': 'price',
    'gia tien': 'price',
    'gia': 'price',
    'description': 'description',
    'mo ta': 'description',
  };

  const normalizedHeaders = headers.map((h) => headerAliases[h] || h);

  const requiredHeaders = ['number', 'carrier', 'price'];
  const missingHeaders = requiredHeaders.filter((h) => !normalizedHeaders.includes(h));
  if (missingHeaders.length > 0) {
    return {
      success: false,
      data: [],
      errors: [{ row: 0, message: `Thieu cot bat buoc: ${missingHeaders.join(', ')}` }],
    };
  }

  const numberIdx = normalizedHeaders.indexOf('number');
  const carrierIdx = normalizedHeaders.indexOf('carrier');
  const categoryIdx = normalizedHeaders.indexOf('category');
  const priceIdx = normalizedHeaders.indexOf('price');
  const descriptionIdx = normalizedHeaders.indexOf('description');

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // skip empty lines

    const values = parseCsvLine(line);
    const rowNumber = i + 1; // 1-indexed row (header is row 1)

    // Validate required fields
    const number = values[numberIdx]?.trim() ?? '';
    const carrier = values[carrierIdx]?.trim() ?? '';
    const category = values[categoryIdx]?.trim() ?? '';
    const priceStr = values[priceIdx]?.trim() ?? '';
    const description = descriptionIdx >= 0 ? values[descriptionIdx]?.trim() : undefined;

    const rowErrors: string[] = [];

    if (!number) {
      rowErrors.push('thieu so dien thoai');
    }
    if (!carrier) {
      rowErrors.push('thieu nha mang');
    }

    const price = Number(priceStr);
    if (!priceStr || isNaN(price)) {
      rowErrors.push('gia phai la so hop le');
    } else if (price <= 0) {
      rowErrors.push('gia phai lon hon 0');
    }

    if (rowErrors.length > 0) {
      errors.push({ row: rowNumber, message: rowErrors.join('; ') });
    } else {
      const record: SimCardInput = {
        number,
        carrier,
        category,
        price,
      };
      if (description) {
        record.description = description;
      }
      data.push(record);
    }
  }

  return {
    success: errors.length === 0,
    data,
    errors,
  };
}

/**
 * Parses JSON content into SimCardInput objects.
 * Expects a JSON array of objects with fields: number, carrier, category, price, description (optional).
 */
export function parseJSON(content: string): ParseResult<SimCardInput> {
  const data: SimCardInput[] = [];
  const errors: { row: number; message: string }[] = [];

  const trimmed = content.trim();
  if (!trimmed) {
    return { success: false, data: [], errors: [{ row: 0, message: 'Noi dung JSON trong' }] };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    return { success: false, data: [], errors: [{ row: 0, message: 'Dinh dang JSON khong hop le' }] };
  }

  if (!Array.isArray(parsed)) {
    return { success: false, data: [], errors: [{ row: 0, message: 'JSON phai la mot mang cac doi tuong' }] };
  }

  for (let i = 0; i < parsed.length; i++) {
    const item = parsed[i];
    const rowNumber = i + 1; // 1-indexed

    if (typeof item !== 'object' || item === null || Array.isArray(item)) {
      errors.push({ row: rowNumber, message: 'Moi muc phai la mot doi tuong' });
      continue;
    }

    const record = item as Record<string, unknown>;
    const rowErrors: string[] = [];

    const number = typeof record.number === 'string' ? record.number.trim() : '';
    const carrier = typeof record.carrier === 'string' ? record.carrier.trim() : '';
    const category = typeof record.category === 'string' ? record.category.trim() : '';
    const priceValue = record.price;
    const description = typeof record.description === 'string' ? record.description.trim() : undefined;

    if (!number) {
      rowErrors.push('thieu so dien thoai');
    }
    if (!carrier) {
      rowErrors.push('thieu nha mang');
    }

    let price: number;
    if (typeof priceValue === 'number') {
      price = priceValue;
      if (price <= 0) {
        rowErrors.push('gia phai lon hon 0');
      }
    } else if (typeof priceValue === 'string') {
      price = Number(priceValue);
      if (isNaN(price)) {
        rowErrors.push('gia phai la so hop le');
      } else if (price <= 0) {
        rowErrors.push('gia phai lon hon 0');
      }
    } else {
      price = 0;
      rowErrors.push('thieu gia, phai la so');
    }

    if (rowErrors.length > 0) {
      errors.push({ row: rowNumber, message: rowErrors.join('; ') });
    } else {
      const simCard: SimCardInput = {
        number,
        carrier,
        category,
        price,
      };
      if (description) {
        simCard.description = description;
      }
      data.push(simCard);
    }
  }

  return {
    success: errors.length === 0,
    data,
    errors,
  };
}

/**
 * Simple CSV line parser that handles quoted fields with commas.
 */
function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
        // Escaped quote
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  values.push(current);
  return values;
}
