/**
 * Main Application Controller
 * Orchestrates the water automation workflow and manages application state
 */

import { ApplicationState } from './state.js';
import { APIClient } from './api.js';
import { AuthenticationManager } from './auth.js';
import { UIManager } from './ui.js';

// Global Cashfree Initialization (Matching working reference)
const cashfree = window.Cashfree ? window.Cashfree({ mode: "sandbox" }) : null;

class AppController {
    constructor() {
        this.state = new ApplicationState();
        this.apiClient = new APIClient();
        this.authManager = new AuthenticationManager(this.apiClient);
        this.uiManager = new UIManager();
        
        // Bind methods to preserve context
        this.handleFormSubmit = this.handleFormSubmit.bind(this);
        this.handleNavigation = this.handleNavigation.bind(this);
        this.handleLogout = this.handleLogout.bind(this);
    }

    /**
     * Initialize the application
     */
    async initialize() {
        try {
            // Load saved state from sessionStorage
            this.state.loadState();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Initialize UI based on current state
            this.uiManager.initialize();
            
            // Navigate to appropriate step based on state
            this.navigateToCurrentStep();

            // Check for redirect return (Cashfree _self redirect)
            const urlParams = new URLSearchParams(window.location.search);
            const redirectOrderId = urlParams.get('orderId');
            if (redirectOrderId) {
                console.log('Detected payment redirect return for order:', redirectOrderId);
                
                // Clear the URL to avoid repeated polling on refresh
                const newUrl = window.location.origin + window.location.pathname;
                window.history.replaceState({}, document.title, newUrl);
                
                this.pollPaymentStatus(redirectOrderId);
            }
            
            console.log('Application initialized successfully');
        } catch (error) {
            console.error('Failed to initialize application:', error);
            this.uiManager.displayError('Failed to initialize application. Please refresh the page.');
        }
    }

    /**
     * Set up event listeners for forms and navigation
     */
    setupEventListeners() {
        // Form submissions
        document.addEventListener('submit', this.handleFormSubmit);
        
        // Navigation buttons
        document.getElementById('backBtn')?.addEventListener('click', this.handleNavigation);
        document.getElementById('logoutBtn')?.addEventListener('click', this.handleLogout);
        document.getElementById('startNewWorkflowBtn')?.addEventListener('click', () => this.startNewWorkflow());
        
        // Payment button direct click listener (Avoiding form submit race)
        document.getElementById('initPaymentBtn')?.addEventListener('click', () => this.handlePayment());
        
        // Form switching (login/register)
        document.getElementById('showRegisterBtn')?.addEventListener('click', () => this.uiManager.showRegisterForm());
        document.getElementById('showLoginBtn')?.addEventListener('click', () => this.uiManager.showLoginForm());
        
        // Handle browser back/forward
        window.addEventListener('popstate', () => this.navigateToCurrentStep());
    }

    /**
     * Handle form submissions based on form ID
     */
    /**
         * Handle form submissions based on form ID with enhanced validation
         */
        async handleFormSubmit(event) {
            event.preventDefault();

            const form = event.target;
            const formId = form.id;

            try {
                // Clear previous messages
                this.uiManager.clearMessages();

                // Perform client-side validation before submission
                const validationResult = this.uiManager.validateFormWithEnhancedRules(form);
                if (!validationResult.isValid) {
                    this.uiManager.displayValidationErrors(validationResult.errors);
                    return;
                }
                const formData = new FormData(form);
                this.uiManager.setLoadingState(true);

                switch (formId) {
                    case 'loginForm':
                        await this.handleLogin(formData);
                        break;
                    case 'registerForm':
                        await this.handleRegister(formData);
                        break;
                    case 'truckRegistrationForm':
                        await this.handleTruckRegistration(formData);
                        break;
                    case 'orderCreationForm':
                        await this.handleOrderCreation(formData);
                        break;
                    default:
                        console.warn('Unknown form submitted:', formId);
                }
            } catch (error) {
                console.error('Form submission error:', error);
                this.uiManager.displayAPIError(error, 'Form submission failed');
            } finally {
                this.uiManager.setLoadingState(false);
            }
        }


