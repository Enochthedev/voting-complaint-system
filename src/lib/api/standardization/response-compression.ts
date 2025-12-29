/**
 * Response compression system for API optimization
 *
 * Provides client-side compression and decompression for large API responses,
 * reducing bandwidth usage and improving performance.
 */

/**
 * Compression configuration
 */
export interface CompressionConfig {
  /** Enable/disable compression */
  enabled: boolean;
  /** Minimum response size to trigger compression (bytes) */
  threshold: number;
  /** Compression algorithm to use */
  algorithm: 'gzip' | 'deflate' | 'brotli';
  /** Compression level (1-9, higher = better compression but slower) */
  level: number;
  /** Enable compression for specific content types */
  contentTypes: string[];
  /** Maximum size to attempt compression (bytes) */
  maxSize: number;
}

/**
 * Compression statistics
 */
export interface CompressionStats {
  /** Total responses processed */
  totalResponses: number;
  /** Responses that were compressed */
  compressedResponses: number;
  /** Original total size (bytes) */
  originalSize: number;
  /** Compressed total size (bytes) */
  compressedSize: number;
  /** Compression ratio (0-1) */
  compressionRatio: number;
  /** Bytes saved through compression */
  bytesSaved: number;
  /** Average compression time (ms) */
  averageCompressionTime: number;
  /** Average decompression time (ms) */
  averageDecompressionTime: number;
}

/**
 * Compressed response wrapper
 */
interface CompressedResponse {
  /** Compressed data */
  data: ArrayBuffer;
  /** Original size */
  originalSize: number;
  /** Compressed size */
  compressedSize: number;
  /** Compression algorithm used */
  algorithm: string;
  /** Compression timestamp */
  timestamp: number;
  /** Content type */
  contentType: string;
}

/**
 * Response compression manager
 */
export class ResponseCompression {
  private config: CompressionConfig;
  private stats: CompressionStats = {
    totalResponses: 0,
    compressedResponses: 0,
    originalSize: 0,
    compressedSize: 0,
    compressionRatio: 0,
    bytesSaved: 0,
    averageCompressionTime: 0,
    averageDecompressionTime: 0,
  };

  constructor(config: Partial<CompressionConfig> = {}) {
    this.config = {
      enabled: true,
      threshold: 1024, // 1KB
      algorithm: 'gzip',
      level: 6, // Balanced compression
      contentTypes: [
        'application/json',
        'text/plain',
        'text/html',
        'text/css',
        'application/javascript',
      ],
      maxSize: 10 * 1024 * 1024, // 10MB
      ...config,
    };
  }

  /**
   * Compress response data
   */
  async compressResponse(
    data: any,
    contentType: string = 'application/json'
  ): Promise<CompressedResponse | null> {
    if (!this.config.enabled) return null;

    const startTime = Date.now();
    this.stats.totalResponses++;

    try {
      // Convert data to string if needed
      const dataString = typeof data === 'string' ? data : JSON.stringify(data);
      const originalSize = new Blob([dataString]).size;

      // Check if compression is worthwhile
      if (originalSize < this.config.threshold || originalSize > this.config.maxSize) {
        return null;
      }

      if (!this.config.contentTypes.includes(contentType)) {
        return null;
      }

      // Convert to Uint8Array for compression
      const encoder = new TextEncoder();
      const uint8Array = encoder.encode(dataString);

      // Compress using CompressionStream (if available)
      let compressedData: ArrayBuffer;

      if ('CompressionStream' in window) {
        compressedData = await this.compressWithStream(uint8Array, this.config.algorithm);
      } else {
        // Fallback to manual compression (simplified)
        compressedData = await this.compressManual(uint8Array);
      }

      const compressedSize = compressedData.byteLength;

      // Only use compression if it actually reduces size
      if (compressedSize >= originalSize * 0.9) {
        return null;
      }

      // Update statistics
      this.stats.compressedResponses++;
      this.stats.originalSize += originalSize;
      this.stats.compressedSize += compressedSize;
      this.stats.bytesSaved += originalSize - compressedSize;
      this.updateCompressionRatio();
      this.updateAverageCompressionTime(Date.now() - startTime);

      return {
        data: compressedData,
        originalSize,
        compressedSize,
        algorithm: this.config.algorithm,
        timestamp: Date.now(),
        contentType,
      };
    } catch (error) {
      console.warn('Compression failed:', error);
      return null;
    }
  }

