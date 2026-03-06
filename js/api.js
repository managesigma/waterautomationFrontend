/**
 * API Client
 * Handles HTTP communication with the backend REST API
 */

class APIClient {
    constructor(baseURL = 'http://34.204.174.3:3000') {
            this.baseURL = baseURL;
            this.defaultHeaders = {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            };
            this.requestLogger = {
                enabled: true,
                logRequests: true,
                logResponses: true
            };
        }


    /**
     * Get authentication token from session storage
     */
    getAuthToken() {
        try {
            const savedState = sessionStorage.getItem('waterAutomationState');
            if (savedState) {
                const state = JSON.parse(savedState);
                return state.authentication?.token || null;
            }
        } catch (error) {
            console.error('Failed to get auth token:', error);
        }
        return null;
    }

    /**
     * Log request details
     */
    logRequest(method, url, data, headers) {
        if (this.requestLogger.enabled && this.requestLogger.logRequests) {
            console.group(`🚀 API Request: ${method.toUpperCase()} ${url}`);
            console.log('Headers:', headers);
            if (data) {
                console.log('Data:', data);
            }
            console.log('Timestamp:', new Date().toISOString());
            console.groupEnd();
        }
    }

    /**
     * Log response details
     */
    logResponse(method, url, response, responseData, duration) {
        if (this.requestLogger.enabled && this.requestLogger.logResponses) {
            const status = response?.status || 'Unknown';
            const statusText = response?.statusText || '';
            const icon = response?.ok ? '✅' : '❌';
            
            console.group(`${icon} API Response: ${method.toUpperCase()} ${url} (${status} ${statusText})`);
            console.log('Status:', status);
            console.log('Duration:', `${duration}ms`);
            if (responseData) {
                console.log('Data:', responseData);
            }
            console.log('Timestamp:', new Date().toISOString());
            console.groupEnd();
        }
    }

    /**
     * Check if server is reachable
     */
    async isServerReachable() {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
            
            const response = await fetch(`${this.baseURL}/health`, {
                method: 'GET',
                mode: 'cors',
                headers: { 'Accept': 'application/json' },
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            return response.ok;
        } catch (error) {
            // Any error means server is not reachable
            return false;
        }
    }

    /**
     * Make HTTP request
     */
    async request(method, endpoint, data = null, requiresAuth = false) {
        const startTime = Date.now();
        let response = null;
        
        try {
            const url = `${this.baseURL}${endpoint}`;
            
            const headers = { ...this.defaultHeaders };
            
            // Add authorization header if required
            if (requiresAuth) {
                const token = this.getAuthToken();
                if (!token) {
                    throw new Error('Authentication required but no token available');
                }
                headers['Authorization'] = `Bearer ${token}`;
            }

            const config = {
                method: method.toUpperCase(),
                headers: headers,
                mode: 'cors',
                credentials: 'same-origin'
            };

            // Add body for POST, PUT, PATCH requests
            if (data && ['POST', 'PUT', 'PATCH'].includes(config.method)) {
                config.body = JSON.stringify(data);
            }

            // Log the request
            this.logRequest(method, url, data, headers);

            response = await fetch(url, config);
            const duration = Date.now() - startTime;
            
            const result = await this.handleResponse(response);
            
            // Log the response
            this.logResponse(method, url, response, result.data, duration);
            
            return result;
        } catch (error) {
            const duration = Date.now() - startTime;
            console.error('API request failed:', error);
            
            // Enhanced error handling for connection issues
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                // Check if server is reachable
                const isReachable = await this.isServerReachable();
                if (!isReachable) {
                    return {
                        success: false,
                        error: 'Unable to connect to server. Please check that the backend API is running and accessible.',
                        status: 0,
                        isConnectionError: true
                    };
                }
            }
            
            return this.handleError(error);
        }
    }

