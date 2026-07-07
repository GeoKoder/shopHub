import React, { useState } from 'react';
import { ArrowLeft, CreditCard, Truck, Shield, CheckCircle } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { CheckoutFormData } from '../types';

interface CheckoutProps {
  onBack: () => void;
  onComplete: () => void;
}

export const Checkout: React.FC<CheckoutProps> = ({ onBack, onComplete }) => {
  const { items, getTotalPrice } = useCart();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<CheckoutFormData>({
    email: user?.email || '',
    phone: '',
    fullName: user?.name || '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    paymentMethod: 'card',
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.email) newErrors.email = 'Email is required';
      if (!formData.phone) newErrors.phone = 'Phone number is required';
    } else if (step === 2) {
      if (!formData.fullName) newErrors.fullName = 'Full name is required';
      if (!formData.street) newErrors.street = 'Street address is required';
      if (!formData.city) newErrors.city = 'City is required';
      if (!formData.state) newErrors.state = 'State is required';
      if (!formData.zipCode) newErrors.zipCode = 'ZIP code is required';
    } else if (step === 3 && formData.paymentMethod === 'card') {
      if (!formData.cardNumber) newErrors.cardNumber = 'Card number is required';
      if (!formData.expiryDate) newErrors.expiryDate = 'Expiry date is required';
      if (!formData.cvv) newErrors.cvv = 'CVV is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    setIsProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsProcessing(false);
    onComplete();
  };

  const subtotal = getTotalPrice();
  const shipping = 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const steps = [
    { number: 1, title: 'Contact', icon: '📧' },
    { number: 2, title: 'Shipping', icon: '🚚' },
    { number: 3, title: 'Payment', icon: '💳' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-700 mb-8 transition-colors duration-200"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Cart</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Checkout Form */}
          <div className="bg-white rounded-2xl shadow-sm p-8">
            {/* Progress Steps */}
            <div className="flex items-center justify-between mb-8">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center">
                  <div className={`
                    flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium
                    ${currentStep >= step.number 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-gray-200 text-gray-600'
                    }
                  `}>
                    {currentStep > step.number ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      step.number
                    )}
                  </div>
                  <span className="ml-3 text-sm font-medium text-gray-700">
                    {step.title}
                  </span>
                  {index < steps.length - 1 && (
                    <div className={`
                      w-12 h-px mx-4
                      ${currentStep > step.number ? 'bg-indigo-600' : 'bg-gray-200'}
                    `} />
                  )}
                </div>
              ))}
            </div>

            {/* Step 1: Contact Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Contact Information</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="john@example.com"
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                      errors.phone ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="+1 (555) 123-4567"
                  />
                  {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                </div>

                <button
                  onClick={handleNext}
                  className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors duration-200"
                >
                  Continue to Shipping
                </button>
              </div>
            )}

            {/* Step 2: Shipping Address */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Truck className="w-5 h-5 text-indigo-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Shipping Address</h2>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                      errors.fullName ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="John Doe"
                  />
                  {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address
                  </label>
                  <input
                    type="text"
                    name="street"
                    value={formData.street}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                      errors.street ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="123 Main Street"
                  />
                  {errors.street && <p className="mt-1 text-sm text-red-600">{errors.street}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                        errors.city ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="New York"
                    />
                    {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                        errors.state ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="NY"
                    />
                    {errors.state && <p className="mt-1 text-sm text-red-600">{errors.state}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ZIP Code
                    </label>
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                        errors.zipCode ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="10001"
                    />
                    {errors.zipCode && <p className="mt-1 text-sm text-red-600">{errors.zipCode}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country
                    </label>
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="United States">United States</option>
                      <option value="Canada">Canada</option>
                      <option value="United Kingdom">United Kingdom</option>
                    </select>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleNext}
                    className="flex-1 bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors duration-200"
                  >
                    Continue to Payment
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Payment */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="flex items-center space-x-2 mb-4">
                  <CreditCard className="w-5 h-5 text-indigo-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Payment Information</h2>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <button
                    onClick={() => handleInputChange({ target: { name: 'paymentMethod', value: 'card' } } as any)}
                    className={`p-4 border-2 rounded-lg text-center transition-colors duration-200 ${
                      formData.paymentMethod === 'card'
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <CreditCard className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                    <span className="text-sm font-medium">Card</span>
                  </button>
                  <button
                    onClick={() => handleInputChange({ target: { name: 'paymentMethod', value: 'paypal' } } as any)}
                    className={`p-4 border-2 rounded-lg text-center transition-colors duration-200 ${
                      formData.paymentMethod === 'paypal'
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="w-8 h-8 mx-auto mb-2 bg-blue-600 text-white rounded flex items-center justify-center text-xs font-bold">
                      PP
                    </div>
                    <span className="text-sm font-medium">PayPal</span>
                  </button>
                  <button
                    onClick={() => handleInputChange({ target: { name: 'paymentMethod', value: 'apple-pay' } } as any)}
                    className={`p-4 border-2 rounded-lg text-center transition-colors duration-200 ${
                      formData.paymentMethod === 'apple-pay'
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="w-8 h-8 mx-auto mb-2 bg-black text-white rounded flex items-center justify-center text-xs">
                      🍎
                    </div>
                    <span className="text-sm font-medium">Apple Pay</span>
                  </button>
                </div>

                {formData.paymentMethod === 'card' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Card Number
                      </label>
                      <input
                        type="text"
                        name="cardNumber"
                        value={formData.cardNumber}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                          errors.cardNumber ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="1234 5678 9012 3456"
                      />
                      {errors.cardNumber && <p className="mt-1 text-sm text-red-600">{errors.cardNumber}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          name="expiryDate"
                          value={formData.expiryDate}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                            errors.expiryDate ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="MM/YY"
                        />
                        {errors.expiryDate && <p className="mt-1 text-sm text-red-600">{errors.expiryDate}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          CVV
                        </label>
                        <input
                          type="text"
                          name="cvv"
                          value={formData.cvv}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                            errors.cvv ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="123"
                        />
                        {errors.cvv && <p className="mt-1 text-sm text-red-600">{errors.cvv}</p>}
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 text-green-600 mb-2">
                    <Shield className="w-5 h-5" />
                    <span className="text-sm font-medium">Secure Payment</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Your payment information is encrypted and secure. We never store your credit card details.
                  </p>
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isProcessing}
                    className="flex-1 bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    {isProcessing ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Processing...</span>
                      </div>
                    ) : (
                      `Complete Order - $${total.toFixed(2)}`
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-2xl shadow-sm p-8 h-fit">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Order Summary</h3>
            
            <div className="space-y-4 mb-6">
              {items.map((item) => (
                <div key={item.product.id} className="flex items-center space-x-4">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 line-clamp-1">
                      {item.product.name}
                    </h4>
                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                  </div>
                  <span className="font-medium text-gray-900">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t pt-6 space-y-3">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>${shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-semibold text-gray-900 pt-3 border-t">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};