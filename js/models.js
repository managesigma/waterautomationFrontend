/**
 * Data Models
 * Defines the structure and validation for application data entities
 */

/**
 * Contractor Model
 */
class Contractor {
    constructor(data = {}) {
        this.id = data._id || data.userId || data.id || null;
        this.phone = data.phone || '';
        this.name = data.name || '';
        this.email = data.email || '';
        this.createdAt = data.createdAt || null;
    }

    /**
     * Validate contractor data
     */
    validate() {
        const errors = {};

        if (!this.phone || this.phone.trim().length === 0) {
            errors.phone = 'Phone number is required';
        } else if (!this.isValidPhone(this.phone)) {
            errors.phone = 'Please enter a valid phone number';
        }

        if (!this.name || this.name.trim().length === 0) {
            errors.name = 'Name is required';
        } else if (this.name.trim().length < 2) {
            errors.name = 'Name must be at least 2 characters long';
        }

        if (!this.email || this.email.trim().length === 0) {
            errors.email = 'Email is required';
        } else if (!this.isValidEmail(this.email)) {
            errors.email = 'Please enter a valid email address';
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors: errors
        };
    }

    /**
     * Validate phone number format
     */
    /**
     * Validate phone number format
     * Enhanced validation for international and local formats
     */
    isValidPhone(phone) {
        if (!phone) return false;
        
        // Remove all non-digit characters except +
        const cleanPhone = phone.replace(/[\s\-\(\)\.]/g, '');
        
        // Check for valid international format (+1234567890) or local format (1234567890)
        const internationalRegex = /^\+[1-9]\d{1,14}$/;
        const localRegex = /^[1-9]\d{9,14}$/;
        
        return internationalRegex.test(cleanPhone) || localRegex.test(cleanPhone);
    }

    /**
     * Validate email format
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Convert to JSON for storage
     */
    toJSON() {
        return {
            id: this.id,
            phone: this.phone,
            name: this.name,
            email: this.email,
            createdAt: this.createdAt
        };
    }

    /**
     * Get display name
     */
    getDisplayName() {
        return this.name || this.email || this.phone;
    }

    /**
     * Format phone number for display
     */
    getFormattedPhone() {
        if (!this.phone) return '';
        
        const cleanPhone = this.phone.replace(/[\s\-\(\)\.]/g, '');
        
        // Format as (XXX) XXX-XXXX for 10-digit numbers
        if (cleanPhone.length === 10) {
            return `(${cleanPhone.slice(0, 3)}) ${cleanPhone.slice(3, 6)}-${cleanPhone.slice(6)}`;
        }
        
        // Format international numbers with + prefix
        if (cleanPhone.startsWith('+')) {
            return cleanPhone;
        }
        
        return this.phone; // Return original if no formatting applies
    }

    /**
     * Get contractor data for API requests
     */
    getAPIData() {
        return {
            phone: this.phone,
            name: this.name,
            email: this.email
        };
    }

    /**
     * Create contractor from API response
     */
    static fromAPIResponse(data) {
        return new Contractor({
            id: data._id || data.userId || data.id,
            phone: data.phone,
            name: data.name,
            email: data.email,
            createdAt: data.createdAt || data.created_at
        });
    }

    /**
     * Sanitize phone number for storage
     */
    sanitizePhone() {
        if (!this.phone) return '';
        return this.phone.replace(/[\s\-\(\)\.]/g, '');
    }

    /**
     * Get contractor data for registration API request
     */
    getRegistrationData() {
        return {
            phone: this.sanitizePhone(),
            name: this.name.trim(),
            email: this.email.trim().toLowerCase(),
            password: this.password // Only included during registration
        };
    }

    /**
     * Get contractor data for login API request
     */
    getLoginData() {
        return {
            phone: this.sanitizePhone(),
            email: this.email.trim().toLowerCase(),
            password: this.password // Only included during login
        };
    }
}

/**
 * Truck Model
 */
class Truck {
    constructor(data = {}) {
        this.id = data._id || data.truckId || data.id || null;
        this.registrationNumber = data.registrationNumber || '';
        this.capacity = data.capacity || 0;
        this.contractorId = data.contractorId || data.userId || null;
        this.status = data.status || 'active';
        this.createdAt = data.createdAt || null;
    }

