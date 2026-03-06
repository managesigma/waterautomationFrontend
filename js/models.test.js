/**
 * Unit Tests for Data Models
 * Tests validation methods and utility functions for all model classes
 */

import { Contractor, Truck, Order, Payment, FormState } from './models.js';

/**
 * Test Suite for Contractor Model
 */
describe('Contractor Model', () => {
    describe('Constructor', () => {
        test('should create contractor with default values', () => {
            const contractor = new Contractor();
            expect(contractor.id).toBeNull();
            expect(contractor.phone).toBe('');
            expect(contractor.name).toBe('');
            expect(contractor.email).toBe('');
            expect(contractor.createdAt).toBeNull();
        });

        test('should create contractor with provided data', () => {
            const data = {
                id: '123',
                phone: '+1234567890',
                name: 'John Doe',
                email: 'john@example.com',
                createdAt: '2023-01-01'
            };
            const contractor = new Contractor(data);
            expect(contractor.id).toBe('123');
            expect(contractor.phone).toBe('+1234567890');
            expect(contractor.name).toBe('John Doe');
            expect(contractor.email).toBe('john@example.com');
            expect(contractor.createdAt).toBe('2023-01-01');
        });
    });

    describe('Validation', () => {
        test('should validate valid contractor data', () => {
            const contractor = new Contractor({
                phone: '+1234567890',
                name: 'John Doe',
                email: 'john@example.com'
            });
            const result = contractor.validate();
            expect(result.isValid).toBe(true);
            expect(Object.keys(result.errors)).toHaveLength(0);
        });

        test('should reject empty required fields', () => {
            const contractor = new Contractor();
            const result = contractor.validate();
            expect(result.isValid).toBe(false);
            expect(result.errors.phone).toBe('Phone number is required');
            expect(result.errors.name).toBe('Name is required');
            expect(result.errors.email).toBe('Email is required');
        });

        test('should reject invalid phone numbers', () => {
            const contractor = new Contractor({
                phone: '123',
                name: 'John Doe',
                email: 'john@example.com'
            });
            const result = contractor.validate();
            expect(result.isValid).toBe(false);
            expect(result.errors.phone).toBe('Please enter a valid phone number');
        });

        test('should reject invalid email addresses', () => {
            const contractor = new Contractor({
                phone: '+1234567890',
                name: 'John Doe',
                email: 'invalid-email'
            });
            const result = contractor.validate();
            expect(result.isValid).toBe(false);
            expect(result.errors.email).toBe('Please enter a valid email address');
        });

        test('should reject short names', () => {
            const contractor = new Contractor({
                phone: '+1234567890',
                name: 'J',
                email: 'john@example.com'
            });
            const result = contractor.validate();
            expect(result.isValid).toBe(false);
            expect(result.errors.name).toBe('Name must be at least 2 characters long');
        });
    });

    describe('Phone Validation', () => {
        test('should accept valid international phone numbers', () => {
            const contractor = new Contractor();
            expect(contractor.isValidPhone('+1234567890')).toBe(true);
            expect(contractor.isValidPhone('+44123456789')).toBe(true);
            expect(contractor.isValidPhone('+86123456789012')).toBe(true);
        });

        test('should accept valid local phone numbers', () => {
            const contractor = new Contractor();
            expect(contractor.isValidPhone('1234567890')).toBe(true);
            expect(contractor.isValidPhone('9876543210')).toBe(true);
        });

        test('should reject invalid phone numbers', () => {
            const contractor = new Contractor();
            expect(contractor.isValidPhone('')).toBe(false);
            expect(contractor.isValidPhone('123')).toBe(false);
            expect(contractor.isValidPhone('0123456789')).toBe(false); // starts with 0
            expect(contractor.isValidPhone('+0123456789')).toBe(false); // starts with +0
        });

        test('should handle phone numbers with formatting', () => {
            const contractor = new Contractor();
            expect(contractor.isValidPhone('(123) 456-7890')).toBe(true);
            expect(contractor.isValidPhone('123-456-7890')).toBe(true);
            expect(contractor.isValidPhone('123.456.7890')).toBe(true);
        });
    });

    describe('Utility Methods', () => {
        test('should format phone numbers correctly', () => {
            const contractor = new Contractor({ phone: '1234567890' });
            expect(contractor.getFormattedPhone()).toBe('(123) 456-7890');
        });

        test('should return original for international numbers', () => {
            const contractor = new Contractor({ phone: '+1234567890' });
            expect(contractor.getFormattedPhone()).toBe('+1234567890');
        });

        test('should get display name', () => {
            const contractor1 = new Contractor({ name: 'John Doe' });
            expect(contractor1.getDisplayName()).toBe('John Doe');

            const contractor2 = new Contractor({ email: 'john@example.com' });
            expect(contractor2.getDisplayName()).toBe('john@example.com');

            const contractor3 = new Contractor({ phone: '1234567890' });
            expect(contractor3.getDisplayName()).toBe('1234567890');
        });

        test('should get API data', () => {
            const contractor = new Contractor({
                id: '123',
                phone: '+1234567890',
                name: 'John Doe',
                email: 'john@example.com'
            });
            const apiData = contractor.getAPIData();
            expect(apiData).toEqual({
                phone: '+1234567890',
                name: 'John Doe',
                email: 'john@example.com'
            });
            expect(apiData.id).toBeUndefined(); // ID should not be in API data
        });

        test('should create from API response', () => {
            const apiData = {
                id: '123',
                phone: '+1234567890',
                name: 'John Doe',
                email: 'john@example.com',
                created_at: '2023-01-01'
            };
            const contractor = Contractor.fromAPIResponse(apiData);
            expect(contractor.id).toBe('123');
            expect(contractor.createdAt).toBe('2023-01-01');
        });
    });
});

