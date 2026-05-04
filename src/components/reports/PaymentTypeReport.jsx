import { useState, useEffect } from 'react';
import { Download, Filter, Users, DollarSign, Calendar, Clock, UserX, AlertCircle, Search, Loader, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

const PaymentTypeReport = ({ dateRange, isMobile }) => {
  const [paymentTypes, setPaymentTypes] = useState([]);
  const [selectedPaymentType, setSelectedPaymentType] = useState(null);
  const [outstandingMembers, setOutstandingMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [viewMode, setViewMode] = useState('outstanding');
  const [paidMembers, setPaidMembers] = useState([]);
  const [summary, setSummary] = useState({
    totalMembers: 0,
    totalOutstandingAmount: 0,
    paymentTypeName: '',
    paymentTypeAmount: 0,
    paidCount: 0,
    notPaidCount: 0
  });

  useEffect(() => {
    fetchPaymentTypes();
  }, []);

  const fetchPaymentTypes = async () => {
    try {
      const response = await api.get('/payment-types');
      let types = [];
      
      if (response.data && response.data.data && response.data.data.records) {
        types = response.data.data.records;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        types = response.data.data;
      } else if (response.data && Array.isArray(response.data)) {
        types = response.data;
      } else if (response.data && response.data.records) {
        types = response.data.records;
      }
      
      setPaymentTypes(types);
    } catch (error) {
      console.error('Error fetching payment types:', error);
      if (toast && typeof toast.error === 'function') {
        toast.error('Failed to load payment types');
      }
    } finally {
      setLoadingTypes(false);
    }
  };

  const fetchAllMembers = async (paymentTypeId, paymentTypeName, paymentTypeAmount) => {
    setLoading(true);
    try {
      // Fetch ALL members
      const membersRes = await api.get('/users?role=member');
      let allMembers = [];
      
      if (membersRes.data && membersRes.data.data && membersRes.data.data.records) {
        allMembers = membersRes.data.data.records;
      } else if (membersRes.data && membersRes.data.data && Array.isArray(membersRes.data.data)) {
        allMembers = membersRes.data.data;
      } else if (membersRes.data && Array.isArray(membersRes.data)) {
        allMembers = membersRes.data;
      } else if (membersRes.data && membersRes.data.records) {
        allMembers = membersRes.data.records;
      }
      
      // Filter to only members
      allMembers = allMembers.filter(m => m && m.role === 'member');
      
      console.log('All Members Count:', allMembers.length);
      console.log('All Members:', allMembers);
      
      // Fetch ALL payments
      const paymentsRes = await api.get('/payments/all');
      let allPayments = [];
      
      if (paymentsRes.data && paymentsRes.data.data && paymentsRes.data.data.records) {
        allPayments = paymentsRes.data.data.records;
      } else if (paymentsRes.data && paymentsRes.data.data && Array.isArray(paymentsRes.data.data)) {
        allPayments = paymentsRes.data.data;
      } else if (paymentsRes.data && Array.isArray(paymentsRes.data)) {
        allPayments = paymentsRes.data;
      } else if (paymentsRes.data && paymentsRes.data.records) {
        allPayments = paymentsRes.data.records;
      }
      
      console.log('All Payments Count:', allPayments.length);
      
      // Filter payments for this specific payment type
      const paymentTypeIdStr = String(paymentTypeId);
      const paymentsForThisType = allPayments.filter(payment => {
        const paymentPaymentTypeId = payment.paymentTypeId ? String(payment.paymentTypeId) : null;
        return paymentPaymentTypeId === paymentTypeIdStr;
      });
      
      console.log('Payments for this type count:', paymentsForThisType.length);
      console.log('Payments for this type:', paymentsForThisType);
      
      // Get IDs of members who have PAID this payment type
      const paidMemberIds = [];
      paymentsForThisType.forEach(payment => {
        if (payment.status === 'paid') {
          let userId = null;
          if (payment.user && typeof payment.user === 'object') {
            userId = payment.user._id || payment.user.id;
          } else if (payment.user) {
            userId = payment.user;
          }
          if (userId && !paidMemberIds.includes(userId)) {
            paidMemberIds.push(userId);
          }
        }
      });
      
      console.log('Paid Member IDs:', paidMemberIds);
      
      // Members who have NOT paid
      const notPaidMembers = [];
      const paidMembersList = [];
      
      allMembers.forEach(member => {
        const memberId = member._id;
        const hasPaid = paidMemberIds.includes(memberId);
        
        if (hasPaid) {
          const payment = paymentsForThisType.find(p => {
            let userId = null;
            if (p.user && typeof p.user === 'object') {
              userId = p.user._id || p.user.id;
            } else if (p.user) {
              userId = p.user;
            }
            return userId === memberId && p.status === 'paid';
          });
          
          paidMembersList.push({
            id: memberId,
            name: member.name || 'Unknown',
            email: member.email || '',
            paymentDate: payment?.paidAt || payment?.createdAt,
            amount: paymentTypeAmount
          });
        } else {
          notPaidMembers.push({
            id: memberId,
            name: member.name || 'Unknown',
            email: member.email || '',
            amount: paymentTypeAmount
          });
        }
      });
      
      const totalOutstandingAmount = notPaidMembers.length * paymentTypeAmount;
      
      setPaidMembers(paidMembersList);
      setOutstandingMembers(notPaidMembers);
      setSummary({
        totalMembers: allMembers.length,
        totalOutstandingAmount: totalOutstandingAmount,
        paymentTypeName: paymentTypeName,
        paymentTypeAmount: paymentTypeAmount,
        paidCount: paidMembersList.length,
        notPaidCount: notPaidMembers.length
      });
      
      console.log('Not Paid Members:', notPaidMembers.length);
      console.log('Paid Members:', paidMembersList.length);
      
      if (toast && typeof toast.success === 'function') {
        if (notPaidMembers.length === 0) {
          toast.success(`All members have paid for ${paymentTypeName}!`);
        } else {
          toast.success(`${notPaidMembers.length} member(s) have not paid for ${paymentTypeName}`);
        }
      }
      
    } catch (error) {
      console.error('Error fetching data:', error);
      if (toast && typeof toast.error === 'function') {
        toast.error('Failed to fetch members data');
      }
      setOutstandingMembers([]);
      setPaidMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentTypeSelect = async (paymentType) => {
    if (!paymentType || !paymentType._id) return;
    setSelectedPaymentType(paymentType);
    await fetchAllMembers(paymentType._id, paymentType.name, paymentType.amount);
  };

  const exportToPDF = () => {
    const currentMembers = viewMode === 'outstanding' ? outstandingMembers : paidMembers;
    const currentTotal = viewMode === 'outstanding'
      ? summary.totalOutstandingAmount
      : (summary.paidCount * summary.paymentTypeAmount);
    
    if (currentMembers.length === 0) {
      if (toast && typeof toast.error === 'function') {
        toast.error('No data to export');
      }
      return;
    }

    const printWindow = window.open('', '_blank');
    const currentDate = new Date().toLocaleDateString('en-US');
    
    let tableRows = '';
    currentMembers.forEach((member, index) => {
      tableRows += `
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;">${index + 1}</td>
          <td style="padding: 10px; border: 1px solid #ddd;">${member.name || 'N/A'}</td>
          <td style="padding: 10px; border: 1px solid #ddd;">${member.email || 'N/A'}</td>
          ${viewMode === 'paid' ? `<td style="padding: 10px; border: 1px solid #ddd;">${member.paymentDate ? new Date(member.paymentDate).toLocaleDateString() : '-'}</td>` : ''}
          <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">₦${summary.paymentTypeAmount.toLocaleString()}</td>
        </tr>
      `;
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${summary.paymentTypeName} Report</title>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .title { font-size: 24px; font-weight: bold; color: #1e40af; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background: #2563eb; color: white; padding: 10px; text-align: left; }
          td { padding: 10px; border: 1px solid #ddd; }
          .footer { margin-top: 30px; text-align: center; font-size: 10px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">${viewMode === 'outstanding' ? 'Members Who Haven\'t Paid' : 'Members Who Paid'} - ${summary.paymentTypeName}</div>
          <div>Generated on: ${currentDate}</div>
        </div>
        <table>
          <thead>
            <tr><th>S/N</th><th>Member Name</th><th>Email</th>${viewMode === 'paid' ? '<th>Payment Date</th>' : ''}<th>Amount</th></tr>
          </thead>
          <tbody>${tableRows}</tbody>
          <tfoot>
            <tr><td colspan="${viewMode === 'paid' ? 4 : 3}" style="text-align: right;"><strong>Total:</strong></td><td style="text-align: right;"><strong>₦${currentTotal.toLocaleString()}</strong></td></tr>
          </tfoot>
        </table>
        <div class="footer"><p>FinLight - Financial Management System</p></div>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  };

  if (loadingTypes) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
        <p className="text-gray-500">Loading payment types...</p>
      </div>
    );
  }

  const currentMembers = viewMode === 'outstanding' ? outstandingMembers : paidMembers;
  const currentTotal = viewMode === 'outstanding'
    ? summary.totalOutstandingAmount
    : (summary.paidCount * summary.paymentTypeAmount);

  return (
    <div className="space-y-4">
      {/* Payment Type Selection */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <h2 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
            <Filter className="h-4 w-4 text-purple-600" />
            Filter by Payment Type
          </h2>
          <p className="text-xs text-gray-500 mt-1">Select a payment type to see members who have not paid</p>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {paymentTypes.map((type) => (
              <button
                key={type._id}
                onClick={() => handlePaymentTypeSelect(type)}
                className={`p-4 rounded-xl text-left transition-all ${
                  selectedPaymentType?._id === type._id
                    ? 'bg-purple-50 border-2 border-purple-500 shadow-md'
                    : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-800 text-sm">{type.name}</span>
                  {selectedPaymentType?._id === type._id && <CheckCircle className="h-4 w-4 text-green-500" />}
                </div>
                <p className="text-xl font-bold text-purple-600">₦{type.amount.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">{type.frequency || 'One-time'}</p>
                {type.is_mandatory && <span className="inline-block mt-2 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Required</span>}
              </button>
            ))}
          </div>
          {paymentTypes.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No payment types configured</p>
              <p className="text-xs text-gray-400 mt-1">Create payment types in the Payments page</p>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      {selectedPaymentType && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <div>
                <h2 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                  {viewMode === 'outstanding' ? <UserX className="h-4 w-4 text-red-600" /> : <CheckCircle className="h-4 w-4 text-green-600" />}
                  {viewMode === 'outstanding' ? `Members Who Haven't Paid - ${summary.paymentTypeName}` : `Members Who Paid - ${summary.paymentTypeName}`}
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Total: {currentMembers.length} members | {viewMode === 'outstanding' ? `Outstanding: ₦${currentTotal.toLocaleString()}` : `Collected: ₦${currentTotal.toLocaleString()}`}
                </p>
              </div>
              <div className="flex gap-2">
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button 
                    onClick={() => setViewMode('outstanding')} 
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${viewMode === 'outstanding' ? 'bg-red-500 text-white' : 'text-gray-600 hover:bg-gray-200'}`}
                  >
                    Not Paid ({summary.notPaidCount})
                  </button>
                  <button 
                    onClick={() => setViewMode('paid')} 
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${viewMode === 'paid' ? 'bg-green-500 text-white' : 'text-gray-600 hover:bg-gray-200'}`}
                  >
                    Paid ({summary.paidCount})
                  </button>
                </div>
                {currentMembers.length > 0 && (
                  <button onClick={exportToPDF} className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700">
                    <Download className="h-3 w-3" /> Export PDF
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
              <p className="text-gray-500">Loading members...</p>
            </div>
          ) : currentMembers.length === 0 ? (
            <div className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500">
                {viewMode === 'outstanding' 
                  ? `No outstanding payments for ${summary.paymentTypeName}`
                  : `No members have paid for ${summary.paymentTypeName} yet`}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">S/N</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Member Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Email</th>
                    {viewMode === 'paid' && <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Date</th>}
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentMembers.map((member, index) => (
                    <tr key={member.id || index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-700">{index + 1}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{member.name || 'N/A'}</td>
                      <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{member.email || 'N/A'}</td>
                      {viewMode === 'paid' && (
                        <td className="px-4 py-3 text-gray-600">
                          {member.paymentDate ? new Date(member.paymentDate).toLocaleDateString() : '-'}
                        </td>
                      )}
                      <td className={`px-4 py-3 text-right font-semibold ${viewMode === 'outstanding' ? 'text-red-600' : 'text-green-600'}`}>
                        ₦{summary.paymentTypeAmount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={viewMode === 'paid' ? 4 : 3} className="px-4 py-3 text-right font-medium">Total:</td>
                    <td className={`px-4 py-3 text-right font-bold ${viewMode === 'outstanding' ? 'text-red-600' : 'text-green-600'}`}>
                      ₦{currentTotal.toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PaymentTypeReport;