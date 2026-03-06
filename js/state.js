/**
 * Application State Management
 * Handles workflow state, data persistence, and state transitions
 */

import { Contractor, Truck, Order, Payment } from './models.js';

class ApplicationState {
    constructor() {
        this.workflow = {
            currentStep: 'authentication',
            completedSteps: [],
            canNavigateBack: true
        };
        
        this.authentication = {
            isAuthenticated: false,
            token: null,
            contractor: null
        };
        
        this.registration = {
            truck: null,
            isRegistered: false
        };
        
        this.ordering = {
            order: null,
            isCreated: false
        };
        
        this.payment = {
            payment: null,
            isProcessed: false
        };
        
        // Load state from sessionStorage on initialization
        this.loadState();
    }

    /**
     * Set authentication state
     */
    setAuthenticated(contractorData, token) {
        this.authentication.isAuthenticated = true;
        this.authentication.token = token;
        this.authentication.contractor = new Contractor(contractorData);
        
        this.addCompletedStep('authentication');
        this.saveState();
        
        // Automatically proceed to next step
        return this.proceedToNextStep();
    }

    /**
     * Set truck registration state
     */
    setTruckRegistered(truckData) {
        this.registration.truck = new Truck(truckData);
        this.registration.isRegistered = true;
        
        this.addCompletedStep('truckRegistration');
        this.saveState();
        
        // Automatically proceed to next step
        return this.proceedToNextStep();
    }

    /**
     * Set order creation state
     */
    setOrderCreated(orderData) {
        this.ordering.order = new Order(orderData);
        this.ordering.isCreated = true;
        
        this.addCompletedStep('orderCreation');
        this.saveState();
        
        // Automatically proceed to next step
        return this.proceedToNextStep();
    }

    /**
     * Set payment processing state
     */
    setPaymentProcessed(paymentData) {
        this.payment.payment = new Payment(paymentData);
        this.payment.isProcessed = true;
        
        this.addCompletedStep('paymentProcessing');
        this.saveState();
        
        // Automatically proceed to completion
        return this.proceedToNextStep();
    }

    /**
     * Set current workflow step
     */
    setCurrentStep(stepName) {
        this.workflow.currentStep = stepName;
        this.saveState();
    }

    /**
     * Add a step to completed steps
     */
    addCompletedStep(stepName) {
        if (!this.workflow.completedSteps.includes(stepName)) {
            this.workflow.completedSteps.push(stepName);
        }
    }

    /**
     * Check if a step has been completed
     */
    isStepCompleted(stepName) {
        return this.workflow.completedSteps.includes(stepName);
    }

    /**
     * Get authentication token
     */
    getAuthToken() {
        return this.authentication.token;
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return this.authentication.isAuthenticated && this.authentication.token;
    }

    /**
     * Get contractor data
     */
    getContractor() {
        return this.authentication.contractor;
    }

    /**
     * Get truck data
     */
    getTruck() {
        return this.registration.truck;
    }

    /**
     * Get order data
     */
    getOrder() {
        return this.ordering.order;
    }

    /**
     * Get payment data
     */
    getPayment() {
        return this.payment.payment;
    }

    /**
     * Reset entire application state
     */
    resetState() {
        this.workflow = {
            currentStep: 'authentication',
            completedSteps: [],
            canNavigateBack: true
        };
        
        this.authentication = {
            isAuthenticated: false,
            token: null,
            contractor: null
        };
        
        this.registration = {
            truck: null,
            isRegistered: false
        };
        
        this.ordering = {
            order: null,
            isCreated: false
        };
        
        this.payment = {
            payment: null,
            isProcessed: false
        };
        
        this.saveState();
    }

    /**
     * Reset workflow while keeping authentication
     */
    resetWorkflow() {
        this.workflow.currentStep = 'truckRegistration';
        this.workflow.completedSteps = this.workflow.completedSteps.filter(step => step === 'authentication');
        
        this.registration = {
            truck: null,
            isRegistered: false
        };
        
        this.ordering = {
            order: null,
            isCreated: false
        };
        
        this.payment = {
            payment: null,
            isProcessed: false
        };
        
        this.saveState();
    }