  /**
   * Decompress response data
   */
  async decompressResponse(compressed: CompressedResponse): Promise<any> {
    const startTime = Date.now();

    try {
      let decompressedData: ArrayBuffer;

      if ('DecompressionStream' in window) {
        decompressedData = await this.decompressWithStream(compressed.data, compressed.algorithm);
      } else {
        // Fallback to manual decompression
        decompressedData = await this.decompressManual(compressed.data);
      }

      // Convert back to string
      const decoder = new TextDecoder();
      const dataString = decoder.decode(decompressedData);

      // Update statistics
      this.updateAverageDecompressionTime(Date.now() - startTime);

      // Parse JSON if it's JSON content
      if (compressed.contentType === 'application/json') {
        return JSON.parse(dataString);
      }

      return dataString;
    } catch (error) {
      console.error('Decompression failed:', error);
      throw new Error('Failed to decompress response data');
    }
  }

  /**
   * Check if response should be compressed
   */
  shouldCompress(data: any, contentType: string = 'application/json'): boolean {
    if (!this.config.enabled) return false;

    const dataString = typeof data === 'string' ? data : JSON.stringify(data);
    const size = new Blob([dataString]).size;

    return (
      size >= this.config.threshold &&
      size <= this.config.maxSize &&
      this.config.contentTypes.includes(contentType)
    );
  }

