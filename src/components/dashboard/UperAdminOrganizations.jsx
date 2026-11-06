import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Building, Plus, Edit2, Trash2, Save, X, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';

const Organizations = () => {
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingOrg, setEditingOrg] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    paystack: { subaccountCode: '', bankName: '', accountNumber: '', percentageCharge: 0 },
    adminEmail: '',
    adminName: '',
    adminPassword: ''
  });

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      const res = await api.get('/admin/organizations');
      setOrgs(res.data.data);
    } catch (err) {
      toast.error('Failed to load organizations');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingOrg) {
        await api.put(`/admin/organizations/${editingOrg._id}`, {
          name: formData.name,
          slug: formData.slug,
          paystack: formData.paystack
        });
        toast.success('Organization updated');
      } else {
        await api.post('/admin/organizations', formData);
        toast.success('Organization created');
      }
      setShowModal(false);
      resetForm();
      fetchOrganizations();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this organization and ALL its data? This cannot be undone.')) return;
    try {
      await api.delete(`/admin/organizations/${id}`);
      toast.success('Organization deleted');
      fetchOrganizations();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const resetForm = () => {
    setEditingOrg(null);
    setFormData({
      name: '',
      slug: '',
      paystack: { subaccountCode: '', bankName: '', accountNumber: '', percentageCharge: 0 },
      adminEmail: '',
      adminName: '',
      adminPassword: ''
    });
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (org) => {
    setEditingOrg(org);
    setFormData({
      name: org.name,
      slug: org.slug,
      paystack: org.paystack || { subaccountCode: '', bankName: '', accountNumber: '', percentageCharge: 0 },
      adminEmail: '',
      adminName: '',
      adminPassword: ''
    });
    setShowModal(true);
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Organizations</h1>
        <button
          onClick={openCreateModal}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus size={18} /> New Organization
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {orgs.map(org => (
          <div key={org._id} className="bg-white rounded-xl shadow p-5 border border-gray-100">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg">{org.name}</h3>
                <p className="text-sm text-gray-500">/{org.slug}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEditModal(org)} className="text-gray-500 hover:text-blue-600">
                  <Edit2 size={18} />
                </button>
                <button onClick={() => handleDelete(org._id)} className="text-gray-500 hover:text-red-600">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            <div className="mt-3 text-sm">
              <p><strong>Admins:</strong> {org.adminCount || 0}</p>
              {org.primaryAdmin && <p className="text-xs text-gray-500">{org.primaryAdmin.name} ({org.primaryAdmin.email})</p>}
              <div className="mt-2 pt-2 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  <CreditCard size={12} className="inline mr-1" />
                  Subaccount: {org.paystack?.subaccountCode || 'Not configured'}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for Create/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">{editingOrg ? 'Edit Organization' : 'Create Organization'}</h2>
                <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Organization Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Slug (URL) *</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={e => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s/g, '-') })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                  />
                  <p className="text-xs text-gray-500">e.g., "agfma" → app.finlight.com/agfma</p>
                </div>
                {!editingOrg && (
                  <>
                    <div className="border-t pt-3">
                      <h3 className="font-semibold text-sm mb-2">Initial Admin User</h3>
                      <div className="space-y-3">
                        <input
                          type="text"
                          placeholder="Admin Name"
                          value={formData.adminName}
                          onChange={e => setFormData({ ...formData, adminName: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        />
                        <input
                          type="email"
                          placeholder="Admin Email"
                          value={formData.adminEmail}
                          onChange={e => setFormData({ ...formData, adminEmail: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        />
                        <input
                          type="password"
                          placeholder="Admin Password"
                          value={formData.adminPassword}
                          onChange={e => setFormData({ ...formData, adminPassword: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        />
                      </div>
                    </div>
                  </>
                )}
                <div className="border-t pt-3">
                  <h3 className="font-semibold text-sm mb-2">Paystack Subaccount (optional)</h3>
                  <input
                    type="text"
                    placeholder="Subaccount Code"
                    value={formData.paystack.subaccountCode}
                    onChange={e => setFormData({ ...formData, paystack: { ...formData.paystack, subaccountCode: e.target.value } })}
                    className="w-full mb-2 border border-gray-300 rounded-lg px-3 py-2"
                  />
                  <input
                    type="text"
                    placeholder="Bank Name"
                    value={formData.paystack.bankName}
                    onChange={e => setFormData({ ...formData, paystack: { ...formData.paystack, bankName: e.target.value } })}
                    className="w-full mb-2 border border-gray-300 rounded-lg px-3 py-2"
                  />
                  <input
                    type="text"
                    placeholder="Account Number"
                    value={formData.paystack.accountNumber}
                    onChange={e => setFormData({ ...formData, paystack: { ...formData.paystack, accountNumber: e.target.value } })}
                    className="w-full mb-2 border border-gray-300 rounded-lg px-3 py-2"
                  />
                  <input
                    type="number"
                    placeholder="Percentage Charge (0-100)"
                    value={formData.paystack.percentageCharge}
                    onChange={e => setFormData({ ...formData, paystack: { ...formData.paystack, percentageCharge: parseFloat(e.target.value) || 0 } })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 border border-gray-300 rounded-lg">Cancel</button>
                  <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                    {editingOrg ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Organizations;