    /**
     * Save state to sessionStorage
     */
    saveState() {
        try {
            const stateData = {
                workflow: this.workflow,
                authentication: {
                    isAuthenticated: this.authentication.isAuthenticated,
                    token: this.authentication.token,
                    contractor: this.authentication.contractor ? this.authentication.contractor.toJSON() : null
                },
                registration: {
                    truck: this.registration.truck ? this.registration.truck.toJSON() : null,
                    isRegistered: this.registration.isRegistered
                },
                ordering: {
                    order: this.ordering.order ? this.ordering.order.toJSON() : null,
                    isCreated: this.ordering.isCreated
                },
                payment: {
                    payment: this.payment.payment ? this.payment.payment.toJSON() : null,
                    isProcessed: this.payment.isProcessed
                },
                timestamp: Date.now()
            };
            
            sessionStorage.setItem('waterAutomationState', JSON.stringify(stateData));
        } catch (error) {
            console.error('Failed to save state:', error);
        }
    }

    /**
     * Load state from sessionStorage
     */
    loadState() {
        try {
            const savedState = sessionStorage.getItem('waterAutomationState');
            
            if (!savedState) {
                return;
            }
            
            const stateData = JSON.parse(savedState);
            
            // Check if state is not too old (24 hours)
            const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
            if (stateData.timestamp && (Date.now() - stateData.timestamp) > maxAge) {
                console.log('Saved state is too old, starting fresh');
                this.clearSavedState();
                return;
            }
            
            // Restore workflow state
            if (stateData.workflow) {
                this.workflow = { ...this.workflow, ...stateData.workflow };
            }
            
            // Restore authentication state
            if (stateData.authentication) {
                this.authentication.isAuthenticated = stateData.authentication.isAuthenticated;
                this.authentication.token = stateData.authentication.token;
                
                if (stateData.authentication.contractor) {
                    this.authentication.contractor = new Contractor(stateData.authentication.contractor);
                }
            }
            
            // Restore registration state
            if (stateData.registration) {
                this.registration.isRegistered = stateData.registration.isRegistered;
                
                if (stateData.registration.truck) {
                    this.registration.truck = new Truck(stateData.registration.truck);
                }
            }
            
            // Restore ordering state
            if (stateData.ordering) {
                this.ordering.isCreated = stateData.ordering.isCreated;
                
                if (stateData.ordering.order) {
                    this.ordering.order = new Order(stateData.ordering.order);
                }
            }
            
            // Restore payment state
            if (stateData.payment) {
                this.payment.isProcessed = stateData.payment.isProcessed;
                
                if (stateData.payment.payment) {
                    this.payment.payment = new Payment(stateData.payment.payment);
                }
            }
            
            console.log('State loaded successfully from sessionStorage');
        } catch (error) {
            console.error('Failed to load state:', error);
            this.clearSavedState();
        }
    }

    /**
     * Clear saved state from sessionStorage
     */
    clearSavedState() {
        try {
            sessionStorage.removeItem('waterAutomationState');
        } catch (error) {
            console.error('Failed to clear saved state:', error);
        }
    }

    /**
     * Get current state summary for debugging
     */
    getStateSummary() {
        return {
            currentStep: this.workflow.currentStep,
            completedSteps: this.workflow.completedSteps,
            isAuthenticated: this.authentication.isAuthenticated,
            hasContractor: !!this.authentication.contractor,
            hasTruck: !!this.registration.truck,
            hasOrder: !!this.ordering.order,
            hasPayment: !!this.payment.payment
        };
    }

    /**
     * Get the next step in the workflow
     */
    getNextStep() {
        const stepOrder = ['authentication', 'truckRegistration', 'orderCreation', 'paymentProcessing', 'completion'];
        const currentIndex = stepOrder.indexOf(this.workflow.currentStep);
        
        if (currentIndex === -1 || currentIndex >= stepOrder.length - 1) {
            return null;
        }
        
        return stepOrder[currentIndex + 1];
    }