    /**
     * Handle login form submission with enhanced error handling
     */
    async handleLogin(formData) {
        const credentials = {
            phone: formData.get('phone'),
            email: formData.get('email'),
            password: formData.get('password')
        };

        const result = await this.authManager.login(credentials);
        
        if (result.success) {
            this.state.setAuthenticated(result.contractor, result.token);
            this.uiManager.displaySuccess('Login successful!');
            this.navigateToStep('truckRegistration');
        } else {
            this.uiManager.displayAPIError(result.error, 'Authentication failed');
            throw new Error(result.error);
        }
    }

    /**
     * Handle registration form submission with enhanced error handling
     */
    async handleRegister(formData) {
        const contractorData = {
            name: formData.get('name'),
            phone: formData.get('phone'),
            email: formData.get('email'),
            password: formData.get('password')
        };

        const result = await this.authManager.register(contractorData);
        
        if (result.success) {
            this.state.setAuthenticated(result.contractor, result.token);
            this.uiManager.displaySuccess('Registration successful!');
            this.navigateToStep('truckRegistration');
        } else {
            this.uiManager.displayAPIError(result.error, 'Registration failed');
            throw new Error(result.error);
        }
    }

    /**
     * Handle truck registration form submission with enhanced error handling
     */
    async handleTruckRegistration(formData) {
        const truckData = {
            registrationNumber: formData.get('registrationNumber'),
            capacity: parseInt(formData.get('capacity')),
            contractorId: this.state.authentication.contractor.id
        };

        const response = await this.apiClient.post('/api/v1/trucks/register', truckData, true);
        
        if (response.success) {
            const truck = response.truck || response.data?.truck || response.data;
            this.state.setTruckRegistered(truck);
            this.uiManager.displaySuccess('Truck registered successfully!');
            this.navigateToStep('orderCreation');
        } else {
            this.uiManager.displayAPIError(response.error, 'Truck registration failed');
            throw new Error(response.error || 'Failed to register truck');
        }
    }

    /**
     * Handle order creation form submission with enhanced error handling
     */
    async handleOrderCreation(formData) {
        const orderData = {
            truckId: formData.get('truckId'),
            requiredLiters: parseInt(formData.get('requiredLiters')),
            contractorId: this.state.authentication.contractor.id
        };

        const response = await this.apiClient.post('/api/v1/orders', orderData, true);
        
        if (response.success) {
            const order = response.order || response.data?.order || response.data;
            this.state.setOrderCreated(order);
            this.uiManager.displaySuccess('Order created successfully!');
            this.navigateToStep('paymentProcessing');
        } else {
            this.uiManager.displayAPIError(response.error, 'Order creation failed');
            throw new Error(response.error || 'Failed to create order');
        }
    }

