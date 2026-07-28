import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';
import { useAuthStore } from '../store/authStore';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import StudentProfile360 from '../components/StudentProfile360';
import FeeManagementCenter from '../components/FeeManagementCenter';
import FinancialAdjustmentsWorkspace from '../components/FinancialAdjustmentsWorkspace';
import TransactionCenter from '../components/TransactionCenter';
import MessagesView from '../components/MessagesView';
import {
  IndianRupee,
  Users,
  AlertTriangle,
  FolderLock,
  Plus,
  Loader2,
  FileSpreadsheet,
  Trash2,
  CheckCircle,
  HelpCircle,
  Percent,
  TrendingUp,
  Settings,
  ShieldCheck,
  Search,
  UserPlus,
  ChevronRight,
  Sparkles,
  Layers,
  GraduationCap,
  Receipt,
  Printer,
  X,
  MoreVertical,
  Eye,
  Edit2,
  CreditCard,
  Filter,
  Download,
  UploadCloud,
  Save
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';

export default function SchoolAdminDashboard() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('analytics');

  // Search & Filter States
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState('');

  // Form States - Fee Type
  const [typeName, setTypeName] = useState('');
  const [typeDesc, setTypeDesc] = useState('');
  const [typeAmount, setTypeAmount] = useState('');
  const [typeRecurring, setTypeRecurring] = useState(false);
  const [typeRecurringInterval, setTypeRecurringInterval] = useState('');
  const [typeVariable, setTypeVariable] = useState(false);
  const [typeDueDays, setTypeDueDays] = useState('30');

  // Form States - Fee Structure
  const [fsTypes, setFsTypes] = useState([]);
  const [fsClass, setFsClass] = useState('');
  const [fsAcademicYear, setFsAcademicYear] = useState('2026-2027');

  // Form States - Invite Accountant
  const [accName, setAccName] = useState('');
  const [accEmail, setAccEmail] = useState('');
  const [accPhone, setAccPhone] = useState('');
  const [accPassword, setAccPassword] = useState('');
  const [accPerms, setAccPerms] = useState({
    can_record_payment: true,
    can_apply_waiver: false,
    can_apply_penalty: false,
    can_reconcile_cheque: true,
    can_view_dashboard_metrics: true,
    can_edit_fee_structure: false,
  });

  // Form States - Excel Student Upload
  const [excelFile, setExcelFile] = useState(null);
  const [bulkFeedback, setBulkFeedback] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);

  // Form States - Individual Student
  const [stName, setStName] = useState('');
  const [stEmail, setStEmail] = useState('');
  const [stPhone, setStPhone] = useState('');
  const [stRoll, setStRoll] = useState('');
  const [stClass, setStClass] = useState('');
  const [stSection, setStSection] = useState('A');
  const [stGuardian, setStGuardian] = useState('');
  const [stGPhone, setStGPhone] = useState('');
  const [stDob, setStDob] = useState('');
  const [stOptedVariableFeeIds, setStOptedVariableFeeIds] = useState([]);
  const [stGender, setStGender] = useState('');
  const [stBloodGroup, setStBloodGroup] = useState('');
  const [stAddress, setStAddress] = useState('');
  const [stPreviousSchool, setStPreviousSchool] = useState('');
  const [stExtracurricular, setStExtracurricular] = useState('');
  const [stGEmail, setStGEmail] = useState('');
  const [stEmergency, setStEmergency] = useState('');
  const [stAdmissionDate, setStAdmissionDate] = useState('');
  const [editingStudentId, setEditingStudentId] = useState(null);

  // Form States - Apply Waiver / Penalty Dialog
  const [selectedFeeId, setSelectedFeeId] = useState('');
  const [actionType, setActionType] = useState('waiver'); // waiver or penalty
  const [actionAmount, setActionAmount] = useState('');
  const [actionReason, setActionReason] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  // Transactions Ledger states
  const [txnSearch, setTxnSearch] = useState('');
  const [txnMethod, setTxnMethod] = useState('');
  const [txnStatus, setTxnStatus] = useState('');
  const [printReceiptData, setPrintReceiptData] = useState(null);

  // Student Profile detail view state
  const [profileStudentId, setProfileStudentId] = useState(null);
  const [profileStudentTab, setProfileStudentTab] = useState('overview');

  const { data: transactions, isLoading: txnsLoading } = useQuery({
    queryKey: ['adminTransactions', txnSearch, txnMethod, txnStatus],
    queryFn: () => api.get(`/accountant/transactions?search=${txnSearch}&method=${txnMethod}&status=${txnStatus}`),
  });

  const handleTriggerPrint = (txn) => {
    setPrintReceiptData(txn);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  // Clean up printing state after print dialog is closed
  React.useEffect(() => {
    const handleAfterPrint = () => {
      setPrintReceiptData(null);
    };
    window.addEventListener('afterprint', handleAfterPrint);
    return () => window.removeEventListener('afterprint', handleAfterPrint);
  }, []);

  // ----------------------------------------------------
  // DATA FETCHING
  // ----------------------------------------------------
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['schoolMetrics'],
    queryFn: () => api.get('/accountant/dashboard/metrics'),
  });

  const { data: students, isLoading: studentsLoading } = useQuery({
    queryKey: ['schoolStudents'],
    queryFn: () => api.get('/school-admin/students'),
  });

  const { data: accountants, isLoading: accountantsLoading } = useQuery({
    queryKey: ['schoolAccountants'],
    queryFn: () => api.get('/school-admin/accountants'),
  });

  const { data: feeTypes } = useQuery({
    queryKey: ['schoolFeeTypes'],
    queryFn: () => api.get('/school-admin/fee-types'),
  });

  const { data: structures } = useQuery({
    queryKey: ['schoolFeeStructures'],
    queryFn: () => api.get('/school-admin/fee-structures'),
  });

  const { data: unpaidFees } = useQuery({
    queryKey: ['unpaidFeesList', studentSearch, selectedClassFilter],
    queryFn: () => api.get(`/accountant/student-fees?status=UNPAID,PARTIAL&search=${studentSearch}&class=${selectedClassFilter}`),
  });

  const lastMonthCollection = React.useMemo(() => {
    if (!metrics?.revenueByMonth || metrics.revenueByMonth.length < 2) return 0;
    return metrics.revenueByMonth[metrics.revenueByMonth.length - 2]?.collected || 0;
  }, [metrics?.revenueByMonth]);

  const collectionRate = React.useMemo(() => {
    if (!metrics?.totalExpected) return 0;
    return Math.round((metrics.totalCollected / metrics.totalExpected) * 100);
  }, [metrics?.totalExpected, metrics?.totalCollected]);

  const availableVariableFees = React.useMemo(() => {
    if (!stClass || !structures) return [];
    return structures.filter(s => s.class === stClass && s.feeType?.isVariable).map(s => s.feeType);
  }, [stClass, structures]);

  const outstandingByMonth = React.useMemo(() => {
    if (!unpaidFees) return [];
    const monthlyMap = {};
    unpaidFees.forEach(fee => {
      const date = new Date(fee.dueDate);
      const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });
      const remaining = Number(fee.amountDue) + Number(fee.penaltyAmount) - Number(fee.amountPaid) - Number(fee.waiverAmount);
      monthlyMap[monthYear] = (monthlyMap[monthYear] || 0) + Math.max(0, remaining);
    });
    return Object.keys(monthlyMap).map(key => ({
      name: key,
      amount: monthlyMap[key]
    })).sort((a, b) => new Date(a.name) - new Date(b.name));
  }, [unpaidFees]);

  // ----------------------------------------------------
  // MUTATIONS
  // ----------------------------------------------------
  const createFeeTypeMutation = useMutation({
    mutationFn: (payload) => api.post('/school-admin/fee-types', payload),
    onSuccess: () => {
      setTypeName('');
      setTypeDesc('');
      setTypeAmount('');
      setTypeRecurring(false);
      setTypeRecurringInterval('');
      setTypeVariable(false);
      setTypeDueDays('30');
      queryClient.invalidateQueries({ queryKey: ['schoolFeeTypes'] });
    },
  });

  const updateFeeTypeMutation = useMutation({
    mutationFn: ({ id, ...payload }) => api.patch(`/school-admin/fee-types/${id}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schoolFeeTypes'] });
    },
  });

  const deleteFeeTypeMutation = useMutation({
    mutationFn: (id) => api.delete(`/school-admin/fee-types/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schoolFeeTypes'] });
    },
  });

  const createFeeStructureMutation = useMutation({
    mutationFn: (payload) => api.post('/school-admin/fee-structures', payload),
    onSuccess: () => {
      setFsTypes([]);
      setFsClass('');
      queryClient.invalidateQueries({ queryKey: ['schoolFeeStructures'] });
      queryClient.invalidateQueries({ queryKey: ['schoolMetrics'] });
      queryClient.invalidateQueries({ queryKey: ['schoolStudents'] });
    },
  });

  const createStudentMutation = useMutation({
    mutationFn: (payload) => api.post('/school-admin/students', payload),
    onSuccess: () => {
      setStName('');
      setStEmail('');
      setStPhone('');
      setStRoll('');
      setStClass('');
      setStSection('A');
      setStGuardian('');
      setStGPhone('');
      setStDob('');
      setStGender('');
      setStBloodGroup('');
      setStAddress('');
      setStPreviousSchool('');
      setStExtracurricular('');
      setStGEmail('');
      setStEmergency('');
      setStAdmissionDate('');
      setActiveTab('students-all');
      queryClient.invalidateQueries({ queryKey: ['schoolStudents'] });
      queryClient.invalidateQueries({ queryKey: ['schoolMetrics'] });
    },
    onError: (err) => {
      alert(err.message || 'Failed to register student');
    }
  });

  const updateStudentMutation = useMutation({
    mutationFn: ({ id, payload }) => api.patch(`/school-admin/students/${id}`, payload),
    onSuccess: () => {
      setEditingStudentId(null);
      setStName('');
      setStEmail('');
      setStPhone('');
      setStRoll('');
      setStClass('');
      setStSection('A');
      setStGuardian('');
      setStGPhone('');
      setStDob('');
      setStGender('');
      setStBloodGroup('');
      setStAddress('');
      setStPreviousSchool('');
      setStExtracurricular('');
      setStGEmail('');
      setStEmergency('');
      setActiveTab('students-all');
      queryClient.invalidateQueries({ queryKey: ['schoolStudents'] });
      queryClient.invalidateQueries({ queryKey: ['schoolMetrics'] });
    },
    onError: (err) => {
      alert(err.message || 'Failed to update student');
    }
  });

  const deleteStudentMutation = useMutation({
    mutationFn: (id) => api.delete(`/school-admin/students/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schoolStudents'] });
      queryClient.invalidateQueries({ queryKey: ['schoolMetrics'] });
    },
  });

  const inviteAccountantMutation = useMutation({
    mutationFn: (payload) => api.post('/school-admin/accountants', payload),
    onSuccess: () => {
      setAccName('');
      setAccEmail('');
      setAccPassword('');
      setAccPhone('');
      queryClient.invalidateQueries({ queryKey: ['schoolAccountants'] });
    },
  });

  const updateAccountantMutation = useMutation({
    mutationFn: ({ id, permissions, status }) => api.patch(`/school-admin/accountants/${id}`, { permissions, status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schoolAccountants'] });
    },
  });

  const applyWaiverMutation = useMutation({
    mutationFn: ({ id, amount, reason }) => api.post(`/school-admin/student-fees/${id}/waiver`, { waiverAmount: amount, reason }),
    onSuccess: () => {
      setActionMessage('Waiver discount successfully applied!');
      setSelectedFeeId('');
      setActionAmount('');
      setActionReason('');
      queryClient.invalidateQueries({ queryKey: ['schoolMetrics'] });
      queryClient.invalidateQueries({ queryKey: ['unpaidFeesList'] });
      queryClient.invalidateQueries({ queryKey: ['schoolStudents'] });
    },
    onError: (err) => {
      setActionMessage(`Error: ${err.response?.data?.error || err.message}`);
    },
  });

  const applyPenaltyMutation = useMutation({
    mutationFn: ({ id, amount }) => api.post(`/school-admin/student-fees/${id}/penalty`, { penaltyAmount: amount }),
    onSuccess: () => {
      setActionMessage('Overdue penalty successfully applied!');
      setSelectedFeeId('');
      setActionAmount('');
      queryClient.invalidateQueries({ queryKey: ['schoolMetrics'] });
      queryClient.invalidateQueries({ queryKey: ['unpaidFeesList'] });
      queryClient.invalidateQueries({ queryKey: ['schoolStudents'] });
    },
    onError: (err) => {
      setActionMessage(`Error: ${err.response?.data?.error || err.message}`);
    },
  });

  // ----------------------------------------------------
  // SUBMISSIONS
  // ----------------------------------------------------
  const handleCreateFeeType = (e) => {
    e.preventDefault();
    if (!typeName || !typeAmount) return;
    createFeeTypeMutation.mutate({ 
      name: typeName, 
      description: typeDesc, 
      amount: typeAmount, 
      isRecurring: typeRecurring,
      recurringIntervalDays: typeRecurringInterval,
      isVariable: typeVariable,
      dueDays: typeDueDays
    });
  };

  const handleCreateFeeStructure = (e) => {
    e.preventDefault();
    if (fsTypes.length === 0 || !fsClass) return;
    createFeeStructureMutation.mutate({
      feeTypeIds: fsTypes,
      class: fsClass,
      academicYear: fsAcademicYear,
    });
  };

  const handleCreateStudent = (e) => {
    e.preventDefault();
    if (!stName || !stEmail || !stRoll || !stClass || !stGuardian || !stGPhone) return;

    const payload = {
      name: stName,
      email: stEmail,
      phone: stPhone,
      rollNumber: stRoll,
      class: stClass,
      section: stSection,
      guardianName: stGuardian,
      guardianPhone: stGPhone,
      dateOfBirth: stDob || undefined,
      gender: stGender || undefined,
      bloodGroup: stBloodGroup || undefined,
      address: stAddress || undefined,
      previousSchool: stPreviousSchool || undefined,
      extracurricular: stExtracurricular || undefined,
      guardianEmail: stGEmail || undefined,
      emergencyContact: stEmergency || undefined,
      admissionDate: stAdmissionDate || undefined,
      optedVariableFeeIds: stOptedVariableFeeIds,
    };

    if (editingStudentId) {
      updateStudentMutation.mutate({ id: editingStudentId, payload });
    } else {
      createStudentMutation.mutate(payload);
    }
  };

  const handleEditStudentClick = (st) => {
    setEditingStudentId(st.id);
    setStName(st.user?.name || '');
    setStEmail(st.user?.email || '');
    setStPhone(st.user?.phone || '');
    setStRoll(st.rollNumber || '');
    setStClass(st.class || '');
    setStSection(st.section || 'A');
    setStGuardian(st.guardianName || '');
    setStGPhone(st.guardianPhone || '');
    
    // Format date string for input type="date"
    const dob = st.dateOfBirth ? new Date(st.dateOfBirth).toISOString().split('T')[0] : '';
    setStDob(dob);
    
    const admDate = st.admissionDate ? new Date(st.admissionDate).toISOString().split('T')[0] : '';
    setStAdmissionDate(admDate);
    
    setStGender(st.gender || '');
    setStBloodGroup(st.bloodGroup || '');
    setStAddress(st.address || '');
    setStPreviousSchool(st.previousSchool || '');
    setStExtracurricular(st.extracurricular || '');
    setStGEmail(st.guardianEmail || '');
    setStEmergency(st.emergencyContact || '');
    
    // Extract assigned variable fees that are NOT paid
    // Wait, the requirement says "if i paid fees... do not show it to me in again"
    // So if we include paid fees here, they would show as checked (or they wouldn't show and get removed).
    // The user's request: "if i paid fees... do not show it to me in again in the additional fees (variable)"
    // We should include ALL assigned variable fees in state. The rendering logic will hide the paid ones.
    const assignedVariableFees = st.studentFees
      ?.filter(f => f.feeStructure?.feeType?.isVariable)
      .map(f => f.feeStructure.feeType.id) || [];
    setStOptedVariableFeeIds(assignedVariableFees);
    
    setActiveTab('students-add');
  };

  const handleDeleteStudent = (id) => {
    if (window.confirm("Are you sure you want to delete this student? This action cannot be undone.")) {
      deleteStudentMutation.mutate(id);
    }
  };

  const handleInviteAccountant = (e) => {
    e.preventDefault();
    if (!accName || !accEmail || !accPassword) return;
    inviteAccountantMutation.mutate({
      name: accName,
      email: accEmail,
      password: accPassword,
      phone: accPhone,
      permissions: accPerms,
    });
  };

  const handleAccountantPermissionToggle = (acc, key) => {
    const nextPerms = { ...acc.permissions, [key]: !acc.permissions?.[key] };
    updateAccountantMutation.mutate({ id: acc.id, permissions: nextPerms });
  };

  const handleAccountantStatusToggle = (acc) => {
    const nextStatus = acc.status === 'active' ? 'inactive' : 'active';
    updateAccountantMutation.mutate({ id: acc.id, status: nextStatus });
  };

  const handleBulkUpload = async (e) => {
    e.preventDefault();
    if (!excelFile) return;

    setUploadLoading(true);
    setBulkFeedback(null);
    const formData = new FormData();
    formData.append('file', excelFile);

    try {
      const data = await api.post('/school-admin/students/bulk-upload', formData);
      setBulkFeedback(data.summary);
      setExcelFile(null);
      queryClient.invalidateQueries({ queryKey: ['schoolStudents'] });
      queryClient.invalidateQueries({ queryKey: ['schoolMetrics'] });
    } catch (err) {
      alert(err.message || 'Excel upload failed');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDownloadTemplate = () => {
    const headers = [
      'Name', 'Email', 'RollNumber', 'Class', 'Section', 'Phone',
      'DateOfBirth', 'Gender', 'BloodGroup', 'Address', 'PreviousSchool',
      'Extracurricular', 'GuardianName', 'GuardianPhone', 'GuardianEmail', 'EmergencyContact'
    ];
    const csvContent = headers.join(',') + '\n';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'student_bulk_upload_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleApplyAction = (e) => {
    e.preventDefault();
    if (!selectedFeeId || !actionAmount) return;
    setActionMessage('');

    if (actionType === 'waiver') {
      applyWaiverMutation.mutate({ id: selectedFeeId, amount: actionAmount, reason: actionReason });
    } else {
      applyPenaltyMutation.mutate({ id: selectedFeeId, amount: actionAmount });
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const COLORS = ['#6366F1', '#EC4899', '#10B981', '#F59E0B', '#3B82F6', '#8B5CF6'];

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 overflow-y-auto relative">
        <Header />

        {/* Tabs panels content */}
        <div className="px-4 md:px-8 pt-0 pb-12 space-y-6">

          {/* PANEL 1: OVERVIEW METRICS */}
          {activeTab === 'analytics' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Premium KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="glass-card rounded-[22px] p-6 border border-white/60 shadow-glass relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center text-brand-primary shadow-sm group-hover:scale-110 transition-transform">
                      <IndianRupee className="w-6 h-6" />
                    </div>
                    <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 border border-emerald-100">
                      ↑ 18%
                    </span>
                  </div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Estimated Revenue</p>
                  <h3 className="text-3xl font-black text-slate-800 tracking-tight mt-1">
                    {metricsLoading ? <Loader2 className="w-6 h-6 animate-spin text-slate-400" /> : formatCurrency(metrics?.totalExpected ?? 0)}
                  </h3>
                  <div className="mt-4 h-8 w-full bg-slate-50 rounded flex items-end gap-0.5 px-1 pb-1">
                    {/* Simulated Sparkline */}
                    {[40, 50, 30, 70, 80, 60, 90].map((h, i) => (
                      <div key={i} className="flex-1 bg-brand-primary/20 rounded-t-sm transition-all group-hover:bg-brand-primary/40" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>

                <div className="glass-card rounded-[22px] p-6 border border-white/60 shadow-glass relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm group-hover:scale-110 transition-transform">
                      <CheckCircle className="w-6 h-6" />
                    </div>
                    <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 border border-emerald-100">
                      ↑ 12%
                    </span>
                  </div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Revenue Collected</p>
                  <h3 className="text-3xl font-black text-slate-800 tracking-tight mt-1">
                    {metricsLoading ? <Loader2 className="w-6 h-6 animate-spin text-slate-400" /> : formatCurrency(metrics?.totalCollected ?? 0)}
                  </h3>
                  <div className="mt-4 text-[10px] font-medium text-slate-400">
                    Last Month: <strong className="text-slate-600">{formatCurrency(lastMonthCollection)}</strong>
                  </div>
                </div>

                <div className="glass-card rounded-[22px] p-6 border border-white/60 shadow-glass relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-rose-100 to-rose-50 border border-rose-100 rounded-2xl flex items-center justify-center text-rose-500 shadow-sm group-hover:scale-110 transition-transform">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <span className="bg-rose-50 text-rose-600 text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 border border-rose-100">
                      ↓ 5%
                    </span>
                  </div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Outstanding Due</p>
                  <h3 className="text-3xl font-black text-slate-800 tracking-tight mt-1">
                    {metricsLoading ? <Loader2 className="w-6 h-6 animate-spin text-slate-400" /> : formatCurrency(metrics?.totalPending ?? 0)}
                  </h3>
                  <div className="mt-4 text-[10px] font-medium text-slate-400">
                    <strong className="text-rose-500">{metrics?.defaultersCount || 0} students</strong> pending
                  </div>
                </div>

                <div className="glass-card rounded-[22px] p-6 border border-white/60 shadow-glass relative overflow-hidden group hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex justify-between items-start">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-amber-50 border border-amber-100 rounded-2xl flex items-center justify-center text-amber-500 shadow-sm group-hover:scale-110 transition-transform">
                      <Percent className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="mt-2 flex items-end justify-between">
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Collection Rate</p>
                      <h3 className="text-3xl font-black text-slate-800 tracking-tight mt-1">
                        {collectionRate}%
                      </h3>
                    </div>
                    <div className="w-12 h-12 rounded-full border-4 border-amber-100 border-t-amber-500 flex items-center justify-center group-hover:rotate-180 transition-transform duration-700 ease-in-out" />
                  </div>
                </div>
              </div>

              {/* Main Charts Row 1 */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 glass-card rounded-[24px] p-6 lg:p-8 border border-white/60 shadow-glass">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-sm font-black text-slate-800 tracking-tight flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-brand-primary" />
                      Revenue Trend (Area)
                    </h3>
                    <select className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 font-bold text-slate-500">
                      <option>This Year</option>
                      <option>Last Year</option>
                    </select>
                  </div>
                  <div className="h-[300px] w-full">
                    {metricsLoading ? (
                      <div className="h-full flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-brand-primary" /></div>
                    ) : metrics?.revenueByMonth && metrics.revenueByMonth.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={metrics.revenueByMonth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                          <XAxis dataKey="month" tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} dy={10} />
                          <YAxis tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                          <Tooltip 
                            formatter={(v) => [formatCurrency(v), 'Collected']}
                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                          />
                          <Area type="monotone" dataKey="collected" stroke="#4F46E5" strokeWidth={3} fillOpacity={1} fill="url(#colorCollected)" activeDot={{ r: 6, fill: '#4F46E5', stroke: '#fff', strokeWidth: 3 }} />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-slate-400 text-xs font-semibold">No data available yet.</div>
                    )}
                  </div>
                </div>

                <div className="glass-card rounded-[24px] p-6 lg:p-8 border border-white/60 shadow-glass">
                  <h3 className="text-sm font-black text-slate-800 tracking-tight flex items-center gap-2 mb-6">
                    <FolderLock className="w-5 h-5 text-brand-accent" />
                    Fee Distribution
                  </h3>
                  <div className="h-[240px] w-full flex items-center justify-center">
                    {metricsLoading ? (
                      <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
                    ) : metrics?.feeTypeBreakdown && metrics.feeTypeBreakdown.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={metrics.feeTypeBreakdown}
                            cx="50%"
                            cy="50%"
                            innerRadius={0}
                            outerRadius={95}
                            paddingAngle={6}
                            dataKey="value"
                            stroke="none"
                          >
                            {metrics.feeTypeBreakdown.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(v) => formatCurrency(v)}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} 
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="text-slate-400 text-xs font-semibold">No payments mapped yet.</div>
                    )}
                  </div>
                  {metrics?.feeTypeBreakdown && (
                    <div className="flex flex-col gap-3 justify-center mt-2 text-[11px] font-bold text-slate-500">
                      {metrics.feeTypeBreakdown.map((item, idx) => (
                        <div key={item.name} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                            <span>{item.name}</span>
                          </div>
                          <span className="text-slate-800">{formatCurrency(item.value)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Main Charts Row 2 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Monthly Collection Bar Chart (Dynamic) */}
                <div className="glass-card rounded-[24px] p-6 lg:p-8 border border-white/60 shadow-glass">
                  <h3 className="text-sm font-black text-slate-800 tracking-tight mb-6">Monthly Collection (Bar)</h3>
                  <div className="h-[250px] w-full">
                    {metricsLoading ? (
                      <div className="h-full flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-brand-primary" /></div>
                    ) : metrics?.revenueByMonth && metrics.revenueByMonth.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={metrics.revenueByMonth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                          <XAxis dataKey="month" tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} dy={10} />
                          <YAxis tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                          <Tooltip formatter={(v) => [formatCurrency(v), 'Collected']} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                          <Bar dataKey="collected" fill="#22C55E" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-slate-400 text-xs font-semibold">No collection history available.</div>
                    )}
                  </div>
                </div>

                {/* Outstanding Trend Area (Dynamic) */}
                <div className="glass-card rounded-[24px] p-6 lg:p-8 border border-white/60 shadow-glass">
                  <h3 className="text-sm font-black text-slate-800 tracking-tight mb-6">Outstanding Trend (Area)</h3>
                  <div className="h-[250px] w-full">
                    {metricsLoading ? (
                      <div className="h-full flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-brand-primary" /></div>
                    ) : outstandingByMonth && outstandingByMonth.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={outstandingByMonth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                          <XAxis dataKey="name" tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} dy={10} />
                          <YAxis tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                          <Tooltip formatter={(v) => [formatCurrency(v), 'Outstanding']} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                          <Area type="monotone" dataKey="amount" stroke="#EF4444" strokeWidth={3} fillOpacity={1} fill="url(#colorOut)" activeDot={{ r: 6, fill: '#EF4444', stroke: '#fff', strokeWidth: 3 }} />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-slate-400 text-xs font-semibold">No outstanding dues.</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Widgets Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Recent Activity Panel */}
                <div className="lg:col-span-2 glass-card rounded-[24px] p-6 lg:p-8 border border-white/60 shadow-glass">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-sm font-black text-slate-800 tracking-tight">Recent Activity Feed</h3>
                    <button className="text-xs font-bold text-brand-primary hover:underline">View All</button>
                  </div>
                  <div className="space-y-5">
                    {metricsLoading ? (
                      <div className="flex justify-center py-4"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
                    ) : metrics?.recentTransactions && metrics.recentTransactions.length > 0 ? (
                      metrics.recentTransactions.map(activity => {
                        const timeAgo = (dateStr) => {
                          const diff = new Date() - new Date(dateStr);
                          const minutes = Math.floor(diff / 60000);
                          if (minutes < 60) return `${minutes} minutes ago`;
                          const hours = Math.floor(minutes / 60);
                          if (hours < 24) return `${hours} hours ago`;
                          return `${Math.floor(hours / 24)} days ago`;
                        };
                        return (
                          <div key={activity.id} className="flex items-center gap-4">
                            <div className={`w-2 h-2 rounded-full shadow-sm shrink-0 ${
                              activity.status === 'SUCCESS' || activity.status === 'CLEARED' ? 'bg-emerald-500' :
                              activity.status === 'PENDING' ? 'bg-amber-500' : 'bg-rose-500'
                            }`} />
                            <div className="flex-1 flex justify-between items-center">
                              <div>
                                <p className="text-xs font-bold text-slate-800">{activity.studentName} paid {activity.feeName}</p>
                                <p className="text-[10px] font-semibold text-slate-400">{timeAgo(activity.date)}</p>
                              </div>
                              {activity.amount > 0 && (
                                <span className={`text-xs font-black px-2 py-1 rounded-lg border ${
                                  activity.status === 'SUCCESS' || activity.status === 'CLEARED' ? 'text-emerald-600 bg-emerald-50 border-emerald-100' :
                                  activity.status === 'PENDING' ? 'text-amber-600 bg-amber-50 border-amber-100' : 'text-rose-600 bg-rose-50 border-rose-100'
                                }`}>
                                  {activity.status === 'SUCCESS' || activity.status === 'CLEARED' ? '+' : ''} {formatCurrency(activity.amount)}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-xs font-semibold text-slate-400 text-center py-4">No recent activity found.</div>
                    )}

                  </div>
                </div>

                {/* Right Widgets: Today's Collection & Upcoming Dues */}
                <div className="space-y-6">
                  {/* Today's Collection */}
                  <div className="glass-card rounded-[24px] p-6 border border-white/60 shadow-glass bg-gradient-to-br from-indigo-600 to-indigo-800 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
                    <h4 className="text-[11px] font-bold text-indigo-200 uppercase tracking-wider mb-1">Today's Collection</h4>
                    <h2 className="text-3xl font-black tracking-tight">
                      {txnsLoading ? <Loader2 className="w-6 h-6 animate-spin text-white" /> : formatCurrency(
                        (transactions || []).reduce((acc, t) => {
                          if ((t.status === 'SUCCESS' || t.status === 'CLEARED') && new Date(t.createdAt).toDateString() === new Date().toDateString()) {
                            return acc + Number(t.amount);
                          }
                          return acc;
                        }, 0)
                      )}
                    </h2>
                    <p className="text-xs font-medium text-indigo-100 mt-2 flex items-center gap-1.5">
                      <Receipt className="w-4 h-4" /> {
                        (transactions || []).filter(t => (t.status === 'SUCCESS' || t.status === 'CLEARED') && new Date(t.createdAt).toDateString() === new Date().toDateString()).length
                      } receipts generated
                    </p>
                  </div>

                  {/* Upcoming Dues / Overdue */}
                  <div className="glass-card rounded-[24px] p-6 border border-white/60 shadow-glass">
                    <h3 className="text-sm font-black text-slate-800 tracking-tight mb-4">Overdue Alerts</h3>
                    <div className="space-y-3">
                      {metricsLoading ? (
                        <div className="flex justify-center py-4"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
                      ) : metrics?.defaultersList && metrics.defaultersList.length > 0 ? (
                        metrics.defaultersList.slice(0, 3).map(due => (
                          <div key={due.id} className="p-3 bg-rose-50/50 border border-rose-100/50 rounded-2xl flex justify-between items-center transition-all hover:bg-rose-50">
                            <div>
                              <p className="text-xs font-bold text-slate-800">{due.student.user.name}</p>
                              <p className="text-[10px] font-semibold text-rose-500 mt-0.5">{due.feeStructure.feeType.name}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-black text-rose-600">{formatCurrency(Number(due.amountDue) + Number(due.penaltyAmount) - Number(due.waiverAmount) - Number(due.amountPaid))}</p>
                              <p className="text-[9px] font-bold text-slate-400">Due {new Date(due.dueDate).toLocaleDateString()}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                         <div className="text-xs font-semibold text-slate-400 text-center py-4">No overdue fees found.</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

        {/* PANEL 2: STUDENTS DESK */}
        {/* PANEL 2.1: ALL STUDENTS (Redesigned) */}
        {activeTab === 'students-all' && (
          <div className="flex flex-col gap-8">
            {/* Top Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-3xl font-black text-slate-800 tracking-tight">Students</h2>
                <p className="text-sm font-medium text-slate-500 mt-1">Manage all student records, admissions and fee profiles.</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveTab('students-bulk')}
                  className="bg-white border border-slate-200 hover:border-brand-primary/50 text-slate-600 hover:text-brand-primary rounded-xl px-5 py-2.5 text-xs font-bold transition-all shadow-sm flex items-center gap-2"
                >
                  <UploadCloud className="w-4 h-4" />
                  Upload Bulk Students
                </button>
                <button
                  onClick={() => setActiveTab('students-add')}
                  className="bg-brand-primary hover:bg-brand-secondary text-white rounded-xl px-5 py-2.5 text-xs font-bold transition-all shadow-md flex items-center gap-2 transform hover:-translate-y-0.5"
                >
                  <Plus className="w-4 h-4" />
                  Add Student
                </button>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="glass-card rounded-2xl p-5 border border-white/40 shadow-sm flex items-center gap-4 hover:-translate-y-1 transition-transform">
                <div className="w-12 h-12 rounded-xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Students</div>
                  <div className="text-2xl font-black text-slate-800">{students?.length || 0}</div>
                </div>
              </div>
              <div className="glass-card rounded-2xl p-5 border border-white/40 shadow-sm flex items-center gap-4 hover:-translate-y-1 transition-transform">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Students</div>
                  <div className="text-2xl font-black text-slate-800">{students?.length || 0}</div>
                </div>
              </div>
              <div className="glass-card rounded-2xl p-5 border border-white/40 shadow-sm flex items-center gap-4 hover:-translate-y-1 transition-transform">
                <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-600">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Outstanding Fees</div>
                  <div className="text-2xl font-black text-slate-800">
                    {formatCurrency(
                      students?.reduce((total, st) => {
                        return total + (st.studentFees?.reduce((sum, f) => sum + (f.status === 'PENDING' ? Number(f.amountDue) : 0), 0) || 0);
                      }, 0) || 0
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white/50 border border-slate-200/50 backdrop-blur-sm p-3 rounded-2xl shadow-sm">
              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    placeholder="Search Students..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 focus:border-brand-primary/50 focus:ring-2 focus:ring-brand-primary/20 rounded-xl text-xs font-medium shadow-sm transition-all outline-none"
                  />
                </div>
                <div className="hidden md:flex items-center gap-2">
                  <select 
                    value={selectedClassFilter} 
                    onChange={(e) => setSelectedClassFilter(e.target.value)}
                    className="bg-white border border-slate-200 text-slate-600 rounded-xl px-3 py-2 text-xs font-bold outline-none cursor-pointer"
                  >
                    <option value="">All Classes</option>
                    {[...Array(12)].map((_, i) => (
                      <option key={i + 1} value={String(i + 1)}>Class {i + 1}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto">
                <button className="md:hidden bg-white border border-slate-200 text-slate-600 rounded-xl p-2 shadow-sm">
                  <Filter className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Data Table */}
            <div className="glass-card rounded-2xl border border-white/40 shadow-premium overflow-hidden bg-white/70">
              {studentsLoading ? (
                <div className="py-20 flex flex-col items-center justify-center gap-4">
                  <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
                  <p className="text-xs font-bold text-slate-400">Loading student directory...</p>
                </div>
              ) : students && students.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200/80 bg-slate-50/50 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                        <th className="py-4 pl-6 px-3">Roll No</th>
                        <th className="py-4 px-3">Student</th>
                        <th className="py-4 px-3">Class</th>
                        <th className="py-4 px-3">Guardian</th>
                        <th className="py-4 px-3">Assigned Fees</th>
                        <th className="py-4 px-3">Status</th>
                        <th className="py-4 pr-6 pl-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students
                        .filter(st => {
                          const matchSearch = studentSearch ? (st.user.name.toLowerCase().includes(studentSearch.toLowerCase()) || st.rollNumber.toLowerCase().includes(studentSearch.toLowerCase())) : true;
                          const matchClass = selectedClassFilter ? st.class === selectedClassFilter : true;
                          return matchSearch && matchClass;
                        })
                        .map((st) => {
                        const totalAssigned = st.studentFees?.reduce((sum, f) => sum + Number(f.amountDue), 0) || 0;
                        const hasUnpaidMandatory = st.studentFees?.some(f => f.feeStructure?.feeType?.isVariable === false && f.status !== 'PAID');
                        
                        return (
                          <tr 
                            key={st.id} 
                            onClick={() => { setProfileStudentTab('overview'); setProfileStudentId(st.id); }}
                            className="border-b border-slate-100 last:border-0 hover:bg-brand-primary/5 transition-colors group cursor-pointer"
                          >
                            <td className="py-4 pl-6 px-3 font-mono text-slate-500">{st.rollNumber}</td>
                            <td className="py-4 px-3">
                              <div className="font-extrabold text-slate-800">{st.user.name}</div>
                              <div className="text-[10px] text-slate-500 mt-0.5">{st.user.email}</div>
                            </td>
                            <td className="py-4 px-3 text-slate-600 font-medium">
                              <div className="flex items-center gap-1.5">
                                <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center font-bold text-slate-700">{st.class}</div>
                                <span>Sec {st.section}</span>
                              </div>
                            </td>
                            <td className="py-4 px-3">
                              <div className="font-bold text-slate-700">{st.guardianName}</div>
                              <div className="text-[10px] text-slate-500 mt-0.5">{st.guardianPhone}</div>
                            </td>
                            <td className="py-4 px-3 font-black text-slate-700">{formatCurrency(totalAssigned)}</td>
                            <td className="py-4 px-3">
                              {hasUnpaidMandatory ? (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-amber-50 text-amber-600 text-[10px] font-bold border border-amber-100">
                                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                  Pending
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-50 text-emerald-600 text-[10px] font-bold border border-emerald-100">
                                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                  Active
                                </span>
                              )}
                            </td>
                            <td className="py-4 pr-6 pl-3">
                              <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleEditStudentClick(st); }}
                                  className="p-1.5 text-slate-400 hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-colors"
                                  title="Edit Student"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleDeleteStudent(st.id); }}
                                  disabled={deleteStudentMutation.isPending}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" 
                                  title="Delete Student"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-24 text-center flex flex-col items-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                    <Users className="w-8 h-8 text-slate-300" />
                  </div>
                  <h3 className="text-sm font-black text-slate-700 mb-1">No Students Found</h3>
                  <p className="text-xs text-slate-500 max-w-sm mb-6">There are currently no students registered in the system. Add your first student or use bulk upload.</p>
                  <div className="flex gap-3">
                    <button onClick={() => setActiveTab('students-bulk')} className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl px-5 py-2 text-xs font-bold transition-all shadow-sm">
                      Bulk Upload
                    </button>
                    <button onClick={() => setActiveTab('students-add')} className="bg-brand-primary hover:bg-brand-secondary text-white rounded-xl px-5 py-2 text-xs font-bold transition-all shadow-sm">
                      Add Student
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* PANEL 2.2: ADD STUDENT */}
        {activeTab === 'students-add' && (
          <div className="max-w-3xl mx-auto">
            <div className="mb-6">
              <button 
                onClick={() => setActiveTab('students-all')}
                className="text-xs font-bold text-slate-400 hover:text-brand-primary flex items-center gap-1 transition-colors mb-4"
              >
                <ChevronRight className="w-4 h-4 rotate-180" /> Back to Students
              </button>
              <h2 className="text-xl font-black text-slate-800 tracking-tight">
                    {editingStudentId ? 'Edit Student' : 'Student Admission Form'}
                  </h2>
                  <p className="text-xs font-bold text-slate-400 mt-1">
                    {editingStudentId ? 'Update student records and fee preferences.' : 'Register a new student and assign fee structures.'}
                  </p>
            </div>
            
            <div className="glass-card rounded-[24px] p-8 border border-white/40 shadow-premium">
              <form onSubmit={handleCreateStudent} className="space-y-6 text-[10px] font-semibold text-slate-500">
                
                <div>
                  <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2 flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-brand-primary" />
                    Student Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block mb-1.5 uppercase tracking-wide">Student Full Name *</label>
                      <input
                        type="text"
                        value={stName}
                        onChange={(e) => setStName(e.target.value)}
                        placeholder="e.g. Rohan Sharma"
                        className="w-full glass-input text-xs py-3 px-4"
                        required
                      />
                    </div>
                    <div>
                      <label className="block mb-1.5 uppercase tracking-wide">Email Address *</label>
                      <input
                        type="email"
                        value={stEmail}
                        onChange={(e) => setStEmail(e.target.value)}
                        placeholder="rohan@gmail.com"
                        className="w-full glass-input text-xs py-3 px-4"
                        required
                      />
                    </div>
                    <div>
                      <label className="block mb-1.5 uppercase tracking-wide">Roll Number *</label>
                      <input
                        type="text"
                        value={stRoll}
                        onChange={(e) => setStRoll(e.target.value)}
                        placeholder="GW-2026-1001"
                        className="w-full glass-input text-xs py-3 px-4"
                        required
                      />
                    </div>
                    <div>
                      <label className="block mb-1.5 uppercase tracking-wide">Grade Class *</label>
                      <input
                        type="text"
                        value={stClass}
                        onChange={(e) => setStClass(e.target.value)}
                        placeholder="e.g. 10"
                        className="w-full glass-input text-xs py-3 px-4"
                        required
                      />
                    </div>
                    <div>
                      <label className="block mb-1.5 uppercase tracking-wide">Section *</label>
                      <input
                        type="text"
                        value={stSection}
                        onChange={(e) => setStSection(e.target.value)}
                        placeholder="e.g. A"
                        className="w-full glass-input text-xs py-3 px-4"
                        required
                      />
                    </div>
                    <div>
                      <label className="block mb-1.5 uppercase tracking-wide">Student Phone</label>
                      <input
                        type="text"
                        value={stPhone}
                        onChange={(e) => setStPhone(e.target.value)}
                        placeholder="Optional"
                        className="w-full glass-input text-xs py-3 px-4"
                      />
                    </div>
                    <div>
                      <label className="block mb-1.5 uppercase tracking-wide">Date of Birth</label>
                      <input
                        type="date"
                        value={stDob}
                        onChange={(e) => setStDob(e.target.value)}
                        className="w-full glass-input text-xs py-3 px-4"
                      />
                    </div>
                    <div>
                      <label className="block mb-1.5 uppercase tracking-wide">Admission Date</label>
                      <input
                        type="date"
                        value={stAdmissionDate}
                        onChange={(e) => setStAdmissionDate(e.target.value)}
                        className="w-full glass-input text-xs py-3 px-4"
                      />
                    </div>
                    <div>
                      <label className="block mb-1.5 uppercase tracking-wide">Gender</label>
                      <select
                        value={stGender}
                        onChange={(e) => setStGender(e.target.value)}
                        className="w-full glass-input text-xs py-3 px-4"
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block mb-1.5 uppercase tracking-wide">Blood Group</label>
                      <input
                        type="text"
                        value={stBloodGroup}
                        onChange={(e) => setStBloodGroup(e.target.value)}
                        placeholder="e.g. O+"
                        className="w-full glass-input text-xs py-3 px-4"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block mb-1.5 uppercase tracking-wide">Address</label>
                      <input
                        type="text"
                        value={stAddress}
                        onChange={(e) => setStAddress(e.target.value)}
                        placeholder="Full Residential Address"
                        className="w-full glass-input text-xs py-3 px-4"
                      />
                    </div>
                    <div>
                      <label className="block mb-1.5 uppercase tracking-wide">Previous School</label>
                      <input
                        type="text"
                        value={stPreviousSchool}
                        onChange={(e) => setStPreviousSchool(e.target.value)}
                        placeholder="Optional"
                        className="w-full glass-input text-xs py-3 px-4"
                      />
                    </div>
                    <div>
                      <label className="block mb-1.5 uppercase tracking-wide">Extracurricular</label>
                      <input
                        type="text"
                        value={stExtracurricular}
                        onChange={(e) => setStExtracurricular(e.target.value)}
                        placeholder="e.g. Football, Chess"
                        className="w-full glass-input text-xs py-3 px-4"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-brand-primary" />
                    Guardian Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1.5 uppercase tracking-wide">Guardian Name *</label>
                      <input
                        type="text"
                        value={stGuardian}
                        onChange={(e) => setStGuardian(e.target.value)}
                        placeholder="e.g. Amit Sharma"
                        className="w-full glass-input text-xs py-3 px-4"
                        required
                      />
                    </div>
                    <div>
                      <label className="block mb-1.5 uppercase tracking-wide">Guardian Phone *</label>
                      <input
                        type="text"
                        value={stGPhone}
                        onChange={(e) => setStGPhone(e.target.value)}
                        placeholder="+91 98765..."
                        className="w-full glass-input text-xs py-3 px-4"
                        required
                      />
                    </div>
                    <div>
                      <label className="block mb-1.5 uppercase tracking-wide">Guardian Email</label>
                      <input
                        type="email"
                        value={stGEmail}
                        onChange={(e) => setStGEmail(e.target.value)}
                        placeholder="Optional"
                        className="w-full glass-input text-xs py-3 px-4"
                      />
                    </div>
                    <div>
                      <label className="block mb-1.5 uppercase tracking-wide">Emergency Contact</label>
                      <input
                        type="text"
                        value={stEmergency}
                        onChange={(e) => setStEmergency(e.target.value)}
                        placeholder="Optional"
                        className="w-full glass-input text-xs py-3 px-4"
                      />
                    </div>
                  </div>
                </div>

                {/* Variable Fees Section */}
                {(() => {
                  const editingStudent = students?.find(s => s.id === editingStudentId);
                  
                  // Paid fees for this student, to be excluded from the checkboxes
                  const paidVariableFeeIds = editingStudent?.studentFees
                    ?.filter(f => f.feeStructure?.feeType?.isVariable && f.status === 'PAID')
                    .map(f => f.feeStructure.feeType.id) || [];
                    
                  const visibleVariableFees = availableVariableFees.filter(fee => !paidVariableFeeIds.includes(fee.id));

                  return visibleVariableFees.length > 0 && (
                    <div className="pt-6 border-t border-slate-200/60 mb-8">
                      <h3 className="text-sm font-black text-slate-800 mb-4 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-brand-primary" />
                        Optional Variable Fees
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {visibleVariableFees.map(fee => (
                          <label key={fee.id} className={`flex items-start gap-3 cursor-pointer p-4 rounded-xl border transition-colors ${stOptedVariableFeeIds.includes(fee.id) ? 'border-amber-400 bg-amber-50/30' : 'border-slate-200/60 bg-slate-50/50 hover:bg-slate-50'}`}>
                            <div className="pt-0.5">
                              <input 
                                type="checkbox"
                                checked={stOptedVariableFeeIds.includes(fee.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setStOptedVariableFeeIds(prev => [...prev, fee.id]);
                                  } else {
                                    setStOptedVariableFeeIds(prev => prev.filter(id => id !== fee.id));
                                  }
                                }}
                                className="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500 cursor-pointer"
                              />
                            </div>
                            <div>
                              <div className="text-sm font-bold text-slate-700">{fee.name}</div>
                              <div className="text-[10px] text-slate-500 mt-1 line-clamp-2">{fee.description}</div>
                              <div className="text-xs font-black text-slate-800 mt-2">{formatCurrency(fee.amount)}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                <div className="pt-8 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab('students-all')}
                    className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl px-6 py-3 text-xs font-bold transition-all shadow-sm"
                  >
                    Cancel
                  </button>
                  <button type="submit" disabled={createStudentMutation.isPending || updateStudentMutation.isPending} className="px-6 py-3 bg-brand-primary hover:bg-brand-secondary text-white text-xs font-bold rounded-xl shadow-lg shadow-brand-primary/20 transition-all active:scale-95 flex items-center gap-2">
                    {editingStudentId ? <Edit2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                    {editingStudentId ? (updateStudentMutation.isPending ? 'Updating...' : 'Update Student') : (createStudentMutation.isPending ? 'Saving...' : 'Register Student')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* PANEL 2.3: BULK UPLOAD */}
        {activeTab === 'students-bulk' && (
          <div className="max-w-4xl mx-auto">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <button 
                  onClick={() => setActiveTab('students-all')}
                  className="text-xs font-bold text-slate-400 hover:text-brand-primary flex items-center gap-1 transition-colors mb-4"
                >
                  <ChevronRight className="w-4 h-4 rotate-180" /> Back to Students
                </button>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Bulk Upload Students</h2>
                <p className="text-xs font-medium text-slate-500 mt-1">Import multiple students at once via Excel spreadsheet.</p>
              </div>
              <button 
                onClick={handleDownloadTemplate}
                className="bg-white border border-slate-200 hover:border-brand-primary/50 text-slate-600 hover:text-brand-primary rounded-xl px-4 py-2 text-xs font-bold transition-all shadow-sm flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download Template
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="glass-card rounded-[24px] p-8 border border-white/40 shadow-premium text-center">
                  <form onSubmit={handleBulkUpload} className="space-y-6">
                    <div className="border-2 border-dashed border-slate-200 hover:border-brand-primary/50 hover:bg-brand-primary/5 transition-colors rounded-[20px] p-12 relative cursor-pointer group">
                      <input
                        type="file"
                        accept=".xlsx, .xls"
                        onChange={(e) => setExcelFile(e.target.files[0])}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="w-16 h-16 bg-white border border-slate-100 shadow-sm rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                        <FileSpreadsheet className="w-8 h-8 text-brand-primary" />
                      </div>
                      <h3 className="text-sm font-black text-slate-700 mb-1">
                        {excelFile ? excelFile.name : 'Drag & Drop your Excel file here'}
                      </h3>
                      <p className="text-xs font-medium text-slate-400">
                        {excelFile ? 'File selected and ready to import' : 'or click to browse from your computer'}
                      </p>
                      <p className="text-[10px] text-slate-300 mt-4 font-bold uppercase tracking-widest">
                        Supports .xls, .xlsx
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={!excelFile || uploadLoading}
                      className="w-full glass-btn-primary flex items-center justify-center gap-2 text-sm py-4 rounded-2xl font-bold"
                    >
                      {uploadLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Importing Data...
                        </>
                      ) : (
                        'Upload & Process Data'
                      )}
                    </button>
                  </form>
                </div>

                {bulkFeedback && (
                  <div className="glass-card rounded-[24px] p-6 border border-brand-primary/20 bg-brand-primary/5 shadow-sm">
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-brand-primary" />
                      Processing Summary
                    </h4>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-white rounded-xl p-4 border border-slate-100 text-center shadow-sm">
                        <div className="text-2xl font-black text-emerald-600">{bulkFeedback.success}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Imported</div>
                      </div>
                      <div className="bg-white rounded-xl p-4 border border-slate-100 text-center shadow-sm">
                        <div className="text-2xl font-black text-rose-600">{bulkFeedback.failed}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Failed</div>
                      </div>
                    </div>
                    {bulkFeedback.errors.length > 0 && (
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Error Logs</div>
                        <div className="max-h-32 overflow-y-auto space-y-1 bg-white p-3 rounded-xl border border-rose-100 text-[10px] text-rose-600 font-mono shadow-inner">
                          {bulkFeedback.errors.map((err, i) => (
                            <div key={i} className="flex items-start gap-1">
                              <span className="text-rose-300 mt-0.5">•</span>
                              <span>{err}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="lg:col-span-1">
                <div className="bg-slate-50 border border-slate-200 rounded-[24px] p-6">
                  <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-4 border-b border-slate-200 pb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    Format Requirements
                  </h3>
                  <div className="text-xs text-slate-600 space-y-4 font-medium leading-relaxed">
                    <p>For a successful import, your Excel file should contain the following header columns in the first row:</p>
                    <div className="space-y-3 my-3">
                      <div>
                        <div className="text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Required Columns:</div>
                        <ul className="grid grid-cols-2 gap-2 font-mono text-[10px] bg-white p-3 rounded-xl border border-slate-200">
                          <li><span className="font-bold text-brand-primary">Name</span></li>
                          <li><span className="font-bold text-brand-primary">Email</span></li>
                          <li><span className="font-bold text-brand-primary">RollNumber</span></li>
                          <li><span className="font-bold text-brand-primary">Class</span></li>
                          <li><span className="font-bold text-brand-primary">Section</span></li>
                          <li><span className="font-bold text-brand-primary">GuardianName</span></li>
                          <li><span className="font-bold text-brand-primary">GuardianPhone</span></li>
                        </ul>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Optional Columns:</div>
                        <ul className="grid grid-cols-2 gap-2 font-mono text-[10px] bg-white p-3 rounded-xl border border-slate-200">
                          <li><span className="font-bold text-slate-600">Phone</span></li>
                          <li><span className="font-bold text-slate-600">DateOfBirth</span></li>
                          <li><span className="font-bold text-slate-600">Gender</span></li>
                          <li><span className="font-bold text-slate-600">BloodGroup</span></li>
                          <li><span className="font-bold text-slate-600">Address</span></li>
                          <li><span className="font-bold text-slate-600">PreviousSchool</span></li>
                          <li><span className="font-bold text-slate-600">Extracurricular</span></li>
                          <li><span className="font-bold text-slate-600">GuardianEmail</span></li>
                          <li><span className="font-bold text-slate-600">EmergencyContact</span></li>
                        </ul>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-400">Values are case-sensitive. Missing required columns will result in validation errors for those rows.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PANEL 3: FEE CONFIGURATION */}
        {activeTab === 'fees' && (
          <FeeManagementCenter
            feeTypes={feeTypes}
            structures={structures}
            students={students}
            typeName={typeName} setTypeName={setTypeName}
            typeDesc={typeDesc} setTypeDesc={setTypeDesc}
            typeRecurring={typeRecurring} setTypeRecurring={setTypeRecurring}
            typeRecurringInterval={typeRecurringInterval} setTypeRecurringInterval={setTypeRecurringInterval}
            typeVariable={typeVariable} setTypeVariable={setTypeVariable}
            typeDueDays={typeDueDays} setTypeDueDays={setTypeDueDays}
            typeAmount={typeAmount} setTypeAmount={setTypeAmount}
            handleCreateFeeType={handleCreateFeeType}
            createFeeTypeMutation={createFeeTypeMutation}
            updateFeeTypeMutation={updateFeeTypeMutation}
            deleteFeeTypeMutation={deleteFeeTypeMutation}
            fsTypes={fsTypes} setFsTypes={setFsTypes}
            fsClass={fsClass} setFsClass={setFsClass}
            fsAcademicYear={fsAcademicYear} setFsAcademicYear={setFsAcademicYear}
            handleCreateFeeStructure={handleCreateFeeStructure}
            createFeeStructureMutation={createFeeStructureMutation}
          />
        )}

        {/* PANEL 4: STAFF ACCOUNTS */}
        {activeTab === 'accountants' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Invite Form */}
            <div className="glass-card rounded-3xl p-6 border border-white/40 shadow-premium lg:col-span-1 h-fit">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <Plus className="w-5 h-5 text-indigo-600" />
                Create Staff Account
              </h3>
              <form onSubmit={handleInviteAccountant} className="space-y-4 text-[10px] font-semibold text-slate-500">
                <div>
                  <label className="block mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={accName}
                    onChange={(e) => setAccName(e.target.value)}
                    placeholder="Mark Miller"
                    className="w-full glass-input text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1">Email Address *</label>
                  <input
                    type="email"
                    value={accEmail}
                    onChange={(e) => setAccEmail(e.target.value)}
                    placeholder="mark@school.com"
                    className="w-full glass-input text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1">Password *</label>
                  <input
                    type="password"
                    value={accPassword}
                    onChange={(e) => setAccPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full glass-input text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1">Phone</label>
                  <input
                    type="text"
                    value={accPhone}
                    onChange={(e) => setAccPhone(e.target.value)}
                    placeholder="Optional"
                    className="w-full glass-input text-xs"
                  />
                </div>

                <div className="pt-2 border-t border-slate-200/50">
                  <span className="block text-[8px] font-bold text-indigo-600 uppercase tracking-widest mb-3">Privileges Configuration</span>
                  
                  <div className="space-y-2 text-slate-600 text-[10px]">
                    {Object.keys(accPerms).map((permKey) => (
                      <label key={permKey} className="flex items-center gap-2.5 cursor-pointer font-bold">
                        <input
                          type="checkbox"
                          checked={accPerms[permKey]}
                          onChange={(e) => setAccPerms({ ...accPerms, [permKey]: e.target.checked })}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span>{permKey.replace(/_/g, ' ').replace('can ', '')}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={inviteAccountantMutation.isPending}
                  className="w-full glass-btn-primary flex items-center justify-center gap-1 mt-2 text-xs py-2.5"
                >
                  {inviteAccountantMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Create Accountant Account'
                  )}
                </button>
              </form>
            </div>

            {/* Accountants directory */}
            <div className="lg:col-span-2 glass-card rounded-3xl p-6 border border-white/40 shadow-premium">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                Active Staff Directory & Dynamic Permissions
              </h3>

              {accountantsLoading ? (
                <div className="py-12 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>
              ) : accountants && accountants.length > 0 ? (
                <div className="space-y-4">
                  {accountants.map((acc) => (
                    <div key={acc.id} className="p-4 bg-white/40 border border-white/60 hover:border-indigo-100 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-slate-800 text-sm">{acc.name}</h4>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                            acc.status === 'active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
                          }`}>
                            {acc.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{acc.email} • {acc.phone || 'No Phone'}</p>
                        
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {Object.keys(acc.permissions || {}).map((k) => {
                            const isGranted = acc.permissions?.[k] === true;
                            return (
                              <button
                                key={k}
                                onClick={() => handleAccountantPermissionToggle(acc, k)}
                                className={`px-2.5 py-1 rounded-lg text-[9px] font-bold border transition-colors ${
                                  isGranted
                                    ? 'bg-indigo-50 border-indigo-150 text-indigo-600'
                                    : 'bg-slate-100/50 border-slate-200 text-slate-400 line-through'
                                }`}
                              >
                                {k.replace('can_', '').replace(/_/g, ' ')}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <button
                        onClick={() => handleAccountantStatusToggle(acc)}
                        className={`px-3 py-2 rounded-2xl font-bold text-[10px] uppercase border transition-colors md:self-center self-start ${
                          acc.status === 'active'
                            ? 'bg-rose-50 border-rose-100 text-rose-600 hover:bg-rose-100'
                            : 'bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-100'
                        }`}
                      >
                        {acc.status === 'active' ? 'Suspend' : 'Reactivate'}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center text-slate-400 text-xs">No staff accountants defined yet.</div>
              )}
            </div>
          </div>
        )}

        {/* PANEL 5: ADJUSTMENT DESK */}
        {activeTab === 'waivers' && (
          <FinancialAdjustmentsWorkspace
            unpaidFees={unpaidFees}
            students={students}
            studentSearch={studentSearch} setStudentSearch={setStudentSearch}
            selectedClassFilter={selectedClassFilter} setSelectedClassFilter={setSelectedClassFilter}
            selectedFeeId={selectedFeeId} setSelectedFeeId={setSelectedFeeId}
            actionType={actionType} setActionType={setActionType}
            actionAmount={actionAmount} setActionAmount={setActionAmount}
            actionReason={actionReason} setActionReason={setActionReason}
            handleApplyAction={handleApplyAction}
            applyWaiverMutation={applyWaiverMutation}
            applyPenaltyMutation={applyPenaltyMutation}
            actionMessage={actionMessage} setActionMessage={setActionMessage}
          />
        )}

        {/* PANEL 6: TRANSACTIONS AUDITING LEDGER */}
        {activeTab === 'transactions' && (
          <TransactionCenter
            transactions={transactions}
            txnsLoading={txnsLoading}
            txnSearch={txnSearch} setTxnSearch={setTxnSearch}
            txnMethod={txnMethod} setTxnMethod={setTxnMethod}
            txnStatus={txnStatus} setTxnStatus={setTxnStatus}
            setProfileStudentId={setProfileStudentId}
          />
        )}

      </div>

      {/* RECEIPT PREVIEW MODAL (ON-SCREEN ONLY) */}
      {printReceiptData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm no-print">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl flex flex-col relative text-left font-sans">
            <button
              type="button"
              onClick={() => setPrintReceiptData(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center pb-4 border-b border-slate-200">
              <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
                {user?.schoolName || 'Greenwood International School'}
              </h3>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-1">Official Student Payment Receipt</p>
            </div>

            <div className="py-4 space-y-2.5 text-xs border-b border-slate-150 text-slate-650 font-medium">
              <div className="flex justify-between"><strong>Student Name:</strong> <span>{printReceiptData.studentFee?.student?.user?.name || 'N/A'}</span></div>
              <div className="flex justify-between"><strong>Roll Number:</strong> <span className="font-mono text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">{printReceiptData.studentFee?.student?.rollNumber || 'N/A'}</span></div>
              <div className="flex justify-between"><strong>Class & Section:</strong> <span>{printReceiptData.studentFee?.student?.class ? `Class ${printReceiptData.studentFee.student.class} - ${printReceiptData.studentFee.student.section}` : 'N/A'}</span></div>
              <div className="flex justify-between"><strong>Receipt Serial ID:</strong> <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">{printReceiptData.receiptUrl}</span></div>
              <div className="flex justify-between"><strong>Settlement Date:</strong> <span>{new Date(printReceiptData.createdAt).toLocaleString()}</span></div>
              <div className="flex justify-between"><strong>Payment Method:</strong> <span className="uppercase bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-bold text-[10px]">{printReceiptData.method}</span></div>
              {printReceiptData.status && (
                <div className="flex justify-between"><strong>Status:</strong> <span className="uppercase font-bold text-emerald-650 text-emerald-600">{printReceiptData.status}</span></div>
              )}
            </div>

            <div className="py-4 space-y-2 text-xs border-b border-slate-150 text-slate-605 font-medium">
              <div className="flex justify-between"><strong>Bill Category:</strong> <span className="font-semibold text-slate-800">{printReceiptData.studentFee?.feeStructure?.feeType?.name}</span></div>
              <div className="flex justify-between"><strong>Original Tuition:</strong> <span>{formatCurrency(Number(printReceiptData.studentFee?.amountDue))}</span></div>
              {Number(printReceiptData.studentFee?.penaltyAmount) > 0 && (
                <div className="flex justify-between text-rose-500"><strong>Overdue Penalty:</strong> <span>+ {formatCurrency(Number(printReceiptData.studentFee?.penaltyAmount))}</span></div>
              )}
              {Number(printReceiptData.studentFee?.waiverAmount) > 0 && (
                <div className="flex justify-between text-emerald-600"><strong>Merit Waiver:</strong> <span>- {formatCurrency(Number(printReceiptData.studentFee?.waiverAmount))}</span></div>
              )}
            </div>

            <div className="pt-4 flex justify-between font-black text-slate-900 text-sm">
              <span>TOTAL AMOUNT SETTLED:</span>
              <span className="text-indigo-600">{formatCurrency(Number(printReceiptData.amount))}</span>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => window.print()}
                className="flex-1 glass-btn-primary flex items-center justify-center gap-1.5 text-xs py-2 font-bold uppercase tracking-wider"
              >
                <Printer className="w-4 h-4" />
                Print Receipt
              </button>
              <button
                onClick={() => setPrintReceiptData(null)}
                className="glass-btn-secondary text-xs py-2 px-4 font-bold uppercase tracking-wider"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRINT-ONLY RECEIPT LAYOUT */}
      {printReceiptData && (
        <div className="print-only hidden p-10 max-w-xl mx-auto border border-slate-400 rounded-3xl font-sans mt-12 bg-white text-black text-left">
          <div className="text-center pb-6 border-b border-slate-300">
            <h1 className="text-xl font-black uppercase tracking-wider">{user?.schoolName || 'Greenwood International School'}</h1>
            <p className="text-[10px] text-slate-500 mt-1">Official Student Payment Receipt</p>
          </div>

          <div className="py-6 space-y-3.5 text-xs border-b border-slate-200">
            <div className="flex justify-between"><strong>Student Name:</strong> <span>{printReceiptData.studentFee?.student?.user?.name}</span></div>
            <div className="flex justify-between"><strong>Roll Number:</strong> <span>{printReceiptData.studentFee?.student?.rollNumber}</span></div>
            <div className="flex justify-between"><strong>Receipt Serial ID:</strong> <span className="font-mono">{printReceiptData.receiptUrl}</span></div>
            <div className="flex justify-between"><strong>Settlement Date:</strong> <span>{new Date(printReceiptData.createdAt).toLocaleString()}</span></div>
            <div className="flex justify-between"><strong>Transaction Type:</strong> <span className="uppercase">{printReceiptData.method}</span></div>
            <div className="flex justify-between"><strong>Status:</strong> <span className="uppercase font-bold">{printReceiptData.status}</span></div>
          </div>

          <div className="py-6 space-y-3 text-xs border-b border-slate-200">
            <div className="flex justify-between"><strong>Bill Category:</strong> <span>{printReceiptData.studentFee?.feeStructure?.feeType?.name}</span></div>
            <div className="flex justify-between"><strong>Original Tuition:</strong> <span>{formatCurrency(Number(printReceiptData.studentFee?.amountDue))}</span></div>
            {Number(printReceiptData.studentFee?.penaltyAmount) > 0 && <div className="flex justify-between text-red-500"><strong>Overdue Penalty:</strong> <span>+ {formatCurrency(Number(printReceiptData.studentFee?.penaltyAmount))}</span></div>}
            {Number(printReceiptData.studentFee?.waiverAmount) > 0 && <div className="flex justify-between text-green-600"><strong>Merit Waiver:</strong> <span>- {formatCurrency(Number(printReceiptData.studentFee?.waiverAmount))}</span></div>}
          </div>

          <div className="pt-6 flex justify-between font-black text-slate-900 text-sm">
            <span>TOTAL AMOUNT SETTLED:</span>
            <span>{formatCurrency(Number(printReceiptData.amount))}</span>
          </div>

          <div className="mt-20 text-center text-[9px] text-slate-400 italic">
            This invoice print represents a secure Ledger Transaction update generated on the Campus Pay SaaS platform.
          </div>
        </div>
      )}

      {/* STUDENT DETAIL PROFILE 360 */}
      {profileStudentId && (() => {
        const student = students?.find(s => s.id === profileStudentId);
        if (!student) return null;
        return <StudentProfile360 
          student={student} 
          onClose={() => setProfileStudentId(null)} 
          initialTab={profileStudentTab} 
          onEdit={() => { setProfileStudentId(null); handleEditStudentClick(student); }}
          onDelete={(id) => { setProfileStudentId(null); handleDeleteStudent(id); }}
        />;
      })()}

      {/* MESSAGES VIEW */}
      {activeTab === 'messages' && <MessagesView />}

      </main>
    </div>
  );
}
