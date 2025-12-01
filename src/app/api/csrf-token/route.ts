/**
 * CSRF Token API Route
 *
 * This API route generates and returns a CSRF token for client-side use.
 * The token is stored in an HTTP-only cookie and returned in the response.
 */

import { NextResponse } from 'next/server';
import { getOrCreateCsrfToken } from '@/lib/csrf';

/**
 * GET /api/csrf-token
 *
 * Generate or retrieve a CSRF token for the current session
 */
export async function GET() {
  try {
    const token = await getOrCreateCsrfToken();

    return NextResponse.json(
      {
        token,
        message: 'CSRF token generated successfully',
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          Pragma: 'no-cache',
        },
      }
    );
  } catch (error) {
    console.error('Error generating CSRF token:', error);

    return NextResponse.json(
      {
        error: 'Failed to generate CSRF token',
      },
      { status: 500 }
    );
  }
}