    /**
     * Handle payment form submission with enhanced error handling
     */
    /**
     * Handle payment initialization and checkout
     */
    async handlePayment() {
        const order = this.state.ordering.order;
        if (!order) return;

        const paymentData = {
            orderId: order.id,
            contractorId: this.state.authentication.contractor.id
        };
        
        // Hide summary and show loading placeholder in dropin container
        const dropinContainer = document.getElementById('cashfreeDropinContainer');
        const paymentBtn = document.getElementById('initPaymentBtn');
        const orderSummary = document.getElementById('orderSummary');
        
        if(orderSummary) orderSummary.style.display = 'none';
        if(paymentBtn) paymentBtn.style.display = 'none';
        
        if(dropinContainer) {
            dropinContainer.classList.remove('hidden');
            dropinContainer.innerHTML = '<div class="w-full h-full flex flex-col items-center justify-center p-10"><div class="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div><p class="text-gray-500 font-medium">Initializing Secure Payment...</p></div>';
        }

        try {
            const response = await this.apiClient.post('/api/v1/payments/create', paymentData, true);
            const paymentSessionId = response.paymentSessionId || response.data?.paymentSessionId;
            
            if (response.success && paymentSessionId) {
                // Store liters for later 
                localStorage.setItem('cf_liters', order.requiredLiters);
                
                // Initialize Cashfree if global init failed
                const cfInstance = cashfree || (window.Cashfree ? window.Cashfree({ mode: "sandbox" }) : null);

                if (!cfInstance) {
                    throw new Error("Cashfree SDK not loaded. Please refresh.");
                }

                let checkoutOptions = { 
                    paymentSessionId: paymentSessionId,
                    redirectTarget: "_modal" 
                };
                
                console.log("🚀 Launching Cashfree Modal...");
                await cfInstance.checkout(checkoutOptions);
                
                // Start Polling for status
                this.pollPaymentStatus(order.id);

            } else {
                if(dropinContainer) dropinContainer.classList.add('hidden');
                if(orderSummary) orderSummary.style.display = 'block';
                if(paymentBtn) paymentBtn.style.display = 'block';
                
                this.uiManager.displayAPIError(response.error || 'Failed to initialize payment', 'Payment Error');
            }
        } catch (error) {
            if(dropinContainer) dropinContainer.classList.add('hidden');
            if(orderSummary) orderSummary.style.display = 'block';
            if(paymentBtn) paymentBtn.style.display = 'block';
            
            console.error(error);
            this.uiManager.displayAPIError(error.message, 'Payment setup failed');
        }
    }

    /**
     * Poll for payment status until confirmed or timeout
     */
    async pollPaymentStatus(orderId) {
        if (!orderId) return;
        
        console.log(` Starting payment polling for order: ${orderId}`);
        this.uiManager.setLoadingState(true, 'Confirming payment status...');
        
        const maxAttempts = 24; // 24 * 2.5s = 60s
        let attempts = 0;
        
        const poll = async () => {
            attempts++;
            try {
                let statusData = null;
                
                // Try primary payment status endpoint first
                const response = await this.apiClient.get(`/api/v1/payments/order/${orderId}`, true);
                
                if (response.success && response.data) {
                    statusData = response.data;
                } else {
                    console.warn('Primary payment poll failed (Unauthorized or Error), trying order fallback...');
                    // Fallback to general order status endpoint
                    const fallbackResponse = await this.apiClient.get(`/api/v1/orders/${orderId}`, true);
                    statusData = fallbackResponse.data || fallbackResponse;
                }

                const status = (statusData?.paymentStatus || statusData?.status || "").toUpperCase();
                console.log(`🔄 Polling attempt ${attempts}: Status = ${status}`);
                
                if (status === 'PAID' || status === 'SUCCESS' || status === 'COMPLETED') {
                    this.state.setPaymentProcessed(statusData || { status: 'SUCCESS' });
                    this.uiManager.setLoadingState(false);
                    this.uiManager.displaySuccess('Payment Confirmed!');
                    this.navigateToStep('completion');
                    return true;
                } else if (status === 'FAILED' || status === 'CANCELLED') {
                    this.uiManager.setLoadingState(false);
                    this.uiManager.displayError('Payment failed or was cancelled.');
                    return false;
                }
            } catch (error) {
                console.warn('Poll attempt failed:', error.message);
            }
            
            if (attempts < maxAttempts) {
                setTimeout(poll, 2500);
            } else {
                this.uiManager.setLoadingState(false);
                this.uiManager.displayError('Payment confirmation timed out. Please check your dashboard.');
            }
        };
        
        poll();
    }

    /**
     * Navigate to a specific workflow step
     */
    navigateToStep(stepName) {
        this.state.setCurrentStep(stepName);
        this.uiManager.showStep(stepName);
        this.updateProgressIndicator();
        this.updateNavigationButtons();
        
        // Update browser history
        const url = new URL(window.location);
        url.searchParams.set('step', stepName);
        window.history.pushState({ step: stepName }, '', url);
    }

