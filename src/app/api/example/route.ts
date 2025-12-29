/**
 * Example API Route demonstrating standardized response wrapper usage
 */

import { NextRequest } from 'next/server';
import {
  createApiResponse,
  extractRequestId,
  extractPagination,
  ErrorType,
} from '@/lib/api/standardization';

/**
 * GET /api/example
 *
 * Example endpoint demonstrating standardized response format
 */
export async function GET(request: NextRequest) {
  const requestId = extractRequestId(request.headers);
  const apiResponse = createApiResponse(requestId);

  try {
    // Extract pagination parameters
    const { page, limit, errors } = extractPagination(request);

    if (errors.length > 0) {
      return apiResponse.validationError(
        errors.map((error) => ({
          field: 'pagination',
          code: 'INVALID_PARAMETER',
          message: error,
        })),
        'Invalid pagination parameters',
        {
          endpoint: '/api/example',
          method: 'GET',
        }
      );
    }

    // Mock data for demonstration
    const mockData = Array.from({ length: 50 }, (_, i) => ({
      id: i + 1,
      name: `Item ${i + 1}`,
      description: `Description for item ${i + 1}`,
      createdAt: new Date().toISOString(),
    }));

    // Calculate pagination
    const total = mockData.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = mockData.slice(startIndex, endIndex);

    // Return paginated response
    return apiResponse.paginated(paginatedData, {
      page,
      limit,
      total,
      baseUrl: new URL('/api/example', request.url).toString(),
    });
  } catch (error) {
    // Use normalized error handling
    return apiResponse.normalizedError(error, undefined, {
      endpoint: '/api/example',
      method: 'GET',
    });
  }
}

/**
 * POST /api/example
 *
 * Example endpoint demonstrating error handling
 */
export async function POST(request: NextRequest) {
  const requestId = extractRequestId(request.headers);
  const apiResponse = createApiResponse(requestId);

  try {
    const body = await request.json();

    // Simulate validation
    if (!body.name) {
      return apiResponse.validationError(
        [
          {
            field: 'name',
            code: 'REQUIRED',
            message: 'Name is required',
          },
        ],
        'Validation failed',
        {
          endpoint: '/api/example',
          method: 'POST',
        }
      );
    }

    // Simulate successful creation
    const newItem = {
      id: Date.now(),
      name: body.name,
      description: body.description || '',
      createdAt: new Date().toISOString(),
    };

    return apiResponse.success(newItem, 201);
  } catch (error) {
    return apiResponse.normalizedError(error, undefined, {
      endpoint: '/api/example',
      method: 'POST',
    });
  }
}
