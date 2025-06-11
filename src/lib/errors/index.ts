import { json } from '@sveltejs/kit';

// Custom error classes
export class ValidationError extends Error {
	constructor(message: string, public field?: string) {
		super(message);
		this.name = 'ValidationError';
	}
}

export class ServiceError extends Error {
	constructor(message: string, public statusCode: number = 500) {
		super(message);
		this.name = 'ServiceError';
	}
}

export class RateLimitError extends ServiceError {
	constructor(message: string = 'Rate limit exceeded') {
		super(message, 429);
		this.name = 'RateLimitError';
	}
}

export class QuotaExceededError extends ServiceError {
	constructor(message: string = 'Service quota exceeded') {
		super(message, 503);
		this.name = 'QuotaExceededError';
	}
}

export class AuthenticationError extends ServiceError {
	constructor(message: string = 'Authentication failed') {
		super(message, 503);
		this.name = 'AuthenticationError';
	}
}

// Error handler utility
export function handleError(error: unknown) {
	// Simplified logging since detailed error analysis is done in the service layer
	console.error('📤 RETURNING ERROR RESPONSE:', error instanceof Error ? error.message : String(error));

	if (error instanceof ValidationError) {
		return json(
			{ error: error.message },
			{ status: 400 }
		);
	}

	if (error instanceof ServiceError) {
		return json(
			{ error: error.message },
			{ status: error.statusCode }
		);
	}

	if (error instanceof SyntaxError) {
		console.error('JSON parsing error:', error.message);
		return json(
			{ error: 'Invalid JSON in request body.' },
			{ status: 400 }
		);
	}

	// Generic server error
	console.error('⚠️  Unhandled error type:', error);
	return json(
		{ error: 'Internal server error. Please try again later.' },
		{ status: 500 }
	);
}