    /**
     * Validate truck data
     */
    validate() {
        const errors = {};

        if (!this.registrationNumber || this.registrationNumber.trim().length === 0) {
            errors.registrationNumber = 'Registration number is required';
        } else if (this.registrationNumber.trim().length < 3) {
            errors.registrationNumber = 'Registration number must be at least 3 characters long';
        } else if (!/^[A-Z0-9\-]+$/i.test(this.registrationNumber.trim())) {
            errors.registrationNumber = 'Registration number can only contain letters, numbers, and hyphens';
        }

        if (!this.capacity || this.capacity <= 0) {
            errors.capacity = 'Capacity must be greater than 0';
        } else if (this.capacity > 50000) {
            errors.capacity = 'Capacity cannot exceed 50,000 liters';
        } else if (!Number.isInteger(Number(this.capacity))) {
            errors.capacity = 'Capacity must be a whole number';
        }

        if (!this.contractorId) {
            errors.contractorId = 'Contractor ID is required';
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors: errors
        };
    }

    /**
     * Convert to JSON for storage
     */
    toJSON() {
        return {
            id: this.id,
            registrationNumber: this.registrationNumber,
            capacity: this.capacity,
            contractorId: this.contractorId,
            status: this.status,
            createdAt: this.createdAt
        };
    }

    /**
     * Get formatted capacity
     */
    getFormattedCapacity() {
        return `${this.capacity.toLocaleString()} L`;
    }

    /**
     * Get display name
     */
    getDisplayName() {
        return `${this.registrationNumber} (${this.getFormattedCapacity()})`;
    }

    /**
     * Get truck data for API requests
     */
    getAPIData() {
        return {
            registrationNumber: this.registrationNumber.trim().toUpperCase(),
            capacity: Number(this.capacity),
            contractorId: this.contractorId
        };
    }

    /**
     * Create truck from API response
     */
    static fromAPIResponse(data) {
        return new Truck({
            id: data._id || data.truckId || data.id,
            registrationNumber: data.registrationNumber || data.registration_number,
            capacity: data.capacity,
            contractorId: data.contractorId || data.contractor_id || data.userId,
            status: data.status,
            createdAt: data.createdAt || data.created_at
        });
    }

    /**
     * Check if truck is available for orders
     */
    isAvailable() {
        return this.status === 'active';
    }

    /**
     * Get status display text
     */
    getStatusDisplay() {
        const statusMap = {
            'active': 'Active',
            'inactive': 'Inactive',
            'maintenance': 'Under Maintenance',
            'retired': 'Retired'
        };
        return statusMap[this.status] || this.status;
    }

    /**
     * Get capacity utilization percentage for a given order
     */
    getCapacityUtilization(requiredLiters) {
        if (!requiredLiters || this.capacity <= 0) return 0;
        return Math.min((requiredLiters / this.capacity) * 100, 100);
    }

    /**
     * Check if truck can fulfill an order
     */
    canFulfillOrder(requiredLiters) {
        return this.isAvailable() && requiredLiters <= this.capacity;
    }

    /**
     * Get formatted registration number for display
     */
    getFormattedRegistrationNumber() {
        return this.registrationNumber.toUpperCase();
    }
}

/**
 * Order Model
 */
class Order {
    constructor(data = {}) {
        this.id = data._id || data.orderId || data.id || null;
        this.displayId = data.orderId || data.id || this.id;
        this.truckId = data.truckId || null;
        this.requiredLiters = data.requiredLiters || 0;
        this.contractorId = data.contractorId || data.userId || null;
        this.status = data.status || 'pending';
        this.amount = data.amount || 0;
        this.createdAt = data.createdAt || null;
    }

    /**
     * Validate order data
     */
    validate() {
        const errors = {};

        if (!this.truckId) {
            errors.truckId = 'Truck ID is required';
        }

        if (!this.requiredLiters || this.requiredLiters <= 0) {
            errors.requiredLiters = 'Required liters must be greater than 0';
        } else if (this.requiredLiters > 50000) {
            errors.requiredLiters = 'Required liters cannot exceed 50,000';
        } else if (!Number.isInteger(Number(this.requiredLiters))) {
            errors.requiredLiters = 'Required liters must be a whole number';
        }

        if (!this.contractorId) {
            errors.contractorId = 'Contractor ID is required';
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors: errors
        };
    }

    /**
     * Convert to JSON for storage
     */
    toJSON() {
        return {
            id: this.id,
            displayId: this.displayId,
            truckId: this.truckId,
            requiredLiters: this.requiredLiters,
            contractorId: this.contractorId,
            status: this.status,
            amount: this.amount,
            createdAt: this.createdAt
        };
    }

    /**
     * Get formatted required liters
     */
    getFormattedLiters() {
        return `${this.requiredLiters.toLocaleString()} L`;
    }

    /**
     * Get formatted amount
     */
    getFormattedAmount() {
        return `$${this.amount.toFixed(2)}`;
    }

    /**
     * Calculate estimated cost (placeholder calculation)
     */
    calculateEstimatedCost(pricePerLiter = 0.05) {
        return this.requiredLiters * pricePerLiter;
    }