/**
 * Test Suite for Truck Model
 */
describe('Truck Model', () => {
    describe('Validation', () => {
        test('should validate valid truck data', () => {
            const truck = new Truck({
                registrationNumber: 'ABC123',
                capacity: 5000,
                contractorId: 'contractor-123'
            });
            const result = truck.validate();
            expect(result.isValid).toBe(true);
            expect(Object.keys(result.errors)).toHaveLength(0);
        });

        test('should reject invalid capacity', () => {
            const truck = new Truck({
                registrationNumber: 'ABC123',
                capacity: 0,
                contractorId: 'contractor-123'
            });
            const result = truck.validate();
            expect(result.isValid).toBe(false);
            expect(result.errors.capacity).toBe('Capacity must be greater than 0');
        });

        test('should reject excessive capacity', () => {
            const truck = new Truck({
                registrationNumber: 'ABC123',
                capacity: 60000,
                contractorId: 'contractor-123'
            });
            const result = truck.validate();
            expect(result.isValid).toBe(false);
            expect(result.errors.capacity).toBe('Capacity cannot exceed 50,000 liters');
        });
    });

    describe('Utility Methods', () => {
        test('should format capacity correctly', () => {
            const truck = new Truck({ capacity: 5000 });
            expect(truck.getFormattedCapacity()).toBe('5,000 L');
        });

        test('should check availability', () => {
            const activeTruck = new Truck({ status: 'active' });
            expect(activeTruck.isAvailable()).toBe(true);

            const inactiveTruck = new Truck({ status: 'inactive' });
            expect(inactiveTruck.isAvailable()).toBe(false);
        });
    });
});

/**
 * Test Suite for Order Model
 */
describe('Order Model', () => {
    describe('Validation', () => {
        test('should validate valid order data', () => {
            const order = new Order({
                truckId: 'truck-123',
                requiredLiters: 3000,
                contractorId: 'contractor-123'
            });
            const result = order.validate();
            expect(result.isValid).toBe(true);
            expect(Object.keys(result.errors)).toHaveLength(0);
        });

        test('should reject invalid required liters', () => {
            const order = new Order({
                truckId: 'truck-123',
                requiredLiters: 0,
                contractorId: 'contractor-123'
            });
            const result = order.validate();
            expect(result.isValid).toBe(false);
            expect(result.errors.requiredLiters).toBe('Required liters must be greater than 0');
        });
    });

    describe('Utility Methods', () => {
        test('should calculate estimated cost', () => {
            const order = new Order({ requiredLiters: 1000 });
            expect(order.calculateEstimatedCost(0.1)).toBe(100);
        });

        test('should check order status', () => {
            const pendingOrder = new Order({ status: 'pending' });
            expect(pendingOrder.isPending()).toBe(true);
            expect(pendingOrder.isCompleted()).toBe(false);

            const completedOrder = new Order({ status: 'completed' });
            expect(completedOrder.isPending()).toBe(false);
            expect(completedOrder.isCompleted()).toBe(true);
        });
    });
});

/**
 * Test Suite for Payment Model
 */
describe('Payment Model', () => {
    describe('Validation', () => {
        test('should validate valid payment data', () => {
            const payment = new Payment({
                orderId: 'order-123',
                amount: 150.00
            });
            const result = payment.validate();
            expect(result.isValid).toBe(true);
            expect(Object.keys(result.errors)).toHaveLength(0);
        });

        test('should reject invalid amount', () => {
            const payment = new Payment({
                orderId: 'order-123',
                amount: 0
            });
            const result = payment.validate();
            expect(result.isValid).toBe(false);
            expect(result.errors.amount).toBe('Amount must be greater than 0');
        });
    });

    describe('Utility Methods', () => {
        test('should check payment status', () => {
            const successfulPayment = new Payment({ status: 'completed' });
            expect(successfulPayment.isSuccessful()).toBe(true);
            expect(successfulPayment.isPending()).toBe(false);
            expect(successfulPayment.isFailed()).toBe(false);

            const pendingPayment = new Payment({ status: 'pending' });
            expect(pendingPayment.isSuccessful()).toBe(false);
            expect(pendingPayment.isPending()).toBe(true);
            expect(pendingPayment.isFailed()).toBe(false);

            const failedPayment = new Payment({ status: 'failed' });
            expect(failedPayment.isSuccessful()).toBe(false);
            expect(failedPayment.isPending()).toBe(false);
            expect(failedPayment.isFailed()).toBe(true);
        });

        test('should format amount with currency', () => {
            const payment = new Payment({ amount: 150.50 });
            expect(payment.getFormattedAmountWithCurrency()).toBe('$150.50 USD');
            expect(payment.getFormattedAmountWithCurrency('EUR')).toBe('$150.50 EUR');
        });

        test('should check if payment can be retried', () => {
            const failedPayment = new Payment({ status: 'failed' });
            expect(failedPayment.canRetry()).toBe(true);

            const successfulPayment = new Payment({ status: 'completed' });
            expect(successfulPayment.canRetry()).toBe(false);
        });
    });
});