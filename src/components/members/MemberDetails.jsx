// import { useEffect, useState } from 'react';
// import { useParams, useNavigate, Link } from 'react-router-dom';
// import api from '../../services/api';
// import { useAuth } from '../../context/AuthContext';
// import toast from 'react-hot-toast';
// import LoadingSpinner from '../common/LoadingSpinner';
// import {
//   User, Mail, Calendar, Shield, CreditCard, CheckCircle,
//   XCircle, ArrowLeft, DollarSign, Clock, FileText, Lock
// } from 'lucide-react';

// /**
//  * Member Details Component
//  * Displays detailed information about a specific member
//  * Accessible by:
//  * - Admins (can view any member)
//  * - Members (can only view their own details)
//  */
// const MemberDetails = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const { user: currentUser, isAdmin } = useAuth();
//   const [member, setMember] = useState(null);
//   const [payments, setPayments] = useState([]);
//   const [summary, setSummary] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [activeTab, setActiveTab] = useState('overview');
//   const [accessDenied, setAccessDenied] = useState(false);

//   useEffect(() => {
//     // Check if user has permission to view this member
//     if (!currentUser) return;
    
//     // Allow access if:
//     // 1. User is admin, OR
//     // 2. User is viewing their own profile
//     if (!isAdmin && currentUser._id !== id) {
//       setAccessDenied(true);
//       setLoading(false);
//       toast.error("You don't have permission to view this member's details");
//       return;
//     }
    
//     fetchMemberDetails();
//   }, [id, currentUser, isAdmin]);

//   const fetchMemberDetails = async () => {
//     setLoading(true);
//     try {
//       const [memberRes, paymentsRes] = await Promise.all([
//         api.get(`/users/${id}`),
//         api.get(`/users/${id}/transactions`)
//       ]);
      
