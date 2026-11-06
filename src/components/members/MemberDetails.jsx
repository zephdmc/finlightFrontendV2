import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import LoadingSpinner from '../common/LoadingSpinner';
import {
  User, Mail, Calendar, Shield, CreditCard, CheckCircle,
  XCircle, ArrowLeft, DollarSign, Clock, FileText, Lock
} from 'lucide-react';

const MemberDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, isAdmin, loading: authLoading } = useAuth();
  const [member, setMember] = useState(null);
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [accessDenied, setAccessDenied] = useState(false);

  // ============================================================
  // HELPERS
  // ============================================================

  // Get user ID (works with both _id and id)
  const getUserId = (user) => user?._id || user?.id;

  // ⭐ Get penalty amount for a payment
  const getPaymentPenalty = (payment) => {
    if (!payment) return 0;
    let penalty = 0;
    if (payment.penaltyBreakdown && Array.isArray(payment.penaltyBreakdown)) {
      payment.penaltyBreakdown.forEach(item => {
        if (item.penalty && item.isLate) penalty += item.penalty;
      });
    }
    if (penalty === 0 && payment.penaltyAmount > 0) {
      penalty = payment.penaltyAmount;
    }
    return penalty;
  };

  // ⭐ Get the payment type display name (prefers the `name` field, falls back to type)
  const getPaymentTypeName = (payment) => {
    if (!payment) return 'Payment';

    // Prefer `name` field (e.g., "Cast")
    if (payment.name && typeof payment.name === 'string' && payment.name.trim()) {
      return payment.name;
    }

    // Try populated paymentTypeId.name
    if (payment.paymentTypeId?.name) {
      return payment.paymentTypeId.name;
    }

    // Try paymentType
    if (payment.paymentType) {
      return payment.paymentType;
    }

    // Fallback to type
    if (payment.type) {
      return payment.type;
    }

    return 'Payment';
  };

  // ⭐ Get the payment type category (e.g., "leavy", "dues") for secondary display
  const getPaymentTypeCategory = (payment) => {
    if (!payment) return '';
    return payment.type || '';
  };

  // ⭐ Get total (base + penalty) for fully paid payments
  const getPaymentTotal = (payment) => {
    if (!payment) return 0;
    const base = payment.amount || 0;
    return base + getPaymentPenalty(payment);
  };

  // ⭐ Get ACTUAL amount paid (handles partial payments)
  const getPaymentPaidAmount = (payment) => {
    if (!payment) return 0;

    const status = (payment?.status || '').toLowerCase();

    // Fully paid → total (base + penalty)
    if (status === 'paid') {
      return getPaymentTotal(payment);
    }

    // Partial → net received so far (fallback to gross paid)
    if (status === 'partial' || payment?.isPartial === true) {
      if (payment.totalNetReceivedSoFar > 0) {
        return payment.totalNetReceivedSoFar;
      }
      if (payment.totalPaidSoFar > 0) {
        return payment.totalPaidSoFar;
      }
      if (Array.isArray(payment.partialPayments)) {
        return payment.partialPayments.reduce(
          (sum, pp) => sum + (pp.netToOrg || pp.amount || 0),
          0
        );
      }
    }

    return 0;
  };

  // ⭐ Get remaining amount owed on a payment
  const getPaymentRemaining = (payment) => {
    if (!payment) return 0;

    const status = (payment?.status || '').toLowerCase();

    // Paid → nothing remaining
    if (status === 'paid') return 0;

    // Partial → remaining amount
    if (status === 'partial' || payment?.isPartial === true) {
      return payment.remainingAmount || 0;
    }

    // Unpaid / pending → full amount + penalty
    return (payment.amount || 0) + getPaymentPenalty(payment);
  };

  // ============================================================
  // EFFECTS
  // ============================================================

  useEffect(() => {
    if (authLoading) return;
    if (!currentUser) {
      navigate('/login');
      return;
    }

    const currentUserId = getUserId(currentUser);
    const isOwnProfile = currentUserId === id;

    if (!isAdmin && !isOwnProfile) {
      setAccessDenied(true);
      setLoading(false);
      toast.error("You don't have permission to view this member's details");
      return;
    }

    fetchMemberDetails();
  }, [id, currentUser, isAdmin, authLoading, navigate]);

  const fetchMemberDetails = async () => {
    setLoading(true);
    try {
      const [memberRes, paymentsRes] = await Promise.all([
        api.get(`/users/${id}`),
        api.get(`/users/${id}/transactions`)
      ]);

      setMember(memberRes.data.data.user || memberRes.data.data);
      setPayments(paymentsRes.data.data.payments || []);
      setSummary(paymentsRes.data.data.summary);
    } catch (error) {
      console.error('Error fetching member details:', error);
      toast.error('Failed to load member details');
      if (isAdmin) navigate('/members');
      else navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyRegistration = async () => {
    try {
      await api.post(`/users/${id}/verify-registration`);
      toast.success('Registration verified successfully');
      fetchMemberDetails();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to verify registration');
    }
  };

  // ============================================================
  // STATUS BADGE
  // ============================================================

  const getPaymentStatusBadge = (status) => {
    if (status === 'paid') {
      return (
        <span className="flex items-center text-blue-600">
          <CheckCircle className="h-4 w-4 mr-1" /> Paid
        </span>
      );
    }
    if (status === 'partial') {
      return (
        <span className="flex items-center text-yellow-600">
          <Clock className="h-4 w-4 mr-1" /> Partial
        </span>
      );
    }
    return (
      <span className="flex items-center text-red-600">
        <XCircle className="h-4 w-4 mr-1" /> Unpaid
      </span>
    );
  };

  // ============================================================
  // LOADING / ACCESS STATES
  // ============================================================

  if (authLoading || loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="flex justify-center mb-4">
          <Lock className="h-16 w-16 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
        <p className="text-gray-600 mb-6">
          You don't have permission to view this member's details.
        </p>
        <button
          onClick={() => navigate(isAdmin ? '/members' : '/dashboard')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Member not found</p>
        <Link
          to={isAdmin ? '/members' : '/dashboard'}
          className="text-blue-600 hover:text-blue-800 mt-2 inline-block"
        >
          Go Back
        </Link>
      </div>
    );
  }

  // ============================================================
  // COMPUTED DATA
  // ============================================================

  const currentUserId = getUserId(currentUser);
  const memberId = getUserId(member);
  const isOwnProfile = currentUserId === memberId;

  // ⭐ Payments to DISPLAY (paid + partial, excludes unpaid/pending)
  const displayPayments = payments.filter(p => {
    const status = (p?.status || '').toLowerCase();
    return status === 'paid' || status === 'partial';
  });

  // ⭐ Payments for OUTSTANDING (partial remaining + unpaid/pending)
  const outstandingPayments = payments.filter(p => {
    const status = (p?.status || '').toLowerCase();
    const isPartial = p?.isPartial === true || status === 'partial';
    const isUnpaid = status === 'unpaid' || status === 'pending';
    return isPartial || isUnpaid;
  });

  // ⭐ Totals
  const totalPaidAmount = displayPayments.reduce(
    (sum, p) => sum + getPaymentPaidAmount(p),
    0
  );

  const totalOutstandingAmount = outstandingPayments.reduce(
    (sum, p) => sum + getPaymentRemaining(p),
    0
  );

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(isAdmin ? '/members' : '/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{member.name}</h1>
              <p className="text-xs text-gray-600">{member.email}</p>
              {isOwnProfile && (
                <span className="inline-block mt-1 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  Your Profile
                </span>
              )}
            </div>
          </div>
          <div className="flex space-x-3">
            {isAdmin && (
              <Link
                to={`/members/edit/${memberId}`}
                className="px-4 py-2 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700"
              >
                Edit Profile
              </Link>
            )}
            {isAdmin && member.role === 'member' && !member.hasPaidRegistration && (
              <button
                onClick={handleVerifyRegistration}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Verify Registration
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'overview'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            Overview
          </button>
          {(isAdmin || isOwnProfile) && (
            <button
              onClick={() => setActiveTab('payments')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'payments'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              Payment History
            </button>
          )}
        </nav>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow p-6">
        {/* ==================== OVERVIEW TAB ==================== */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Member Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Member Information</h3>
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="text-xs font-medium">{member.name}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Email Address</p>
                    <p className="text-xs font-medium">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Shield className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Role</p>
                    <p className="text-xs font-medium capitalize">{member.role}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Member Since</p>
                    <p className="text-xs font-medium">
                      {new Date(member.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Summary */}
              {(isAdmin || isOwnProfile) && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Payment Summary</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Registration Status</span>
                      {member.hasPaidRegistration ? (
                        <span className="flex items-center text-xs text-blue-600">
                          <CheckCircle className="h-4 w-4 mr-1" /> Paid
                        </span>
                      ) : (
                        <span className="flex items-center text-xs text-yellow-600">
                          <Clock className="h-4 w-4 mr-1" /> Pending
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Total Paid</span>
                      <span className="text-xs font-semibold text-blue-600">
                        ₦{totalPaidAmount.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Total Payments</span>
                      <span className="text-xs font-semibold">{displayPayments.length}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Non-admin viewing another member */}
              {!isAdmin && !isOwnProfile && (
                <div className="space-y-4">
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">
                      <strong>Limited Access:</strong> You can only view basic member information.
                      Payment details are private.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Recent Payments */}
            {(isAdmin || isOwnProfile) && displayPayments.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Payments</h3>
                <div className="space-y-3">
                  {displayPayments.slice(0, 5).map(payment => {
                    const status = (payment?.status || '').toLowerCase();
                    const isPartial = status === 'partial' || payment?.isPartial === true;
                    const paidAmount = getPaymentPaidAmount(payment);
                    const penalty = getPaymentPenalty(payment);
                    const remaining = getPaymentRemaining(payment);

                    return (
                      <div
                        key={payment._id}
                        className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-xs">
                            <span className="text-gray-800">
                              {getPaymentTypeName(payment)}
                            </span>
                            {getPaymentTypeCategory(payment) && (
                              <span className="ml-2 text-xs text-gray-400 capitalize">
                                ({getPaymentTypeCategory(payment)})
                              </span>
                            )}
                            {isPartial && (
                              <span className="ml-2 text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full">
                                Partial
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-gray-500">
                            {payment.paidAt
                              ? new Date(payment.paidAt).toLocaleDateString()
                              : payment.updatedAt
                                ? new Date(payment.updatedAt).toLocaleDateString()
                                : 'Not paid'}
                            {penalty > 0 && (
                              <span className="ml-2 text-xs bg-gray-100 text-gray-100 px-1.5 py-0.5 rounded-full">
                                +₦{penalty.toLocaleString()} penalty
                              </span>
                            )}
                            {isPartial && remaining > 0 && (
                              <span className="ml-2 text-xs text-orange-600">
                                ₦{remaining.toLocaleString()} remaining
                              </span>
                            )}
                          </p>
                        </div>
                        <div className="text-right text-xs">
                          <p className="font-semibold text-blue-600">
                            ₦{paidAmount.toLocaleString()}
                          </p>
                          {getPaymentStatusBadge(payment.status)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== PAYMENTS TAB ==================== */}
        {activeTab === 'payments' && (isAdmin || isOwnProfile) && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Payment History</h3>
            </div>

            {displayPayments.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No payment records found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Amount Paid
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Remaining
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Due Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Paid Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {displayPayments.map(payment => {
                      const status = (payment?.status || '').toLowerCase();
                      const isPartial = status === 'partial' || payment?.isPartial === true;
                      const paidAmount = getPaymentPaidAmount(payment);
                      const penalty = getPaymentPenalty(payment);
                      const remaining = getPaymentRemaining(payment);

                      return (
                        <tr key={payment._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="capitalize">{payment.type}</span>
                            {penalty > 0 && (
                              <span className="ml-2 text-xs bg-gray-100 text-red-700 px-1.5 py-0.5 rounded-full">
                                +₦{penalty.toLocaleString()}
                              </span>
                            )}
                            {isPartial && (
                              <span className="ml-2 text-xs bg-gray-50 text-yellow-700 px-1.5 py-0.5 rounded-full">
                                Partial
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap font-medium text-blue-600">
                            ₦{paidAmount.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-100">
                            {remaining > 0 ? `₦${remaining.toLocaleString()}` : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {payment.dueDate
                              ? new Date(payment.dueDate).toLocaleDateString()
                              : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getPaymentStatusBadge(payment.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {payment.paidAt
                              ? new Date(payment.paidAt).toLocaleDateString()
                              : payment.updatedAt
                                ? new Date(payment.updatedAt).toLocaleDateString()
                                : '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ==================== PAYMENTS TAB — ACCESS DENIED ==================== */}
        {activeTab === 'payments' && !isAdmin && !isOwnProfile && (
          <div className="text-center py-8">
            <Lock className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">You don't have permission to view payment details.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberDetails;