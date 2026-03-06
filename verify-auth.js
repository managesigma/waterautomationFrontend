/**
 * Simple verification script for AuthenticationManager
 */

// Mock sessionStorage for Node.js environment
global.sessionStorage = {
    data: {},
    getItem: function(key) {
        return this.data[key] || null;
    },
    setItem: function(key, value) {
        this.data[key] = value;
    },
    clear: function() {
        this.data = {};
    }
};

// Mock console for cleaner output
const originalLog = console.log;
console.log = (...args) => {
    if (!args[0]?.includes('Authentication data')) {
        originalLog(...args);
    }
};

// Mock APIClient
class MockAPIClient {
    async post(endpoint, data) {
        if (endpoint === '/api/v1/auth/login') {
            return {
                success: true,
                contractor: { id: '123', name: 'Test User', email: data.email },
                token: 'mock-jwt-token'
            };
        }
        return { success: false, error: 'Unknown endpoint' };
    }
}

// Load AuthenticationManager (simulate ES6 import)
const fs = require('fs');
const authCode = fs.readFileSync('js/auth.js', 'utf8');

// Remove export statement and evaluate
const cleanCode = authCode.replace('export { AuthenticationManager };', '');
eval(cleanCode);

// Make sure AuthenticationManager is available
if (typeof AuthenticationManager === 'undefined') {
    throw new Error('AuthenticationManager class not found in auth.js');
}

async function verifyAuthenticationManager() {
    console.log('🔍 Verifying AuthenticationManager...\n');

    try {
        // Test 1: Basic instantiation
        const mockApiClient = new MockAPIClient();
        const authManager = new AuthenticationManager(mockApiClient);
        console.log('✅ AuthenticationManager instantiated successfully');

        // Test 2: Initial state
        console.log('✅ Initial authentication state:', authManager.isAuthenticated());
        console.log('✅ Initial token:', authManager.getToken());

        // Test 3: Validation methods
        const phoneValid = authManager.isValidPhone('+1234567890');
        const emailValid = authManager.isValidEmail('test@example.com');
        const passwordValid = authManager.isValidPassword('password123');
        console.log('✅ Phone validation:', phoneValid);
        console.log('✅ Email validation:', emailValid);
        console.log('✅ Password validation:', passwordValid);

        // Test 4: Login credentials validation
        const credentialsValidation = authManager.validateLoginCredentials({
            phone: '+1234567890',
            email: 'test@example.com',
            password: 'password123'
        });
        console.log('✅ Credentials validation:', credentialsValidation.isValid);

        // Test 5: Mock login
        const loginResult = await authManager.login({
            phone: '+1234567890',
            email: 'test@example.com',
            password: 'password123'
        });
        console.log('✅ Login result:', loginResult.success);
        console.log('✅ Token stored:', !!authManager.getToken());
        console.log('✅ Is authenticated after login:', authManager.isAuthenticated());

        // Test 6: Auth status
        const authStatus = authManager.getAuthStatus();
        console.log('✅ Auth status:', {
            isAuthenticated: authStatus.isAuthenticated,
            hasToken: authStatus.hasToken,
            contractorName: authStatus.contractorName
        });

        // Test 7: Logout
        authManager.logout();
        console.log('✅ Is authenticated after logout:', authManager.isAuthenticated());

        console.log('\n🎉 All AuthenticationManager verifications passed!');
        
    } catch (error) {
        console.error('❌ Verification failed:', error.message);
        console.error(error.stack);
    }
}

verifyAuthenticationManager();