import React from 'react';
import { CheckCircle, Download, ArrowRight } from 'lucide-react';
import { useCart } from '../hooks/useCart';

interface OrderSuccessProps {
  onContinueShopping: () => void;
}

export const OrderSuccess: React.FC<OrderSuccessProps> = ({ onContinueShopping }) => {
  const { clearCart } = useCart();
  
  React.useEffect(() => {
    clearCart();
  }, [clearCart]);

  const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;
  const estimatedDelivery = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
        <p className="text-gray-600 mb-6">
          Thank you for your purchase. Your order has been successfully placed.
        </p>

        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Order Number:</span>
              <span className="font-medium text-gray-900">{orderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Estimated Delivery:</span>
              <span className="font-medium text-gray-900">{estimatedDelivery}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tracking:</span>
              <span className="font-medium text-indigo-600">Available soon</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <button className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Download Receipt</span>
          </button>

          <button
            onClick={onContinueShopping}
            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-6">
          You will receive an email confirmation shortly with your order details and tracking information.
        </p>
      </div>
    </div>
  );
};