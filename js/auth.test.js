/**
 * Unit tests for AuthenticationManager
 */

// Mock APIClient for testing
class MockAPIClient {
    constructor() {
        this.shouldSucceed = true;
        this.mockResponse = {};
    }

    setMockResponse(response) {
        this.mockResponse = response;
    }

    setShouldSucceed(shouldSucceed) {
        this.shouldSucceed = shouldSucceed;
    }

    async post(endpoint, data, requiresAuth = false) {
        if (!this.shouldSucceed) {
            throw new Error('Network error');
        }

        // Simulate API responses
        if (endpoint === '/api/v1/auth/login') {
            return this.mockResponse.login || {
                success: true,
                contractor: {
                    id: '123',
                    name: 'Test Contractor',
                    email: data.email,
                    phone: data.phone
                },
                token: 'mock-jwt-token-12345'
            };
        }

        if (endpoint === '/api/v1/contractors/register') {
            return this.mockResponse.register || {
                success: true,
                contractor: {
                    id: '456',
                    name: data.name,
                    email: data.email,
                    phone: data.phone
                },
                token: 'mock-jwt-token-67890'
            };
        }

        if (endpoint === '/api/v1/auth/refresh') {
            return this.mockResponse.refresh || {
                success: true,
                token: 'mock-refreshed-token-99999'
            };
        }

        return { success: false, error: 'Unknown endpoint' };
    }

    async get(endpoint, requiresAuth = false) {
        if (endpoint === '/api/v1/auth/validate') {
            return this.mockResponse.validate || {
                success: true,
                contractor: { id: '123', name: 'Test Contractor' }
            };
        }
        return { success: false, error: 'Unknown endpoint' };
    }
}

