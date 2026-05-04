import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import LoadingSpinner from '../common/LoadingSpinner';
import { User, Mail, Lock, Shield, X, AlertCircle, Eye, EyeOff, Users, Info } from 'lucide-react';

/**
 * Member Form Component
 * Handles both creating new members and editing existing ones
 * Accessible by:
 * - Admins (can edit any member)
 * - Members (can only edit their own profile)
 */

const MemberForm = ({ isEdit = false }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user: currentUser, isAdmin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [accessDenied, setAccessDenied] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [memberLimit, setMemberLimit] = useState(null);
  const [checkingLimit, setCheckingLimit] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'member'
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Check permissions for edit mode
    if (isEdit && id) {
      // Allow access if:
      // 1. User is admin, OR
      // 2. User is editing their own profile
      if (!isAdmin && currentUser?._id !== id) {
        setAccessDenied(true);
        setFetching(false);
        toast.error("You don't have permission to edit this member's profile");
        return;
      }
      fetchMember();
    } else if (!isEdit && isAdmin) {
      // Check member limit before showing add form
      checkMemberLimit();
    }
  }, [isEdit, id, isAdmin, currentUser]);

  const checkMemberLimit = async () => {
    setCheckingLimit(true);
    try {
      const response = await api.get('/auth/check-member-limit');
      const data = response.data.data;
      setMemberLimit(data);
      
      if (data.isFull) {
        toast.error(`Member registration limit reached. Maximum of ${data.maxMembers} members allowed.`, {
          duration: 5000,
          icon: '⚠️'
        });
      } else if (data.percentageFull >= 80) {
        toast.custom((t) => (
          <div className={`bg-yellow-50 border border-yellow-200 rounded-lg p-4 shadow-lg max-w-md ${
            t.visible ? 'animate-enter' : 'animate-leave'
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
      }
    } catch (error) {
      console.error('Failed to check member limit:', error);
    } finally {
      setCheckingLimit(false);
    }
  };

  const fetchMember = async () => {
    try {
      const { data } = await api.get(`/users/${id}`);
      setFormData({
        name: data.data.user.name,
        email: data.data.user.email,
        role: data.data.user.role,
        password: '' // Don't populate password
      });
    } catch (error) {
      toast.error('Failed to fetch member details');
      navigate('/members');
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@([^\s@]+\.)+[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!isEdit && !formData.password) {
      newErrors.password = 'Password is required';
    } else if (!isEdit && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (!isEdit && !/(?=.*[A-Za-z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one letter and one number';
    }
    
    // For edit mode, if password is provided, validate it
    if (isEdit && formData.password && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (isEdit && formData.password && !/(?=.*[A-Za-z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one letter and one number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Check member limit before submitting for new member registration
    if (!isEdit && isAdmin) {
      // Refresh limit check before submission
      try {
        const response = await api.get('/auth/check-member-limit');
        const data = response.data.data;
        
        if (data.isFull) {
          toast.error(`Member registration limit reached. Maximum of ${data.maxMembers} members allowed.`, {
            duration: 5000,
            icon: '⚠️'
          });
          // Navigate back to members page after showing error
          setTimeout(() => {
            navigate('/members');
          }, 3000);
          return;
        }
      } catch (error) {
        console.error('Failed to check member limit:', error);
        // Continue with registration if limit check fails? Better to show error
        toast.error('Unable to verify member limit. Please try again.');
        return;
      }
    }
    
    setLoading(true);
    
    try {
      if (isEdit) {
        // Update existing member
        const updateData = {
          name: formData.name,
          email: formData.email,
        };
        
        // Only admins can change roles
        if (isAdmin) {
          updateData.role = formData.role;
        }
        
        // Only include password if it was provided (not empty)
        if (formData.password && formData.password.trim() !== '') {
          updateData.password = formData.password;
        }
        
        console.log('Updating user with data:', updateData);
        
        const response = await api.put(`/users/${id}`, updateData);
        console.log('Update response:', response.data);
        
        toast.success('Profile updated successfully');
        
        // Redirect based on who is editing
        if (isAdmin) {
          navigate('/members');
        } else {
          navigate(`/members/${id}`);
        }
      } else {
        // Create new member (admin only)
        await api.post('/users/register', formData);
        toast.success('Member registered successfully');
        navigate('/members');
      }
    } catch (error) {
      console.error('Registration/Update error:', error);
      const message = error.response?.data?.message || 'Operation failed';
      
      // Check if error is about member limit
      if (message.toLowerCase().includes('limit reached') || 
          message.toLowerCase().includes('maximum')) {
        toast.error(message, {
          duration: 5000,
          icon: '⚠️'
        });
        // Navigate back to members page after 3 seconds
        setTimeout(() => {
          navigate('/members');
        }, 3000);
      } else {
        toast.error(message);
      }
      
      if (error.response?.data?.errors) {
        const fieldErrors = {};
        error.response.data.errors.forEach(err => {
          fieldErrors[err.field] = err.message;
        });
        setErrors(fieldErrors);
      }
    } finally {
      setLoading(false);
    }
  };

  if (accessDenied) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="flex justify-center mb-4">
          <AlertCircle className="h-16 w-16 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
        <p className="text-gray-600 mb-6">
          You don't have permission to edit this member's profile.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (fetching || checkingLimit) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Check if current user is editing their own profile
  const isOwnProfile = currentUser?._id === id;

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {isEdit ? (isOwnProfile ? 'Edit Your Profile' : 'Edit Member') : 'Add New Member'}
        </h2>
        <button
          onClick={() => navigate(isAdmin ? '/members' : `/members/${id}`)}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="h-6 w-6" />
        </button>
      </div>
      
      {/* Member Limit Warning Banner for Add Member Form */}
      {!isEdit && memberLimit && memberLimit.isFull && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-red-800 mb-1">Registration Closed</h3>
              <p className="text-sm text-red-700">
                Member registration limit has been reached. Maximum of {memberLimit.maxMembers} members allowed.
              </p>
              <button
                onClick={() => navigate('/members')}
                className="mt-3 text-sm text-red-700 font-medium hover:text-red-800 underline"
              >
                Return to Member List
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Member Limit Warning Banner for Near Limit */}
      {!isEdit && memberLimit && !memberLimit.isFull && memberLimit.percentageFull >= 80 && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-yellow-800 mb-1">Member Limit Warning</h3>
              <p className="text-sm text-yellow-700">
                {memberLimit.availableSlots} slot{memberLimit.availableSlots !== 1 ? 's' : ''} remaining out of {memberLimit.maxMembers} maximum members.
                Current capacity: {memberLimit.currentMembers}/{memberLimit.maxMembers}
              </p>
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name *
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter full name"
              disabled={!isEdit && memberLimit?.isFull}
            />
          </div>
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>
        
        {/* Email Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter email address"
              disabled={!isEdit && memberLimit?.isFull}
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>
        
        {/* Password Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {isEdit ? 'New Password (leave blank to keep current)' : 'Password *'}
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={isEdit ? 'Enter new password' : 'Enter password'}
              disabled={!isEdit && memberLimit?.isFull}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              disabled={!isEdit && memberLimit?.isFull}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
          )}
          {!isEdit && (
            <p className="mt-1 text-xs text-gray-500">
              Password must be at least 6 characters with at least one letter and one number
            </p>
          )}
          {isEdit && (
            <p className="mt-1 text-xs text-gray-500">
              Leave blank to keep your current password
            </p>
          )}
        </div>
        
        {/* Role Field - Only show for admins */}
        {isAdmin && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                disabled={!isEdit && memberLimit?.isFull}
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Admins have full access to manage members and financial records
            </p>
          </div>
        )}
        
        {/* Capacity Info for Admin */}
        {!isEdit && isAdmin && memberLimit && !memberLimit.isFull && (
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Users className="h-4 w-4 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm text-blue-800">
                  <strong>Current Capacity:</strong> {memberLimit.currentMembers}/{memberLimit.maxMembers} members
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  {memberLimit.availableSlots} slot{memberLimit.availableSlots !== 1 ? 's' : ''} available
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Info message for non-admin editing their profile */}
        {!isAdmin && isOwnProfile && (
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> You can update your name, email, and password. 
              Role changes can only be made by an administrator.
            </p>
          </div>
        )}
        
        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            type="button"
            onClick={() => navigate(isAdmin ? '/members' : `/members/${id}`)}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || (!isEdit && memberLimit?.isFull)}
            className={`px-4 py-2 rounded-lg transition duration-200 flex items-center gap-2 ${
              !isEdit && memberLimit?.isFull
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            } disabled:opacity-50`}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              isEdit ? 'Update Profile' : 'Add Member'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MemberForm;