  /**
   * Get compression statistics
   */
  getStats(): CompressionStats {
    return { ...this.stats };
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats = {
      totalResponses: 0,
      compressedResponses: 0,
      originalSize: 0,
      compressedSize: 0,
      compressionRatio: 0,
      bytesSaved: 0,
      averageCompressionTime: 0,
      averageDecompressionTime: 0,
    };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<CompressionConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get configuration
   */
  getConfig(): CompressionConfig {
    return { ...this.config };
  }

  /**
   * Compress data using CompressionStream
   */
  private async compressWithStream(data: Uint8Array, algorithm: string): Promise<ArrayBuffer> {
    const stream = new CompressionStream(algorithm as any);
    const writer = stream.writable.getWriter();
    const reader = stream.readable.getReader();

    // Write data to compression stream
    await writer.write(data);
    await writer.close();

    // Read compressed data
    const chunks: Uint8Array[] = [];
    let done = false;

    while (!done) {
      const { value, done: readerDone } = await reader.read();
      done = readerDone;
      if (value) {
        chunks.push(value);
      }
    }

    // Combine chunks
    const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;

    for (const chunk of chunks) {
      result.set(chunk, offset);
      offset += chunk.length;
    }

    return result.buffer;
  }

  /**
   * Decompress data using DecompressionStream
   */
  private async decompressWithStream(data: ArrayBuffer, algorithm: string): Promise<ArrayBuffer> {
    const stream = new DecompressionStream(algorithm as any);
    const writer = stream.writable.getWriter();
    const reader = stream.readable.getReader();

    // Write compressed data to decompression stream
    await writer.write(new Uint8Array(data));
    await writer.close();

    // Read decompressed data
    const chunks: Uint8Array[] = [];
    let done = false;

    while (!done) {
      const { value, done: readerDone } = await reader.read();
      done = readerDone;
      if (value) {
        chunks.push(value);
      }
    }

    // Combine chunks
    const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;

    for (const chunk of chunks) {
      result.set(chunk, offset);
      offset += chunk.length;
    }

    return result.buffer;
  }

  /**
   * Manual compression fallback (simplified LZ-style compression)
   */
  private async compressManual(data: Uint8Array): Promise<ArrayBuffer> {
    // This is a simplified compression algorithm for fallback
    // In a real implementation, you might use a library like pako

    const dictionary = new Map<string, number>();
    const result: number[] = [];
    let dictSize = 256;

    // Initialize dictionary with single characters
    for (let i = 0; i < 256; i++) {
      dictionary.set(String.fromCharCode(i), i);
    }

    let current = '';
    const dataString = new TextDecoder().decode(data);

    for (let i = 0; i < dataString.length; i++) {
      const char = dataString[i];
      const combined = current + char;

      if (dictionary.has(combined)) {
        current = combined;
      } else {
        result.push(dictionary.get(current)!);
        dictionary.set(combined, dictSize++);
        current = char;
      }
    }

    if (current) {
      result.push(dictionary.get(current)!);
    }

    // Convert result to ArrayBuffer
    const buffer = new ArrayBuffer(result.length * 2);
    const view = new Uint16Array(buffer);
    for (let i = 0; i < result.length; i++) {
      view[i] = result[i];
    }

    return buffer;
  }

  /**
   * Manual decompression fallback
   */
  private async decompressManual(data: ArrayBuffer): Promise<ArrayBuffer> {
    // Corresponding decompression for the manual compression
    const view = new Uint16Array(data);
    const dictionary: string[] = [];

    // Initialize dictionary
    for (let i = 0; i < 256; i++) {
      dictionary[i] = String.fromCharCode(i);
    }

    let result = '';
    let dictSize = 256;
    let previous = String.fromCharCode(view[0]);
    result += previous;

    for (let i = 1; i < view.length; i++) {
      const code = view[i];
      let current: string;

      if (dictionary[code]) {
        current = dictionary[code];
      } else if (code === dictSize) {
        current = previous + previous[0];
      } else {
        throw new Error('Invalid compression data');
      }

      result += current;
      dictionary[dictSize++] = previous + current[0];
      previous = current;
    }

    return new TextEncoder().encode(result).buffer;
  }

  /**
   * Update compression ratio
   */
  private updateCompressionRatio(): void {
    if (this.stats.originalSize > 0) {
      this.stats.compressionRatio = this.stats.compressedSize / this.stats.originalSize;
    }
  }

  /**
   * Update average compression time
   */
  private updateAverageCompressionTime(newTime: number): void {
    if (this.stats.compressedResponses === 1) {
      this.stats.averageCompressionTime = newTime;
    } else {
      const total =
        this.stats.averageCompressionTime * (this.stats.compressedResponses - 1) + newTime;
      this.stats.averageCompressionTime = total / this.stats.compressedResponses;
    }
  }

  /**
   * Update average decompression time
   */
  private updateAverageDecompressionTime(newTime: number): void {
    const totalDecompressions = this.stats.compressedResponses; // Assuming each compressed response is decompressed

    if (totalDecompressions === 1) {
      this.stats.averageDecompressionTime = newTime;
    } else {
      const total = this.stats.averageDecompressionTime * (totalDecompressions - 1) + newTime;
      this.stats.averageDecompressionTime = total / totalDecompressions;
    }
  }
}

/**
 * Global compression manager instance
 */
export const globalCompression = new ResponseCompression();

/**
 * Utility functions for API integration
 */

/**
 * Compress API response if beneficial
 */
export async function compressApiResponse(data: any, contentType?: string): Promise<any> {
  const compressed = await globalCompression.compressResponse(data, contentType);

  if (compressed) {
    return {
      __compressed: true,
      ...compressed,
    };
  }

  return data;
}

/**
 * Decompress API response if needed
 */
export async function decompressApiResponse(data: any): Promise<any> {
  if (data && data.__compressed) {
    const { __compressed, ...compressedData } = data;
    return globalCompression.decompressResponse(compressedData);
  }

  return data;
}

/**
 * Middleware for automatic compression/decompression
 */
export function createCompressionMiddleware() {
  return {
    request: async (config: any) => {
      // Compress request body if applicable
      if (config.data && globalCompression.shouldCompress(config.data)) {
        const compressed = await globalCompression.compressResponse(config.data);
        if (compressed) {
          config.data = compressed;
          config.headers = {
            ...config.headers,
            'Content-Encoding': compressed.algorithm,
            'X-Original-Size': compressed.originalSize.toString(),
          };
        }
      }
      return config;
    },

    response: async (response: any) => {
      // Decompress response if needed
      if (response.data && response.data.__compressed) {
        response.data = await decompressApiResponse(response.data);
      }
      return response;
    },

    error: (error: any) => {
      // Handle compression-related errors
      if (error.message?.includes('compression') || error.message?.includes('decompression')) {
        console.warn('Compression error, falling back to uncompressed data:', error);
        // Could implement fallback logic here
      }
      return Promise.reject(error);
    },
  };
}

/**
 * React Query integration for compression
 */
export function createCompressedQueryFn<T>(originalQueryFn: () => Promise<T>) {
  return async (): Promise<T> => {
    const result = await originalQueryFn();

    // Compress large responses for caching
    if (globalCompression.shouldCompress(result)) {
      const compressed = await globalCompression.compressResponse(result);
      if (compressed) {
        return {
          __compressed: true,
          ...compressed,
        } as T;
      }
    }

    return result;
  };
}

/**
 * Hook for compression statistics
 */
export function useCompressionStats() {
  return globalCompression.getStats();
}