    /**
     * Get the previous step in the workflow
     */
    getPreviousStep() {
        const stepOrder = ['authentication', 'truckRegistration', 'orderCreation', 'paymentProcessing', 'completion'];
        const currentIndex = stepOrder.indexOf(this.workflow.currentStep);
        
        if (currentIndex <= 0) {
            return null;
        }
        
        return stepOrder[currentIndex - 1];
    }

    /**
     * Check if navigation to a specific step is allowed
     */
    canNavigateToStep(stepName) {
        const stepOrder = ['authentication', 'truckRegistration', 'orderCreation', 'paymentProcessing', 'completion'];
        const targetIndex = stepOrder.indexOf(stepName);
        const currentIndex = stepOrder.indexOf(this.workflow.currentStep);
        
        if (targetIndex === -1) {
            return false;
        }
        
        // Can always navigate to current step
        if (targetIndex === currentIndex) {
            return true;
        }
        
        // Can navigate backward if canNavigateBack is true and step is completed
        if (targetIndex < currentIndex && this.workflow.canNavigateBack) {
            return this.isStepCompleted(stepName);
        }
        
        // Can navigate forward only to the next step if current step is completed
        if (targetIndex === currentIndex + 1) {
            const currentStepName = stepOrder[currentIndex];
            return this.isStepCompleted(currentStepName);
        }
        
        // Cannot skip steps forward
        return false;
    }

    /**
     * Navigate to the next step automatically after completing current step
     */
    proceedToNextStep() {
        const nextStep = this.getNextStep();
        if (nextStep && this.canNavigateToStep(nextStep)) {
            this.setCurrentStep(nextStep);
            return nextStep;
        }
        return null;
    }

    /**
     * Get workflow progress as percentage
     */
    getWorkflowProgress() {
        const totalSteps = 4; // authentication, truckRegistration, orderCreation, paymentProcessing
        const completedCount = this.workflow.completedSteps.length;
        return Math.min((completedCount / totalSteps) * 100, 100);
    }

    /**
     * Get workflow step display information
     */
    getStepInfo(stepName) {
        const stepInfo = {
            authentication: {
                title: 'Authentication',
                description: 'Login or register your contractor account',
                order: 1
            },
            truckRegistration: {
                title: 'Truck Registration',
                description: 'Register your water delivery truck',
                order: 2
            },
            orderCreation: {
                title: 'Create Order',
                description: 'Create a new water delivery order',
                order: 3
            },
            paymentProcessing: {
                title: 'Payment',
                description: 'Process payment for your order',
                order: 4
            },
            completion: {
                title: 'Complete',
                description: 'Workflow completed successfully',
                order: 5
            }
        };
        
        return stepInfo[stepName] || null;
    }

    /**
     * Get all workflow steps with their status
     */
    getWorkflowStatus() {
        const steps = ['authentication', 'truckRegistration', 'orderCreation', 'paymentProcessing'];
        
        return steps.map(stepName => {
            const info = this.getStepInfo(stepName);
            return {
                name: stepName,
                title: info.title,
                description: info.description,
                order: info.order,
                isCompleted: this.isStepCompleted(stepName),
                isCurrent: this.workflow.currentStep === stepName,
                canNavigate: this.canNavigateToStep(stepName)
            };
        });
    }

    /**
     * Validate state consistency
     */
    validateState() {
        const issues = [];
        
        // Check authentication consistency
        if (this.authentication.isAuthenticated && !this.authentication.token) {
            issues.push('Authenticated but no token');
        }
        
        if (this.authentication.isAuthenticated && !this.authentication.contractor) {
            issues.push('Authenticated but no contractor data');
        }
        
        // Check registration consistency
        if (this.registration.isRegistered && !this.registration.truck) {
            issues.push('Truck registered but no truck data');
        }
        
        // Check ordering consistency
        if (this.ordering.isCreated && !this.ordering.order) {
            issues.push('Order created but no order data');
        }
        
        // Check payment consistency
        if (this.payment.isProcessed && !this.payment.payment) {
            issues.push('Payment processed but no payment data');
        }
        
        // Check workflow step consistency
        const stepOrder = ['authentication', 'truckRegistration', 'orderCreation', 'paymentProcessing', 'completion'];
        const currentStepIndex = stepOrder.indexOf(this.workflow.currentStep);
        
        if (currentStepIndex === -1) {
            issues.push('Invalid current step');
        }
        
        return {
            isValid: issues.length === 0,
            issues: issues
        };
    }
    /**
     * Get the next step in the workflow
     */
    getNextStep() {
        const stepOrder = ['authentication', 'truckRegistration', 'orderCreation', 'paymentProcessing', 'completion'];
        const currentIndex = stepOrder.indexOf(this.workflow.currentStep);

        if (currentIndex === -1 || currentIndex >= stepOrder.length - 1) {
            return null;
        }

        return stepOrder[currentIndex + 1];
    }

