import { useState, useEffect, useMemo } from 'react';
import {
  Download, Filter, Users, DollarSign, Calendar, Clock, UserX,
  AlertCircle, Search, Loader, CheckCircle, X, ChevronLeft,
  ChevronRight, PieChart, BarChart3
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

// ============================================================
// CONSTANTS
// ============================================================
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH_KEYS = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];

const PaymentTypeReport = ({ dateRange, isMobile }) => {
  // ============================================================
  // STATE Ã¢â‚¬â€ EXISTING
  // ============================================================
  const [paymentTypes, setPaymentTypes] = useState([]);
  const [selectedPaymentType, setSelectedPaymentType] = useState(null);
  const [outstandingMembers, setOutstandingMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [viewMode, setViewMode] = useState('outstanding');
  const [paidMembers, setPaidMembers] = useState([]);
  const [showResultsModal, setShowResultsModal] = useState(false);

  const [summary, setSummary] = useState({
    totalMembers: 0,
    totalOutstandingAmount: 0,
    paymentTypeName: '',
    paymentTypeAmount: 0,
    paidCount: 0,
    notPaidCount: 0,
    partialCount: 0,
    totalPaidAmount: 0,
    totalRemainingAmount: 0
  });

  // ============================================================
  // STATE Ã¢â‚¬â€ NEW: DUES MODAL
  // ============================================================
  const [showDuesModal, setShowDuesModal] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [duesMatrix, setDuesMatrix] = useState([]);
  const [duesSummary, setDuesSummary] = useState({
    paymentTypeName: '',
    paymentTypeAmount: 0,
    year: new Date().getFullYear(),
    monthTotals: {},
    grandTotal: 0,
    memberCount: 0
  });
  const [loadingDues, setLoadingDues] = useState(false);

  // ============================================================
  // AVAILABLE YEARS
  // ============================================================
  const availableYears = useMemo(() => {
    const y = new Date().getFullYear();
    return [y - 2, y - 1, y, y + 1, y + 2];
  }, []);

  // ============================================================
  // EFFECTS
  // ============================================================
  useEffect(() => {
    fetchPaymentTypes();
  }, []);

  useEffect(() => {
    if (showDuesModal && selectedPaymentType) {
      fetchDuesReport(selectedPaymentType, selectedYear);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear]);

  // ============================================================
  // FETCH PAYMENT TYPES
  // ============================================================
  const fetchPaymentTypes = async () => {
    setLoadingTypes(true);
    try {
      const response = await api.get('/payment-types');

      let types = [];

      if (response?.data?.data?.records && Array.isArray(response.data.data.records)) {
        types = response.data.data.records;
      } else if (Array.isArray(response?.data?.records)) {
        types = response.data.records;
      } else if (Array.isArray(response?.data?.data)) {
        types = response.data.data;
      } else if (Array.isArray(response?.data)) {
        types = response.data;
      }

      setPaymentTypes(types);
    } catch (error) {
      console.error('Error fetching Contribution:', error);
      if (toast && typeof toast.error === 'function') {
        toast.error('Failed to load Contribution');
      }
      setPaymentTypes([]);
    } finally {
      setLoadingTypes(false);
    }
  };

  // ============================================================
  // NEW: FETCH DUES REPORT (matrix per member per month)
  // ============================================================
  const fetchDuesReport = async (paymentType, year) => {
    setLoadingDues(true);
    try {
      const paymentTypeId = String(paymentType._id);


      // ============================================================
      // 1. Fetch ALL members (paginated)
      // ============================================================
      let allMembers = [];
      let page = 1;
      const pageLimit = 100;
      let hasMore = true;
      let safety = 0;

      while (hasMore && safety < 20) {
        safety++;
        const membersRes = await api.get(`/users?limit=${pageLimit}&page=${page}`);

        let pageMembers = [];
        if (membersRes?.data?.data && Array.isArray(membersRes.data.data)) {
          pageMembers = membersRes.data.data;
        } else if (Array.isArray(membersRes?.data)) {
          pageMembers = membersRes.data;
        } else if (membersRes?.data?.records && Array.isArray(membersRes.data.records)) {
          pageMembers = membersRes.data.records;
        } else if (membersRes?.data?.data?.records && Array.isArray(membersRes.data.data.records)) {
          pageMembers = membersRes.data.data.records;
        }

        if (!pageMembers || pageMembers.length === 0) {
          hasMore = false;
        } else {
          allMembers = [...allMembers, ...pageMembers];
          if (pageMembers.length < pageLimit) hasMore = false;
          else page += 1;
        }
      }

      allMembers = allMembers.filter(m => m && m.role === 'member');

      // ============================================================
      // 2. Fetch ALL payments from /payments/all Ã¢Â­Â THE WORKING ENDPOINT
      // ============================================================
      let allPayments = [];

      try {
        const paymentsRes = await api.get('/payments/all');

        if (paymentsRes?.data?.data?.records && Array.isArray(paymentsRes.data.data.records)) {
          allPayments = paymentsRes.data.data.records;
        } else if (paymentsRes?.data?.records && Array.isArray(paymentsRes.data.records)) {
          allPayments = paymentsRes.data.records;
        } else if (paymentsRes?.data?.data && Array.isArray(paymentsRes.data.data)) {
          allPayments = paymentsRes.data.data;
        } else if (Array.isArray(paymentsRes?.data)) {
          allPayments = paymentsRes.data;
        }


        // Ã¢Â­Â Diagnostic: show all paymentTypeIds
              } catch (err) {
        console.error('Ã¢ÂÅ’ Failed to fetch /payments/all:', err.message);
        allPayments = [];
      }

      // ============================================================
      // 3. Filter payments to this dues type (robust matching)
      // ============================================================
      const duesPayments = allPayments.filter(p => {
        let pid = null;
        if (p.paymentTypeId) {
          if (typeof p.paymentTypeId === 'object') {
            pid = String(p.paymentTypeId._id || p.paymentTypeId.id || p.paymentTypeId);
          } else {
            pid = String(p.paymentTypeId);
          }
        }

        // Match by ID
        if (pid && pid === paymentTypeId) return true;

        // Fallback: match by name
        if (p.name && paymentType.name &&
          String(p.name).toLowerCase() === String(paymentType.name).toLowerCase()) {
          return true;
        }

        return false;
      });


      // ============================================================
      // 4. Build matrix Ã¢â‚¬â€ one row per member, one column per month
      // ============================================================
      const matrix = allMembers.map(member => {
        const memberId = member._id || member.id;
        const months = {};
        MONTH_KEYS.forEach(k => { months[k] = 0; });

        const memberPayments = duesPayments.filter(p => {
          const uid = p.user && typeof p.user === 'object'
            ? (p.user._id || p.user.id)
            : p.user;
          return String(uid) === String(memberId);
        });


        memberPayments.forEach(payment => {
          const status = (payment?.status || '').toLowerCase();
          if (status !== 'paid' && status !== 'partial') return;

          const paidMonths = Array.isArray(payment.paidMonths) && payment.paidMonths.length
            ? payment.paidMonths
            : Array.isArray(payment.months) ? payment.months : [];

          const monthlyPrice = Number(payment.monthlyPrice) || 0;
          const penaltyByMonth = {};
          if (Array.isArray(payment.penaltyBreakdown)) {
            payment.penaltyBreakdown.forEach(b => {
              if (b?.month) {
                const parts = String(b.month).split('-');
                const mk = parts.length === 2 ? parts[1] : String(b.month).padStart(2, '0');
                penaltyByMonth[mk] = (penaltyByMonth[mk] || 0) + (b.isLate ? Number(b.penalty) || 0 : 0);
              }
            });
          }

          if (paidMonths.length > 0) {
            paidMonths.forEach(mk => {
              const parts = String(mk).split('-');
              let monthKey = null;
              let y = null;

              if (parts.length === 2) {
                y = parts[0];
                monthKey = parts[1];
              } else if (/^\d{1,2}$/.test(mk)) {
                monthKey = String(mk).padStart(2, '0');
              } else {
                const idx = MONTHS.findIndex(m => m.toLowerCase() === String(mk).toLowerCase().slice(0, 3));
                if (idx >= 0) monthKey = MONTH_KEYS[idx];
              }

              if (!monthKey || (y && Number(y) !== year)) return;

              const base = monthlyPrice || (Number(payment.amount) || 0) / paidMonths.length;
              const penalty = penaltyByMonth[monthKey] || 0;
              months[monthKey] = (months[monthKey] || 0) + base + penalty;
            });
          } else {
            // fallback to paidAt
            const dateVal = payment.paidAt || payment.updatedAt || payment.createdAt;
            if (dateVal) {
              const d = new Date(dateVal);
              if (!isNaN(d.getTime()) && d.getFullYear() === year) {
                const mk = String(d.getMonth() + 1).padStart(2, '0');
                const base = Number(payment.amount) || 0;
                const penalty = Object.values(penaltyByMonth).reduce((s, v) => s + v, 0);
                months[mk] = (months[mk] || 0) + base + penalty;
              }
            }
          }
        });

        const total = Object.values(months).reduce((s, v) => s + v, 0);

        return {
          memberId,
          name: member.name || 'Unknown',
          email: member.email || '',
          months,
          total
        };
      });

      // ============================================================
      // 5. Column totals
      // ============================================================
      const monthTotals = {};
      MONTH_KEYS.forEach(k => { monthTotals[k] = 0; });
      matrix.forEach(row => {
        MONTH_KEYS.forEach(k => {
          monthTotals[k] += row.months[k] || 0;
        });
      });
      const grandTotal = Object.values(monthTotals).reduce((s, v) => s + v, 0);


      setDuesMatrix(matrix);
      setDuesSummary({
        paymentTypeName: paymentType.name || 'Dues',
        paymentTypeAmount: Number(paymentType.amount) || 0,
        year,
        monthTotals,
        grandTotal,
        memberCount: matrix.length
      });
    } catch (error) {
      console.error('Error fetching dues report:', error);
      toast.error('Failed to load dues report');
      setDuesMatrix([]);
    } finally {
      setLoadingDues(false);
    }
  };
  // ============================================================
  // EXISTING: FETCH ALL MEMBERS (non-dues path)
  // ============================================================
  const fetchAllMembers = async (paymentTypeId, paymentTypeName, paymentTypeAmount) => {
    setLoading(true);
    try {
      // Fetch ALL members
      const membersRes = await api.get('/users?limit=100');
      let allMembers = [];

      if (membersRes?.data?.data && Array.isArray(membersRes.data.data)) {
        allMembers = membersRes.data.data;
      } else if (Array.isArray(membersRes?.data)) {
        allMembers = membersRes.data;
      } else if (membersRes?.data?.records && Array.isArray(membersRes.data.records)) {
        allMembers = membersRes.data.records;
      }

      allMembers = allMembers.filter(m => m && m.role === 'member');

      // Fetch ALL payments
      const paymentsRes = await api.get('/payments/all');
      let allPayments = [];

      if (paymentsRes?.data?.data?.records && Array.isArray(paymentsRes.data.data.records)) {
        allPayments = paymentsRes.data.data.records;
      } else if (paymentsRes?.data?.records && Array.isArray(paymentsRes.data.records)) {
        allPayments = paymentsRes.data.records;
      } else if (paymentsRes?.data?.data && Array.isArray(paymentsRes.data.data)) {
        allPayments = paymentsRes.data.data;
      } else if (Array.isArray(paymentsRes?.data)) {
        allPayments = paymentsRes.data;
      }

      const paymentTypeIdStr = String(paymentTypeId);

      const paymentsForThisType = allPayments.filter(payment => {
        let paymentTypeIdValue = null;
        if (payment.paymentTypeId && typeof payment.paymentTypeId === 'object') {
          paymentTypeIdValue = payment.paymentTypeId._id || payment.paymentTypeId;
        } else if (payment.paymentTypeId) {
          paymentTypeIdValue = String(payment.paymentTypeId);
        }
        return String(paymentTypeIdValue) === paymentTypeIdStr;
      });

      const paidMembersList = [];
      const outstandingMembersList = [];
      let totalPaidAmount = 0;
      let totalRemainingAmount = 0;
      let partialCount = 0;
      let paidCount = 0;

      allMembers.forEach(member => {
        const memberId = member._id;

        const memberPayments = paymentsForThisType.filter(p => {
          let userId = null;
          if (p.user && typeof p.user === 'object') {
            userId = p.user._id || p.user.id;
          } else if (p.user) {
            userId = p.user;
          }
          return userId === memberId;
        });

        const fullyPaidPayment = memberPayments.find(
          p => p.status === 'paid' && p.isPartial !== true
        );
        const partialPayment = memberPayments.find(
          p => (p.status === 'partial' || p.isPartial === true) && p.remainingAmount > 0
        );
        const outstandingRecord = memberPayments.find(
          p => p.type === 'outstanding' && p.status === 'unpaid'
        );

        if (fullyPaidPayment) {
          paidMembersList.push({
            id: memberId,
            name: member.name || 'Unknown',
            email: member.email || '',
            paymentDate: fullyPaidPayment.paidAt || fullyPaidPayment.createdAt,
            amount: paymentTypeAmount,
            status: 'paid',
            isPartial: false
          });
          totalPaidAmount += paymentTypeAmount;
          paidCount++;
        } else if (partialPayment || outstandingRecord) {
          const remainingAmount =
            partialPayment?.remainingAmount || outstandingRecord?.amount || paymentTypeAmount;

          let netReceived = paymentTypeAmount - remainingAmount;
          if (netReceived <= 0) {
            const paidAmount =
              partialPayment?.totalPaidSoFar || partialPayment?.amount || 0;
            if (paidAmount > 0) netReceived = paidAmount * 0.96;
            else netReceived = paymentTypeAmount;
          }

          const displayPaidAmount = Math.round(netReceived);

          paidMembersList.push({
            id: memberId,
            name: member.name || 'Unknown',
            email: member.email || '',
            paymentDate: partialPayment?.paidAt || partialPayment?.createdAt || new Date(),
            amount: displayPaidAmount,
            totalAmount: paymentTypeAmount,
            paidAmount: displayPaidAmount,
            netReceived: displayPaidAmount,
            remainingAmount,
            status: 'partial',
            isPartial: true
          });

          outstandingMembersList.push({
            id: memberId,
            name: member.name || 'Unknown',
            email: member.email || '',
            remainingAmount,
            paidAmount: displayPaidAmount,
            totalAmount: paymentTypeAmount,
            netReceived: displayPaidAmount,
            paymentDate: partialPayment?.paidAt || partialPayment?.createdAt,
            status: 'partial',
            isPartial: true
          });

          totalPaidAmount += displayPaidAmount;
          totalRemainingAmount += remainingAmount;
          partialCount++;
          paidCount++;
        } else {
          outstandingMembersList.push({
            id: memberId,
            name: member.name || 'Unknown',
            email: member.email || '',
            remainingAmount: paymentTypeAmount,
            totalAmount: paymentTypeAmount,
            status: 'not_paid',
            isPartial: false
          });
          totalRemainingAmount += paymentTypeAmount;
        }
      });

      setPaidMembers(paidMembersList);
      setOutstandingMembers(outstandingMembersList);

      setSummary({
        totalMembers: allMembers.length,
        totalOutstandingAmount: totalRemainingAmount,
        paymentTypeName,
        paymentTypeAmount,
        paidCount,
        notPaidCount: outstandingMembersList.length,
        partialCount,
        totalPaidAmount,
        totalRemainingAmount
      });

      setShowResultsModal(true);

      if (toast && typeof toast.success === 'function') {
        if (outstandingMembersList.length === 0) {
          toast.success(`All members have paid for ${paymentTypeName}!`);
        } else {
          toast.success(
            `${outstandingMembersList.length} member(s) have not fully paid for ${paymentTypeName}`
          );
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

  // ============================================================
  // HANDLE SELECTION Ã¢â‚¬â€ branch on dues type
  // ============================================================
  const handlePaymentTypeSelect = async (paymentType) => {
    if (!paymentType || !paymentType._id) return;
    setSelectedPaymentType(paymentType);

    const typeStr = String(paymentType.type || '').toLowerCase();
    const nameStr = String(paymentType.name || '').toLowerCase();
    const isDues =
      typeStr === 'dues' ||
      typeStr === 'monthly_dues' ||
      nameStr.includes('due');

    if (isDues) {
      setShowDuesModal(true);
      await fetchDuesReport(paymentType, selectedYear);
    } else {
      await fetchAllMembers(paymentType._id, paymentType.name, paymentType.amount);
    }
  };

  // ============================================================
  // EXPORT Ã¢â‚¬â€ EXISTING (non-dues)
  // ============================================================
  const exportToPDF = () => {
    const currentMembers = viewMode === 'outstanding' ? outstandingMembers : paidMembers;

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
      let displayAmount = 0;

      if (viewMode === 'paid') {
        displayAmount = member.amount || 0;
      } else {
        displayAmount = member.remainingAmount || 0;
      }

      let statusColumn = '';
      if (viewMode === 'outstanding') {
        if (member.isPartial) {
          statusColumn = `<td style="padding: 8px; border: 1px solid #ddd;">
            <span style="background: #ff9800; color: white; padding: 2px 8px; border-radius: 12px; font-size: 10px;">Partial</span>
            <span style="font-size: 10px; color: #666; display: block;">Ã¢â€šÂ¦${(member.paidAmount || 0).toLocaleString()} paid</span>
          </td>`;
        } else {
          statusColumn = `<td style="padding: 8px; border: 1px solid #ddd;">
            <span style="background: #f44336; color: white; padding: 2px 8px; border-radius: 12px; font-size: 10px;">Not Paid</span>
          </td>`;
        }
      }

      let nameColumn = `<td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; font-size: 12px;">${member.name || 'N/A'}`;
      if (member.isPartial && viewMode === 'paid') {
        nameColumn += ` <span style="background: #ff9800; color: white; padding: 2px 8px; border-radius: 12px; font-size: 9px; margin-left: 4px;">Partial</span>`;
      }
      nameColumn += `</td>`;

      const emailColumn = `<td style="padding: 8px; border: 1px solid #ddd; font-size: 11px;">${member.email || 'N/A'}</td>`;

      let paymentDateColumn = '';
      if (viewMode === 'paid') {
        paymentDateColumn = `<td style="padding: 8px; border: 1px solid #ddd; font-size: 11px;">${member.paymentDate ? new Date(member.paymentDate).toLocaleDateString() : '-'
          }</td>`;
      }

      tableRows += `
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: center; font-size: 11px;">${index + 1}</td>
        ${nameColumn}
        ${emailColumn}
        ${viewMode === 'outstanding' ? statusColumn : ''}
        ${viewMode === 'paid' ? paymentDateColumn : ''}
        <td style="padding: 8px; border: 1px solid #ddd; text-align: right; font-weight: bold; font-size: 12px; color: ${viewMode === 'paid' ? '#2e7d32' : '#c62828'};">
          Ã¢â€šÂ¦${displayAmount.toLocaleString()}
          ${member.isPartial && viewMode === 'paid' ? `<div style="font-size: 9px; color: #666; font-weight: normal;">Total: Ã¢â€šÂ¦${(member.totalAmount || 0).toLocaleString()}</div>` : ''}
        </td>
      </tr>
    `;
    });

    const totalAmount = currentMembers.reduce((sum, m) => {
      if (viewMode === 'paid') return sum + (m.amount || 0);
      return sum + (m.remainingAmount || 0);
    }, 0);

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${summary.paymentTypeName} Report</title>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: Arial, sans-serif; margin: 15px; }
        .header { text-align: center; margin-bottom: 20px; }
        .title { font-size: 20px; font-weight: bold; color: #1e40af; }
        .subtitle { font-size: 12px; color: #666; margin-top: 4px; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 11px; }
        th { background: #2563eb; color: white; padding: 8px; text-align: left; font-size: 10px; }
        td { padding: 8px; border: 1px solid #ddd; font-size: 11px; }
        .footer { margin-top: 20px; text-align: center; font-size: 9px; color: #666; border-top: 1px solid #ddd; padding-top: 15px; }
        .total-row { background: #f5f5f5; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="title">${viewMode === 'outstanding' ? "Members Who Haven't Paid Fully" : 'Members Who Paid'} - ${summary.paymentTypeName}</div>
        <div class="subtitle">Payment Type: ${summary.paymentTypeName} | Amount: Ã¢â€šÂ¦${(summary.paymentTypeAmount || 0).toLocaleString()}</div>
        <div class="subtitle">Generated on: ${currentDate} | Total Members: ${currentMembers.length}</div>
      </div>
      <table>
        <thead>
          <tr>
            <th style="text-align: center; width: 40px;">S/N</th>
            <th>Member Name</th>
            <th>Email</th>
            ${viewMode === 'outstanding' ? '<th>Status</th>' : ''}
            ${viewMode === 'paid' ? '<th>Payment Date</th>' : ''}
            <th style="text-align: right;">${viewMode === 'paid' ? 'Amount Paid' : 'Remaining'}</th>
          </tr>
        </thead>
        <tbody>${tableRows}</tbody>
        <tfoot>
          <tr class="total-row">
            <td colspan="${viewMode === 'paid' ? 4 : 3}" style="text-align: right; font-size: 12px;">
              <strong>Total ${viewMode === 'paid' ? 'Collected' : 'Remaining'}:</strong>
            </td>
            <td style="text-align: right; font-size: 12px; font-weight: bold; color: ${viewMode === 'paid' ? '#2e7d32' : '#c62828'};">
              Ã¢â€šÂ¦${totalAmount.toLocaleString()}
            </td>
          </tr>
        </tfoot>
      </table>
      <div class="footer">
        <p>FinLight - Financial Management System</p>
      </div>
    </body>
    </html>
  `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  };

  // ============================================================
  // NEW: EXPORT DUES MATRIX
  // ============================================================
  const exportDuesToPDF = () => {
    if (duesMatrix.length === 0) {
      toast.error('No data to export');
      return;
    }

    const printWindow = window.open('', '_blank');
    const currentDate = new Date().toLocaleDateString('en-US');

    let headerCells = MONTHS.map(
      m => `<th style="padding:6px;border:1px solid #ddd;background:#2563eb;color:white;font-size:10px;">${m}</th>`
    ).join('');
    headerCells += `<th style="padding:6px;border:1px solid #ddd;background:#1e40af;color:white;font-size:10px;">Total</th>`;

    let bodyRows = duesMatrix.map((row, i) => {
      const monthCells = MONTH_KEYS.map(
        k => `<td style="padding:6px;border:1px solid #ddd;text-align:right;font-size:10px;">
          ${row.months[k] > 0 ? 'Ã¢â€šÂ¦' + row.months[k].toLocaleString() : '-'}
        </td>`
      ).join('');

      return `
        <tr>
          <td style="padding:6px;border:1px solid #ddd;text-align:center;font-size:10px;">${i + 1}</td>
          <td style="padding:6px;border:1px solid #ddd;font-weight:bold;font-size:10px;">${row.name}</td>
          ${monthCells}
          <td style="padding:6px;border:1px solid #ddd;text-align:right;font-weight:bold;font-size:10px;color:#1e40af;">
            Ã¢â€šÂ¦${row.total.toLocaleString()}
          </td>
        </tr>`;
    }).join('');

    const totalsCells = MONTH_KEYS.map(
      k => `<td style="padding:6px;border:1px solid #ddd;text-align:right;font-weight:bold;font-size:10px;background:#f5f5f5;">
        Ã¢â€šÂ¦${(duesSummary.monthTotals[k] || 0).toLocaleString()}
      </td>`
    ).join('');

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Dues Report Ã¢â‚¬â€ ${duesSummary.year}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 12px; }
        .title { text-align:center; font-size:18px; font-weight:bold; color:#1e40af; }
        .subtitle { text-align:center; font-size:11px; color:#666; margin-top:4px; }
        table { width:100%; border-collapse:collapse; margin-top:12px; }
      </style>
    </head>
    <body>
      <div class="title">Dues Report Ã¢â‚¬â€ ${duesSummary.paymentTypeName}</div>
      <div class="subtitle">Year: ${duesSummary.year} | Members: ${duesSummary.memberCount} | Grand Total: Ã¢â€šÂ¦${duesSummary.grandTotal.toLocaleString()}</div>
      <div class="subtitle">Generated: ${currentDate}</div>
      <table>
        <thead>
          <tr>
            <th style="padding:6px;border:1px solid #ddd;background:#2563eb;color:white;font-size:10px;">#</th>
            <th style="padding:6px;border:1px solid #ddd;background:#2563eb;color:white;font-size:10px;">Member</th>
            ${headerCells}
          </tr>
        </thead>
        <tbody>${bodyRows}</tbody>
        <tfoot>
          <tr>
            <td colspan="2" style="padding:6px;border:1px solid #ddd;text-align:right;font-weight:bold;font-size:10px;background:#f5f5f5;">TOTALS</td>
            ${totalsCells}
            <td style="padding:6px;border:1px solid #ddd;text-align:right;font-weight:bold;font-size:10px;background:#1e40af;color:white;">
              Ã¢â€šÂ¦${duesSummary.grandTotal.toLocaleString()}
            </td>
          </tr>
        </tfoot>
      </table>
    </body>
    </html>`;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  };

  // ============================================================
  // COMPUTED
  // ============================================================
  const getCurrentItems = () =>
    viewMode === 'outstanding' ? outstandingMembers : paidMembers;

  const currentItems = getCurrentItems();
  const currentTotal = currentItems.reduce((sum, m) => {
    if (viewMode === 'paid') return sum + (m.amount || 0);
    return sum + (m.remainingAmount || 0);
  }, 0);

  const closeModal = () => {
    setShowResultsModal(false);
    setViewMode('outstanding');
  };

  const closeDuesModal = () => {
    setShowDuesModal(false);
  };

  // ============================================================
  // LOADING STATE
  // ============================================================
  if (loadingTypes) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p className="text-xs text-gray-500">Loading Contributions...</p>
      </div>
    );
  }

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="space-y-3">
      {/* Payment Type Selection */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-3 py-2 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <h2 className="font-semibold text-gray-800 text-xs flex items-center gap-1.5">
            <Filter className="h-3.5 w-3.5 text-blue-600" />
            Filter by Contribution
          </h2>
          <p className="text-[10px] text-gray-500 mt-0.5">
            Select a contribution to see members who have not paid
          </p>
        </div>
        <div className="p-2.5">
          <div className="grid grid-cols-2 gap-2">
            {paymentTypes.map((type) => (
              <button
                key={type._id}
                onClick={() => handlePaymentTypeSelect(type)}
                className={`p-2.5 rounded-lg text-left transition-all ${selectedPaymentType?._id === type._id
                  ? 'bg-blue-50 border-2 border-blue-500 shadow-sm'
                  : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                  }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-gray-800 text-[11px] truncate max-w-[70px]">
                    {type.name || 'Unknown'}
                  </span>
                  {selectedPaymentType?._id === type._id && (
                    <CheckCircle className="h-3 w-3 text-blue-500 flex-shrink-0" />
                  )}
                </div>
                <div className="flex items-center justify-between mb-1">
                  {type.is_mandatory && (
                    <span className="inline-block mt-0.5 text-[8px] bg-gray-50 text-gray-700 px-1.5 py-0.5 rounded-full">
                      Required
                    </span>
                  )}
                  <p className="text-[10px] text-blue-500">View List</p>
                </div>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-bold text-blue-600">
                    Ã¢â€šÂ¦{(type.amount || 0).toLocaleString()}
                  </p>
                  <p className="text-[9px] text-gray-500 mt-0.5">
                    {type.frequency || 'One-time'}
                  </p>
                </div>
              </button>
            ))}
          </div>
          {paymentTypes.length === 0 && (
            <div className="text-center py-6">
              <p className="text-xs text-gray-500">No Contribution configured</p>
              <p className="text-[10px] text-gray-400 mt-1">
                Create Contribution in the Payments page
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================
          NEW: DUES MODAL
      ============================================================ */}
      {showDuesModal && selectedPaymentType && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center animate-fadeIn">
          <div className="bg-white w-full h-full md:max-w-6xl md:max-h-[92vh] md:rounded-2xl overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex-shrink-0 px-3 py-2 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <button
                  onClick={closeDuesModal}
                  className="p-1 hover:bg-gray-200 rounded-lg transition-colors flex-shrink-0"
                >
                  <X className="h-4 w-4 text-gray-600" />
                </button>
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-800 text-sm truncate">
                    {duesSummary.paymentTypeName} Ã¢â‚¬â€ Dues Report
                  </h3>
                  <p className="text-[10px] text-gray-500 truncate">
                    Ã¢â€šÂ¦{duesSummary.paymentTypeAmount.toLocaleString()} / month Ã¢â‚¬Â¢{' '}
                    {duesSummary.memberCount} members
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Year selector */}
                <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg px-2 py-1">
                  <Calendar className="h-3.5 w-3.5 text-gray-500" />
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="text-xs font-medium text-gray-700 bg-transparent border-none focus:outline-none"
                  >
                    {availableYears.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={exportDuesToPDF}
                  className="flex items-center gap-1 px-2 py-1 bg-blue-600 text-white rounded-lg text-[10px] font-medium hover:bg-blue-700 transition-colors"
                >
                  <Download className="h-3 w-3" />
                  <span className="hidden xs:inline">Export</span>
                </button>
              </div>
            </div>

            {/* Summary bar */}
            <div className="flex-shrink-0 px-3 py-2 bg-blue-50 border-b border-blue-100 flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-3 text-[10px]">
                <span className="text-gray-600">
                  Grand Total:{' '}
                  <span className="font-bold text-blue-700">
                    Ã¢â€šÂ¦{duesSummary.grandTotal.toLocaleString()}
                  </span>
                </span>
                <span className="text-gray-600">
                  Members:{' '}
                  <span className="font-bold text-gray-800">
                    {duesSummary.memberCount}
                  </span>
                </span>
                <span className="text-gray-600">
                  Year:{' '}
                  <span className="font-bold text-gray-800">
                    {duesSummary.year}
                  </span>
                </span>
              </div>
            </div>

            {/* Body Ã¢â‚¬â€ matrix table */}
            <div className="flex-1 overflow-auto p-2">
              {loadingDues ? (
                <div className="py-12 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-xs text-gray-500">Loading dues data...</p>
                </div>
              ) : duesMatrix.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-2">
                    <Search className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="text-xs text-gray-500">No members found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-[10px] border-collapse">
                    <thead className="bg-blue-600 text-white sticky top-0">
                      <tr>
                        <th className="px-1.5 py-1.5 text-center font-medium w-8 border border-blue-700">
                          #
                        </th>
                        <th className="px-1.5 py-1.5 text-left font-medium border border-blue-700 min-w-[100px]">
                          Member
                        </th>
                        {MONTHS.map((m) => (
                          <th
                            key={m}
                            className="px-1 py-1.5 text-center font-medium border border-blue-700 w-12"
                          >
                            {m}
                          </th>
                        ))}
                        <th className="px-1.5 py-1.5 text-right font-medium border border-blue-700 bg-blue-700 min-w-[70px]">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {duesMatrix.map((row, i) => (
                        <tr key={row.memberId || i} className="hover:bg-blue-50/40">
                          <td className="px-1.5 py-1 text-center text-gray-500 border border-gray-100">
                            {i + 1}
                          </td>
                          <td className="px-1.5 py-1 font-medium text-gray-800 border border-gray-100 whitespace-nowrap">
                            {row.name}
                          </td>
                          {MONTH_KEYS.map((k) => {
                            const v = row.months[k] || 0;
                            const isPaid = v > 0;
                            return (
                              <td
                                key={k}
                                className={`px-1 py-1 text-center border border-gray-100 ${isPaid ? 'text-blue-700 font-semibold' : 'text-gray-300'
                                  }`}
                              >
                                {isPaid ? `Ã¢â€šÂ¦${v.toLocaleString()}` : 'Ã¢â‚¬â€œ'}
                              </td>
                            );
                          })}
                          <td className="px-1.5 py-1 text-right font-bold text-blue-700 border border-gray-100 bg-blue-50/50">
                            Ã¢â€šÂ¦{row.total.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-100 sticky bottom-0">
                      <tr>
                        <td
                          colSpan="2"
                          className="px-1.5 py-1.5 text-right font-bold text-gray-800 border border-gray-200"
                        >
                          TOTALS
                        </td>
                        {MONTH_KEYS.map((k) => (
                          <td
                            key={k}
                            className="px-1 py-1.5 text-center font-bold text-gray-800 border border-gray-200"
                          >
                            Ã¢â€šÂ¦{(duesSummary.monthTotals[k] || 0).toLocaleString()}
                          </td>
                        ))}
                        <td className="px-1.5 py-1.5 text-right font-bold text-white bg-blue-700 border border-blue-700">
                          Ã¢â€šÂ¦{duesSummary.grandTotal.toLocaleString()}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          EXISTING: NON-DUES MODAL
      ============================================================ */}
      {showResultsModal && selectedPaymentType && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center animate-fadeIn">
          <div className="bg-white w-full h-full md:max-w-4xl md:max-h-[90vh] md:rounded-2xl overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex-shrink-0 px-3 py-2 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-white flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <button
                  onClick={closeModal}
                  className="p-1 hover:bg-gray-200 rounded-lg transition-colors flex-shrink-0"
                >
                  <X className="h-4 w-4 text-gray-600" />
                </button>
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-800 text-sm truncate">
                    {summary.paymentTypeName}
                  </h3>
                  <p className="text-[10px] text-gray-500 truncate">
                    Ã¢â€šÂ¦{(summary.paymentTypeAmount || 0).toLocaleString()} Ã¢â‚¬Â¢{' '}
                    {outstandingMembers.length + paidMembers.length} members
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {currentItems.length > 0 && (
                  <button
                    onClick={exportToPDF}
                    className="flex items-center gap-1 px-2 py-1 bg-blue-600 text-white rounded-lg text-[10px] font-medium hover:bg-blue-700 transition-colors"
                  >
                    <Download className="h-3 w-3" />
                    <span className="hidden xs:inline">Export</span>
                  </button>
                )}
                <button
                  onClick={closeModal}
                  className="p-1 hover:bg-gray-200 rounded-lg transition-colors hidden sm:inline-flex"
                >
                  <X className="h-4 w-4 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {/* Summary Cards */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-blue-50 rounded-lg p-2 text-center">
                  <p className="text-[9px] text-gray-500">Paid</p>
                  <p className="text-sm font-bold text-blue-600">{summary.paidCount}</p>
                  <p className="text-[8px] text-blue-500">
                    Ã¢â€šÂ¦{summary.totalPaidAmount.toLocaleString()}
                  </p>
                </div>
                <div className="bg-orange-50 rounded-lg p-2 text-center">
                  <p className="text-[9px] text-gray-500">Partial</p>
                  <p className="text-sm font-bold text-orange-600">
                    {summary.partialCount}
                  </p>
                  <p className="text-[8px] text-orange-500">
                    Ã¢â€šÂ¦{summary.totalRemainingAmount.toLocaleString()}
                  </p>
                </div>
                <div className="bg-red-50 rounded-lg p-2 text-center">
                  <p className="text-[9px] text-gray-500">Unpaid</p>
                  <p className="text-sm font-bold text-red-600">
                    {outstandingMembers.filter((m) => !m.isPartial).length}
                  </p>
                  <p className="text-[8px] text-red-500">
                    Ã¢â€šÂ¦
                    {outstandingMembers
                      .filter((m) => !m.isPartial)
                      .reduce((sum, m) => sum + (m.remainingAmount || 0), 0)
                      .toLocaleString()}
                  </p>
                </div>
              </div>

              {/* View Toggle */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex bg-gray-100 rounded-lg p-0.5">
                  <button
                    onClick={() => setViewMode('outstanding')}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-all ${viewMode === 'outstanding'
                      ? 'bg-red-500 text-white'
                      : 'text-gray-600 hover:bg-gray-200'
                      }`}
                  >
                    Unpaid ({outstandingMembers.length})
                  </button>
                  <button
                    onClick={() => setViewMode('paid')}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-all ${viewMode === 'paid'
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-600 hover:bg-gray-200'
                      }`}
                  >
                    Paid ({paidMembers.length})
                  </button>
                </div>
                <span className="text-[9px] text-gray-400">
                  {currentItems.length} members
                </span>
              </div>

              {/* Partial Alert */}
              {summary.partialCount > 0 && (
                <div className="p-1.5 bg-orange-50 rounded-lg border border-orange-200">
                  <p className="text-[9px] text-orange-700">
                    <span className="font-medium">{summary.partialCount}</span> member(s)
                    have partial payments
                    {viewMode === 'outstanding'
                      ? ` Ã¢â‚¬Â¢ Remaining: Ã¢â€šÂ¦${outstandingMembers
                        .filter((m) => m.isPartial)
                        .reduce((sum, m) => sum + (m.remainingAmount || 0), 0)
                        .toLocaleString()}`
                      : ` Ã¢â‚¬Â¢ Paid: Ã¢â€šÂ¦${paidMembers
                        .filter((m) => m.isPartial)
                        .reduce((sum, m) => sum + (m.amount || 0), 0)
                        .toLocaleString()}`}
                  </p>
                </div>
              )}

              {/* Results Table */}
              {loading ? (
                <div className="py-8 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-xs text-gray-500">Loading members...</p>
                </div>
              ) : currentItems.length === 0 ? (
                <div className="py-8 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-2">
                    <Search className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="text-xs text-gray-500">
                    {viewMode === 'outstanding'
                      ? `No outstanding payments for ${summary.paymentTypeName}`
                      : `No members have paid for ${summary.paymentTypeName} yet`}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto -mx-3">
                  <div className="px-3">
                    <table className="w-full text-xs">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-2 py-1.5 text-left text-[9px] font-medium text-gray-500 uppercase w-8">
                            #
                          </th>
                          <th className="px-2 py-1.5 text-left text-[9px] font-medium text-gray-500 uppercase">
                            Name
                          </th>
                          <th className="px-2 py-1.5 text-left text-[9px] font-medium text-gray-500 uppercase hidden sm:table-cell">
                            Email
                          </th>
                          {viewMode === 'outstanding' && (
                            <th className="px-2 py-1.5 text-left text-[9px] font-medium text-gray-500 uppercase">
                              Status
                            </th>
                          )}
                          {viewMode === 'paid' && (
                            <th className="px-2 py-1.5 text-left text-[9px] font-medium text-gray-500 uppercase hidden xs:table-cell">
                              Date
                            </th>
                          )}
                          <th className="px-2 py-1.5 text-right text-[9px] font-medium text-gray-500 uppercase">
                            {viewMode === 'paid' ? 'Paid' : 'Remaining'}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {currentItems.slice(0, 50).map((member, index) => {
                          const isPartial = member.isPartial === true;

                          const displayAmount =
                            viewMode === 'paid'
                              ? member.amount || 0
                              : member.remainingAmount || 0;

                          return (
                            <tr
                              key={member.id || index}
                              className={`hover:bg-gray-50 ${isPartial ? 'bg-orange-50/50' : ''
                                }`}
                            >
                              <td className="px-2 py-1.5 text-[10px] text-gray-500 text-center">
                                {index + 1}
                              </td>
                              <td className="px-2 py-1.5 font-medium text-gray-800 text-[10px]">
                                {member.name || 'N/A'}
                                {isPartial && (
                                  <span className="ml-1 text-[8px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full">
                                    Partial
                                  </span>
                                )}
                              </td>
                              <td className="px-2 py-1.5 text-gray-500 text-[9px] hidden sm:table-cell truncate max-w-[80px]">
                                {member.email || 'N/A'}
                              </td>
                              {viewMode === 'outstanding' && (
                                <td className="px-2 py-1.5">
                                  {isPartial ? (
                                    <span className="text-[8px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full">
                                      Ã¢â€šÂ¦{member.paidAmount.toLocaleString()} paid
                                    </span>
                                  ) : (
                                    <span className="text-[8px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full">
                                      Not Paid
                                    </span>
                                  )}
                                </td>
                              )}
                              {viewMode === 'paid' && (
                                <td className="px-2 py-1.5 text-gray-500 text-[9px] hidden xs:table-cell">
                                  {member.paymentDate
                                    ? new Date(member.paymentDate).toLocaleDateString()
                                    : '-'}
                                </td>
                              )}
                              <td
                                className={`px-2 py-1.5 text-right font-semibold text-[10px] ${viewMode === 'outstanding'
                                  ? isPartial
                                    ? 'text-orange-600'
                                    : 'text-red-600'
                                  : 'text-blue-600'
                                  }`}
                              >
                                Ã¢â€šÂ¦{displayAmount.toLocaleString()}
                                {isPartial && viewMode === 'paid' && (
                                  <span className="block text-[7px] text-gray-400">
                                    of Ã¢â€šÂ¦{member.totalAmount.toLocaleString()}
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      {currentItems.length > 50 && (
                        <tfoot>
                          <tr>
                            <td
                              colSpan={viewMode === 'paid' ? 4 : 3}
                              className="px-2 py-2 text-center text-[9px] text-gray-400"
                            >
                              Showing first 50 of {currentItems.length} members
                            </td>
                          </tr>
                        </tfoot>
                      )}
                      <tfoot className="bg-gray-50 border-t border-gray-200">
                        <tr>
                          <td
                            colSpan={viewMode === 'paid' ? 4 : 3}
                            className="px-2 py-1.5 text-right text-[10px] font-medium"
                          >
                            Total:
                          </td>
                          <td
                            className={`px-2 py-1.5 text-right text-xs font-bold ${viewMode === 'outstanding'
                              ? 'text-red-600'
                              : 'text-blue-600'
                              }`}
                          >
                            Ã¢â€šÂ¦{currentTotal.toLocaleString()}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        @media (max-width: 480px) {
          .xs\\:table-cell { display: none; }
        }
        @media (min-width: 481px) {
          .xs\\:table-cell { display: table-cell; }
        }
        @media (min-width: 640px) {
          .sm\\:table-cell { display: table-cell; }
        }
        @media (max-width: 639px) {
          .sm\\:table-cell { display: none; }
        }
      `}</style>
    </div>
  );
};

export default PaymentTypeReport;