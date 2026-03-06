/**
 * Simple test for APIClient enhancements
 * Tests the enhanced error handling and logging functionality
 */

import { APIClient } from './api.js';

// Test APIClient enhancements
async function testAPIClient() {
    console.log('🧪 Testing APIClient enhancements...');
    
    const apiClient = new APIClient();
    
    // Test 1: Validate base URL requirement
    console.log('\n1. Testing base URL validation...');
    const isValidBaseURL = apiClient.validateBaseURL();
    console.log(`✅ Base URL validation: ${isValidBaseURL ? 'PASS' : 'FAIL'}`);
    console.log(`   Current base URL: ${apiClient.getBaseURL()}`);
    
    // Test 2: Test logging configuration
    console.log('\n2. Testing logging configuration...');
    const loggingConfig = apiClient.getLoggingConfig();
    console.log(`✅ Logging config: ${JSON.stringify(loggingConfig)}`);
    
    // Test 3: Test connection error handling (with unreachable server)
    console.log('\n3. Testing connection error handling...');
    const badApiClient = new APIClient('http://localhost:9999'); // Non-existent server
    try {
        const result = await badApiClient.testConnection();
        console.log(`✅ Connection test result: ${JSON.stringify(result)}`);
    } catch (error) {
        console.log(`✅ Connection error handled: ${error.message}`);
    }
    
    // Test 4: Test authentication token handling
    console.log('\n4. Testing authentication token handling...');
    const token = apiClient.getAuthToken();
    console.log(`✅ Auth token retrieval: ${token ? 'Token found' : 'No token (expected for fresh session)'}`);
    
    // Test 5: Test convenience methods exist
    console.log('\n5. Testing convenience methods...');
    const methods = ['login', 'registerContractor', 'registerTruck', 'createOrder', 'createPayment'];
    const methodsExist = methods.every(method => typeof apiClient[method] === 'function');
    console.log(`✅ Convenience methods: ${methodsExist ? 'PASS' : 'FAIL'}`);
    
    // Test 6: Test error message extraction
    console.log('\n6. Testing error message extraction...');
    const errorMessage = apiClient.extractErrorMessage({ error: 'Test error message' }, 400);
    console.log(`✅ Error extraction: ${errorMessage === 'Test error message' ? 'PASS' : 'FAIL'}`);
    
    console.log('\n🎉 APIClient enhancement tests completed!');
}

// Run tests if this file is loaded directly
if (typeof window !== 'undefined') {
    // Browser environment
    window.testAPIClient = testAPIClient;
    console.log('APIClient test loaded. Run testAPIClient() to execute tests.');
} else {
    // Node environment (if needed)
    testAPIClient().catch(console.error);
}