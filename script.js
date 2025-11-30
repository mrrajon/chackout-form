// Form validation script
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('checkoutForm');
    const resetButton = document.getElementById('resetButton');
    const fields = form.querySelectorAll('input, select');
    const paymentMethodRadios = document.querySelectorAll('input[name="paymentMethod"]');
    const shippingOptions = document.querySelectorAll('.shipping-option');
    const applyPromoButton = document.getElementById('applyPromo');
    
    // Price calculation variables
    const basePrices = {
        subtotal: 149.96,
        taxRate: 0.08, // 8% tax rate
        discount: 10.00,
        currentShipping: 9.99
    };
    
    // Initialize prices
    initializePrices();
    
    // Add real-time validation on blur
    fields.forEach(field => {
        field.addEventListener('blur', validateField);
        field.addEventListener('input', function() {
            // Only validate if the field has already been validated (has validation classes)
            if (this.classList.contains('is-invalid') || this.classList.contains('is-valid')) {
                validateField.call(this);
            }
        });
    });
    
    // Special handling for payment method radio buttons
    paymentMethodRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            validatePaymentMethod();
        });
    });
    
    // Shipping method change handler
    shippingOptions.forEach(option => {
        option.addEventListener('change', function() {
            updateShippingCost(this.value, parseFloat(this.dataset.cost));
        });
    });
    
    // Promo code application
    applyPromoButton.addEventListener('click', applyPromoCode);
    
    // Reset button handler
    resetButton.addEventListener('click', resetForm);
    
    // Form submission handler
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        event.stopPropagation();
        
        let isFormValid = true;
        
        // Validate all fields
        fields.forEach(field => {
            if (!validateField.call(field)) {
                isFormValid = false;
            }
        });
        
        // Validate payment method separately
        if (!validatePaymentMethod()) {
            isFormValid = false;
        }
        
        // Validate terms and conditions
        const agreeTerms = document.getElementById('agreeTerms');
        if (!agreeTerms.checked) {
            agreeTerms.classList.add('is-invalid');
            isFormValid = false;
        } else {
            agreeTerms.classList.remove('is-invalid');
        }
        
        if (isFormValid) {
            // Form is valid - show success message
            showSuccessMessage();
            // In a real application, you would submit the form here
            // form.submit();
        } else {
            // Show all validation errors and scroll to first error
            showAllValidationErrors();
            scrollToFirstError();
        }
        
        form.classList.add('was-validated');
    });
    
    // Initialize prices function
    function initializePrices() {
        calculateTotal();
    }
    
    // Update shipping cost function
    function updateShippingCost(method, cost) {
        basePrices.currentShipping = cost;
        calculateTotal();
        
        // Update shipping cost display with animation
        const shippingElement = document.getElementById('shipping-cost');
        shippingElement.textContent = `$${cost.toFixed(2)}`;
        shippingElement.classList.add('price-update');
        
        // Remove animation class after animation completes
        setTimeout(() => {
            shippingElement.classList.remove('price-update');
        }, 600);
        
        // Show shipping method confirmation
        showShippingConfirmation(method);
    }
    
    // Calculate total function
    function calculateTotal() {
        const tax = basePrices.subtotal * basePrices.taxRate;
        const total = basePrices.subtotal + basePrices.currentShipping + tax - basePrices.discount;
        
        // Update all price displays
        document.getElementById('tax').textContent = `$${tax.toFixed(2)}`;
        document.getElementById('total').textContent = `$${total.toFixed(2)}`;
        
        // Add animation to total
        const totalElement = document.getElementById('total');
        totalElement.classList.add('price-update');
        setTimeout(() => {
            totalElement.classList.remove('price-update');
        }, 600);
    }
    
    // Apply promo code function
    function applyPromoCode() {
        const promoCodeInput = document.getElementById('promoCode');
        const promoMessage = document.getElementById('promoMessage');
        const promoCode = promoCodeInput.value.trim().toUpperCase();
        
        // Valid promo codes
        const validPromoCodes = {
            'SAVE10': 10,
            'WELCOME15': 15,
            'SUMMER25': 25,
            'FREESHIP': basePrices.currentShipping
        };
        
        if (promoCode === '') {
            promoMessage.innerHTML = '<span class="text-danger">Please enter a promo code</span>';
            return;
        }
        
        if (validPromoCodes[promoCode]) {
            const discount = validPromoCodes[promoCode];
            
            if (promoCode === 'FREESHIP') {
                // Free shipping
                basePrices.currentShipping = 0;
                basePrices.discount = 0;
                promoMessage.innerHTML = '<span class="text-success">Free shipping applied!</span>';
            } else {
                // Regular discount
                basePrices.discount = discount;
                promoMessage.innerHTML = `<span class="text-success">$${discount.toFixed(2)} discount applied!</span>`;
            }
            
            // Update prices
            updateDiscountDisplay();
            calculateTotal();
            
            // Disable promo code input after successful application
            promoCodeInput.disabled = true;
            applyPromoButton.disabled = true;
            applyPromoButton.textContent = 'Applied';
            
        } else {
            promoMessage.innerHTML = '<span class="text-danger">Invalid promo code. Please try again.</span>';
        }
    }
    
    // Update discount display
    function updateDiscountDisplay() {
        const discountElement = document.getElementById('discount');
        discountElement.textContent = `-$${basePrices.discount.toFixed(2)}`;
        discountElement.classList.add('price-update');
        
        setTimeout(() => {
            discountElement.classList.remove('price-update');
        }, 600);
    }
    
    // Show shipping confirmation
    function showShippingConfirmation(method) {
        const shippingNames = {
            'standard': 'Standard Shipping',
            'express': 'Express Shipping',
            'overnight': 'Overnight Shipping'
        };
        
        // Create temporary confirmation message
        const confirmationMessage = document.createElement('div');
        confirmationMessage.className = 'alert alert-info alert-dismissible fade show mt-3';
        confirmationMessage.innerHTML = `
            <i class="fas fa-shipping-fast me-2"></i>
            <strong>${shippingNames[method]} selected!</strong> Your order will be delivered in the estimated timeframe.
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        // Insert after shipping method section
        const shippingSection = document.querySelector('.shipping-info');
        shippingSection.appendChild(confirmationMessage);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            if (confirmationMessage.parentNode) {
                confirmationMessage.remove();
            }
        }, 3000);
    }
    
    // Field validation function
    function validateField() {
        const field = this;
        const value = field.value.trim();
        const validationIcon = field.parentElement.querySelector('.validation-icon');
        
        // Clear previous validation states
        field.classList.remove('is-valid', 'is-invalid');
        
        // Skip validation for empty non-required fields
        if (!field.required && value === '') {
            if (validationIcon) {
                validationIcon.innerHTML = '';
            }
            return true;
        }
        
        let isValid = true;
        let errorMessage = '';
        
        // Field-specific validation
        switch(field.type) {
            case 'email':
                isValid = validateEmail(value);
                errorMessage = 'Please provide a valid email address.';
                break;
                
            case 'text':
                if (field.id === 'firstName') {
                    isValid = value.length >= 5;
                    errorMessage = 'First name must be at least 5 characters long.';
                } else {
                    isValid = value !== '';
                    errorMessage = `Please provide a valid ${field.previousElementSibling.textContent.toLowerCase().trim()}.`;
                }
                break;
                
            case 'number':
                if (field.id === 'cardNumber') {
                    isValid = value.length === 16;
                    errorMessage = 'Credit card number must be exactly 16 digits.';
                } else if (field.id === 'cvv') {
                    isValid = value.length === 3 && value >= 100 && value <= 999;
                    errorMessage = 'Please provide a valid 3-digit CVV.';
                } else {
                    isValid = value !== '';
                    errorMessage = `Please provide a valid ${field.previousElementSibling.textContent.toLowerCase().trim()}.`;
                }
                break;
                
            case 'tel':
                isValid = validatePhoneNumber(value);
                errorMessage = 'Please provide a valid phone number.';
                break;
                
            case 'date':
                if (field.id === 'expiryDate') {
                    isValid = validateExpiryDate(value);
                    errorMessage = 'Please provide a valid future expiry date.';
                } else {
                    isValid = value !== '';
                    errorMessage = `Please provide a valid ${field.previousElementSibling.textContent.toLowerCase().trim()}.`;
                }
                break;
                
            default:
                if (field.required) {
                    isValid = value !== '';
                    errorMessage = `Please provide a valid ${field.previousElementSibling.textContent.toLowerCase().trim()}.`;
                }
        }
        
        // Special handling for select elements
        if (field.tagName === 'SELECT' && field.required) {
            isValid = value !== '';
            errorMessage = `Please select a ${field.previousElementSibling.textContent.toLowerCase().trim()}.`;
        }
        
        // Apply validation styles and icons
        if (isValid) {
            field.classList.add('is-valid');
            if (validationIcon) {
                validationIcon.innerHTML = '<i class="fas fa-check"></i>';
            }
        } else {
            field.classList.add('is-invalid');
            if (validationIcon) {
                validationIcon.innerHTML = '<i class="fas fa-times"></i>';
            }
            // Set custom error message if available
            const feedbackElement = field.parentElement.nextElementSibling;
            if (feedbackElement && feedbackElement.classList.contains('invalid-feedback')) {
                feedbackElement.textContent = errorMessage;
            }
        }
        
        return isValid;
    }
    
    // Payment method validation
    function validatePaymentMethod() {
        const paymentMethodGroup = document.querySelector('input[name="paymentMethod"]').closest('.mb-3');
        const selectedPayment = document.querySelector('input[name="paymentMethod"]:checked');
        
        if (!selectedPayment) {
            paymentMethodGroup.classList.add('was-validated');
            return false;
        } else {
            paymentMethodGroup.classList.remove('was-validated');
            return true;
        }
    }
    
    // Email validation function
    function validateEmail(email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }
    
    // Phone number validation (basic)
    function validatePhoneNumber(phone) {
        const re = /^[\+]?[1-9][\d]{0,15}$/;
        return re.test(phone.replace(/[\s\-\(\)]/g, ''));
    }
    
    // Expiry date validation
    function validateExpiryDate(dateString) {
        if (!dateString) return false;
        
        const expiryDate = new Date(dateString);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        return expiryDate > today;
    }
    
    // Show all validation errors
    function showAllValidationErrors() {
        fields.forEach(field => {
            if (field.required && !field.value.trim()) {
                validateField.call(field);
            }
        });
        
        // Validate payment method
        validatePaymentMethod();
        
        // Validate terms and conditions
        const agreeTerms = document.getElementById('agreeTerms');
        if (!agreeTerms.checked) {
            agreeTerms.classList.add('is-invalid');
        }
    }
    
    // Show success message
    function showSuccessMessage() {
        // Get selected shipping method
        const selectedShipping = document.querySelector('input[name="shippingMethod"]:checked');
        const shippingMethod = selectedShipping ? selectedShipping.nextElementSibling.textContent.trim() : 'Standard Shipping';
        
        // Create success alert
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-success alert-dismissible fade show mt-4';
        alertDiv.innerHTML = `
            <h4 class="alert-heading"><i class="fas fa-check-circle me-2"></i>Order Successful!</h4>
            <p>Thank you for your purchase. Your order has been placed successfully.</p>
            <p><strong>Shipping Method:</strong> ${shippingMethod}</p>
            <p class="mb-0"><strong>Order Total: ${document.getElementById('total').textContent}</strong></p>
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        // Insert before the form
        form.parentNode.insertBefore(alertDiv, form);
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Reset form after 5 seconds
        setTimeout(() => {
            resetForm();
            alertDiv.remove();
        }, 5000);
    }
    
    // Scroll to first error
    function scrollToFirstError() {
        const firstError = form.querySelector('.is-invalid');
        if (firstError) {
            firstError.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
            firstError.focus();
        }
    }
    
    // Reset form function
    function resetForm() {
        form.reset();
        form.classList.remove('was-validated');
        
        // Clear all validation states
        fields.forEach(field => {
            field.classList.remove('is-valid', 'is-invalid');
            const validationIcon = field.parentElement.querySelector('.validation-icon');
            if (validationIcon) {
                validationIcon.innerHTML = '';
            }
        });
        
        // Clear payment method validation
        const paymentMethodGroup = document.querySelector('input[name="paymentMethod"]').closest('.mb-3');
        paymentMethodGroup.classList.remove('was-validated');
        
        // Clear terms validation
        const agreeTerms = document.getElementById('agreeTerms');
        agreeTerms.classList.remove('is-invalid');
        
        // Reset prices to default
        basePrices.currentShipping = 9.99;
        basePrices.discount = 10.00;
        initializePrices();
        
        // Reset promo code
        const promoCodeInput = document.getElementById('promoCode');
        const promoMessage = document.getElementById('promoMessage');
        const applyPromoButton = document.getElementById('applyPromo');
        
        promoCodeInput.value = '';
        promoCodeInput.disabled = false;
        applyPromoButton.disabled = false;
        applyPromoButton.textContent = 'Apply';
        promoMessage.innerHTML = '';
        
        // Reset shipping to default
        document.getElementById('standardShipping').checked = true;
        
        // Remove any existing alerts
        const existingAlert = document.querySelector('.alert');
        if (existingAlert) {
            existingAlert.remove();
        }
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
});