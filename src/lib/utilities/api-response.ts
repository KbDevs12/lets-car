import { NextResponse } from "next/server";

// Success response helper
export function successResponse(
  data: any,
  message: string = "Success",
  status: number = 200
) {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

// Error response helper
export function errorResponse(
  message: string,
  status: number = 400,
  errors?: any[],
  field?: string
) {
  return NextResponse.json(
    {
      error: true,
      message,
      ...(errors && { errors }),
      ...(field && { field }),
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

// Validation error response
export function validationErrorResponse(errors: any[]) {
  return NextResponse.json(
    {
      error: true,
      message: "Data yang dikirim tidak valid",
      errors,
      timestamp: new Date().toISOString(),
    },
    { status: 400 }
  );
}

// Method not allowed response
export function methodNotAllowedResponse(allowedMethods: string[] = []) {
  return NextResponse.json(
    {
      error: true,
      message: "Method tidak diizinkan",
      allowedMethods,
      timestamp: new Date().toISOString(),
    },
    {
      status: 405,
      headers:
        allowedMethods.length > 0
          ? {
              Allow: allowedMethods.join(", "),
            }
          : {},
    }
  );
}

// Unauthorized response
export function unauthorizedResponse(message: string = "Unauthorized") {
  return NextResponse.json(
    {
      error: true,
      message,
      timestamp: new Date().toISOString(),
    },
    { status: 401 }
  );
}

// Forbidden response
export function forbiddenResponse(message: string = "Forbidden") {
  return NextResponse.json(
    {
      error: true,
      message,
      timestamp: new Date().toISOString(),
    },
    { status: 403 }
  );
}

// Not found response
export function notFoundResponse(message: string = "Data tidak ditemukan") {
  return NextResponse.json(
    {
      error: true,
      message,
      timestamp: new Date().toISOString(),
    },
    { status: 404 }
  );
}

// Conflict response
export function conflictResponse(message: string, field?: string) {
  return NextResponse.json(
    {
      error: true,
      message,
      ...(field && { field }),
      timestamp: new Date().toISOString(),
    },
    { status: 409 }
  );
}

// Internal server error response
export function serverErrorResponse(
  message: string = "Terjadi kesalahan internal server"
) {
  return NextResponse.json(
    {
      error: true,
      message,
      timestamp: new Date().toISOString(),
    },
    { status: 500 }
  );
}

// Rate limit response
export function rateLimitResponse(
  message: string = "Terlalu banyak permintaan"
) {
  return NextResponse.json(
    {
      error: true,
      message,
      timestamp: new Date().toISOString(),
    },
    { status: 429 }
  );
}
