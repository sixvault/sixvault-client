/**
 * Browser-compatible crypto utilities for Sixvault
 * Provides crypto functions that work in browser environment
 */

/**
 * Generate random bytes using Web Crypto API or fallback
 * @param {number} size - Number of bytes to generate
 * @returns {Uint8Array} Random bytes
 */
export function randomBytes(size) {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    // Browser environment with Web Crypto API
    const bytes = new Uint8Array(size);
    window.crypto.getRandomValues(bytes);
    return bytes;
  } else {
    // Fallback for environments without Web Crypto API
    const bytes = new Uint8Array(size);
    for (let i = 0; i < size; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
    return bytes;
  }
}

/**
 * Create SHA-256 hash of input string
 * @param {string} input - Input string to hash
 * @returns {Promise<Uint8Array>} Hash digest
 */
export async function sha256(input) {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    // Browser environment with Web Crypto API
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    return new Uint8Array(hashBuffer);
  } else {
    // Fallback simple hash (not cryptographically secure - for demo only)
    console.warn('Using fallback hash - not cryptographically secure!');
    return simpleSHA256Fallback(input);
  }
}

/**
 * Simple SHA-256 fallback implementation (not cryptographically secure)
 * This is only for demonstration purposes
 */
function simpleSHA256Fallback(input) {
  // This is a very simple hash function for demo purposes only
  // In production, you would use a proper crypto library
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hash = new Uint8Array(32);
  
  let h = 0x6a09e667;
  for (let i = 0; i < data.length; i++) {
    h = ((h << 5) - h + data[i]) & 0xffffffff;
  }
  
  // Fill hash array with derived values
  for (let i = 0; i < 32; i++) {
    hash[i] = (h >>> (i % 4 * 8)) & 0xff;
    h = ((h << 7) ^ (h >>> 25)) & 0xffffffff;
  }
  
  return hash;
}

/**
 * Browser-compatible Buffer-like class
 */
export class BrowserBuffer {
  constructor(data) {
    if (typeof data === 'number') {
      this.data = new Uint8Array(data);
    } else if (typeof data === 'string') {
      this.data = new TextEncoder().encode(data);
    } else if (data instanceof Uint8Array || data instanceof Array) {
      this.data = new Uint8Array(data);
    } else {
      this.data = new Uint8Array(0);
    }
    this.length = this.data.length;
  }

  static from(data, encoding = 'utf8') {
    if (encoding === 'hex') {
      const bytes = new Uint8Array(data.length / 2);
      for (let i = 0; i < data.length; i += 2) {
        bytes[i / 2] = parseInt(data.substr(i, 2), 16);
      }
      return new BrowserBuffer(bytes);
    } else if (encoding === 'base64') {
      const binaryString = atob(data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return new BrowserBuffer(bytes);
    } else {
      return new BrowserBuffer(data);
    }
  }

  toString(encoding = 'utf8') {
    if (encoding === 'hex') {
      return Array.from(this.data)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    } else if (encoding === 'base64') {
      const binaryString = String.fromCharCode(...this.data);
      return btoa(binaryString);
    } else {
      return new TextDecoder().decode(this.data);
    }
  }

  slice(start, end) {
    return new BrowserBuffer(this.data.slice(start, end));
  }
}

/**
 * Browser crypto interface that mimics Node.js crypto module
 */
export const browserCrypto = {
  randomBytes: (size) => new BrowserBuffer(randomBytes(size)),
  
  createHash: (algorithm) => ({
    update: function(data) {
      this._data = (this._data || '') + data;
      return this;
    },
    digest: async function() {
      if (algorithm === 'sha256') {
        const hash = await sha256(this._data);
        return new BrowserBuffer(hash);
      }
      throw new Error(`Unsupported hash algorithm: ${algorithm}`);
    }
  })
};

// Export Buffer for compatibility
export const Buffer = BrowserBuffer; 