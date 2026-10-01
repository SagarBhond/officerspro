import React, { useState, useEffect } from 'react';
import DefaultLayout from '../../layout/DefaultLayout';
import axios from 'axios';
import { useOfficer } from '../../components/Header/OfficerContext';

// Get API URL from environment variable
const SUBSCRIPTION_API = import.meta.env.VITE_SUBSCRIPTION_API;

interface PaymentTransaction {
  id: number;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  amount: number;
  currency: string;
  status: string;
  planType: string;
  createdAt: string;
}

interface Officer {
  officerId: string;
  [key: string]: any;
}

interface Props {
  handleLogout?: () => void;
}

const PaymentHistory: React.FC<Props> = ({ handleLogout }) => {
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { officer } = useOfficer() as { officer: Officer };

  useEffect(() => {
    fetchPaymentHistory();
  }, []);

  const fetchPaymentHistory = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('token');
      const headers: any = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      // Primary: fetch by email (since this is what works reliably)
      const officerEmail = localStorage.getItem('officerEmail');
      if (officerEmail) {
        try {
          console.log('Fetching payment history by email:', officerEmail);
          const response = await axios.get(
            `${SUBSCRIPTION_API}/api/payment-history/officer/email/${encodeURIComponent(
              officerEmail,
            )}`,
            { headers },
          );
          console.log('Payment history response:', response.data);
          if (response.data && Array.isArray(response.data)) {
            setTransactions(response.data);
            if (response.data.length === 0) {
              console.log('No transactions found for email:', officerEmail);
            }
            return;
          }
        } catch (err: any) {
          console.error('Failed to fetch payment history by email:', err);
          console.error('Error details:', err.response?.data || err.message);

          // Fallback: try by officerId if email fails
          if (officer.officerId) {
            try {
              console.log('Trying to fetch by officerId:', officer.officerId);
              const response = await axios.get(
                `${SUBSCRIPTION_API}/api/payment-history/officer/${officer.officerId}`,
                { headers },
              );
              if (response.data && Array.isArray(response.data)) {
                setTransactions(response.data);
                return;
              }
            } catch (err2: any) {
              console.error('Failed to fetch by officerId as well:', err2);
            }
          }

          setError('Failed to fetch payment history. Please try again.');
        }
      } else {
        // If no email, try by officerId
        if (officer.officerId) {
          try {
            console.log(
              'No email found, trying by officerId:',
              officer.officerId,
            );
            const response = await axios.get(
              `${SUBSCRIPTION_API}/api/payment-history/officer/${officer.officerId}`,
              { headers },
            );
            if (response.data && Array.isArray(response.data)) {
              setTransactions(response.data);
              return;
            }
          } catch (err: any) {
            console.error('Failed to fetch by officerId:', err);
            setError('Failed to fetch payment history. Please try again.');
          }
        } else {
          setError('Officer information not found. Please log in again.');
        }
      }
    } catch (err) {
      console.error('Unexpected error fetching payment history:', err);
      setError('Failed to fetch payment history. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'PAID':
        return 'text-green-600 bg-green-100 border-green-200';
      case 'FAILED':
        return 'text-red-600 bg-red-100 border-red-200';
      case 'CREATED':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPlanDisplayName = (planType: string): string => {
    if (!planType) return 'No Plan';
    return planType.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const getPlanDuration = (planType: string): string => {
    switch (planType?.toUpperCase()) {
      case 'ONE_MONTH':
        return '30 days';
      case 'THREE_MONTHS':
        return '90 days';
      case 'SIX_MONTHS':
        return '180 days';
      case 'TWELVE_MONTHS':
        return '365 days';
      case 'FREE':
        return 'Unlimited';
      default:
        return 'N/A';
    }
  };

  if (loading) {
    return (
      <DefaultLayout handleLogout={handleLogout ?? (() => {})}>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">
            Loading payment history...
          </div>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout handleLogout={handleLogout ?? (() => {})}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900">
              Payment History
            </h1>
            <p className="mt-2 text-sm text-gray-700">
              View all your subscription payment transactions
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {transactions.length === 0 ? (
          <div className="mt-8 text-center">
            <div className="text-gray-500 text-lg">
              No payment transactions found
            </div>
            <p className="text-gray-400 mt-2">
              Your payment history will appear here once you make a subscription
              payment.
            </p>
          </div>
        ) : (
          <div className="mt-8 flow-root">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Plan Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((transaction) => (
                    <tr
                      key={transaction.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 font-mono">
                        {transaction.razorpayOrderId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {getPlanDisplayName(transaction.planType)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {transaction.planType}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getPlanDuration(transaction.planType)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          ₹{transaction.amount.toLocaleString('en-IN')}{' '}
                          {transaction.currency}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold leading-5 border ${getStatusColor(
                            transaction.status,
                          )}`}
                        >
                          {transaction.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(transaction.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DefaultLayout>
  );
};

export default PaymentHistory;
