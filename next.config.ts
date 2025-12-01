import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,

  // Bundle optimization
  compiler: {
    // Remove console logs in production
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? {
            exclude: ['error', 'warn'],
          }
        : false,
  },

  // Experimental features for better performance
  experimental: {
    // Enable optimized package imports
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-dialog',
      '@radix-ui/react-tabs',
      '@tiptap/react',
      '@tiptap/starter-kit',
    ],
  },

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },

  // Production source maps (disabled for smaller bundle)
  productionBrowserSourceMaps: false,

  // Turbopack configuration (empty to silence warning)
  turbopack: {},

  // Security headers
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: '/:path*',
        headers: [
          // Prevent clickjacking attacks by controlling iframe embedding
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          // Prevent MIME type sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // Enable browser XSS protection (legacy but still useful)
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          // Control referrer information sent with requests
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // Permissions Policy (formerly Feature Policy)
          // Restrict access to browser features and APIs
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          // Strict-Transport-Security (HSTS)
          // Force HTTPS connections for 1 year, including subdomains
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          // Content Security Policy (CSP)
          // Define trusted sources for content to prevent XSS attacks
          {
            key: 'Content-Security-Policy',
            value: [
              // Default: only allow same-origin content
              "default-src 'self'",
              // Scripts: allow self, inline scripts (for Next.js), and eval (for development)
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              // Styles: allow self, inline styles, and Google Fonts
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              // Images: allow self, data URIs, blob URIs, and Supabase storage
              "img-src 'self' data: blob: https://*.supabase.co https://*.supabase.in",
              // Fonts: allow self and Google Fonts
              "font-src 'self' https://fonts.gstatic.com",
              // Connect: allow self and Supabase API
              "connect-src 'self' https://*.supabase.co https://*.supabase.in wss://*.supabase.co wss://*.supabase.in",
              // Media: allow self and Supabase storage
              "media-src 'self' https://*.supabase.co https://*.supabase.in",
              // Objects: disallow plugins like Flash
              "object-src 'none'",
              // Base URI: restrict base tag to same origin
              "base-uri 'self'",
              // Form actions: only allow same-origin form submissions
              "form-action 'self'",
              // Frame ancestors: prevent embedding (redundant with X-Frame-Options)
              "frame-ancestors 'none'",
              // Upgrade insecure requests to HTTPS
              'upgrade-insecure-requests',
            ].join('; '),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
