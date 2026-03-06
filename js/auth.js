/**
 * Authentication Manager
 * Handles contractor authentication, token management, and session state
 */

class AuthenticationManager {
    constructor(apiClient) {
        this.apiClient = apiClient;
    }

    /**
     * Login contractor
     */
    async login(credentials) {
        try {
            // Validate credentials
            const validation = this.validateLoginCredentials(credentials);
            if (!validation.isValid) {
                return {
                    success: false,
                    error: validation.errors.join(', ')
                };
            }

            // Make login request
            const response = await this.apiClient.post('/api/v1/auth/login', {
                phoneNumber: Number(credentials.phone.trim()),
                email: credentials.email.trim(),
                password: credentials.password
            });

            if (response.success) {
                // Handle various response structures (flat or nested in .data)
                const contractor = response.contractor || response.user || response.data?.user || response.data?.contractor;
                const token = response.token || response.accessToken || response.data?.token || response.data?.accessToken;
                
                // Store authentication data in session storage
                this.storeAuthenticationData(token, contractor);
                
                return {
                    success: true,
                    contractor: contractor,
                    token: token
                };
            } else {
                return {
                    success: false,
                    error: response.error || 'Login failed'
                };
            }
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                error: 'Login failed due to an unexpected error'
            };
        }
    }

    /**
     * Register new contractor
     */
    async register(contractorData) {
        try {
            // Validate contractor data
            const validation = this.validateRegistrationData(contractorData);
            if (!validation.isValid) {
                return {
                    success: false,
                    error: validation.errors.join(', ')
                };
            }

            // Make registration request
            const response = await this.apiClient.post('/api/v1/contractors/register', {
                name: contractorData.name.trim(),
                phoneNumber: Number(contractorData.phone.trim()),
                email: contractorData.email.trim(),
                password: contractorData.password
            });

            if (response.success) {
                // Handle various response structures (flat or nested in .data)
                const contractor = response.contractor || response.user || response.data?.user || response.data?.contractor || response.data;
                const token = response.token || response.accessToken || response.data?.token || response.data?.accessToken;
                
                // Store authentication data in session storage
                this.storeAuthenticationData(token, contractor);
                
                return {
                    success: true,
                    contractor: contractor,
                    token: token
                };
            } else {
                return {
                    success: false,
                    error: response.error || 'Registration failed'
                };
            }
        } catch (error) {
            console.error('Registration error:', error);
            return {
                success: false,
                error: 'Registration failed due to an unexpected error'
            };
        }
    }

    /**
     * Validate login credentials
     */
    validateLoginCredentials(credentials) {
        const errors = [];

        if (!credentials.phone || credentials.phone.trim().length === 0) {
            errors.push('Phone number is required');
        } else if (!this.isValidPhone(credentials.phone)) {
            errors.push('Please enter a valid phone number');
        }

        if (!credentials.email || credentials.email.trim().length === 0) {
            errors.push('Email is required');
        } else if (!this.isValidEmail(credentials.email)) {
            errors.push('Please enter a valid email address');
        }

        if (!credentials.password || credentials.password.length === 0) {
            errors.push('Password is required');
        } else if (credentials.password.length < 6) {
            errors.push('Password must be at least 6 characters long');
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Validate registration data
     */
    validateRegistrationData(data) {
        const errors = [];

        if (!data.name || data.name.trim().length === 0) {
            errors.push('Name is required');
        } else if (data.name.trim().length < 2) {
            errors.push('Name must be at least 2 characters long');
        }

        if (!data.phone || data.phone.trim().length === 0) {
            errors.push('Phone number is required');
        } else if (!this.isValidPhone(data.phone)) {
            errors.push('Please enter a valid phone number');
        }

        if (!data.email || data.email.trim().length === 0) {
            errors.push('Email is required');
        } else if (!this.isValidEmail(data.email)) {
            errors.push('Please enter a valid email address');
        }

        if (!data.password || data.password.length === 0) {
            errors.push('Password is required');
        } else if (data.password.length < 6) {
            errors.push('Password must be at least 6 characters long');
        } else if (!this.isValidPassword(data.password)) {
            errors.push('Password must contain at least one letter and one number');
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Validate phone number format
     */
    isValidPhone(phone) {
        // Remove common formatting characters
        const cleanPhone = phone.replace(/[\s\-\(\)\.]/g, '');
        
        // Basic phone validation - accepts international format
        const phoneRegex = /^[\+]?[1-9][\d]{7,14}$/;
        return phoneRegex.test(cleanPhone);
    }

    /**
     * Validate email format
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email.trim());
    }

    /**
     * Validate password strength
     */
    isValidPassword(password) {
        // Must contain at least one letter and one number
        const hasLetter = /[a-zA-Z]/.test(password);
        const hasNumber = /\d/.test(password);
        return hasLetter && hasNumber;
    }

    /**
     * Store authentication data in session storage
     */
    storeAuthenticationData(token, contractor) {
        try {
            // Get existing state or create new one
            let state = {};
            const savedState = sessionStorage.getItem('waterAutomationState');
            if (savedState) {
                state = JSON.parse(savedState);
            }

            // Update authentication data
            state.authentication = {
                isAuthenticated: true,
                token: token,
                contractor: contractor
            };

            // Save updated state
            sessionStorage.setItem('waterAutomationState', JSON.stringify(state));
            
            console.log('Authentication data stored successfully');
        } catch (error) {
            console.error('Failed to store authentication data:', error);
            throw new Error('Failed to store authentication data');
        }
    }

    /**
     * Clear authentication data from session storage
     */
    clearAuthenticationData() {
        try {
            const savedState = sessionStorage.getItem('waterAutomationState');
            if (savedState) {
                const state = JSON.parse(savedState);
                state.authentication = {
                    isAuthenticated: false,
                    token: null,
                    contractor: null
                };
                sessionStorage.setItem('waterAutomationState', JSON.stringify(state));
            }
            console.log('Authentication data cleared successfully');
        } catch (error) {
            console.error('Failed to clear authentication data:', error);
        }
    }

    /**
     * Initialize authentication state on app startup
     */
    initializeAuthState() {
        try {
            const token = this.getToken();
            const contractor = this.getContractor();
            
            // If we have a token, check if it's expired
            if (token) {
                if (this.isTokenExpired()) {
                    console.log('Found expired token on startup, clearing authentication');
                    this.clearAuthenticationData();
                    return {
                        isAuthenticated: false,
                        reason: 'Token expired'
                    };
                } else {
                    console.log('Found valid token on startup');
                    return {
                        isAuthenticated: true,
                        contractor: contractor,
                        token: token
                    };
                }
            } else {
                console.log('No authentication token found on startup');
                return {
                    isAuthenticated: false,
                    reason: 'No token'
                };
            }
        } catch (error) {
            console.error('Failed to initialize auth state:', error);
            this.clearAuthenticationData();
            return {
                isAuthenticated: false,
                reason: 'Initialization error'
            };
        }
    }

    /**
     * Get current authentication token
     */
    getToken() {
        try {
            const savedState = sessionStorage.getItem('waterAutomationState');
            if (savedState) {
                const state = JSON.parse(savedState);
                return state.authentication?.token || null;
            }
        } catch (error) {
            console.error('Failed to get token:', error);
        }
        return null;
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        const token = this.getToken();
        return token !== null && token !== undefined && token !== '';
    }

    /**
     * Get current contractor data
     */
    getContractor() {
        try {
            const savedState = sessionStorage.getItem('waterAutomationState');
            if (savedState) {
                const state = JSON.parse(savedState);
                return state.authentication?.contractor || null;
            }
        } catch (error) {
            console.error('Failed to get contractor:', error);
        }
        return null;
    }

    /**
     * Logout user
     */
    logout() {
        try {
            this.clearAuthenticationData();
            console.log('User logged out successfully');
        } catch (error) {
            console.error('Failed to logout:', error);
        }
    }

    /**
     * Refresh authentication token (if supported by backend)
     */
    async refreshToken() {
        try {
            const currentToken = this.getToken();
            if (!currentToken) {
                return {
                    success: false,
                    error: 'No token to refresh'
                };
            }

            const response = await this.apiClient.post('/api/v1/auth/refresh', {}, true);

            if (response.success) {
                const newToken = response.token || response.accessToken;
                const contractor = this.getContractor(); // Keep existing contractor data
                
                // Store the new token
                this.storeAuthenticationData(newToken, contractor);
                
                return {
                    success: true,
                    token: newToken
                };
            } else {
                return {
                    success: false,
                    error: response.error || 'Token refresh failed'
                };
            }
        } catch (error) {
            console.error('Token refresh error:', error);
            return {
                success: false,
                error: 'Token refresh failed due to an unexpected error'
            };
        }
    }

    /**
     * Validate current token with backend
     */
    async validateToken() {
        try {
            const response = await this.apiClient.get('/api/v1/auth/validate', true);
            
            return {
                success: response.success,
                valid: response.success,
                contractor: response.contractor || response.user
            };
        } catch (error) {
            console.error('Token validation error:', error);
            return {
                success: false,
                valid: false,
                error: 'Token validation failed'
            };
        }
    }

    /**
     * Check if token is expired (basic client-side check)
     */
    isTokenExpired() {
        const token = this.getToken();
        if (!token) return true;

        try {
            // Basic JWT token expiration check
            const payload = JSON.parse(atob(token.split('.')[1]));
            const currentTime = Math.floor(Date.now() / 1000);
            
            return payload.exp && payload.exp < currentTime;
        } catch (error) {
            console.error('Failed to check token expiration:', error);
            return true; // Assume expired if we can't parse
        }
    }

    /**
     * Get token expiration time
     */
    getTokenExpiration() {
        const token = this.getToken();
        if (!token) return null;

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.exp ? new Date(payload.exp * 1000) : null;
        } catch (error) {
            console.error('Failed to get token expiration:', error);
            return null;
        }
    }

    /**
     * Auto-refresh token if needed
     */
    async ensureValidToken() {
        if (!this.isAuthenticated()) {
            return {
                success: false,
                error: 'Not authenticated'
            };
        }

        if (this.isTokenExpired()) {
            console.log('Token expired, attempting refresh...');
            const refreshResult = await this.refreshToken();
            
            if (!refreshResult.success) {
                this.logout();
                return {
                    success: false,
                    error: 'Session expired, please login again'
                };
            }
        }

        return {
            success: true,
            token: this.getToken()
        };
    }

    /**
     * Format phone number for display
     */
    formatPhoneNumber(phone) {
        // Remove all non-digit characters
        const cleaned = phone.replace(/\D/g, '');
        
        // Format based on length
        if (cleaned.length === 10) {
            return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
        } else if (cleaned.length === 11 && cleaned[0] === '1') {
            return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
        }
        
        return phone; // Return original if can't format
    }

    /**
     * Get authentication status summary
     */
    getAuthStatus() {
        const token = this.getToken();
        const contractor = this.getContractor();
        const isExpired = this.isTokenExpired();
        
        return {
            isAuthenticated: this.isAuthenticated(),
            hasToken: !!token,
            hasContractor: !!contractor,
            isTokenExpired: isExpired,
            tokenExpiration: this.getTokenExpiration(),
            contractorName: contractor?.name || null,
            contractorEmail: contractor?.email || null
        };
    }

    /**
     * Store authentication data in session storage
     */
    storeAuthenticationData(token, contractor) {
        try {
            // Get existing state or create new one
            let state = {};
            const savedState = sessionStorage.getItem('waterAutomationState');
            if (savedState) {
                state = JSON.parse(savedState);
            }

            // Update authentication data
            state.authentication = {
                isAuthenticated: true,
                token: token,
                contractor: contractor
            };

            // Save updated state
            sessionStorage.setItem('waterAutomationState', JSON.stringify(state));

            console.log('Authentication data stored successfully');
        } catch (error) {
            console.error('Failed to store authentication data:', error);
            throw new Error('Failed to store authentication data');
        }
    }
}

export { AuthenticationManager };