    /**
     * Handle HTTP response
     */
    async handleResponse(response) {
        try {
            // Check if response has content
            const contentType = response.headers.get('content-type');
            let responseData = null;
            
            if (contentType && contentType.includes('application/json')) {
                responseData = await response.json();
            } else {
                const text = await response.text();
                if (text) {
                    try {
                        responseData = JSON.parse(text);
                    } catch {
                        responseData = { message: text };
                    }
                }
            }

            if (response.ok) {
                return {
                    success: true,
                    data: responseData,
                    status: response.status,
                    ...responseData // Spread response data for easier access
                };
            } else {
                // Handle HTTP error responses
                const errorMessage = this.extractErrorMessage(responseData, response.status);
                return {
                    success: false,
                    error: errorMessage,
                    status: response.status,
                    data: responseData
                };
            }
        } catch (error) {
            console.error('Failed to handle response:', error);
            return {
                success: false,
                error: 'Failed to process server response',
                status: 0
            };
        }
    }

    /**
     * Extract error message from response data
     */
    extractErrorMessage(responseData, status) {
        if (responseData) {
            // Try different common error message fields
            if (responseData.error) return responseData.error;
            if (responseData.message) return responseData.message;
            if (responseData.detail) return responseData.detail;
            if (responseData.errors && Array.isArray(responseData.errors)) {
                return responseData.errors.join(', ');
            }
        }

        // Fallback to HTTP status messages
        const statusMessages = {
            400: 'Bad Request - Please check your input',
            401: 'Unauthorized - Please login again',
            403: 'Forbidden - You do not have permission',
            404: 'Not Found - The requested resource was not found',
            409: 'Conflict - The resource already exists',
            422: 'Validation Error - Please check your input',
            500: 'Internal Server Error - Please try again later',
            502: 'Bad Gateway - Server is temporarily unavailable',
            503: 'Service Unavailable - Please try again later'
        };

        return statusMessages[status] || `HTTP Error ${status}`;
    }

    /**
     * Handle network and other errors
     */
    handleError(error) {
        let errorMessage = 'An unexpected error occurred';
        let isConnectionError = false;

        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            errorMessage = 'Connection error: Unable to reach the backend API. Please ensure the server is running on http://localhost:3000';
            isConnectionError = true;
        } else if (error.name === 'AbortError') {
            errorMessage = 'Request was cancelled or timed out';
        } else if (error.message === 'Authentication required but no token available') {
            errorMessage = 'Authentication required. Please login again.';
        } else if (error.message) {
            errorMessage = error.message;
        }