//       setMember(memberRes.data.data.user || memberRes.data.data);
//       setPayments(paymentsRes.data.data.payments || []);
//       setSummary(paymentsRes.data.data.summary);
//     } catch (error) {
//       toast.error('Failed to load member details');
//       if (isAdmin) {
//         navigate('/members');
//       } else {
//         navigate('/dashboard');
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleVerifyRegistration = async () => {
//     try {
//       await api.post(`/users/${id}/verify-registration`);
//       toast.success('Registration verified successfully');
//       fetchMemberDetails();
//     } catch (error) {
//       toast.error(error.response?.data?.message || 'Failed to verify registration');
//     }
//   };

//   const getPaymentStatusBadge = (status) => {
//     if (status === 'paid') {
//       return <span className="flex items-center text-green-600"><CheckCircle className="h-4 w-4 mr-1" /> Paid</span>;
//     }
//     return <span className="flex items-center text-red-600"><XCircle className="h-4 w-4 mr-1" /> Unpaid</span>;
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center py-12">
//         <LoadingSpinner size="lg" />
//       </div>
//     );
//   }

//   if (accessDenied) {
//     return (
//       <div className="bg-white rounded-lg shadow p-8 text-center">
//         <div className="flex justify-center mb-4">
//           <Lock className="h-16 w-16 text-red-500" />
//         </div>
//         <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
//         <p className="text-gray-600 mb-6">
//           You don't have permission to view this member's details.
//         </p>
//         <button
//           onClick={() => navigate(isAdmin ? '/members' : '/dashboard')}
//           className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//         >
//           Go Back
//         </button>
//       </div>
//     );
//   }

//   if (!member) {
//     return (
//       <div className="text-center py-12">
//         <p className="text-gray-500">Member not found</p>
//         <Link to={isAdmin ? "/members" : "/dashboard"} className="text-blue-600 hover:text-blue-800 mt-2 inline-block">
//           Go Back
//         </Link>
//       </div>
//     );
//   }

//   // Check if current user is viewing their own profile
//   const isOwnProfile = currentUser?._id === member._id;

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="bg-white rounded-lg shadow p-6">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center space-x-4">
//             <button
//               onClick={() => navigate(isAdmin ? '/members' : '/dashboard')}
//               className="p-2 hover:bg-gray-100 rounded-lg transition"
//             >
//               <ArrowLeft className="h-5 w-5 text-gray-600" />
//             </button>
//             <div>
//               <h1 className="text-2xl font-bold text-gray-800">{member.name}</h1>
//               <p className="text-gray-600">{member.email}</p>
//               {isOwnProfile && (
//                 <span className="inline-block mt-1 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
//                   Your Profile
//                 </span>
//               )}
//             </div>
//           </div>
//           <div className="flex space-x-3">
//             {/* Show edit button for admins OR users editing their own profile */}
//             {(isAdmin || isOwnProfile) && (
//               <Link
//                 to={`/members/edit/${member._id}`}
//                 className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
//               >
//                 Edit Profile
//               </Link>
//             )}
//             {/* Show verify button only for admins on member accounts that aren't verified */}
//             {isAdmin && member.role === 'member' && !member.hasPaidRegistration && (
//               <button
//                 onClick={handleVerifyRegistration}
//                 className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//               >
//                 Verify Registration
//               </button>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Tabs */}
//       <div className="border-b border-gray-200">
//         <nav className="flex space-x-8">
//           <button
//             onClick={() => setActiveTab('overview')}
//             className={`py-4 px-1 border-b-2 font-medium text-sm ${
//               activeTab === 'overview'
//                 ? 'border-blue-500 text-blue-600'
//                 : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//             }`}
//           >
//             Overview
//           </button>
//           <button
//             onClick={() => setActiveTab('payments')}
//             className={`py-4 px-1 border-b-2 font-medium text-sm ${
//               activeTab === 'payments'
//                 ? 'border-blue-500 text-blue-600'
//                 : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//             }`}
//           >
//             Payment History
//           </button>
//         </nav>
//       </div>

//       {/* Content */}
//       <div className="bg-white rounded-lg shadow p-6">
//         {activeTab === 'overview' && (
//           <div className="space-y-6">
//             {/* Member Information */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div className="space-y-4">
//                 <h3 className="text-lg font-semibold text-gray-800">Member Information</h3>
//                 <div className="flex items-center space-x-3">
//                   <User className="h-5 w-5 text-gray-400" />
//                   <div>
//                     <p className="text-sm text-gray-500">Full Name</p>
//                     <p className="font-medium">{member.name}</p>
//                   </div>
//                 </div>
//                 <div className="flex items-center space-x-3">
//                   <Mail className="h-5 w-5 text-gray-400" />
//                   <div>
//                     <p className="text-sm text-gray-500">Email Address</p>
//                     <p className="font-medium">{member.email}</p>
//                   </div>
//                 </div>
//                 <div className="flex items-center space-x-3">
//                   <Shield className="h-5 w-5 text-gray-400" />
//                   <div>
//                     <p className="text-sm text-gray-500">Role</p>
//                     <p className="font-medium capitalize">{member.role}</p>
//                   </div>
//                 </div>
//                 <div className="flex items-center space-x-3">
//                   <Calendar className="h-5 w-5 text-gray-400" />
//                   <div>
//                     <p className="text-sm text-gray-500">Member Since</p>
//                     <p className="font-medium">{new Date(member.createdAt).toLocaleDateString()}</p>
//                   </div>
//                 </div>
//               </div>

//               {/* Payment Summary - Only show for admins or on own profile */}
//               {(isAdmin || isOwnProfile) && (
//                 <div className="space-y-4">
//                   <h3 className="text-lg font-semibold text-gray-800">Payment Summary</h3>
//                   <div className="bg-gray-50 rounded-lg p-4 space-y-3">
//                     <div className="flex justify-between items-center">
//                       <span className="text-gray-600">Registration Status</span>
//                       {member.hasPaidRegistration ? (
//                         <span className="flex items-center text-green-600">
//                           <CheckCircle className="h-4 w-4 mr-1" /> Paid
//                         </span>
//                       ) : (
//                         <span className="flex items-center text-yellow-600">
//                           <Clock className="h-4 w-4 mr-1" /> Pending
//                         </span>
//                       )}
//                     </div>
//                     <div className="flex justify-between items-center">
//                       <span className="text-gray-600">Total Paid</span>
//                       <span className="font-semibold text-green-600">
//                         ₦{summary?.totalPaid?.toLocaleString() || 0}
//                       </span>
//                     </div>
//                     <div className="flex justify-between items-center">
//                       <span className="text-gray-600">Outstanding Balance</span>
//                       <span className="font-semibold text-red-600">
//                         ₦{summary?.totalOutstanding?.toLocaleString() || 0}
//                       </span>
//                     </div>
//                     <div className="flex justify-between items-center">
//                       <span className="text-gray-600">Total Payments</span>
//                       <span className="font-semibold">{payments.length}</span>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* Message for non-admin viewing other members */}
//               {!isAdmin && !isOwnProfile && (
//                 <div className="space-y-4">
//                   <div className="bg-yellow-50 rounded-lg p-4">
//                     <p className="text-sm text-yellow-800">
//                       <strong>Limited Access:</strong> You can only view basic member information.
//                       Payment details are private.
//                     </p>
//                   </div>
//                 </div>
//               )}
//             </div>

//             {/* Recent Payments - Only show for admins or on own profile */}
//             {(isAdmin || isOwnProfile) && payments.length > 0 && (
//               <div>
//                 <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Payments</h3>
//                 <div className="space-y-3">
//                   {payments.slice(0, 5).map(payment => (
//                     <div key={payment._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
//                       <div>
//                         <p className="font-medium capitalize">{payment.type}</p>
//                         <p className="text-xs text-gray-500">
//                           {payment.paidAt ? new Date(payment.paidAt).toLocaleDateString() : 'Not paid'}
//                         </p>
//                       </div>
//                       <div className="text-right">
//                         <p className="font-semibold">₦{payment.amount.toLocaleString()}</p>
//                         {getPaymentStatusBadge(payment.status)}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}
//           </div>
//         )}

//         {activeTab === 'payments' && (isAdmin || isOwnProfile) && (
//           <div>
//             <div className="flex justify-between items-center mb-6">
//               <h3 className="text-lg font-semibold text-gray-800">Payment History</h3>
//               {isAdmin && (
//                 <Link
//                   to={`/payments?user=${member._id}`}
//                   className="text-blue-600 hover:text-blue-800 text-sm"
//                 >
//                   Create New Payment →
//                 </Link>
//               )}
//             </div>
            
//             {payments.length === 0 ? (
//               <p className="text-center text-gray-500 py-8">No payment records found</p>
//             ) : (
//               <div className="overflow-x-auto">
//                 <table className="min-w-full divide-y divide-gray-200">
//                   <thead className="bg-gray-50">
//                     <tr>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paid Date</th>
//                     </tr>
//                   </thead>
//                   <tbody className="bg-white divide-y divide-gray-200">
//                     {payments.map(payment => (
//                       <tr key={payment._id}>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <span className="capitalize">{payment.type}</span>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap font-medium">
//                           ₦{payment.amount.toLocaleString()}
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           {payment.dueDate ? new Date(payment.dueDate).toLocaleDateString() : '-'}
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           {getPaymentStatusBadge(payment.status)}
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           {payment.paidAt ? new Date(payment.paidAt).toLocaleDateString() : '-'}
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             )}
//           </div>
//         )}

