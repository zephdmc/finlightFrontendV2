import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Search, Filter, ChevronLeft, ChevronRight, Eye, Edit, Trash2, Mail, Phone, Calendar, ChevronDown, UserPlus, Users as UsersIcon, X, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorAlert from '../common/ErrorAlert';

/**
 * Member List Component
 * Displays paginated list of members with search and filter capabilities
 * Mobile-friendly banking app style list
 */
const MemberList = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalMembers, setTotalMembers] = useState(0);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const itemsPerPage = 10;

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [currentPage, searchTerm, filterRole, filterStatus]);

  const fetchMembers = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        role: filterRole !== 'all' ? filterRole : undefined,
        status: filterStatus !== 'all' ? filterStatus : undefined
      };
      
      const { data } = await api.get('/users', { params });
      setMembers(data.data.records);
      setTotalPages(data.data.pagination.pages);
      setTotalMembers(data.data.pagination.total);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch members');
      toast.error('Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterRoleChange = (e) => {
    setFilterRole(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterStatusChange = (e) => {
    setFilterStatus(e.target.value);
    setCurrentPage(1);
  };

  const handleDeleteClick = (member) => {
    setSelectedMember(member);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedMember) return;
    
    try {
      await api.delete(`/users/${selectedMember._id}`);
      toast.success('Member deleted successfully');
      setShowDeleteModal(false);
      fetchMembers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete member');
    }
  };

  const getStatusBadge = (member) => {
    if (member.role === 'admin') {
      return { text: 'Admin', class: 'bg-purple-100 text-purple-700', icon: Shield };
    }
    if (member.registrationStatus === 'paid') {
      return { text: 'Active', class: 'bg-green-100 text-green-700', icon: CheckCircle };
    }
    return { text: 'Pending', class: 'bg-yellow-100 text-yellow-700', icon: Clock };
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterRole('all');
    setFilterStatus('all');
    setShowFilters(false);
  };

  const hasActiveFilters = searchTerm || filterRole !== 'all' || filterStatus !== 'all';

  if (loading && members.length === 0) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Header with Stats */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Members</h1>
              <p className="text-sm text-gray-500 mt-0.5">{totalMembers} total members</p>
            </div>
            <Link
              to="/register"
              state={{ fromMembers: true }}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 text-center font-medium shadow-md flex items-center gap-2"
            >
              <UserPlus className="h-4 w-4" />
              {!isMobile && "Add Member"}
            </Link>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-2xl shadow-sm mb-4 overflow-hidden">
          <div className="p-3">
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search members..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-sm"
                  aria-label="Search members"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2.5 rounded-xl border transition-colors ${
                  showFilters || hasActiveFilters
                    ? 'bg-blue-50 border-blue-300 text-blue-600'
                    : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                }`}
              >
                <Filter className="h-5 w-5" />
              </button>
            </div>

            {/* Expandable Filters */}
            {showFilters && (
              <div className="mt-3 space-y-3 pt-3 border-t border-gray-100">
                <div className="relative">
                  <select
                    value={filterRole}
                    onChange={handleFilterRoleChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 appearance-none text-sm"
                    aria-label="Filter by role"
                  >
                    <option value="all">All Roles</option>
                    <option value="member">Members Only</option>
                    <option value="admin">Admins Only</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
                <div className="relative">
                  <select
                    value={filterStatus}
                    onChange={handleFilterStatusChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 appearance-none text-sm"
                    aria-label="Filter by status"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active Members</option>
                    <option value="pending">Pending Registration</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>

                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="w-full py-2 text-red-600 text-sm font-medium"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            )}

            {/* Active Filters Display */}
            {hasActiveFilters && !showFilters && (
              <div className="mt-2 flex flex-wrap gap-2">
                {searchTerm && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 rounded-lg text-xs text-blue-700">
                    Search: "{searchTerm}"
                    <button onClick={() => setSearchTerm('')} className="hover:text-blue-900">×</button>
                  </span>
                )}
                {filterRole !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 rounded-lg text-xs text-blue-700">
                    Role: {filterRole}
                    <button onClick={() => setFilterRole('all')} className="hover:text-blue-900">×</button>
                  </span>
                )}
                {filterStatus !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 rounded-lg text-xs text-blue-700">
                    Status: {filterStatus === 'active' ? 'Active' : 'Pending'}
                    <button onClick={() => setFilterStatus('all')} className="hover:text-blue-900">×</button>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4">
            <ErrorAlert type="error" message={error} onClose={() => setError(null)} />
          </div>
        )}

        {/* Member Count */}
        <div className="mb-3 flex justify-between items-center">
          <p className="text-xs text-gray-500">
            Showing {members.length} of {totalMembers} members
          </p>
        </div>

        {/* Mobile List View - Banking App Style */}
        <div className="space-y-3">
          {members.length === 0 && !loading && !error ? (
            <div className="bg-white rounded-2xl shadow-sm text-center py-12 px-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <UsersIcon className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-sm mb-3">No members found</p>
              {(searchTerm || filterRole !== 'all' || filterStatus !== 'all') ? (
                <button
                  onClick={clearFilters}
                  className="text-blue-600 text-sm font-medium"
                >
                  Clear filters
                </button>
              ) : (
                <Link
                  to="/register"
                  state={{ fromMembers: true }}
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium text-sm"
                >
                  <UserPlus className="h-4 w-4" />
                  Add your first member
                </Link>
              )}
            </div>
          ) : (
            members.map((member) => {
              const status = getStatusBadge(member);
              const StatusIcon = status.icon;
              return (
                <div
                  key={member._id}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all active:bg-gray-50"
                >
                  <div className="p-4">
                    {/* Main Row */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-semibold text-gray-900 text-base">
                            {member.name}
                          </h3>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full ${status.class}`}>
                            <StatusIcon className="h-3 w-3" />
                            {status.text}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 flex items-center gap-1 mb-1">
                          <Mail className="h-3.5 w-3.5" />
                          {member.email}
                        </p>
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          Registered {formatDate(member.createdAt)}
                        </p>
                      </div>
                      
                      {/* Action Icons */}
                      <div className="flex items-center gap-1">
                        <Link
                          to={`/members/${member._id}`}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                          title="View Details"
                          aria-label={`View ${member.name}`}
                        >
                          <Eye className="h-5 w-5" />
                        </Link>
                        <Link
                          to={`/members/edit/${member._id}`}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-xl transition-colors"
                          title="Edit"
                          aria-label={`Edit ${member.name}`}
                        >
                          <Edit className="h-5 w-5" />
                        </Link>
                        {member.role !== 'admin' && (
                          <button
                            onClick={() => handleDeleteClick(member)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                            title="Delete"
                            aria-label={`Delete ${member.name}`}
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Subtle Divider with Meta Info */}
                    <div className="border-t border-gray-100 pt-3 mt-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">
                          {member.role === 'admin' ? 'Administrator' : 'Regular Member'}
                        </span>
                        <span className="text-gray-400 font-mono">
                          ID: {member._id.slice(-6)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between bg-white rounded-2xl shadow-sm px-4 py-3">
            <div className="text-xs text-gray-500">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-gray-200 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-200 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                aria-label="Next page"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal - Mobile Optimized */}
      {showDeleteModal && selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end md:items-center justify-center z-50">
          <div className="bg-white rounded-t-2xl md:rounded-2xl w-full max-w-md animate-slide-up">
            <div className="p-6">
              <div className="flex items-center justify-center w-14 h-14 bg-red-100 rounded-full mx-auto mb-4">
                <Trash2 className="h-7 w-7 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">Delete Member</h3>
              <p className="text-sm text-gray-600 text-center mb-6">
                Are you sure you want to delete <span className="font-semibold">{selectedMember.name}</span>? 
                This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 font-medium transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="flex-1 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 font-medium transition-colors text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

// Add missing Shield icon import
const Shield = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2L3 7v7c0 5.5 9 9 9 9s9-3.5 9-9V7l-9-5z" />
  </svg>
);

export default MemberList;