    /**
     * Navigate to the current step based on application state
     */
    navigateToCurrentStep() {
        const urlParams = new URLSearchParams(window.location.search);
        const urlStep = urlParams.get('step');
        
        // Determine the appropriate step based on state
        let targetStep = this.determineCurrentStep();
        
        // Use URL step if it's valid and accessible
        if (urlStep && this.isStepAccessible(urlStep)) {
            targetStep = urlStep;
        }
        
        this.navigateToStep(targetStep);
    }

    /**
     * Determine the current step based on application state
     */
    determineCurrentStep() {
        if (!this.state.authentication.isAuthenticated) {
            return 'authentication';
        }
        
        if (!this.state.registration.isRegistered) {
            return 'truckRegistration';
        }
        
        if (!this.state.ordering.isCreated) {
            return 'orderCreation';
        }
        
        if (!this.state.payment.isProcessed) {
            return 'paymentProcessing';
        }
        
        return 'completion';
    }

    /**
     * Check if a step is accessible based on current state
     */
    isStepAccessible(stepName) {
        const stepOrder = ['authentication', 'truckRegistration', 'orderCreation', 'paymentProcessing', 'completion'];
        const currentStepIndex = stepOrder.indexOf(this.determineCurrentStep());
        const targetStepIndex = stepOrder.indexOf(stepName);
        
        return targetStepIndex <= currentStepIndex;
    }

    /**
     * Update progress indicator based on current step
     */
    updateProgressIndicator() {
        const steps = ['authentication', 'truckRegistration', 'orderCreation', 'paymentProcessing'];
        const currentStep = this.state.workflow.currentStep;
        
        steps.forEach((step, index) => {
            const stepElement = document.querySelector(`[data-step="${index + 1}"]`);
            if (stepElement) {
                stepElement.classList.remove('active', 'completed');
                
                if (step === currentStep) {
                    stepElement.classList.add('active');
                } else if (this.isStepCompleted(step)) {
                    stepElement.classList.add('completed');
                }
            }
        });
    }

    /**
     * Check if a step has been completed
     */
    isStepCompleted(stepName) {
        switch (stepName) {
            case 'authentication':
                return this.state.authentication.isAuthenticated;
            case 'truckRegistration':
                return this.state.registration.isRegistered;
            case 'orderCreation':
                return this.state.ordering.isCreated;
            case 'paymentProcessing':
                return this.state.payment.isProcessed;
            default:
                return false;
        }
    }

    /**
     * Update navigation button states
     */
    updateNavigationButtons() {
        const backBtn = document.getElementById('backBtn');
        const currentStep = this.state.workflow.currentStep;
        
        if (backBtn) {
            backBtn.disabled = currentStep === 'authentication';
        }
    }

    /**
     * Handle navigation button clicks
     */
    handleNavigation(event) {
        const button = event.target;
        
        if (button.id === 'backBtn') {
            this.navigateToPreviousStep();
        }
    }

    /**
     * Navigate to the previous step in the workflow
     */
    navigateToPreviousStep() {
        const steps = ['authentication', 'truckRegistration', 'orderCreation', 'paymentProcessing', 'completion'];
        const currentIndex = steps.indexOf(this.state.workflow.currentStep);
        
        if (currentIndex > 0) {
            const previousStep = steps[currentIndex - 1];
            this.navigateToStep(previousStep);
        }
    }

    /**
     * Handle logout
     */
    handleLogout() {
        this.authManager.logout();
        this.state.resetState();
        this.navigateToStep('authentication');
        this.uiManager.displaySuccess('Logged out successfully');
    }

    /**
     * Start a new workflow (reset to truck registration)
     */
    startNewWorkflow() {
        // Keep authentication but reset workflow progress
        this.state.resetWorkflow();
        this.navigateToStep('truckRegistration');
        this.uiManager.displaySuccess('Starting new workflow');
    }

    /**
     * Handle global errors
     */
    handleError(error) {
        console.error('Application error:', error);
        this.uiManager.displayError(error.message || 'An unexpected error occurred');
        this.uiManager.setLoadingState(false);
    }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new AppController();
    app.initialize().catch(error => {
        console.error('Failed to initialize application:', error);
    });
    
    // Make app globally available for debugging
    window.app = app;
});

export { AppController };