    /**
     * Get the previous step in the workflow
     */
    getPreviousStep() {
        const stepOrder = ['authentication', 'truckRegistration', 'orderCreation', 'paymentProcessing', 'completion'];
        const currentIndex = stepOrder.indexOf(this.workflow.currentStep);

        if (currentIndex <= 0) {
            return null;
        }

        return stepOrder[currentIndex - 1];
    }

    /**
     * Check if navigation to a specific step is allowed
     */
    canNavigateToStep(stepName) {
        const stepOrder = ['authentication', 'truckRegistration', 'orderCreation', 'paymentProcessing', 'completion'];
        const targetIndex = stepOrder.indexOf(stepName);
        const currentIndex = stepOrder.indexOf(this.workflow.currentStep);

        if (targetIndex === -1) {
            return false;
        }

        // Can always navigate to current step
        if (targetIndex === currentIndex) {
            return true;
        }

        // Can navigate backward if canNavigateBack is true and step is completed
        if (targetIndex < currentIndex && this.workflow.canNavigateBack) {
            return this.isStepCompleted(stepName);
        }

        // Can navigate forward only to the next step if current step is completed
        if (targetIndex === currentIndex + 1) {
            const currentStepName = stepOrder[currentIndex];
            return this.isStepCompleted(currentStepName);
        }

        // Cannot skip steps forward
        return false;
    }

    /**
     * Navigate to the next step automatically after completing current step
     */
    proceedToNextStep() {
        const nextStep = this.getNextStep();
        if (nextStep && this.canNavigateToStep(nextStep)) {
            this.setCurrentStep(nextStep);
            return nextStep;
        }
        return null;
    }

    /**
     * Get workflow progress as percentage
     */
    getWorkflowProgress() {
        const totalSteps = 4; // authentication, truckRegistration, orderCreation, paymentProcessing
        const completedCount = this.workflow.completedSteps.length;
        return Math.min((completedCount / totalSteps) * 100, 100);
    }

    /**
     * Get workflow step display information
     */
    getStepInfo(stepName) {
        const stepInfo = {
            authentication: {
                title: 'Authentication',
                description: 'Login or register your contractor account',
                order: 1
            },
            truckRegistration: {
                title: 'Truck Registration',
                description: 'Register your water delivery truck',
                order: 2
            },
            orderCreation: {
                title: 'Create Order',
                description: 'Create a new water delivery order',
                order: 3
            },
            paymentProcessing: {
                title: 'Payment',
                description: 'Process payment for your order',
                order: 4
            },
            completion: {
                title: 'Complete',
                description: 'Workflow completed successfully',
                order: 5
            }
        };

        return stepInfo[stepName] || null;
    }

    /**
     * Get all workflow steps with their status
     */
    getWorkflowStatus() {
        const steps = ['authentication', 'truckRegistration', 'orderCreation', 'paymentProcessing'];

        return steps.map(stepName => {
            const info = this.getStepInfo(stepName);
            return {
                name: stepName,
                title: info.title,
                description: info.description,
                order: info.order,
                isCompleted: this.isStepCompleted(stepName),
                isCurrent: this.workflow.currentStep === stepName,
                canNavigate: this.canNavigateToStep(stepName)
            };
        });
    }
}

export { ApplicationState };