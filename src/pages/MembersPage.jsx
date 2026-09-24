import { useEffect, useState, useRef } from 'react';
import { Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MemberList from '../components/members/MemberList';
import MemberForm from '../components/members/MemberForm';
import MemberDetails from '../components/members/MemberDetails';
import Navbar from '../components/common/Navbar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Users, Plus, ArrowLeft, ChevronRight, Home, UserPlus, Printer, AlertCircle, Info, Download } from 'lucide-react';
import bannerGif from '../assets/memberBanner.gif';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useUsers, useMemberLimit } from '../hooks/usePaymentData';

const MembersPage = () => {
  const { loading, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  // ========== REACT QUERY HOOKS ==========
  const {
    data: usersData = [],
    isLoading: usersLoading,
    refetch: refetchUsers
  } = useUsers('member', 100);

  const {
    data: memberLimit = null,
    isLoading: limitLoading,
    refetch: refetchMemberLimit
  } = useMemberLimit();

  const isSubRoute = location.pathname !== '/members';

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Process members data when React Query returns data
  useEffect(() => {
    if (usersData && usersData.length > 0) {
      processMembersData(usersData);
    } else if (usersData && usersData.length === 0 && !usersLoading) {
      setMembers([]);
      setLoadingMembers(false);
    }
  }, [usersData, usersLoading]);

  // Check member limit and show warnings
  useEffect(() => {
    if (memberLimit && !limitLoading && isAdmin && !isSubRoute) {
      showMemberLimitWarning(memberLimit);
    }
  }, [memberLimit, limitLoading, isAdmin, isSubRoute]);

  const processMembersData = (membersData) => {
    setLoadingMembers(true);
    try {
      // Ensure each member has safe properties
      const safeMembers = (membersData || []).map(member => ({
        ...member,
        name: member?.name || 'Unknown',
        email: member?.email || 'No email',
        role: member?.role || 'member',
        hasPaidRegistration: member?.hasPaidRegistration || false,
        registrationStatus: member?.registrationStatus || 'unpaid',
        // Safe display name
        displayName: member?.name ? member.name : 'Unknown Member',
        // Safe initial for avatar
        initial: member?.name ? member.name.charAt(0).toUpperCase() : 'U',
        // Safe role display
        roleDisplay: member?.role ? member.role.charAt(0).toUpperCase() + member.role.slice(1) : 'Member'
      }));

      setMembers(safeMembers);

    } catch (error) {
      console.error('Failed to process members:', error);
      setMembers([]);
    } finally {
      setLoadingMembers(false);
    }
  };

  const showMemberLimitWarning = (data) => {
    if (data?.percentageFull >= 80 && !data?.isFull) {
      toast.custom((t) => (
        <div className={`bg-yellow-50 border border-yellow-200 rounded-lg p-4 shadow-lg max-w-md ${t.visible ? 'animate-enter' : 'animate-leave'
          }`}>
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-800">Member Limit Warning</p>
              <p className="text-xs text-yellow-700 mt-1">
                {data.availableSlots} slot{data.availableSlots !== 1 ? 's' : ''} remaining out of {data.maxMembers} maximum members.
              </p>
            </div>
          </div>
        </div>
      ), { duration: 5000 });
    } else if (data?.isFull) {
      toast.error(`Member registration limit reached. Maximum of ${data.maxMembers} members allowed.`, {
        duration: 5000,
        icon: 'âš ï¸'
      });
    }
  };

  const fetchMembers = async () => {
    await refetchUsers();
  };

  const getPageTitle = () => {
    if (location.pathname.includes('/add')) return 'Add New Member';
    if (location.pathname.includes('/edit')) return 'Edit Member';
    if (location.pathname.match(/\/members\/[a-fA-F0-9]{24}$/)) return 'Member Details';
    return 'Member Management';
  };

  const getPageDescription = () => {
    if (location.pathname.includes('/add')) return 'Register a new member to the organization';
    if (location.pathname.includes('/edit')) return 'Update member information and details';
    if (location.pathname.match(/\/members\/[a-fA-F0-9]{24}$/)) return 'View detailed member information and payment history';
    return 'Manage all members, view details, and track payment status';
  };

  const handlePrint = () => {
    if (members.length === 0) {
      toast.error('No member data to print');
      return;
    }

    const printWindow = window.open('', '_blank');
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const tableRows = members.map((member, index) => {
      // Safe property access
      const memberName = member?.name || member?.displayName || 'N/A';
      const memberEmail = member?.email || 'N/A';
      const memberId = member?.memberId || member?._id?.slice(-6) || 'N/A';
      const createdAt = member?.createdAt ? new Date(member.createdAt).toLocaleDateString() : 'N/A';
      const hasPaid = member?.hasPaidRegistration === true || member?.registrationStatus === 'paid';

      return `
      <tr>
        <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${index + 1}</td>
        <td style="padding: 10px; border: 1px solid #ddd;">${memberName}</td>
        <td style="padding: 10px; border: 1px solid #ddd;">${memberEmail}</td>
        <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${memberId}</td>
        <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${createdAt}</td>
        <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">
          <span style="display: inline-block; padding: 4px 8px; border-radius: 4px; background: ${hasPaid ? '#10b981' : '#ef4444'}; color: white; font-size: 11px;">
            ${hasPaid ? 'Paid' : 'Unpaid'}
          </span>
        </td>
      </tr>
    `}).join('');

    const paidCount = members.filter(m => m?.hasPaidRegistration === true || m?.registrationStatus === 'paid').length;
    const unpaidCount = members.length - paidCount;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>AGFMA Member Directory - ${currentDate}</title>
        <meta charset="UTF-8">
        <style>
          @page {
            size: A4;
            margin: 1.5cm;
          }
          body {
            font-family: 'Segoe UI', Arial, sans-serif;
            margin: 0;
            padding: 0;
            background: white;
            font-size: 12px;
          }
          .print-container {
            max-width: 100%;
            margin: 0 auto;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 3px solid #2563eb;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 10px;
          }
          .title {
            font-size: 20px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 5px;
          }
          .subtitle {
            font-size: 12px;
            color: #6b7280;
          }
          .report-info {
            background: #f3f4f6;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            display: flex;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 10px;
          }
          .info-item {
            text-align: center;
            flex: 1;
          }
          .info-label {
            font-size: 10px;
            color: #6b7280;
            margin-bottom: 5px;
          }
          .info-value {
            font-size: 14px;
            font-weight: bold;
            color: #1f2937;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th {
            background: #2563eb;
            color: white;
            padding: 12px;
            text-align: left;
            font-size: 11px;
            font-weight: 600;
          }
          td {
            padding: 10px;
            border: 1px solid #e5e7eb;
            font-size: 11px;
          }
          tr:nth-child(even) {
            background: #f9fafb;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            text-align: center;
            font-size: 9px;
            color: #9ca3af;
            border-top: 1px solid #e5e7eb;
          }
          @media print {
            body {
              margin: 0;
              padding: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="print-container">
          <div class="header">
            <div class="logo">AGFMA</div>
            <div class="title">Member Directory Report</div>
            <div class="subtitle">Complete Member List and Registration Status</div>
          </div>

          <div class="report-info">
            <div class="info-item">
              <div class="info-label">Total Members</div>
              <div class="info-value">${members.length}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Report Date</div>
              <div class="info-value">${currentDate}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Paid Members</div>
              <div class="info-value">${paidCount}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Unpaid Members</div>
              <div class="info-value">${unpaidCount}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 5%;">S/N</th>
                <th style="width: 25%;">Member Name</th>
                <th style="width: 25%;">Email Address</th>
                <th style="width: 10%;">Member ID</th>
                <th style="width: 15%;">Registration Date</th>
                <th style="width: 20%;">Registration Status</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
            <tfoot>
              <tr style="background: #f3f4f6;">
                <td colspan="5" style="text-align: right; font-weight: bold;">Total Members: </td>
                <td style="font-weight: bold;">${members.length}</td>
              </tr>
            </tfoot>
          </table>

          <div class="footer">
            <p>This is a computer-generated document. No signature is required.</p>
            <p>&copy; ${new Date().getFullYear()} AGFMA - All Rights Reserved</p>
            <p>Generated on: ${new Date().toLocaleString()}</p>
          </div>
        </div>

        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 1000);
          }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  const isLoadingMembers = usersLoading || loadingMembers;
  const isMemberLimitFull = memberLimit?.isFull || false;
  const availableSlots = memberLimit?.availableSlots || 0;
  const handleBackToHome = () => {
    // Navigate based on user role
    if (isAdmin) {
      navigate('/admin-dashboard');
    } else {
      navigate('/dashboard');
    }
  };
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      {/* Banner Section - Mobile Optimized */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-b-3xl text-white">


        <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
          <button
            onClick={handleBackToHome}
            className="p-2 bg-white/20 rounded-xl hover:bg-white/30 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          </button>
          {/* Breadcrumb */}
          {isSubRoute && (
            <div className="flex items-center gap-2 text-sm mb-4">
              <Link to="/members" className="text-blue-200 hover:text-white transition-colors flex items-center gap-1">
                <Home className="h-3 w-3" />
                <span>Members</span>
              </Link>
              <ChevronRight className="h-3 w-3 text-blue-300" />
              <span className="text-white font-medium">
                {location.pathname.includes('/add') && 'Add New Member'}
                {location.pathname.includes('/edit') && 'Edit Member'}
                {location.pathname.match(/\/members\/[a-fA-F0-9]{24}$/) && 'Member Details'}
              </span>
            </div>
          )}

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold">
                {getPageTitle()}
              </h1>
              <p className="text-blue-100 text-sm mt-2">
                {getPageDescription()}
              </p>
              {!isSubRoute && (
                <Link
                  to="/members/add"
                  className={`inline-flex items-center gap-2 mt-4 px-4 py-2 backdrop-blur-sm rounded-xl transition-all text-sm font-medium ${isMemberLimitFull
                    ? 'bg-gray-400 cursor-not-allowed opacity-50'
                    : 'bg-white/20 hover:bg-white/30'
                    }`}
                  onClick={(e) => {
                    if (isMemberLimitFull) {
                      e.preventDefault();
                      toast.error(`Member registration limit reached. Maximum of ${memberLimit?.maxMembers} members allowed.`);
                    }
                  }}
                >
                  <UserPlus className="h-4 w-4" />
                  Add New Member
                  {memberLimit && !isMemberLimitFull && (
                    <span className="ml-1 text-xs bg-white/30 px-1.5 py-0.5 rounded-full">
                      {availableSlots} slot{availableSlots !== 1 ? 's' : ''} left
                    </span>
                  )}
                </Link>
              )}
            </div>

            {/* Banner Image - Hidden on mobile, visible on desktop */}
            {!isMobile && (
              <div className="flex-1 max-w-md">
                <img
                  src={bannerGif}
                  alt="Member Management Banner"
                  className="w-full rounded-2xl shadow-lg"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Member Limit Warning Banner - Show when limit is near or reached */}
      {!isSubRoute && memberLimit && (memberLimit.isFull || (memberLimit.percentageFull >= 80)) && (
        <div className={`max-w-7xl mx-auto px-4 mt-4 ${memberLimit.isFull ? 'bg-red-50 border border-red-200' : 'bg-yellow-50 border border-yellow-200'
          } rounded-xl p-3`}>
          <div className="flex items-center gap-3">
            {memberLimit.isFull ? (
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
            ) : (
              <Info className="h-5 w-5 text-yellow-600 flex-shrink-0" />
            )}
            <div className="flex-1">
              <p className={`text-sm font-medium ${memberLimit.isFull ? 'text-red-800' : 'text-yellow-800'
                }`}>
                {memberLimit.isFull
                  ? 'Member Registration Limit Reached'
                  : `Member Limit Warning: ${memberLimit.availableSlots} slot${memberLimit.availableSlots !== 1 ? 's' : ''} remaining`}
              </p>
              <p className={`text-xs ${memberLimit.isFull ? 'text-red-700' : 'text-yellow-700'
                } mt-0.5`}>
                {memberLimit.isFull
                  ? `Maximum of ${memberLimit.maxMembers} members allowed. Please remove inactive members or upgrade your plan.`
                  : `${memberLimit.percentageFull.toFixed(0)}% of member capacity used (${memberLimit.currentMembers}/${memberLimit.maxMembers}).`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        <Routes>
          <Route index element={<MemberList members={members} loadingMembers={isLoadingMembers} />} />
          <Route path="add" element={<MemberForm onSuccess={refetchUsers} />} />
          <Route path="edit/:id" element={<MemberForm isEdit={true} onSuccess={refetchUsers} />} />
          <Route path=":id" element={<MemberDetails />} />
        </Routes>

        {/* Footer Quick Actions - Mobile Optimized */}
        {!isSubRoute && (
          <div className="mt-6 bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 md:p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-800 mb-3">Quick Actions</h3>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={handlePrint}
                      disabled={isLoadingMembers || members.length === 0}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Printer className="h-4 w-4" />
                      Print Member List
                    </button>
                  </div>
                </div>
                <div className="text-left md:text-right">
                  {memberLimit && (
                    <p className="text-xs text-gray-500 mb-1">
                      Member Capacity: {memberLimit.currentMembers}/{memberLimit.maxMembers}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    Total members: {members.length} | Click on any member to view details.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MembersPage;