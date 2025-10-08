import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Package, Truck, CheckCircle, Clock, AlertCircle, MapPin, Calendar, Hash, Sparkles, Eye } from 'lucide-react';
import { trackingService, TrackingInfo } from '../services/trackingService';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const TrackOrderPage: React.FC = () => {
  const [orderNumber, setOrderNumber] = useState('');
  const [trackingInfo, setTrackingInfo] = useState<TrackingInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate order number
    const validation = trackingService.validateOrderNumber(orderNumber);
    if (!validation.isValid) {
      setError(validation.error || 'Invalid order number');
      return;
    }

    setLoading(true);
    setError(null);
    setTrackingInfo(null);

    try {
      const info = await trackingService.trackOrder(orderNumber);
      setTrackingInfo(info);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Order not found. Please check your order number and try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderTrackingSteps = () => {
    if (!trackingInfo) return null;

    const steps = [
      { key: 'confirmed', label: 'Order Confirmed', icon: CheckCircle, description: 'Payment verified & order received' },
      { key: 'processing', label: 'Crafting Your Order', icon: Package, description: 'Carefully preparing your items' },
      { key: 'shipped', label: 'En Route', icon: Truck, description: 'On its way to you' },
      { key: 'delivered', label: 'Delivered', icon: Sparkles, description: 'Ready to elevate your style' }
    ];

    const currentStatusIndex = steps.findIndex(step => step.key === trackingInfo.status);
    const progressPercentage = trackingService.getProgressPercentage(trackingInfo.status);

    return (
      <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-orange-100/50 p-8 mb-12 overflow-hidden">
        {/* Decorative background */}
        <div className="absolute inset-0 bg-gradient-to-br from-rose-50/30 to-orange-50/30"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-200/20 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-rose-200/20 rounded-full blur-xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-center mb-8">
            <Eye className="w-5 h-5 text-orange-600 mr-2" />
            <h3 className="text-2xl font-serif font-semibold text-neutral-800">Journey Progress</h3>
          </div>
          
          {/* Enhanced Progress Bar */}
          <div className="relative mb-12">
            <div className="absolute top-6 left-0 w-full h-1 bg-gradient-to-r from-neutral-200 to-neutral-300 rounded-full"></div>
            <motion.div 
              className="absolute top-6 left-0 h-1 bg-gradient-to-r from-orange-400 via-rose-400 to-orange-500 rounded-full shadow-lg"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            ></motion.div>
            
            <div className="relative flex justify-between">
              {steps.map((step, index) => {
                const isCompleted = currentStatusIndex >= index;
                const isCurrent = currentStatusIndex === index;
                const Icon = step.icon;
                
                return (
                  <motion.div
                    key={step.key}
                    className="flex flex-col items-center max-w-xs"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.2, duration: 0.8 }}
                  >
                    <div className={`
                      w-12 h-12 rounded-full border-2 flex items-center justify-center mb-3 transition-all duration-500
                      ${isCompleted 
                        ? 'bg-gradient-to-br from-orange-400 to-rose-500 border-transparent text-white shadow-lg' 
                        : 'bg-white border-neutral-300 text-neutral-400'
                      }
                      ${isCurrent ? 'ring-4 ring-orange-200/60 scale-110' : ''}
                    `}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`
                      text-sm font-semibold text-center mb-1 transition-colors duration-300
                      ${isCompleted ? 'text-neutral-800' : 'text-neutral-500'}
                    `}>
                      {step.label}
                    </span>
                    <span className={`
                      text-xs text-center leading-tight transition-colors duration-300
                      ${isCompleted ? 'text-neutral-600' : 'text-neutral-400'}
                    `}>
                      {step.description}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderOrderDetails = () => {
    if (!trackingInfo) return null;

    const statusInfo = trackingService.getStatusInfo(trackingInfo.status);
    const paymentInfo = trackingService.getPaymentStatusInfo(trackingInfo.paymentStatus);

    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.8 }}
        className="space-y-8"
      >
        {/* Elegant Order Status Card */}
        <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-orange-100/50 p-8 overflow-hidden">
          {/* Decorative background */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-50/40 to-rose-50/30"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-200/20 rounded-full blur-2xl"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-start justify-between mb-6">
              <div className="mb-4 md:mb-0">
                <h3 className="text-2xl font-serif font-semibold text-neutral-800 mb-2">Current Status</h3>
                <p className="text-neutral-600 font-light">Last updated: {trackingService.formatDate(trackingInfo.createdAt)}</p>
              </div>
              <div className={`inline-flex items-center px-6 py-3 rounded-2xl text-sm font-semibold backdrop-blur-sm ${statusInfo.bgColor} ${statusInfo.color} border border-white/20`}>
                <span className="mr-2 text-lg">{statusInfo.icon}</span>
                {statusInfo.label}
              </div>
            </div>
            
            <p className="text-neutral-700 text-lg leading-relaxed mb-6">{statusInfo.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {trackingInfo.trackingNumber && (
                <div className="p-4 bg-gradient-to-r from-orange-50/50 to-rose-50/50 rounded-2xl border border-orange-100/50">
                  <div className="flex items-center text-sm">
                    <Hash className="w-5 h-5 text-orange-600 mr-3" />
                    <div>
                      <span className="text-neutral-600 block">Tracking Number</span>
                      <span className="font-mono font-semibold text-neutral-800">{trackingInfo.trackingNumber}</span>
                    </div>
                  </div>
                </div>
              )}

              {trackingInfo.estimatedDelivery && (
                <div className="p-4 bg-gradient-to-r from-rose-50/50 to-orange-50/50 rounded-2xl border border-rose-100/50">
                  <div className="flex items-center text-sm">
                    <Calendar className="w-5 h-5 text-rose-600 mr-3" />
                    <div>
                      <span className="text-neutral-600 block">Estimated Delivery</span>
                      <span className="font-semibold text-neutral-800">
                        {trackingService.formatDate(trackingInfo.estimatedDelivery)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sophisticated Order Summary */}
        <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-orange-100/50 p-8 overflow-hidden">
          {/* Decorative background */}
          <div className="absolute inset-0 bg-gradient-to-br from-rose-50/30 to-orange-50/40"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-orange-200/20 rounded-full blur-2xl"></div>
          
          <div className="relative z-10">
            <h3 className="text-2xl font-serif font-semibold text-neutral-800 mb-8 text-center">Order Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-1">
                <p className="text-sm font-medium text-neutral-500 uppercase tracking-wide">Order Number</p>
                <p className="font-mono text-lg font-semibold text-neutral-800">{trackingInfo.orderNumber}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-neutral-500 uppercase tracking-wide">Total Investment</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-rose-600 bg-clip-text text-transparent">
                  {trackingService.formatCurrency(trackingInfo.total)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-neutral-500 uppercase tracking-wide">Curated Pieces</p>
                <p className="text-lg font-semibold text-neutral-800">
                  {trackingInfo.itemCount} {trackingInfo.itemCount === 1 ? 'Item' : 'Items'}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-neutral-500 uppercase tracking-wide">Payment Status</p>
                <span className={`inline-flex px-4 py-2 rounded-xl text-sm font-semibold ${paymentInfo.bgColor} ${paymentInfo.color}`}>
                  {paymentInfo.label}
                </span>
              </div>
            </div>

            <div className="pt-6 border-t border-gradient-to-r from-orange-200/50 to-rose-200/50">
              <div className="flex items-center justify-center">
                <MapPin className="w-5 h-5 text-orange-600 mr-3" />
                <span className="text-neutral-700 font-medium">
                  Delivering to {trackingInfo.shippingLocation.city}, {trackingInfo.shippingLocation.state}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Elegant Order Items Collection */}
        <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-orange-100/50 p-8 overflow-hidden">
          {/* Decorative background */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-50/30 to-rose-50/40"></div>
          <div className="absolute top-0 left-0 w-32 h-32 bg-orange-200/20 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 right-0 w-24 h-24 bg-rose-200/20 rounded-full blur-xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-center mb-8">
              <Sparkles className="w-6 h-6 text-orange-600 mr-3" />
              <h3 className="text-2xl font-serif font-semibold text-neutral-800">Curated Collection</h3>
            </div>
            
            <div className="space-y-6">
              {trackingInfo.items.map((item, index) => (
                <motion.div 
                  key={index} 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  className="flex items-center space-x-6 p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-orange-100/40 hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="relative">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-xl shadow-md group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-400/10 to-rose-400/10 rounded-xl"></div>
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg text-neutral-800 mb-1 group-hover:text-orange-700 transition-colors duration-300">{item.name}</h4>
                    <p className="text-sm text-neutral-600 font-medium">
                      <span className="text-orange-600">Quantity:</span> {item.quantity}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-xl font-bold bg-gradient-to-r from-orange-600 to-rose-600 bg-clip-text text-transparent">
                      {trackingService.formatCurrency(item.price)}
                    </p>
                    <p className="text-sm text-neutral-500 font-medium">per piece</p>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <div className="mt-8 pt-6 border-t border-gradient-to-r from-orange-200/40 to-rose-200/40">
              <div className="text-center">
                <p className="text-neutral-600 font-light italic">
                  "Every piece in your collection has been carefully selected to elevate your style"
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-rose-50/50 via-orange-50/30 to-white"></div>
      <div className="absolute top-20 left-10 w-96 h-96 bg-orange-300/10 rounded-full blur-3xl"></div>
      <div className="max-sm:hidden absolute bottom-20 right-10 w-80 h-80 bg-rose-400/10 rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-r from-orange-100/20 to-rose-100/20 rounded-full blur-3xl"></div>
      
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-16">
        {/* Elegant Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="inline-flex items-center justify-center mb-6"
          >
            <div className="p-3 bg-gradient-to-br from-orange-100 to-rose-100 rounded-2xl mr-4">
              <Eye className="w-8 h-8 text-orange-600" />
            </div>
            <h1 className="text-5xl md:text-6xl font-serif font-bold bg-gradient-to-r from-neutral-800 to-neutral-600 bg-clip-text text-transparent">
              Track Your Order
            </h1>
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed font-light"
          >
            Follow your luxury pieces on their journey to you. Enter your order number below to experience 
            <span className="text-orange-600 font-medium"> real-time elegance tracking</span>
          </motion.p>
        </motion.div>

        {/* Sophisticated Search Form */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-orange-100/50 p-10 mb-12 overflow-hidden"
        >
          {/* Decorative background */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-50/30 to-rose-50/20"></div>
          <div className="absolute top-0 right-0 w-40 h-40 bg-rose-200/20 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-orange-200/20 rounded-full blur-xl"></div>
          
          <div className="relative z-10">
            <form onSubmit={handleTrackOrder} className="max-w-3xl mx-auto">
              <div className="flex gap-4">
                <input
                  type="text"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
                  placeholder="Enter your order number (e.g., ORD-1234567890-ABC)"
                  className="flex-1 px-6 py-4 h-14 text-lg border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-300 focus:border-orange-400 transition-all duration-300 bg-white text-neutral-800 placeholder-neutral-400"
                  disabled={loading}
                />
                <Button
                  type="submit"
                  disabled={loading || !orderNumber.trim()}
                  className="px-6 py-4 h-14 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 disabled:from-neutral-300 disabled:to-neutral-400 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border-0"
                >
                  {loading ? (
                    <LoadingSpinner className="w-6 h-6" />
                  ) : (
                    <>
                      <Search className="w-6 h-6 mr-2" />
                      Track Order
                    </>
                  )}
                </Button>
              </div>
              
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-5 bg-red-50/80 backdrop-blur-sm border border-red-200/50 rounded-2xl flex items-center"
                >
                  <AlertCircle className="w-6 h-6 text-red-500 mr-4" />
                  <p className="text-red-700 font-medium">{error}</p>
                </motion.div>
              )}
            </form>
          </div>
        </motion.div>

        {/* Tracking Steps */}
        {trackingInfo && renderTrackingSteps()}

        {/* Order Details */}
        {trackingInfo && renderOrderDetails()}

        {/* Elegant Help & Support Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="text-center mt-16"
        >
          <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-orange-100/50 p-10 overflow-hidden">
            {/* Decorative background */}
            <div className="absolute inset-0 bg-gradient-to-br from-rose-50/40 to-orange-50/30"></div>
            <div className="absolute top-0 right-0 w-40 h-40 bg-orange-200/20 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-rose-200/20 rounded-full blur-xl"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-center mb-6">
                <div className="p-3 bg-gradient-to-br from-orange-100 to-rose-100 rounded-2xl mr-4">
                  <Clock className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="text-3xl font-serif font-semibold text-neutral-800">Concierge Support</h3>
              </div>
              
              <p className="text-lg text-neutral-600 mb-8 max-w-2xl mx-auto leading-relaxed font-light">
                Can't locate your order or experiencing tracking concerns? Our dedicated 
                <span className="text-orange-600 font-medium"> luxury support concierge</span> is here to provide personalized assistance.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <a
                  href="/support"
                  className="group inline-flex items-center justify-center px-8 py-4 border-2 border-orange-200 text-neutral-700 rounded-2xl hover:bg-orange-50 hover:border-orange-300 transition-all duration-300 font-semibold backdrop-blur-sm"
                >
                  <span className="mr-2 group-hover:scale-110 transition-transform duration-300">📞</span>
                  Contact Support
                </a>
                <a
                  href="mailto:support@dashngshop.com"
                  className="group inline-flex items-center justify-center px-8 py-4 bg-neutral-800 hover:bg-neutral-900 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
                >
                  <span className="mr-2 group-hover:scale-110 transition-transform duration-300">✉️</span>
                  Email Our Concierge
                </a>
              </div>
              
              <div className="mt-8 pt-6 border-t border-gradient-to-r from-orange-200/40 to-rose-200/40">
                <p className="text-neutral-500 text-sm font-light italic">
                  "Exceptional service is our signature. We're here 24/7 to ensure your luxury experience is flawless."
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TrackOrderPage;