function runAuthenticationTests(testRunner) {
    const { describe, test, expect } = testRunner;

    describe('AuthenticationManager', () => {
        let mockApiClient;
        let authManager;

        // Setup before each test
        function setup() {
            sessionStorage.clear();
            mockApiClient = new MockAPIClient();
            authManager = new AuthenticationManager(mockApiClient);
        }

        test('should initialize with no authentication', () => {
            setup();
            expect(authManager.isAuthenticated()).toBe(false);
            expect(authManager.getToken()).toBeNull();
            expect(authManager.getContractor()).toBeNull();
        });

        test('should validate login credentials correctly', () => {
            setup();
            
            // Valid credentials
            const validResult = authManager.validateLoginCredentials({
                phone: '+1234567890',
                email: 'test@example.com',
                password: 'password123'
            });
            expect(validResult.isValid).toBe(true);
            expect(validResult.errors).toHaveLength(0);

            // Invalid credentials
            const invalidResult = authManager.validateLoginCredentials({
                phone: '123',
                email: 'invalid-email',
                password: '123'
            });
            expect(invalidResult.isValid).toBe(false);
            expect(invalidResult.errors.length > 0).toBe(true);
        });

        test('should validate registration data correctly', () => {
            setup();
            
            // Valid data
            const validResult = authManager.validateRegistrationData({
                name: 'John Doe',
                phone: '+1234567890',
                email: 'john@example.com',
                password: 'password123'
            });
            expect(validResult.isValid).toBe(true);

            // Invalid data
            const invalidResult = authManager.validateRegistrationData({
                name: '',
                phone: '123',
                email: 'invalid',
                password: '123'
            });
            expect(invalidResult.isValid).toBe(false);
        });

        test('should handle successful login', async () => {
            setup();
            
            const result = await authManager.login({
                phone: '+1234567890',
                email: 'test@example.com',
                password: 'password123'
            });

            expect(result.success).toBe(true);
            expect(result.token).toBe('mock-jwt-token-12345');
            expect(result.contractor.name).toBe('Test Contractor');
            expect(authManager.isAuthenticated()).toBe(true);
            expect(authManager.getToken()).toBe('mock-jwt-token-12345');
        });

        test('should handle failed login', async () => {
            setup();
            mockApiClient.setMockResponse({
                login: { success: false, error: 'Invalid credentials' }
            });

            const result = await authManager.login({
                phone: '+1234567890',
                email: 'test@example.com',
                password: 'wrongpassword'
            });

            expect(result.success).toBe(false);
            expect(result.error).toBe('Invalid credentials');
            expect(authManager.isAuthenticated()).toBe(false);
        });

        test('should handle successful registration', async () => {
            setup();
            
            const result = await authManager.register({
                name: 'New User',
                phone: '+1987654321',
                email: 'new@example.com',
                password: 'newpass123'
            });

            expect(result.success).toBe(true);
            expect(result.token).toBe('mock-jwt-token-67890');
            expect(authManager.isAuthenticated()).toBe(true);
        });

        test('should store and retrieve authentication data', async () => {
            setup();
            
            await authManager.login({
                phone: '+1234567890',
                email: 'test@example.com',
                password: 'password123'
            });

            // Check that data is stored in sessionStorage
            const savedState = JSON.parse(sessionStorage.getItem('waterAutomationState'));
            expect(savedState.authentication.isAuthenticated).toBe(true);
            expect(savedState.authentication.token).toBe('mock-jwt-token-12345');
            expect(savedState.authentication.contractor.name).toBe('Test Contractor');
        });

        test('should logout correctly', async () => {
            setup();
            
            // Login first
            await authManager.login({
                phone: '+1234567890',
                email: 'test@example.com',
                password: 'password123'
            });

            expect(authManager.isAuthenticated()).toBe(true);

            // Logout
            authManager.logout();

            expect(authManager.isAuthenticated()).toBe(false);
            expect(authManager.getToken()).toBeNull();
            expect(authManager.getContractor()).toBeNull();
        });

        test('should initialize auth state correctly', () => {
            setup();
            
            // Test with no existing data
            let initResult = authManager.initializeAuthState();
            expect(initResult.isAuthenticated).toBe(false);
            expect(initResult.reason).toBe('No token');

            // Test with valid token (mock a non-expired token)
            const mockToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjk5OTk5OTk5OTl9.fake';
            authManager.storeAuthenticationData(mockToken, { name: 'Test User' });
            
            initResult = authManager.initializeAuthState();
            expect(initResult.isAuthenticated).toBe(true);
        });

        test('should validate phone numbers correctly', () => {
            setup();
            
            expect(authManager.isValidPhone('+1234567890')).toBe(true);
            expect(authManager.isValidPhone('1234567890')).toBe(true);
            expect(authManager.isValidPhone('(123) 456-7890')).toBe(true);
            expect(authManager.isValidPhone('123')).toBe(false);
            expect(authManager.isValidPhone('')).toBe(false);
        });

        test('should validate email addresses correctly', () => {
            setup();
            
            expect(authManager.isValidEmail('test@example.com')).toBe(true);
            expect(authManager.isValidEmail('user.name@domain.co.uk')).toBe(true);
            expect(authManager.isValidEmail('invalid-email')).toBe(false);
            expect(authManager.isValidEmail('test@')).toBe(false);
            expect(authManager.isValidEmail('')).toBe(false);
        });

        test('should validate passwords correctly', () => {
            setup();
            
            expect(authManager.isValidPassword('password123')).toBe(true);
            expect(authManager.isValidPassword('abc123')).toBe(true);
            expect(authManager.isValidPassword('password')).toBe(false); // no number
            expect(authManager.isValidPassword('123456')).toBe(false); // no letter
            expect(authManager.isValidPassword('')).toBe(false);
        });

        test('should format phone numbers correctly', () => {
            setup();
            
            expect(authManager.formatPhoneNumber('1234567890')).toBe('(123) 456-7890');
            expect(authManager.formatPhoneNumber('11234567890')).toBe('+1 (123) 456-7890');
            expect(authManager.formatPhoneNumber('123')).toBe('123'); // unchanged if can't format
        });

        test('should get authentication status correctly', async () => {
            setup();
            
            // Test unauthenticated state
            let status = authManager.getAuthStatus();
            expect(status.isAuthenticated).toBe(false);
            expect(status.hasToken).toBe(false);

            // Test authenticated state
            await authManager.login({
                phone: '+1234567890',
                email: 'test@example.com',
                password: 'password123'
            });

            status = authManager.getAuthStatus();
            expect(status.isAuthenticated).toBe(true);
            expect(status.hasToken).toBe(true);
            expect(status.contractorName).toBe('Test Contractor');
        });

        test('should handle network errors gracefully', async () => {
            setup();
            mockApiClient.setShouldSucceed(false);

            const loginResult = await authManager.login({
                phone: '+1234567890',
                email: 'test@example.com',
                password: 'password123'
            });

            expect(loginResult.success).toBe(false);
            expect(loginResult.error).toBe('Login failed due to an unexpected error');
        });
    });
}

export { runAuthenticationTests, MockAPIClient };