import sanitizeHtml from 'sanitize-html';

export function sanitize(text: string): string {
  return sanitizeHtml(text, {
    allowedTags: ['b', 'i', 'em', 'strong', 'p', 'br'],
    allowedAttributes: {},
  });
}

export function sanitizeObject<T>(obj: T): T {
  if (typeof obj !== 'object' || obj === null) {
    if (typeof obj === 'string') {
      return sanitize(obj) as unknown as T;
    }
    return obj;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = (Array.isArray(obj) ? [] : {}) as any;

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      if (typeof value === 'string') {
        result[key] = sanitize(value);
      } else if (typeof value === 'object' && value !== null) {
        result[key] = sanitizeObject(value);
      } else {
        result[key] = value;
      }
    }
  }

  return result;
}