    /**
     * Get order data for API requests
     */
    getAPIData() {
        return {
            truckId: this.truckId,
            requiredLiters: Number(this.requiredLiters),
            contractorId: this.contractorId
        };
    }

    /**
     * Create order from API response
     */
    static fromAPIResponse(data) {
        return new Order({
            id: data._id || data.orderId || data.id,
            truckId: data.truckId || data.truck_id,
            requiredLiters: data.requiredLiters || data.required_liters,
            contractorId: data.contractorId || data.contractor_id || data.userId,
            status: data.status,
            amount: data.amount,
            createdAt: data.createdAt || data.created_at
        });
    }

    /**
     * Check if order is pending
     */
    isPending() {
        return this.status === 'pending';
    }

    /**
     * Check if order is completed
     */
    isCompleted() {
        return this.status === 'completed' || this.status === 'delivered';
    }

    /**
     * Check if order can be cancelled
     */
    canBeCancelled() {
        return this.status === 'pending' || this.status === 'confirmed';
    }

    /**
     * Get status display text
     */
    getStatusDisplay() {
        const statusMap = {
            'pending': 'Pending',
            'confirmed': 'Confirmed',
            'in_progress': 'In Progress',
            'delivered': 'Delivered',
            'completed': 'Completed',
            'cancelled': 'Cancelled'
        };
        return statusMap[this.status] || this.status;
    }

    /**
     * Get order summary for display
     */
    getSummary() {
        return `${this.getFormattedLiters()} - ${this.getStatusDisplay()}`;
    }

    /**
     * Get formatted amount with currency
     */
    getFormattedAmountWithCurrency(currency = 'USD') {
        return `${this.getFormattedAmount()} ${currency}`;
    }

    /**
     * Get order priority based on required liters
     */
    getPriority() {
        if (this.requiredLiters >= 10000) return 'high';
        if (this.requiredLiters >= 5000) return 'medium';
        return 'low';
    }

    /**
     * Get priority display text
     */
    getPriorityDisplay() {
        const priorityMap = {
            'high': 'High Priority',
            'medium': 'Medium Priority',
            'low': 'Low Priority'
        };
        return priorityMap[this.getPriority()];
    }
}

/**
 * Payment Model
 */
class Payment {
    constructor(data = {}) {
        this.id = data.id || null;
        this.orderId = data.orderId || null;
        this.amount = data.amount || 0;
        this.status = data.status || 'pending';
        this.method = data.method || 'credit_card';
        this.transactionId = data.transactionId || null;
        this.processedAt = data.processedAt || null;
        this.createdAt = data.createdAt || null;
    }

    /**
     * Validate payment data
     */
    validate() {
        const errors = {};

        if (!this.orderId) {
            errors.orderId = 'Order ID is required';
        }

        if (!this.amount || this.amount <= 0) {
            errors.amount = 'Amount must be greater than 0';
        } else if (this.amount > 1000000) {
            errors.amount = 'Amount cannot exceed $1,000,000';
        }

        if (this.method && !['credit_card', 'debit_card', 'bank_transfer', 'cash'].includes(this.method)) {
            errors.method = 'Invalid payment method';
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors: errors
        };
    }

    /**
     * Convert to JSON for storage
     */
    toJSON() {
        return {
            id: this.id,
            orderId: this.orderId,
            amount: this.amount,
            status: this.status,
            method: this.method,
            transactionId: this.transactionId,
            processedAt: this.processedAt,
            createdAt: this.createdAt
        };
    }

    /**
     * Get formatted amount
     */
    getFormattedAmount() {
        return `$${this.amount.toFixed(2)}`;
    }

    /**
     * Check if payment is successful
     */
    isSuccessful() {
        return this.status === 'completed' || this.status === 'success';
    }

    /**
     * Check if payment is pending
     */
    isPending() {
        return this.status === 'pending' || this.status === 'processing';
    }

    /**
     * Check if payment failed
     */
    isFailed() {
        return this.status === 'failed' || this.status === 'error';
    }

    /**
     * Get status display text
     */
    getStatusDisplay() {
        const statusMap = {
            'pending': 'Pending',
            'processing': 'Processing',
            'completed': 'Completed',
            'success': 'Successful',
            'failed': 'Failed',
            'error': 'Error',
            'cancelled': 'Cancelled'
        };

        return statusMap[this.status] || this.status;
    }

    /**
     * Get payment data for API requests
     */
    getAPIData() {
        return {
            orderId: this.orderId,
            amount: this.amount,
            method: this.method
        };
    }

    /**
     * Create payment from API response
     */
    static fromAPIResponse(data) {
        return new Payment({
            id: data.id,
            orderId: data.orderId || data.order_id,
            amount: data.amount,
            status: data.status,
            method: data.method,
            transactionId: data.transactionId || data.transaction_id,
            processedAt: data.processedAt || data.processed_at,
            createdAt: data.createdAt || data.created_at
        });
    }