//         {activeTab === 'payments' && !isAdmin && !isOwnProfile && (
//           <div className="text-center py-8">
//             <Lock className="h-12 w-12 text-gray-400 mx-auto mb-3" />
//             <p className="text-gray-500">You don't have permission to view payment details.</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default MemberDetails;




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

/**
 * Member Details Component
 * Displays detailed information about a specific member
 * Accessible by: 
 * - Admins (can view any member)
 * - Members (can only view their own details - read only)
 */
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

  // Helper function to get user ID (works with both _id and id)
  const getUserId = (user) => {
    return user?._id || user?.id;
  };

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) {
      console.log('Auth still loading...');
      return;
    }
    
    // Check if user is authenticated
    if (!currentUser) {
      console.log('No current user, redirecting to login');
      navigate('/login');
      return;
    }
    
    const currentUserId = getUserId(currentUser);
    
    console.log('Current User:', currentUser);
    console.log('Current User ID:', currentUserId);
    console.log('Requested ID from URL:', id);
    console.log('Is Admin:', isAdmin);
    
    // Allow access if:
    // 1. User is admin, OR
    // 2. User is viewing their own profile
    const isOwnProfile = currentUserId === id;
    
    if (!isAdmin && !isOwnProfile) {
      console.log('Access denied - Not admin and not own profile');
      setAccessDenied(true);
      setLoading(false);
      toast.error("You don't have permission to view this member's details");
      return;
    }
    
    console.log('Access granted - Fetching member details');
    fetchMemberDetails();
  }, [id, currentUser, isAdmin, authLoading, navigate]);

  const fetchMemberDetails = async () => {
    setLoading(true);
    try {
      const [memberRes, paymentsRes] = await Promise.all([
        api.get(`/users/${id}`),
        api.get(`/users/${id}/transactions`)
      ]);
      
      console.log('Member data fetched:', memberRes.data);
      
      setMember(memberRes.data.data.user || memberRes.data.data);
      setPayments(paymentsRes.data.data.payments || []);
      setSummary(paymentsRes.data.data.summary);
    } catch (error) {
      console.error('Error fetching member details:', error);
      toast.error('Failed to load member details');
      if (isAdmin) {
        navigate('/members');
      } else {
        navigate('/dashboard');
      }
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

  const getPaymentStatusBadge = (status) => {
    if (status === 'paid') {
      return <span className="flex items-center text-green-600"><CheckCircle className="h-4 w-4 mr-1" /> Paid</span>;
    }
    return <span className="flex items-center text-red-600"><XCircle className="h-4 w-4 mr-1" /> Unpaid</span>;
  };

  // Show loading while auth is loading
  if (authLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (loading) {
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
        <Link to={isAdmin ? "/members" : "/dashboard"} className="text-blue-600 hover:text-blue-800 mt-2 inline-block">
          Go Back
        </Link>
      </div>
    );
  }

  // Check if current user is viewing their own profile (using helper function)
  const currentUserId = getUserId(currentUser);
  const memberId = getUserId(member);
  const isOwnProfile = currentUserId === memberId;

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
              <p className="text-gray-600">{member.email}</p>
              {isOwnProfile && (
                <span className="inline-block mt-1 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  Your Profile
                </span>
              )}
            </div>
          </div>
          <div className="flex space-x-3">
            {/* EDIT BUTTON - ONLY SHOW FOR ADMINS */}
            {isAdmin && (
              <Link
                to={`/members/edit/${memberId}`}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Edit Profile
              </Link>
            )}
            {/* Show verify button only for admins on member accounts that aren't verified */}
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
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Overview
          </button>
          {(isAdmin || isOwnProfile) && (
            <button
              onClick={() => setActiveTab('payments')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'payments'
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
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Member Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Member Information</h3>
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="font-medium">{member.name}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Email Address</p>
                    <p className="font-medium">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Shield className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Role</p>
                    <p className="font-medium capitalize">{member.role}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Member Since</p>
                    <p className="font-medium">{new Date(member.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Payment Summary - Only show for admins or on own profile */}
              {(isAdmin || isOwnProfile) && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Payment Summary</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Registration Status</span>
                      {member.hasPaidRegistration ? (
                        <span className="flex items-center text-green-600">
                          <CheckCircle className="h-4 w-4 mr-1" /> Paid
                        </span>
                      ) : (
                        <span className="flex items-center text-yellow-600">
                          <Clock className="h-4 w-4 mr-1" /> Pending
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Paid</span>
                      <span className="font-semibold text-green-600">
                        ₦{summary?.totalPaid?.toLocaleString() || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Outstanding Balance</span>
                      <span className="font-semibold text-red-600">
                        ₦{summary?.totalOutstanding?.toLocaleString() || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Payments</span>
                      <span className="font-semibold">{payments.length}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Message for non-admin viewing other members */}
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

            {/* Recent Payments - Only show for admins or on own profile */}
            {(isAdmin || isOwnProfile) && payments.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Payments</h3>
                <div className="space-y-3">
                  {payments.slice(0, 5).map(payment => (
                    <div key={payment._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium capitalize">{payment.type}</p>
                        <p className="text-xs text-gray-500">
                          {payment.paidAt ? new Date(payment.paidAt).toLocaleDateString() : 'Not paid'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">₦{payment.amount.toLocaleString()}</p>
                        {getPaymentStatusBadge(payment.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'payments' && (isAdmin || isOwnProfile) && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Payment History</h3>
              {isAdmin && (
                <Link
                  to={`/payments?user=${memberId}`}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Create New Payment →
                </Link>
              )}
            </div>
            
            {payments.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No payment records found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paid Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {payments.map(payment => (
                      <tr key={payment._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="capitalize">{payment.type}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-medium">
                          ₦{payment.amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {payment.dueDate ? new Date(payment.dueDate).toLocaleDateString() : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getPaymentStatusBadge(payment.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {payment.paidAt ? new Date(payment.paidAt).toLocaleDateString() : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

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