import React, { useState, useEffect } from "react";
import DefaultLayout from "../../layout/DefaultLayout";
import axios from "axios";

// Get API URL from environment variable
const SUBSCRIPTION_API = import.meta.env.VITE_SUBSCRIPTION_API;

// Razorpay type declaration
declare global {
  interface Window {
    Razorpay: any;
  }
}

interface Plan {
  id?: number;
  name: string;
  price: number;
  duration: string;
  durationDays?: number;
  features: string[];
}

interface CurrentSubscription {
  currentPlan: string;
  startDate?: string;
  endDate?: string;
  remainingDays?: number;
  isValid?: boolean;
  hasUpcomingPlan?: boolean;
  upcomingPlan?: string;
  upcomingPlanActivationDate?: string;
}

interface Props {
  handleLogout?: () => void;
}

const SubscriptionPlans: React.FC<Props> = ({ handleLogout }) => {
  const [loading, setLoading] = useState(false);
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  const [currentSubscription, setCurrentSubscription] = useState<CurrentSubscription | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);

  useEffect(() => {
    // Fetch plans from backend
    setPlansLoading(true);
    axios.get("http://localhost:8081/api/public/plans")
      .then(res => setPlans(res.data))
      .catch(() => setPlans([]))
      .finally(() => setPlansLoading(false));
  }, []);

  useEffect(() => {
    const fetchCurrentPlan = async () => {
      try {
        // Get email from localStorage - check both 'officerEmail' and 'officer' object
        let email = localStorage.getItem("officerEmail");
        if (!email) {
          const officerStr = localStorage.getItem("officer");
          if (officerStr) {
            try {
              const officer = JSON.parse(officerStr);
              email = officer.email;
              if (email) {
                localStorage.setItem("officerEmail", email); // Store for future use
              }
            } catch (e) {
              console.error("Failed to parse officer data:", e);
            }
          }
        }
        if (!email) return;
        const token = localStorage.getItem("token");
        const headers: any = {};
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }
        const statusRes = await axios.get(
          `${SUBSCRIPTION_API}/api/subscriptions/status?email=${encodeURIComponent(email)}`,
          { headers }
        );
        setCurrentSubscription(statusRes.data);
      } catch (err) {
        console.error("Failed to fetch subscription status:", err);
      }
    };
    fetchCurrentPlan();
  }, []);

  const handleUpgradeClick = async (planType: string) => {
    // Get email from localStorage - check both 'officerEmail' and 'officer' object
    let email = localStorage.getItem("officerEmail");
    if (!email) {
      const officerStr = localStorage.getItem("officer");
      if (officerStr) {
        try {
          const officer = JSON.parse(officerStr);
          email = officer.email;
          if (email) {
            localStorage.setItem("officerEmail", email); // Store for future use
          }
        } catch (e) {
          console.error("Failed to parse officer data:", e);
        }
      }
    }
    
    if (!email) {
      setError("User email not found. Please log in again.");
      return;
    }

    setLoading(true);
    setProcessingPlan(planType);
    setError("");
    setSuccess("");

    try {
      // Get officer name from localStorage
      const officerStr = localStorage.getItem("officer");
      let officerName = null;
      if (officerStr) {
        try {
          const officer = JSON.parse(officerStr);
          if (officer.firstName && officer.lastName) {
            officerName = `${officer.firstName} ${officer.lastName}`;
          } else if (officer.firstName) {
            officerName = officer.firstName;
          }
        } catch (e) {
          console.error("Failed to parse officer data:", e);
        }
      }
      
      const token = localStorage.getItem("token");
      const headers: any = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      // Build URL with optional officerName
      let url = `${SUBSCRIPTION_API}/api/payments/create-subscription-order?email=${encodeURIComponent(email)}&planType=${planType}`;
      if (officerName) {
        url += `&officerName=${encodeURIComponent(officerName)}`;
      }
      
      const res = await axios.post(url, {}, { headers });

      const { orderId, amount } = res.data;

      const options = {
        key: "rzp_test_EsHwLQL04BIQh4",
        amount,
        currency: "INR",
        name: "Crime Management System",
        description: `Subscription for ${planType}`,
        order_id: orderId,
        handler: async (paymentResponse: any) => {
          await verifyPayment(paymentResponse);
        },
        prefill: { email },
        theme: { color: "#3399cc" },
        modal: {
          ondismiss: () => {
            setLoading(false);
            setProcessingPlan(null);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    // } catch (err) {
    //   setError("Payment initiation failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const verifyPayment = async (paymentResponse: any) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const headers: any = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      const verifyRes = await axios.post(
        `${SUBSCRIPTION_API}/api/payments/verify-subscription`,
        {
          razorpay_order_id: paymentResponse.razorpay_order_id,
          razorpay_payment_id: paymentResponse.razorpay_payment_id,
          razorpay_signature: paymentResponse.razorpay_signature
        },
        { headers }
      );

      if (verifyRes.data.status === "success") {
        setSuccess("Payment successful! Your subscription has been activated.");
        setShowSuccessModal(true);
        
        // Refresh subscription data with retry logic
        let email = localStorage.getItem("officerEmail");
        if (!email) {
          const officerStr = localStorage.getItem("officer");
          if (officerStr) {
            try {
              const officer = JSON.parse(officerStr);
              email = officer.email;
              if (email) {
                localStorage.setItem("officerEmail", email);
              }
            } catch (e) {
              console.error("Failed to parse officer data:", e);
            }
          }
        }
        
        if (email) {
          // Wait a bit for backend to fully process
          await new Promise(resolve => setTimeout(resolve, 500));
          
          try {
            const token = localStorage.getItem("token");
            const headers: any = {};
            if (token) {
              headers.Authorization = `Bearer ${token}`;
            }
            const statusRes = await axios.get(
              `${SUBSCRIPTION_API}/api/subscriptions/status?email=${encodeURIComponent(email)}`,
              { headers }
            );
            setCurrentSubscription(statusRes.data);
          } catch (statusErr: any) {
            console.error("Failed to fetch updated status (will retry on page refresh):", statusErr);
            // Don't show error to user - payment was successful
          }
        }
      } else {
        const errorMsg = verifyRes.data?.message || "Payment verification failed. Please contact support.";
        setError(errorMsg);
        console.error("Payment verification failed:", verifyRes.data);
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || "Verification failed. Please contact support.";
      setError(errorMsg);
      console.error("Payment verification error:", err);
    } finally {
      setLoading(false);
      setProcessingPlan(null);
    }
  };

  const closeSuccessModal = () => {
    setShowSuccessModal(false);
    setSuccess("");
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (remainingDays: number): string => {
    if (remainingDays <= 0) return 'text-red-600 bg-red-100';
    if (remainingDays <= 7) return 'text-orange-600 bg-orange-100';
    if (remainingDays <= 30) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const getStatusText = (remainingDays: number): string => {
    if (remainingDays <= 0) return 'Expired';
    if (remainingDays <= 7) return 'Expiring Soon';
    if (remainingDays <= 30) return 'Valid';
    return 'Active';
  };

  const getPlanDisplayName = (planType: string): string => {
    if (!planType) return 'No Plan';
    return planType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <DefaultLayout handleLogout={handleLogout ?? (() => {})}>
      <h2 className="text-3xl font-bold text-center mb-4">Subscription Plans</h2>

      {currentSubscription && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 text-blue-900 p-6 rounded-lg mb-6">
          <div className="text-center">
            <h3 className="text-xl font-bold mb-4">Current Subscription Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="text-sm text-gray-600 mb-1">Current Plan</p>
                <p className="text-lg font-semibold text-blue-800">
                  {getPlanDisplayName(currentSubscription.currentPlan)}
                </p>
              </div>
              
              {currentSubscription.startDate && (
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="text-sm text-gray-600 mb-1">Start Date</p>
                  <p className="text-lg font-semibold text-blue-800">
                    {formatDate(currentSubscription.startDate)}
                  </p>
                </div>
              )}
              
              {currentSubscription.endDate && (
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="text-sm text-gray-600 mb-1">Valid Until</p>
                  <p className="text-lg font-semibold text-blue-800">
                    {formatDate(currentSubscription.endDate)}
                  </p>
                </div>
              )}
            </div>
            
            <div className="mt-4 flex justify-center gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="text-sm text-gray-600 mb-1">Remaining Days</p>
                <div className="flex items-center gap-2">
                  <span className={`text-2xl font-bold ${getStatusColor(currentSubscription.remainingDays || 0)}`}>
                    {currentSubscription.remainingDays || 0} days
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(currentSubscription.remainingDays || 0)}`}>
                    {getStatusText(currentSubscription.remainingDays || 0)}
                  </span>
                </div>
              </div>
              
              {/* Show upcoming plan if exists */}
              {currentSubscription.hasUpcomingPlan && currentSubscription.upcomingPlan && (
                <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-4 rounded-lg shadow-sm border-2 border-purple-300">
                  <p className="text-sm text-purple-600 font-semibold mb-1 flex items-center gap-1">
                    <span>🔔</span> Upcoming Plan
                  </p>
                  <p className="text-lg font-bold text-purple-800 mb-1">
                    {getPlanDisplayName(currentSubscription.upcomingPlan)}
                  </p>
                  <p className="text-xs text-purple-600">
                    Activates on {currentSubscription.upcomingPlanActivationDate ? formatDate(currentSubscription.upcomingPlanActivationDate) : 'N/A'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 text-center">
          <div className="flex items-center justify-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6 text-center">
          <div className="flex items-center justify-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {success}
          </div>
        </div>
      )}

      {plansLoading ? (
        <div className="flex justify-center items-center h-32">
          <div className="text-lg text-gray-600">Loading plans...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {plans.map((plan, i) => {
            const isCurrent = currentSubscription?.currentPlan === plan.duration;
            const planDisplayName = getPlanDisplayName(plan.duration);
            
            return (
              <div key={plan.id || i} className="bg-white p-6 rounded-xl shadow-lg flex flex-col items-center border border-gray-200 hover:shadow-xl transition-shadow">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-2 px-4 rounded-full mb-4 font-bold">
                  ₹{plan.price}
                </div>
                <h3 className="text-lg font-semibold mb-2 text-center">{plan.name}</h3>
                <p className="text-sm text-gray-500 mb-4 text-center">{planDisplayName}</p>
                <ul className="text-gray-600 text-sm mb-4 text-left w-full">
                  {plan.features && plan.features.map((feature, idx) => (
                    <li key={idx} className="mb-1">• {feature}</li>
                  ))}
                </ul>
                <button
                  onClick={() => handleUpgradeClick(plan.duration)}
                  disabled={loading || isCurrent || processingPlan === plan.duration}
                  className={`w-full py-3 rounded-full font-medium text-white transition-colors ${
                    isCurrent
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
                  }`}
                >
                  {processingPlan === plan.duration
                    ? "Processing..."
                    : isCurrent
                    ? "Current Plan"
                    : "Upgrade"}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Payment Successful!</h3>
              <p className="text-sm text-gray-500 mb-6">
                Your subscription has been activated successfully. You can now enjoy all the features of your new plan.
              </p>
              <button
                onClick={closeSuccessModal}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </DefaultLayout>
  );
};

export default SubscriptionPlans;