    /**
     * Get formatted amount with currency
     */
    getFormattedAmountWithCurrency(currency = 'USD') {
        return `$${this.getFormattedAmount()} ${currency}`;
    }

    /**
     * Get payment summary for display
     */
    getSummary() {
        return `${this.getFormattedAmountWithCurrency()} - ${this.getStatusDisplay()}`;
    }

    /**
     * Check if payment can be retried
     */
    canRetry() {
        return this.isFailed() || this.status === 'cancelled';
    }

    /**
     * Get payment method display text
     */
    getMethodDisplay() {
        const methodMap = {
            'credit_card': 'Credit Card',
            'debit_card': 'Debit Card',
            'bank_transfer': 'Bank Transfer',
            'cash': 'Cash',
            'digital_wallet': 'Digital Wallet'
        };
        return methodMap[this.method] || this.method;
    }

    /**
     * Get time since payment creation
     */
    getTimeSinceCreation() {
        if (!this.createdAt) return 'Unknown';
        
        const now = new Date();
        const created = new Date(this.createdAt);
        const diffMs = now - created;
        const diffMins = Math.floor(diffMs / 60000);
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} minutes ago`;
        
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours} hours ago`;
        
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays} days ago`;
    }

    /**
     * Check if payment is recent (within last hour)
     */
    isRecent() {
        if (!this.createdAt) return false;
        
        const now = new Date();
        const created = new Date(this.createdAt);
        const diffMs = now - created;
        const diffHours = diffMs / (1000 * 60 * 60);
        
        return diffHours <= 1;
    }
}

/**
 * Form State Model for managing form validation and state
 */
class FormState {
    constructor(formName) {
        this.formName = formName;
        this.data = {};
        this.errors = {};
        this.isValid = false;
        this.isSubmitting = false;
        this.isDirty = false;
    }

    /**
     * Set field value and validate
     */
    setField(name, value) {
        this.data[name] = value;
        this.isDirty = true;
        this.validateField(name);
        this.updateFormValidity();
    }

    /**
     * Get field value
     */
    getField(name) {
        return this.data[name] || '';
    }

    /**
     * Set field error
     */
    setFieldError(name, error) {
        if (error) {
            this.errors[name] = error;
        } else {
            delete this.errors[name];
        }
        this.updateFormValidity();
    }

    /**
     * Get field error
     */
    getFieldError(name) {
        return this.errors[name] || null;
    }

    /**
     * Validate specific field (override in subclasses)
     */
    validateField(name) {
        // Override in specific form implementations
        return true;
    }

    /**
     * Validate all fields
     */
    validateAll() {
        Object.keys(this.data).forEach(fieldName => {
            this.validateField(fieldName);
        });
        this.updateFormValidity();
        return this.isValid;
    }

    /**
     * Update overall form validity
     */
    updateFormValidity() {
        this.isValid = Object.keys(this.errors).length === 0;
    }

    /**
     * Clear all errors
     */
    clearErrors() {
        this.errors = {};
        this.updateFormValidity();
    }

    /**
     * Reset form state
     */
    reset() {
        this.data = {};
        this.errors = {};
        this.isValid = false;
        this.isSubmitting = false;
        this.isDirty = false;
    }

    /**
     * Set submitting state
     */
    setSubmitting(isSubmitting) {
        this.isSubmitting = isSubmitting;
    }

    /**
     * Get form data as plain object
     */
    getData() {
        return { ...this.data };
    }

    /**
     * Check if form has errors
     */
    hasErrors() {
        return Object.keys(this.errors).length > 0;
    }

    /**
     * Get all errors
     */
    getErrors() {
        return { ...this.errors };
    }

    /**
     * Check if specific field is dirty (has been modified)
     */
    isFieldDirty(name) {
        return this.isDirty && this.data.hasOwnProperty(name);
    }

    /**
     * Get field validation status
     */
    getFieldStatus(name) {
        return {
            value: this.getField(name),
            error: this.getFieldError(name),
            isDirty: this.isFieldDirty(name),
            isValid: !this.getFieldError(name)
        };
    }

    /**
     * Set multiple fields at once
     */
    setFields(data) {
        Object.keys(data).forEach(name => {
            this.setField(name, data[name]);
        });
    }

    /**
     * Get form validation summary
     */
    getValidationSummary() {
        return {
            isValid: this.isValid,
            isDirty: this.isDirty,
            isSubmitting: this.isSubmitting,
            errorCount: Object.keys(this.errors).length,
            fieldCount: Object.keys(this.data).length
        };
    }
}

export { Contractor, Truck, Order, Payment, FormState };