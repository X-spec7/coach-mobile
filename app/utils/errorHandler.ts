export interface ErrorInfo {
  title: string;
  message: string;
  type: 'error' | 'warning' | 'info';
  showRetry: boolean;
}

export const handleApiError = (error: any, context: string = 'operation'): ErrorInfo => {
  console.error(`[${context}] Error:`, error);

  // Handle network errors
  if (error instanceof TypeError && error.message === 'Network request failed') {
    return {
      title: 'Connection Error',
      message: 'Unable to connect to the server. Please check your internet connection and try again.',
      type: 'error',
      showRetry: true,
    };
  }

  // Handle fetch errors with status codes
  if (error.message && typeof error.message === 'string') {
    const message = error.message.toLowerCase();
    
    // Authentication errors
    if (message.includes('401') || message.includes('unauthorized') || message.includes('authentication required')) {
      return {
        title: 'Authentication Required',
        message: 'Your session has expired. Please sign in again to continue.',
        type: 'warning',
        showRetry: false,
      };
    }

    // Permission errors
    if (message.includes('403') || message.includes('forbidden') || message.includes('permission denied')) {
      return {
        title: 'Access Denied',
        message: 'You don\'t have permission to perform this action. Please contact support if you believe this is an error.',
        type: 'error',
        showRetry: false,
      };
    }

    // Not found errors
    if (message.includes('404') || message.includes('not found')) {
      return {
        title: 'Not Found',
        message: 'The requested resource was not found. This feature may not be available yet.',
        type: 'info',
        showRetry: false,
      };
    }

    // Server errors
    if (message.includes('500') || message.includes('internal server error')) {
      return {
        title: 'Server Error',
        message: 'The server is experiencing issues. Please try again later or contact support if the problem persists.',
        type: 'error',
        showRetry: true,
      };
    }

    // Bad request errors (400)
    if (message.includes('400') || message.includes('bad request')) {
      return {
        title: 'Invalid Request',
        message: 'The request was invalid. Please check your input and try again.',
        type: 'warning',
        showRetry: true,
      };
    }

    // Rate limiting
    if (message.includes('429') || message.includes('rate limit') || message.includes('too many requests')) {
      return {
        title: 'Too Many Requests',
        message: 'You\'ve made too many requests. Please wait a moment before trying again.',
        type: 'warning',
        showRetry: true,
      };
    }

    // Connection timeout
    if (message.includes('timeout') || message.includes('timed out')) {
      return {
        title: 'Request Timeout',
        message: 'The request took too long to complete. Please check your connection and try again.',
        type: 'error',
        showRetry: true,
      };
    }

    // Specific connection request errors
    if (context === 'connection_request') {
      if (message.includes('already exists') || message.includes('duplicate') || message.includes('409')) {
        return {
          title: 'Connection Already Exists',
          message: 'A connection request has already been sent to this user.',
          type: 'info',
          showRetry: false,
        };
      }

      if (message.includes('cannot connect to yourself') || message.includes('self connection')) {
        return {
          title: 'Invalid Request',
          message: 'You cannot send a connection request to yourself.',
          type: 'warning',
          showRetry: false,
        };
      }

      if (message.includes('user not found') || message.includes('404')) {
        return {
          title: 'User Not Found',
          message: 'The user you\'re trying to connect with could not be found.',
          type: 'error',
          showRetry: false,
        };
      }

      if (message.includes('invalid user type') || message.includes('wrong role') || message.includes('user type mismatch')) {
        return {
          title: 'Invalid User Type',
          message: 'You can only connect with users of the opposite type (coaches can connect with clients and vice versa).',
          type: 'warning',
          showRetry: false,
        };
      }

      if (message.includes('missing required fields') || message.includes('validation error')) {
        return {
          title: 'Invalid Request Data',
          message: 'Please check that all required information is provided correctly.',
          type: 'warning',
          showRetry: true,
        };
      }
    }

    // Specific fetch relationships errors
    if (context === 'fetch_relationships') {
      if (message.includes('authentication required') || message.includes('401')) {
        return {
          title: 'Authentication Required',
          message: 'Please sign in to view your connections.',
          type: 'warning',
          showRetry: false,
        };
      }

      if (message.includes('not found') || message.includes('404')) {
        return {
          title: 'Feature Not Available',
          message: 'The coach-client connection feature is not yet available on this server.',
          type: 'info',
          showRetry: false,
        };
      }
    }

    // Generic error with the original message
    return {
      title: 'Error',
      message: error.message || `An unexpected error occurred during ${context}. Please try again.`,
      type: 'error',
      showRetry: true,
    };
  }

  // Fallback for unknown errors
  return {
    title: 'Unexpected Error',
    message: `An unexpected error occurred during ${context}. Please try again or contact support if the problem persists.`,
    type: 'error',
    showRetry: true,
  };
};

// Specific error handlers for different contexts
export const handleConnectionRequestError = (error: any): ErrorInfo => {
  return handleApiError(error, 'connection_request');
};

export const handleAuthenticationError = (error: any): ErrorInfo => {
  return handleApiError(error, 'authentication');
};

export const handleNetworkError = (error: any): ErrorInfo => {
  return handleApiError(error, 'network');
}; 