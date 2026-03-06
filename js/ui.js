/**
 * UI Manager
 * Handles DOM manipulation, form validation, and user interface updates
 * Enhanced with improved step navigation, progress indicators, and loading states
 */

class UIManager {
    constructor() {
        this.currentStep = 'authentication';
        this.completedSteps = [];
        this.loadingOverlay = null;
        this.successMessage = null;
        this.errorMessage = null;
        this.stepOrder = ['authentication', 'truckRegistration', 'orderCreation', 'paymentProcessing', 'completion'];
        
        // Initialize after DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeElements());
        } else {
            this.initializeElements();
        }
    }

    /**
     * Initialize UI elements
     */
    initialize() {
        this.initializeElements();
        this.setupFormValidation();
        this.setupFormSwitching();
        this.setupNavigationHandlers();
    }

    /**
     * Initialize DOM element references
     */
    initializeElements() {
        this.loadingOverlay = document.getElementById('loadingOverlay');
        this.successMessage = document.getElementById('successMessage');
        this.errorMessage = document.getElementById('errorMessage');
    }

    /**
     * Show a specific workflow step with enhanced navigation
     */
    showStep(stepName) {
        // Validate step name
        if (!this.stepOrder.includes(stepName)) {
            console.error(`Invalid step name: ${stepName}`);
            return false;
        }

        // Hide all steps
        const allSteps = document.querySelectorAll('.workflow-step');
        allSteps.forEach(step => {
            step.classList.remove('active');
            step.classList.add('hidden');
        });

        // Show target step
        const targetStep = document.getElementById(`${stepName}Step`);
        if (targetStep) {
            targetStep.classList.remove('hidden');
            targetStep.classList.add('active');
            this.currentStep = stepName;
            
            // Update progress indicator
            this.updateProgressIndicator(stepName, this.completedSteps);
            
            // Update navigation buttons
            this.updateNavigationButtons();
            
            // Populate form data if needed
            this.populateFormData(stepName);
            
            // Scroll to top and focus first input
            this.scrollToTop();
            setTimeout(() => this.focusFirstInput(), 100);
            
            // Clear any existing messages
            this.clearMessages();
            
            return true;
        } else {
            console.error(`Step element not found: ${stepName}Step`);
            return false;
        }
    }

    /**
     * Navigate to next step in workflow
     */
    navigateToNextStep() {
        const currentIndex = this.stepOrder.indexOf(this.currentStep);
        
        if (currentIndex === -1) {
            console.error(`Current step not found in step order: ${this.currentStep}`);
            return false;
        }

        // Mark current step as completed
        if (!this.completedSteps.includes(this.currentStep)) {
            this.completedSteps.push(this.currentStep);
        }

        // Check if there's a next step
        if (currentIndex < this.stepOrder.length - 1) {
            const nextStep = this.stepOrder[currentIndex + 1];
            return this.showStep(nextStep);
        } else {
            console.log('Already at the last step');
            return false;
        }
    }

    /**
     * Navigate to previous step in workflow
     */
    navigateToPreviousStep() {
        const currentIndex = this.stepOrder.indexOf(this.currentStep);
        
        if (currentIndex === -1) {
            console.error(`Current step not found in step order: ${this.currentStep}`);
            return false;
        }

        // Check if there's a previous step
        if (currentIndex > 0) {
            const previousStep = this.stepOrder[currentIndex - 1];
            return this.showStep(previousStep);
        } else {
            console.log('Already at the first step');
            return false;
        }
    }

    /**
     * Check if navigation to next step is allowed
     */
    canNavigateToNextStep() {
        return this.completedSteps.includes(this.currentStep);
    }

    /**
     * Check if navigation to previous step is allowed
     */
    canNavigateToPreviousStep() {
        const currentIndex = this.stepOrder.indexOf(this.currentStep);
        return currentIndex > 0;
    }

    /**
     * Mark current step as completed and navigate to next
     */
    completeCurrentStep() {
        if (!this.completedSteps.includes(this.currentStep)) {
            this.completedSteps.push(this.currentStep);
        }
        
        // Update progress indicator immediately
        this.updateProgressIndicator(this.currentStep, this.completedSteps);
        
        // Navigate to next step after a brief delay for visual feedback
        setTimeout(() => {
            this.navigateToNextStep();
        }, 500);
    }

    /**
     * Reset workflow to beginning
     */
    resetWorkflow() {
        this.currentStep = 'authentication';
        this.completedSteps = [];
        this.showStep('authentication');
        this.clearMessages();
    }

    /**
     * Setup navigation button handlers
     */
    setupNavigationHandlers() {
        const backBtn = document.getElementById('backBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        const startNewWorkflowBtn = document.getElementById('startNewWorkflowBtn');

        if (backBtn) {
            backBtn.addEventListener('click', () => {
                if (this.canNavigateToPreviousStep()) {
                    this.navigateToPreviousStep();
                }
            });
        }

        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.handleLogout();
            });
        }

        if (startNewWorkflowBtn) {
            startNewWorkflowBtn.addEventListener('click', () => {
                this.resetWorkflow();
            });
        }
    }

    /**
     * Handle logout action
     */
    handleLogout() {
        // Clear session storage
        sessionStorage.removeItem('waterAutomationState');
        sessionStorage.removeItem('authToken');
        
        // Reset workflow
        this.resetWorkflow();
        
        // Show success message
        this.displaySuccess('Logged out successfully');
    }

    /**
     * Populate form data based on current step and application state
     */
    populateFormData(stepName) {
        try {
            const savedState = sessionStorage.getItem('waterAutomationState');
            if (!savedState) return;
            
            const state = JSON.parse(savedState);
            
            switch (stepName) {
                case 'orderCreation':
                    this.populateOrderForm(state);
                    break;
                case 'paymentProcessing':
                    this.populatePaymentForm(state);
                    break;
                case 'completion':
                    this.populateCompletionSummary(state);
                    break;
            }
        } catch (error) {
            console.error('Failed to populate form data:', error);
        }
    }

    /**
     * Populate order creation form
     */
    populateOrderForm(state) {
        const truckIdField = document.getElementById('truckId');
        if (truckIdField && state.registration?.truck?.id) {
            truckIdField.value = state.registration.truck.id;
        }
    }

    /**
     * Populate payment form
     */
    populatePaymentForm(state) {
        const orderIdField = document.getElementById('orderId');
        const orderSummary = document.getElementById('orderSummary');
        
        if (orderIdField && state.ordering?.order?.id) {
            orderIdField.value = state.ordering.order.id;
        }
        
        if (orderSummary && state.ordering?.order) {
            this.renderOrderSummary(state.ordering.order, state.registration?.truck);
        }
    }

    /**
     * Render order summary with enhanced formatting
     */
    renderOrderSummary(order, truck) {
        const orderSummary = document.getElementById('orderSummary');
        if (!orderSummary) return;

        const estimatedCost = order.requiredLiters * 0.5; // $0.5 per liter

        orderSummary.innerHTML = `
            <div class="bg-indigo-50/50 border border-indigo-100 rounded-xl p-5 mb-6">
                <h4 class="text-sm font-bold text-indigo-900 mb-4 px-1 flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
                    Order Summary
                </h4>
                <div class="space-y-3">
                    <div class="flex justify-between items-center text-sm border-b border-indigo-100/50 pb-2">
                        <span class="text-gray-500 font-medium">Order ID</span>
                        <span class="text-gray-800 font-mono bg-white px-2 py-0.5 rounded shadow-sm">${order.displayId || order.id || 'N/A'}</span>
                    </div>
                    <div class="flex justify-between items-center text-sm border-b border-indigo-100/50 pb-2">
                        <span class="text-gray-500 font-medium">Truck</span>
                        <span class="text-gray-800 font-medium">${truck?.registrationNumber || 'N/A'}</span>
                    </div>
                    <div class="flex justify-between items-center text-sm border-b border-indigo-100/50 pb-2">
                        <span class="text-gray-500 font-medium">Required Liters</span>
                        <span class="text-gray-800 font-medium">${(order.requiredLiters || 0).toLocaleString()} L</span>
                    </div>
                    <div class="flex justify-between items-center pt-1">
                        <span class="text-gray-700 font-bold">Estimated Cost</span>
                        <span class="text-lg font-black text-indigo-700">$${estimatedCost.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Populate completion summary with enhanced formatting
     */
    populateCompletionSummary(state) {
        const completionSummary = document.getElementById('completionSummary');
        if (!completionSummary) return;

        const order = state.ordering?.order;
        const displayId = order?.displayId || order?.id || '—';
        
        // Try to get liters from state, fallback to localStorage (for redirect flow)
        const liters = order?.requiredLiters || localStorage.getItem('cf_liters') || '—';
        const formattedLiters = liters !== '—' ? `${Number(liters).toLocaleString()} Liters` : '—';

        completionSummary.innerHTML = `
            <div class="mt-8 animate-[fadeIn_0.5s_ease-out]">
                <!-- Success Card (Syne + DM Mono Aesthetic) -->
                <div class="bg-gradient-to-br from-[#051a12] to-[#0a1f1a] border border-green-500/30 rounded-[2.5rem] p-8 sm:p-10 relative overflow-hidden shadow-2xl">
                    <!-- Decorative Radial Gradient -->
                    <div class="absolute top-[-60px] right-[-60px] w-[200px] h-[200px] bg-green-500/10 rounded-full blur-[70px] pointer-events-none"></div>
                    
                    <div class="relative z-10 text-center sm:text-left">
                        <div class="w-16 h-16 bg-green-500/15 border-2 border-green-500 rounded-full flex items-center justify-center mb-6 mx-auto sm:mx-0 shadow-[0_0_20px_rgba(34,211,160,0.3)]">
                            <svg class="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
                            </svg>
                        </div>
                        
                        <h2 class="text-3xl sm:text-4xl font-extrabold text-white mb-2 tracking-tight font-['Syne']">Order Placed!</h2>
                        <p class="text-xs sm:text-sm text-gray-400 font-medium font-['DM_Mono'] uppercase tracking-[1.5px] mb-10">Payment confirmed · Order active</p>
                        
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-xl">
                            <!-- Order ID Detail -->
                            <div class="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-1 hover:bg-white/10 transition-colors">
                                <span class="text-[10px] uppercase tracking-[1.5px] text-gray-500 font-['DM_Mono']">Order ID</span>
                                <span class="text-lg font-bold text-green-400 font-['DM_Mono']">${displayId}</span>
                            </div>
                            
                            <!-- Quantity Detail -->
                            <div class="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-1 hover:bg-white/10 transition-colors">
                                <span class="text-[10px] uppercase tracking-[1.5px] text-gray-500 font-['DM_Mono']">Quantity Ordered</span>
                                <span class="text-lg font-bold text-white font-['Syne']">${formattedLiters}</span>
                            </div>
                            
                            <!-- Status Detail -->
                            <div class="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-1 sm:col-span-2 hover:bg-white/10 transition-colors">
                                <span class="text-[10px] uppercase tracking-[1.5px] text-gray-500 font-['DM_Mono']">Payment Status</span>
                                <div class="flex items-center gap-2">
                                    <span class="text-lg font-bold text-green-400 font-['Syne'] uppercase">PAID</span>
                                    <svg class="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Enhanced loading state management
     */
    setLoadingState(isLoading, message = 'Processing...') {
        if (this.loadingOverlay) {
            const loadingText = this.loadingOverlay.querySelector('p');
            
            if (isLoading) {
                if (loadingText) {
                    loadingText.textContent = message;
                }
                this.loadingOverlay.classList.remove('hidden');
                this.loadingOverlay.style.display = 'flex';
                
                // Disable all form inputs while loading
                this.setAllFormsEnabled(false);
            } else {
                this.loadingOverlay.classList.add('hidden');
                this.loadingOverlay.style.display = '';
                
                // Re-enable form inputs
                this.setAllFormsEnabled(true);
            }
        }
    }

    /**
     * Set loading state with custom message for specific operations
     */
    setLoadingStateWithMessage(isLoading, operation) {
        const messages = {
            'login': 'Authenticating...',
            'register': 'Creating account...',
            'truck-registration': 'Registering truck...',
            'order-creation': 'Creating order...',
            'payment-processing': 'Processing payment...',
            'default': 'Processing...'
        };
        
        const message = messages[operation] || messages['default'];
        this.setLoadingState(isLoading, message);
    }

    /**
     * Enable/disable all forms
     */
    setAllFormsEnabled(enabled) {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            const inputs = form.querySelectorAll('input, button');
            inputs.forEach(element => {
                element.disabled = !enabled;
            });
        });
        
        // Also handle navigation buttons
        const backBtn = document.getElementById('backBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        
        if (backBtn && enabled) {
            backBtn.disabled = !this.canNavigateToPreviousStep();
        } else if (backBtn) {
            backBtn.disabled = true;
        }
        
        if (logoutBtn) {
            logoutBtn.disabled = !enabled;
        }
    }

    /**
     * Display success message with auto-hide
     */
    displaySuccess(message, autoHide = true) {
        this.clearMessages();
        if (this.successMessage) {
            this.successMessage.textContent = message;
            this.successMessage.classList.remove('hidden', 'opacity-0', 'translate-y-[-10px]');
            this.successMessage.classList.add('opacity-100', 'translate-y-0');
            
            // Auto-hide after 5 seconds if enabled
            if (autoHide) {
                setTimeout(() => {
                    this.clearMessages();
                }, 5000);
            }
        }
    }

    /**
     * Display error message
     */
    displayError(message) {
        this.clearMessages();
        if (this.errorMessage) {
            this.errorMessage.textContent = message;
            this.errorMessage.classList.remove('hidden', 'opacity-0', 'translate-y-[-10px]');
            this.errorMessage.classList.add('opacity-100', 'translate-y-0');
        }
    }

    /**
     * Clear all messages
     */
    clearMessages() {
        if (this.successMessage) {
            this.successMessage.classList.add('hidden', 'opacity-0', 'translate-y-[-10px]');
            this.successMessage.classList.remove('opacity-100', 'translate-y-0');
        }
        if (this.errorMessage) {
            this.errorMessage.classList.add('hidden', 'opacity-0', 'translate-y-[-10px]');
            this.errorMessage.classList.remove('opacity-100', 'translate-y-0');
        }
        this.clearFieldErrors();
    }

    /**
     * Clear field-specific error messages
     */
    clearFieldErrors() {
        const errorElements = document.querySelectorAll('[id$="Error"]');
        errorElements.forEach(element => {
            element.classList.add('hidden');
            element.textContent = '';
        });
    }

    /**
     * Display field-specific error
     */
    displayFieldError(fieldName, message) {
        const errorElement = document.getElementById(`${fieldName}Error`);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.remove('hidden');
        }
    }

    /**
     * Setup form validation
     */
    setupFormValidation() {
        // Real-time validation for all form inputs
        document.addEventListener('input', (event) => {
            if (event.target.tagName === 'INPUT') {
                this.validateField(event.target);
            }
        });

        // Validation on blur
        document.addEventListener('blur', (event) => {
            if (event.target.tagName === 'INPUT') {
                this.validateField(event.target);
            }
        }, true);
    }

    /**
     * Validate individual form field
     */
    validateField(field) {
            const fieldName = field.name;
            const value = field.value.trim();
            let isValid = true;
            let errorMessage = '';

            // Clear previous error
            this.clearFieldError(fieldName);

            // Required field validation
            if (field.hasAttribute('required') && !value) {
                isValid = false;
                errorMessage = 'This field is required';
            }
            // Email validation
            else if (field.type === 'email' && value && !this.isValidEmail(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid email address (e.g., user@example.com)';
            }
            // Phone validation
            else if (field.type === 'tel' && value && !this.isValidPhone(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid phone number (e.g., +1234567890)';
            }
            // Number validation
            else if (field.type === 'number' && value) {
                const numValue = parseFloat(value);
                const min = field.getAttribute('min');
                const max = field.getAttribute('max');

                if (isNaN(numValue)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid number';
                } else if (min && numValue < parseFloat(min)) {
                    isValid = false;
                    errorMessage = `Value must be at least ${min}`;
                } else if (max && numValue > parseFloat(max)) {
                    isValid = false;
                    errorMessage = `Value cannot exceed ${max}`;
                } else if (numValue <= 0 && (fieldName === 'capacity' || fieldName === 'requiredLiters')) {
                    isValid = false;
                    errorMessage = 'Value must be greater than 0';
                }
            }
            // Password validation
            else if (field.type === 'password' && value) {
                if (value.length < 6) {
                    isValid = false;
                    errorMessage = 'Password must be at least 6 characters long';
                } else if (!/(?=.*[a-zA-Z])/.test(value)) {
                    isValid = false;
                    errorMessage = 'Password must contain at least one letter';
                }
            }
            // Text field validation (name, registration number)
            else if (field.type === 'text' && value) {
                if (fieldName === 'name' && value.length < 2) {
                    isValid = false;
                    errorMessage = 'Name must be at least 2 characters long';
                } else if (fieldName === 'registrationNumber') {
                    if (value.length < 3) {
                        isValid = false;
                        errorMessage = 'Registration number must be at least 3 characters long';
                    } else if (!/^[A-Za-z0-9\-]+$/.test(value)) {
                        isValid = false;
                        errorMessage = 'Registration number can only contain letters, numbers, and hyphens';
                    }
                }
            }

            // Display error if validation failed
            if (!isValid) {
                this.displayFieldError(fieldName, errorMessage);
            }

            // Update field styling
            field.classList.toggle('invalid', !isValid);

            return isValid;
        }


    /**
     * Clear field error
     */
    clearFieldError(fieldName) {
        const errorElement = document.getElementById(`${fieldName}Error`);
        if (errorElement) {
            errorElement.classList.remove('show');
            errorElement.textContent = '';
        }
    }

    /**
     * Validate entire form
     */
    validateForm(form) {
        const inputs = form.querySelectorAll('input[required], input[type="email"], input[type="tel"], input[type="number"], input[type="password"]');
        let isFormValid = true;

        inputs.forEach(input => {
            const isFieldValid = this.validateField(input);
            if (!isFieldValid) {
                isFormValid = false;
            }
        });

        return isFormValid;
    }
    /**
     * Enhanced form validation with comprehensive error handling
     */
    validateFormWithEnhancedRules(form) {
        const inputs = form.querySelectorAll('input[required], input[type="email"], input[type="tel"], input[type="number"], input[type="password"], input[type="text"]');
        let isFormValid = true;
        const errors = [];

        inputs.forEach(input => {
            const isFieldValid = this.validateFieldEnhanced(input);
            if (!isFieldValid) {
                isFormValid = false;
                errors.push(`${input.name}: ${this.getFieldErrorMessage(input)}`);
            }
        });

        return { isValid: isFormValid, errors };
    }

    /**
     * Enhanced field validation with comprehensive rules
     */
    validateFieldEnhanced(field) {
        const fieldName = field.name;
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        // Clear previous error
        this.clearFieldError(fieldName);

        // Required field validation
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = 'This field is required';
        }
        // Email validation
        else if (field.type === 'email' && value && !this.isValidEmail(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid email address (e.g., user@example.com)';
        }
        // Phone validation
        else if (field.type === 'tel' && value && !this.isValidPhone(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid phone number (e.g., +1234567890)';
        }
        // Number validation
        else if (field.type === 'number' && value) {
            const numValue = parseFloat(value);
            const min = field.getAttribute('min');
            const max = field.getAttribute('max');

            if (isNaN(numValue)) {
                isValid = false;
                errorMessage = 'Please enter a valid number';
            } else if (min && numValue < parseFloat(min)) {
                isValid = false;
                errorMessage = `Value must be at least ${min}`;
            } else if (max && numValue > parseFloat(max)) {
                isValid = false;
                errorMessage = `Value cannot exceed ${max}`;
            } else if (numValue <= 0 && (fieldName === 'capacity' || fieldName === 'requiredLiters')) {
                isValid = false;
                errorMessage = 'Value must be greater than 0';
            }
        }
        // Password validation
        else if (field.type === 'password' && value) {
            if (value.length < 6) {
                isValid = false;
                errorMessage = 'Password must be at least 6 characters long';
            } else if (!/(?=.*[a-zA-Z])/.test(value)) {
                isValid = false;
                errorMessage = 'Password must contain at least one letter';
            }
        }
        // Text field validation (name, registration number)
        else if (field.type === 'text' && value) {
            if (fieldName === 'name' && value.length < 2) {
                isValid = false;
                errorMessage = 'Name must be at least 2 characters long';
            } else if (fieldName === 'registrationNumber') {
                if (value.length < 3) {
                    isValid = false;
                    errorMessage = 'Registration number must be at least 3 characters long';
                } else if (!/^[A-Za-z0-9\-]+$/.test(value)) {
                    isValid = false;
                    errorMessage = 'Registration number can only contain letters, numbers, and hyphens';
                }
            }
        }

        // Store error message for later retrieval
        field.dataset.errorMessage = errorMessage;

        // Display error if validation failed
        if (!isValid) {
            this.displayFieldError(fieldName, errorMessage);
        }

        // Update field styling
        field.classList.toggle('invalid', !isValid);

        return isValid;
    }

    /**
     * Get field error message
     */
    getFieldErrorMessage(field) {
        return field.dataset.errorMessage || 'Invalid input';
    }

    /**
     * Display API error with enhanced formatting
     */
    displayAPIError(error, context = '') {
        let errorMessage = '';

        if (typeof error === 'string') {
            errorMessage = error;
        } else if (error && error.message) {
            errorMessage = error.message;
        } else if (error && error.error) {
            errorMessage = error.error;
        } else {
            errorMessage = 'An unexpected error occurred';
        }

        // Add context if provided
        if (context) {
            errorMessage = `${context}: ${errorMessage}`;
        }

        // Display with enhanced styling
        this.displayError(errorMessage);

        // Log for debugging
        console.error('API Error:', { error, context, message: errorMessage });
    }

    /**
     * Display validation errors in a prominent format
     */
    displayValidationErrors(errors) {
        if (errors.length === 0) return;

        const errorMessage = errors.length === 1
            ? errors[0]
            : `Please fix the following errors:\n• ${errors.join('\n• ')}`;

        this.displayError(errorMessage);
    }

    /**
     * Enhanced error display with better formatting
     */
    displayErrorEnhanced(message, type = 'error') {
        this.clearMessages();

        if (this.errorMessage) {
            // Format message for better readability
            const formattedMessage = message.replace(/\n/g, '<br>');
            this.errorMessage.innerHTML = formattedMessage;
            this.errorMessage.classList.add('show');
            this.errorMessage.classList.add(type);

            // Auto-scroll to error message
            this.errorMessage.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    }
    /**
     * Enhanced form validation with comprehensive error handling
     */
    validateFormWithEnhancedRules(form) {
        const inputs = form.querySelectorAll('input[required], input[type="email"], input[type="tel"], input[type="number"], input[type="password"], input[type="text"]');
        let isFormValid = true;
        const errors = [];

        inputs.forEach(input => {
            const isFieldValid = this.validateFieldEnhanced(input);
            if (!isFieldValid) {
                isFormValid = false;
                errors.push(`${input.name}: ${this.getFieldErrorMessage(input)}`);
            }
        });

        return { isValid: isFormValid, errors };
    }

    /**
     * Enhanced field validation with comprehensive rules
     */
    validateFieldEnhanced(field) {
        const fieldName = field.name;
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        // Clear previous error
        this.clearFieldError(fieldName);

        // Required field validation
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = 'This field is required';
        }
        // Email validation
        else if (field.type === 'email' && value && !this.isValidEmail(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid email address (e.g., user@example.com)';
        }
        // Phone validation
        else if (field.type === 'tel' && value && !this.isValidPhone(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid phone number (e.g., +1234567890)';
        }
        // Number validation
        else if (field.type === 'number' && value) {
            const numValue = parseFloat(value);
            const min = field.getAttribute('min');
            const max = field.getAttribute('max');

            if (isNaN(numValue)) {
                isValid = false;
                errorMessage = 'Please enter a valid number';
            } else if (min && numValue < parseFloat(min)) {
                isValid = false;
                errorMessage = `Value must be at least ${min}`;
            } else if (max && numValue > parseFloat(max)) {
                isValid = false;
                errorMessage = `Value cannot exceed ${max}`;
            } else if (numValue <= 0 && (fieldName === 'capacity' || fieldName === 'requiredLiters')) {
                isValid = false;
                errorMessage = 'Value must be greater than 0';
            }
        }
        // Password validation
        else if (field.type === 'password' && value) {
            if (value.length < 6) {
                isValid = false;
                errorMessage = 'Password must be at least 6 characters long';
            } else if (!/(?=.*[a-zA-Z])/.test(value)) {
                isValid = false;
                errorMessage = 'Password must contain at least one letter';
            }
        }
        // Text field validation (name, registration number)
        else if (field.type === 'text' && value) {
            if (fieldName === 'name' && value.length < 2) {
                isValid = false;
                errorMessage = 'Name must be at least 2 characters long';
            } else if (fieldName === 'registrationNumber') {
                if (value.length < 3) {
                    isValid = false;
                    errorMessage = 'Registration number must be at least 3 characters long';
                } else if (!/^[A-Za-z0-9\-]+$/.test(value)) {
                    isValid = false;
                    errorMessage = 'Registration number can only contain letters, numbers, and hyphens';
                }
            }
        }

        // Store error message for later retrieval
        field.dataset.errorMessage = errorMessage;

        // Display error if validation failed
        if (!isValid) {
            this.displayFieldError(fieldName, errorMessage);
        }

        // Update field styling
        field.classList.toggle('invalid', !isValid);

        return isValid;
    }

    /**
     * Get field error message
     */
    getFieldErrorMessage(field) {
        return field.dataset.errorMessage || 'Invalid input';
    }

    /**
     * Display API error with enhanced formatting
     */
    displayAPIError(error, context = '') {
        let errorMessage = '';

        if (typeof error === 'string') {
            errorMessage = error;
        } else if (error && error.message) {
            errorMessage = error.message;
        } else if (error && error.error) {
            errorMessage = error.error;
        } else {
            errorMessage = 'An unexpected error occurred';
        }

        // Add context if provided
        if (context) {
            errorMessage = `${context}: ${errorMessage}`;
        }

        // Display with enhanced styling
        this.displayError(errorMessage);

        // Log for debugging
        console.error('API Error:', { error, context, message: errorMessage });
    }

    /**
     * Display validation errors in a prominent format
     */
    displayValidationErrors(errors) {
        if (errors.length === 0) return;

        const errorMessage = errors.length === 1
            ? errors[0]
            : `Please fix the following errors:\n• ${errors.join('\n• ')}`;

        this.displayError(errorMessage);
    }

    /**
     * Enhanced error display with better formatting
     */
    displayErrorEnhanced(message, type = 'error') {
        this.clearMessages();

        if (this.errorMessage) {
            // Format message for better readability
            const formattedMessage = message.replace(/\n/g, '<br>');
            this.errorMessage.innerHTML = formattedMessage;
            this.errorMessage.classList.add('show');
            this.errorMessage.classList.add(type);

            // Auto-scroll to error message
            this.errorMessage.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    }


    /**
     * Setup form switching (login/register)
     */
    setupFormSwitching() {
        const showRegisterBtn = document.getElementById('showRegisterBtn');
        const showLoginBtn = document.getElementById('showLoginBtn');

        if (showRegisterBtn) {
            showRegisterBtn.addEventListener('click', () => this.showRegisterForm());
        }

        if (showLoginBtn) {
            showLoginBtn.addEventListener('click', () => this.showLoginForm());
        }
    }

    /**
     * Show register form
     */
    showRegisterForm() {
        const loginContainer = document.getElementById('loginContainer');
        const registerContainer = document.getElementById('registerContainer');

        if (loginContainer && registerContainer) {
            loginContainer.classList.add('hidden');
            registerContainer.classList.remove('hidden');
            this.clearMessages();
            
            // Focus first input in register form
            setTimeout(() => {
                const firstInput = registerContainer.querySelector('input');
                if (firstInput) firstInput.focus();
            }, 100);
        }
    }

    /**
     * Show login form
     */
    showLoginForm() {
        const loginContainer = document.getElementById('loginContainer');
        const registerContainer = document.getElementById('registerContainer');

        if (loginContainer && registerContainer) {
            registerContainer.classList.add('hidden');
            loginContainer.classList.remove('hidden');
            this.clearMessages();
            
            // Focus first input in login form
            setTimeout(() => {
                const firstInput = loginContainer.querySelector('input');
                if (firstInput) firstInput.focus();
            }, 100);
        }
    }

    /**
     * Email validation
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Phone validation
     */
    isValidPhone(phone) {
        const cleanPhone = phone.replace(/[\s\-\(\)\.]/g, '');
        const phoneRegex = /^[\+]?[1-9][\d]{7,14}$/;
        return phoneRegex.test(cleanPhone);
    }

    /**
     * Enhanced progress indicator with better visual feedback
     */
    updateProgressIndicator(currentStep, completedSteps = []) {
        const stepMapping = {
            'authentication': 1,
            'truckRegistration': 2,
            'orderCreation': 3,
            'paymentProcessing': 4,
            'completion': 4
        };
        
        const currentStepNumber = stepMapping[currentStep] || 1;
        
        // Update each step indicator
        for (let i = 1; i <= 4; i++) {
            const stepElement = document.querySelector(`[data-step="${i}"]`);
            if (stepElement) {
                const circle = stepElement.querySelector('div');
                const label = stepElement.querySelector('span');
                
                if (!circle || !label) continue;

                const stepName = Object.keys(stepMapping).find(key => stepMapping[key] === i);
                const isCompleted = i < currentStepNumber || (stepName && completedSteps.includes(stepName));

                if (i === currentStepNumber) {
                    // Active state
                    circle.className = 'w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-lg ring-4 ring-white/50 transition-all duration-300 transform group-hover:scale-110';
                    label.className = 'absolute -bottom-7 text-xs sm:text-sm font-semibold text-indigo-900 whitespace-nowrap opacity-100 transition-opacity';
                    circle.textContent = i;
                } else if (isCompleted) {
                    // Completed state
                    circle.className = 'w-12 h-12 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-xl shadow-lg transition-all duration-300 transform group-hover:scale-110';
                    label.className = 'absolute -bottom-7 text-xs sm:text-sm font-semibold text-green-700 whitespace-nowrap opacity-100 transition-opacity';
                    circle.innerHTML = '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>';
                } else {
                    // Inactive state
                    circle.className = 'w-12 h-12 rounded-full bg-white/70 backdrop-blur-md text-gray-500 flex items-center justify-center font-bold text-xl shadow-md border-2 border-gray-200 transition-all duration-300 transform group-hover:scale-110';
                    label.className = 'absolute -bottom-7 text-xs sm:text-sm font-semibold text-gray-500 whitespace-nowrap opacity-70 transition-opacity';
                    circle.textContent = i;
                }
            }
        }
        
        // Update progress bar fill
        this.updateProgressBarFill(currentStepNumber);
    }

    /**
     * Update progress bar fill animation
     */
    updateProgressBarFill(currentStepNumber) {
        const progressFill = document.getElementById('progressFill');
        if (!progressFill) return;

        const percentages = {
            1: '15%',
            2: '41%',
            3: '68%',
            4: '100%'
        };
        
        progressFill.style.width = percentages[currentStepNumber] || '15%';
    }

    /**
     * Enhanced navigation button management
     */
    updateNavigationButtons() {
        const backBtn = document.getElementById('backBtn');
        const logoutBtn = document.getElementById('logoutBtn');

        if (backBtn) {
            const canGoBack = this.canNavigateToPreviousStep();
            backBtn.disabled = !canGoBack;
            backBtn.style.opacity = canGoBack ? '1' : '0.5';
        }

        if (logoutBtn) {
            // Show logout button on all steps except completion
            const showLogout = this.currentStep !== 'completion';
            logoutBtn.style.display = showLogout ? 'inline-flex' : 'none';
        }
    }

    /**
     * Reset form with enhanced clearing
     */
    resetForm(formId) {
        const form = document.getElementById(formId);
        if (form) {
            form.reset();
            this.clearFieldErrors();
            
            // Remove validation classes
            const inputs = form.querySelectorAll('input');
            inputs.forEach(input => {
                input.classList.remove('invalid');
            });
        }
    }

    /**
     * Disable/enable form with visual feedback
     */
    setFormEnabled(formId, enabled) {
        const form = document.getElementById(formId);
        if (form) {
            const inputs = form.querySelectorAll('input, button');
            inputs.forEach(element => {
                element.disabled = !enabled;
            });
            
            // Add visual feedback
            form.style.opacity = enabled ? '1' : '0.7';
        }
    }

    /**
     * Smooth scroll to top of page
     */
    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    /**
     * Focus on first input of current step with better targeting
     */
    focusFirstInput() {
        const currentStepElement = document.querySelector('.workflow-step.active');
        if (currentStepElement) {
            // Look for visible form containers first
            const visibleContainer = currentStepElement.querySelector('.form-container:not(.hidden)');
            const targetContainer = visibleContainer || currentStepElement;
            
            const firstInput = targetContainer.querySelector('input:not([readonly]):not([disabled]):not([type="hidden"])');
            if (firstInput) {
                firstInput.focus();
            }
        }
    }

    /**
     * Get current step name
     */
    getCurrentStep() {
        return this.currentStep;
    }

    /**
     * Get completed steps
     */
    getCompletedSteps() {
        return [...this.completedSteps];
    }

    /**
     * Check if UI is in loading state
     */
    isLoading() {
        return this.loadingOverlay && this.loadingOverlay.classList.contains('show');
    }

    /**
     * Get workflow progress percentage
     */
    getProgressPercentage() {
        const totalSteps = this.stepOrder.length - 1; // Exclude completion step
        const completedCount = this.completedSteps.filter(step => step !== 'completion').length;
        return Math.round((completedCount / totalSteps) * 100);
    }

    /**
     * Check if workflow is complete
     */
    isWorkflowComplete() {
        return this.currentStep === 'completion';
    }

    /**
     * Enhanced form validation with comprehensive error handling
     */
    validateFormWithEnhancedRules(form) {
        const inputs = form.querySelectorAll('input[required], input[type="email"], input[type="tel"], input[type="number"], input[type="password"], input[type="text"]');
        let isFormValid = true;
        const errors = [];

        inputs.forEach(input => {
            const isFieldValid = this.validateFieldEnhanced(input);
            if (!isFieldValid) {
                isFormValid = false;
                errors.push(`${input.name}: ${this.getFieldErrorMessage(input)}`);
            }
        });

        return { isValid: isFormValid, errors };
    }

    /**
     * Enhanced field validation with comprehensive rules
     */
    validateFieldEnhanced(field) {
        const fieldName = field.name;
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        // Clear previous error
        this.clearFieldError(fieldName);

        // Required field validation
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = 'This field is required';
        }
        // Email validation
        else if (field.type === 'email' && value && !this.isValidEmail(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid email address (e.g., user@example.com)';
        }
        // Phone validation
        else if (field.type === 'tel' && value && !this.isValidPhone(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid phone number (e.g., +1234567890)';
        }
        // Number validation
        else if (field.type === 'number' && value) {
            const numValue = parseFloat(value);
            const min = field.getAttribute('min');
            const max = field.getAttribute('max');

            if (isNaN(numValue)) {
                isValid = false;
                errorMessage = 'Please enter a valid number';
            } else if (min && numValue < parseFloat(min)) {
                isValid = false;
                errorMessage = `Value must be at least ${min}`;
            } else if (max && numValue > parseFloat(max)) {
                isValid = false;
                errorMessage = `Value cannot exceed ${max}`;
            } else if (numValue <= 0 && (fieldName === 'capacity' || fieldName === 'requiredLiters')) {
                isValid = false;
                errorMessage = 'Value must be greater than 0';
            }
        }
        // Password validation
        else if (field.type === 'password' && value) {
            if (value.length < 6) {
                isValid = false;
                errorMessage = 'Password must be at least 6 characters long';
            } else if (!/(?=.*[a-zA-Z])/.test(value)) {
                isValid = false;
                errorMessage = 'Password must contain at least one letter';
            }
        }
        // Text field validation (name, registration number)
        else if (field.type === 'text' && value) {
            if (fieldName === 'name' && value.length < 2) {
                isValid = false;
                errorMessage = 'Name must be at least 2 characters long';
            } else if (fieldName === 'registrationNumber') {
                if (value.length < 3) {
                    isValid = false;
                    errorMessage = 'Registration number must be at least 3 characters long';
                } else if (!/^[A-Za-z0-9\-]+$/.test(value)) {
                    isValid = false;
                    errorMessage = 'Registration number can only contain letters, numbers, and hyphens';
                }
            }
        }

        // Store error message for later retrieval
        field.dataset.errorMessage = errorMessage;

        // Display error if validation failed
        if (!isValid) {
            this.displayFieldError(fieldName, errorMessage);
        }

        // Update field styling
        field.classList.toggle('invalid', !isValid);

        return isValid;
    }

    /**
     * Get field error message
     */
    getFieldErrorMessage(field) {
        return field.dataset.errorMessage || 'Invalid input';
    }

    /**
     * Display API error with enhanced formatting
     */
    displayAPIError(error, context = '') {
        let errorMessage = '';

        if (typeof error === 'string') {
            errorMessage = error;
        } else if (error && error.message) {
            errorMessage = error.message;
        } else if (error && error.error) {
            errorMessage = error.error;
        } else {
            errorMessage = 'An unexpected error occurred';
        }

        // Add context if provided
        if (context) {
            errorMessage = `${context}: ${errorMessage}`;
        }

        // Display with enhanced styling
        this.displayError(errorMessage);

        // Log for debugging
        console.error('API Error:', { error, context, message: errorMessage });
    }

    /**
     * Display validation errors in a prominent format
     */
    displayValidationErrors(errors) {
        if (errors.length === 0) return;

        const errorMessage = errors.length === 1
            ? errors[0]
            : `Please fix the following errors:\n• ${errors.join('\n• ')}`;

        this.displayError(errorMessage);
    }

    /**
     * Enhanced error display with better formatting
     */
    displayErrorEnhanced(message, type = 'error') {
        this.clearMessages();

        if (this.errorMessage) {
            // Format message for better readability
            const formattedMessage = message.replace(/\n/g, '<br>');
            this.errorMessage.innerHTML = formattedMessage;
            this.errorMessage.classList.add('show');
            this.errorMessage.classList.add(type);

            // Auto-scroll to error message
            this.errorMessage.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    }
}

export { UIManager };
// Enhanced validation methods for comprehensive form validation and error display

/**
 * Enhanced form validation with comprehensive error handling
 */
UIManager.prototype.validateFormWithEnhancedRules = function(form) {
    const inputs = form.querySelectorAll('input[required], input[type="email"], input[type="tel"], input[type="number"], input[type="password"], input[type="text"]');
    let isFormValid = true;
    const errors = [];

    inputs.forEach(input => {
        const isFieldValid = this.validateFieldEnhanced(input);
        if (!isFieldValid) {
            isFormValid = false;
            errors.push(`${input.name}: ${this.getFieldErrorMessage(input)}`);
        }
    });

    return { isValid: isFormValid, errors };
};

/**
 * Validate phone number format
 */
UIManager.prototype.isValidPhone = function(phone) {
    const cleanPhone = phone.replace(/[\s\-\(\)\.]/g, '');
    const phoneRegex = /^[\+]?[1-9][\d]{7,14}$/;
    return phoneRegex.test(cleanPhone);
};

/**
 * Validate email format
 */
UIManager.prototype.isValidEmail = function(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
};

/**
 * Enhanced field validation with comprehensive rules
 */
UIManager.prototype.validateFieldEnhanced = function(field) {
    const fieldName = field.name;
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';

    // Clear previous error
    this.clearFieldError(fieldName);

    // Required field validation
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = 'This field is required';
    }
    // Email validation
    else if (field.type === 'email' && value && !this.isValidEmail(value)) {
        isValid = false;
        errorMessage = 'Please enter a valid email address (e.g., user@example.com)';
    }
    // Phone validation
    else if (field.type === 'tel' && value && !this.isValidPhone(value)) {
        isValid = false;
        errorMessage = 'Please enter a valid phone number (e.g., +1234567890)';
    }
    // Number validation
    else if (field.type === 'number' && value) {
        const numValue = parseFloat(value);
        const min = field.getAttribute('min');
        const max = field.getAttribute('max');
        
        if (isNaN(numValue)) {
            isValid = false;
            errorMessage = 'Please enter a valid number';
        } else if (min && numValue < parseFloat(min)) {
            isValid = false;
            errorMessage = `Value must be at least ${min}`;
        } else if (max && numValue > parseFloat(max)) {
            isValid = false;
            errorMessage = `Value cannot exceed ${max}`;
        } else if (numValue <= 0 && (fieldName === 'capacity' || fieldName === 'requiredLiters')) {
            isValid = false;
            errorMessage = 'Value must be greater than 0';
        }
    }
    // Password validation
    else if (field.type === 'password' && value) {
        if (value.length < 6) {
            isValid = false;
            errorMessage = 'Password must be at least 6 characters long';
        } else if (!/(?=.*[a-zA-Z])/.test(value)) {
            isValid = false;
            errorMessage = 'Password must contain at least one letter';
        }
    }
    // Text field validation (name, registration number)
    else if (field.type === 'text' && value) {
        if (fieldName === 'name' && value.length < 2) {
            isValid = false;
            errorMessage = 'Name must be at least 2 characters long';
        } else if (fieldName === 'registrationNumber') {
            if (value.length < 3) {
                isValid = false;
                errorMessage = 'Registration number must be at least 3 characters long';
            } else if (!/^[A-Za-z0-9\-]+$/.test(value)) {
                isValid = false;
                errorMessage = 'Registration number can only contain letters, numbers, and hyphens';
            }
        }
    }

    // Store error message for later retrieval
    field.dataset.errorMessage = errorMessage;

    // Display error if validation failed
    if (!isValid) {
        this.displayFieldError(fieldName, errorMessage);
    }

    // Update field styling
    field.classList.toggle('invalid', !isValid);

    return isValid;
};

/**
 * Get field error message
 */
UIManager.prototype.getFieldErrorMessage = function(field) {
    return field.dataset.errorMessage || 'Invalid input';
};

/**
 * Display API error with enhanced formatting
 */
UIManager.prototype.displayAPIError = function(error, context = '') {
    let errorMessage = '';
    
    if (typeof error === 'string') {
        errorMessage = error;
    } else if (error && error.message) {
        errorMessage = error.message;
    } else if (error && error.error) {
        errorMessage = error.error;
    } else {
        errorMessage = 'An unexpected error occurred';
    }

    // Add context if provided
    if (context) {
        errorMessage = `${context}: ${errorMessage}`;
    }

    // Display with enhanced styling
    this.displayError(errorMessage);
    
    // Log for debugging
    console.error('API Error:', { error, context, message: errorMessage });
};

/**
 * Display validation errors in a prominent format
 */
UIManager.prototype.displayValidationErrors = function(errors) {
    if (errors.length === 0) return;

    const errorMessage = errors.length === 1 
        ? errors[0] 
        : `Please fix the following errors:\n• ${errors.join('\n• ')}`;
    
    this.displayError(errorMessage);
};

/**
 * Enhanced error display with better formatting
 */
UIManager.prototype.displayErrorEnhanced = function(message, type = 'error') {
    this.clearMessages();
    
    if (this.errorMessage) {
        // Format message for better readability
        const formattedMessage = message.replace(/\n/g, '<br>');
        this.errorMessage.innerHTML = formattedMessage;
        this.errorMessage.classList.add('show');
        this.errorMessage.classList.add(type);
        
        // Auto-scroll to error message
        this.errorMessage.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
        });
    }
};