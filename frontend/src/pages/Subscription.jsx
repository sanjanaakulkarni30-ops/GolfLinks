import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import useSubscriptionStore from '../store/subscriptionStore';

// Load Razorpay script
const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        if (window.Razorpay) {
            resolve(true);
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => {
            console.log('Razorpay script loaded successfully');
            resolve(true);
        };
        script.onerror = () => {
            console.error('Failed to load Razorpay script');
            resolve(false);
        };
        document.body.appendChild(script);
    });
};

const Subscription = () => {
    const { user } = useAuthStore();
    const {
        plans,
        currentSubscription,
        isLoading,
        fetchPlans,
        fetchSubscriptionStatus,
        createSubscription,
        cancelSubscription
    } = useSubscriptionStore();

    const navigate = useNavigate();
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        fetchPlans();
        fetchSubscriptionStatus();
        loadRazorpayScript();
    }, [user, navigate, fetchPlans, fetchSubscriptionStatus]);

    const handleSubscribe = async () => {
        if (!selectedPlan) return;

        console.log('Starting subscription process for plan:', selectedPlan);
        setProcessing(true);

        try {
            const result = await createSubscription(selectedPlan);
            console.log('Subscription creation result:', result);

            if (result.success) {
                const { subscriptionId, amount, currency } = result.data;
                console.log('Opening Razorpay with subscription ID:', subscriptionId);

                console.log('Razorpay Key ID:', import.meta.env.VITE_RAZORPAY_KEY_ID);
                const options = {
                    key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                    subscription_id: subscriptionId,
                    name: 'Golf Charity Platform',
                    description: `${selectedPlan.name} Subscription`,
                    image: '/logo.png',
                    handler: async function (response) {
                        console.log('Payment handler called with response:', response);
                        try {
                            // Verify payment on backend using axios
                            const verifyResult = await fetch(`${import.meta.env.VITE_API_URL}/subscription/verify`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                                },
                                body: JSON.stringify({
                                    razorpay_payment_id: response.razorpay_payment_id,
                                    razorpay_subscription_id: response.razorpay_subscription_id,
                                    razorpay_signature: response.razorpay_signature,
                                    plan: selectedPlan.id
                                })
                            });

                            const verifyData = await verifyResult.json();

                            if (verifyResult.ok) {
                                toast.success('Subscription activated successfully!');
                                await fetchSubscriptionStatus(); // Refresh subscription status
                                navigate('/dashboard');
                            } else {
                                toast.error(verifyData.message || 'Payment verification failed');
                            }
                        } catch (error) {
                            console.error('Payment verification error:', error);
                            toast.error('Payment verification failed');
                        }
                    },
                    modal: {
                        ondismiss: function () {
                            toast.error('Payment cancelled');
                            setProcessing(false);
                        }
                    },
                    prefill: {
                        name: `${user.firstName} ${user.lastName}`,
                        email: user.email,
                        contact: '9999999999'
                    },
                    theme: {
                        color: '#2563eb'
                    }
                };

                const razorpay = new window.Razorpay(options);

                razorpay.on('payment.failed', function (response) {
                    console.error('Payment failed:', response.error);
                    toast.error(`Payment failed: ${response.error.description}`);
                    setProcessing(false);
                });

                razorpay.open();
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error('Failed to create subscription');
        } finally {
            setProcessing(false);
        }
    };

    const handleCancelSubscription = async () => {
        if (!confirm('Are you sure you want to cancel your subscription?')) return;

        const result = await cancelSubscription();
        if (result.success) {
            toast.success('Subscription canceled successfully');
            fetchSubscriptionStatus();
        } else {
            toast.error('Failed to cancel subscription');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Choose Your Plan
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Join our community and start playing golf for good causes while winning amazing prizes.
                    </p>
                </div>

                {currentSubscription ? (
                    <div className="max-w-2xl mx-auto">
                        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8 text-center mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                Current Subscription
                            </h2>
                            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                                <div className="text-lg font-semibold text-green-800 mb-2">
                                    {currentSubscription.plan === 'monthly' ? 'Monthly Plan' : 'Yearly Plan'}
                                </div>
                                <div className="text-3xl font-bold text-green-600 mb-2">
                                    ₹{currentSubscription.amount / 100}/{currentSubscription.plan === 'monthly' ? 'month' : 'year'}
                                </div>
                                <div className="text-sm text-green-700">
                                    Status: {currentSubscription.isActive ? 'Active' : 'Inactive'}
                                </div>
                                <div className="text-sm text-green-700">
                                    Next billing: {new Date(currentSubscription.currentPeriodEnd).toLocaleDateString()}
                                </div>
                                {currentSubscription.cancelAtPeriodEnd && (
                                    <div className="text-sm text-orange-700 mt-2">
                                        Will be canceled at the end of current period
                                    </div>
                                )}
                            </div>

                            {!currentSubscription.cancelAtPeriodEnd && (
                                <button
                                    onClick={handleCancelSubscription}
                                    className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                                >
                                    Cancel Subscription
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
                            {plans.map((plan) => (
                                <div
                                    key={plan.id}
                                    className={`bg-white rounded-lg shadow-md border border-gray-200 p-8 cursor-pointer transition-all duration-200 ${selectedPlan?.id === plan.id
                                        ? 'ring-2 ring-blue-500 border-blue-500'
                                        : 'hover:shadow-lg'
                                        } ${plan.id === 'yearly' ? 'relative' : ''}`}
                                    onClick={() => setSelectedPlan(plan)}
                                >
                                    {plan.id === 'yearly' && (
                                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                            <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                                                Best Value
                                            </span>
                                        </div>
                                    )}

                                    <div className="text-center mb-6">
                                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                            {plan.name}
                                        </h3>
                                        <div className="text-4xl font-bold text-blue-600 mb-2">
                                            ₹{plan.price}
                                        </div>
                                        <div className="text-gray-600">
                                            per {plan.interval}
                                        </div>
                                        {plan.savings && (
                                            <div className="text-green-600 font-medium mt-2">
                                                Save ₹{plan.savings} per year
                                            </div>
                                        )}
                                    </div>

                                    <ul className="space-y-3 mb-6">
                                        {plan.features.map((feature, index) => (
                                            <li key={index} className="flex items-center">
                                                <Check className="text-green-500 mr-3" size={16} />
                                                <span className="text-gray-700">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <div className="text-center">
                                        <div className={`w-6 h-6 rounded-full border-2 mx-auto transition-colors duration-200 ${selectedPlan?.id === plan.id
                                            ? 'bg-blue-500 border-blue-500'
                                            : 'border-gray-300'
                                            }`}>
                                            {selectedPlan?.id === plan.id && (
                                                <Check className="text-white" size={16} />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {selectedPlan && (
                            <div className="max-w-md mx-auto">
                                <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                                        Payment Details
                                    </h3>

                                    <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium">{selectedPlan.name}</span>
                                            <span className="font-bold">₹{selectedPlan.price}</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleSubscribe}
                                        disabled={processing}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                    >
                                        {processing ? (
                                            'Processing...'
                                        ) : (
                                            <>
                                                <CreditCard size={16} className="mr-2" />
                                                Subscribe with Razorpay
                                            </>
                                        )}
                                    </button>

                                    <p className="text-xs text-gray-500 text-center mt-4">
                                        Secure payment powered by Razorpay. You can cancel anytime.
                                    </p>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Subscription;