/**
 * Test script for AuthenticationManager
 */

// Mock APIClient for testing
class MockAPIClient {
    async post(endpoint, data, requiresAuth = false) {
        console.log(`Mock API call: ${endpoint}`, data);
        
        // Simulate successful login/registration
        if (endpoint === '/api/v1/auth/login') {
            return {
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
            return {
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
        
        return { success: false, error: 'Unknown endpoint' };
    }
}

// Import AuthenticationManager (in a real environment)
// For testing, we'll assume it's available globally

async function testAuthenticationManager() {
    console.log('=== Testing AuthenticationManager ===');
    
    // Clear any existing session data
    sessionStorage.clear();
    
    const mockApiClient = new MockAPIClient();
    const authManager = new AuthenticationManager(mockApiClient);
    
    // Test 1: Initial state
    console.log('\n1. Testing initial state:');
    console.log('Is authenticated:', authManager.isAuthenticated());
    console.log('Token:', authManager.getToken());
    console.log('Contractor:', authManager.getContractor());
    
    // Test 2: Initialize auth state
    console.log('\n2. Testing auth state initialization:');
    const initResult = authManager.initializeAuthState();
    console.log('Init result:', initResult);
    
    // Test 3: Login
    console.log('\n3. Testing login:');
    const loginResult = await authManager.login({
        phone: '+1234567890',
        email: 'test@example.com',
        password: 'password123'
    });
    console.log('Login result:', loginResult);
    console.log('Is authenticated after login:', authManager.isAuthenticated());
    console.log('Token after login:', authManager.getToken());
    console.log('Contractor after login:', authManager.getContractor());
    
    // Test 4: Auth status
    console.log('\n4. Testing auth status:');
    const authStatus = authManager.getAuthStatus();
    console.log('Auth status:', authStatus);
    
    // Test 5: Logout
    console.log('\n5. Testing logout:');
    authManager.logout();
    console.log('Is authenticated after logout:', authManager.isAuthenticated());
    console.log('Token after logout:', authManager.getToken());
    
    // Test 6: Registration
    console.log('\n6. Testing registration:');
    const registerResult = await authManager.register({
        name: 'New Contractor',
        phone: '+1987654321',
        email: 'new@example.com',
        password: 'newpass123'
    });
    console.log('Registration result:', registerResult);
    console.log('Is authenticated after registration:', authManager.isAuthenticated());
    
    console.log('\n=== Tests completed ===');
}

// Export for use in test runner
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { testAuthenticationManager };
}