        return {
            success: false,
            error: errorMessage,
            status: 0,
            isConnectionError
        };
    }

    /**
     * POST request
     */
    async post(endpoint, data, requiresAuth = false) {
        return this.request('POST', endpoint, data, requiresAuth);
    }

    /**
     * GET request
     */
    async get(endpoint, requiresAuth = false) {
        return this.request('GET', endpoint, null, requiresAuth);
    }

    /**
     * PUT request
     */
    async put(endpoint, data, requiresAuth = false) {
        return this.request('PUT', endpoint, data, requiresAuth);
    }

    /**
     * DELETE request
     */
    async delete(endpoint, requiresAuth = false) {
        return this.request('DELETE', endpoint, null, requiresAuth);
    }

    /**
     * PATCH request
     */
    async patch(endpoint, data, requiresAuth = false) {
        return this.request('PATCH', endpoint, data, requiresAuth);
    }

    /**
     * Test API connection
     */
    async testConnection() {
        try {
            const response = await fetch(`${this.baseURL}/health`, {
                method: 'GET',
                mode: 'cors',
                headers: {
                    'Accept': 'application/json'
                }
            });

            return {
                success: response.ok,
                status: response.status,
                message: response.ok ? 'API connection successful' : 'API connection failed'
            };
        } catch (error) {
            return {
                success: false,
                status: 0,
                message: 'Unable to connect to API server',
                error: error.message
            };
        }
    }

    /**
     * Set base URL
     */
    setBaseURL(baseURL) {
        // Validate base URL format
        try {
            new URL(baseURL);
            this.baseURL = baseURL;
        } catch (error) {
            throw new Error(`Invalid base URL: ${baseURL}`);
        }
    }

    /**
     * Get base URL
     */
    getBaseURL() {
        return this.baseURL;
    }

    /**
     * Validate that base URL matches requirement 6.3
     */
    validateBaseURL() {
        const expectedBaseURL = 'http://localhost:3000';
        if (this.baseURL !== expectedBaseURL) {
            console.warn(`Base URL is ${this.baseURL}, but requirement 6.3 specifies ${expectedBaseURL}`);
            return false;
        }
        return true;
    }

    /**
     * Set default headers
     */
    setDefaultHeaders(headers) {
        this.defaultHeaders = { ...this.defaultHeaders, ...headers };
    }

    /**
     * Get default headers
     */
    getDefaultHeaders() {
        return { ...this.defaultHeaders };
    }

    /**
     * Create request with timeout
     */
    async requestWithTimeout(method, endpoint, data = null, requiresAuth = false, timeoutMs = 30000) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        try {
            const url = `${this.baseURL}${endpoint}`;
            
            const headers = { ...this.defaultHeaders };
            
            if (requiresAuth) {
                const token = this.getAuthToken();
                if (!token) {
                    throw new Error('Authentication required but no token available');
                }
                headers['Authorization'] = `Bearer ${token}`;
            }

            const config = {
                method: method.toUpperCase(),
                headers: headers,
                mode: 'cors',
                credentials: 'same-origin',
                signal: controller.signal
            };

            if (data && ['POST', 'PUT', 'PATCH'].includes(config.method)) {
                config.body = JSON.stringify(data);
            }

            const response = await fetch(url, config);
            clearTimeout(timeoutId);
            
            return await this.handleResponse(response);
        } catch (error) {
            clearTimeout(timeoutId);
            
            if (error.name === 'AbortError') {
                return {
                    success: false,
                    error: 'Request timeout - please try again',
                    status: 0
                };
            }
            
            return this.handleError(error);
        }
    }

    /**
     * Batch requests (execute multiple requests concurrently)
     */
    async batchRequests(requests) {
        try {
            const promises = requests.map(req => 
                this.request(req.method, req.endpoint, req.data, req.requiresAuth)
            );
            
            const results = await Promise.allSettled(promises);
            
            return results.map((result, index) => ({
                request: requests[index],
                success: result.status === 'fulfilled',
                result: result.status === 'fulfilled' ? result.value : result.reason
            }));
        } catch (error) {
            console.error('Batch request failed:', error);
            return requests.map(req => ({
                request: req,
                success: false,
                result: this.handleError(error)
            }));
        }
    }

    /**
     * Convenience methods for specific API endpoints
     */
    
    // Authentication endpoints
    async login(credentials) {
        return this.post('/api/v1/auth/login', credentials, false);
    }

    async registerContractor(contractorData) {
        return this.post('/api/v1/contractors/register', contractorData, false);
    }

    // Truck registration endpoint
    async registerTruck(truckData) {
        return this.post('/api/v1/trucks/register', truckData, true);
    }

    // Order management endpoint
    async createOrder(orderData) {
        return this.post('/api/v1/orders', orderData, true);
    }

    // Payment processing endpoint
    async createPayment(paymentData) {
        return this.post('/api/v1/payments/create', paymentData, true);
    }

    /**
     * Enable or disable request/response logging
     */
    setLogging(enabled, logRequests = true, logResponses = true) {
        this.requestLogger.enabled = enabled;
        this.requestLogger.logRequests = logRequests;
        this.requestLogger.logResponses = logResponses;
    }

    /**
     * Get current logging configuration
     */
    getLoggingConfig() {
        return { ...this.requestLogger };
    }
}

export { APIClient };