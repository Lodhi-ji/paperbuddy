import React, { useState } from 'react';
import {
  ChevronLeft,
  Calendar,
  MapPin,
  Mail,
  Phone,
  Shield,
  FileText,
  Activity,
  MessageSquare,
  DownloadCloud,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  BookOpen,
  Award,
  TrendingUp,
  BarChart2,
  MoreVertical,
  Edit2,
  Trash2,
  Download,
  IndianRupee,
  Receipt,
  FileSpreadsheet,
  UploadCloud,
  Bell,
  CreditCard,
  Banknote,
  Smartphone,
  Landmark,
  AlertTriangle,
  ShieldCheck
} from 'lucide-react';
import { 
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import MessagesView from './MessagesView';
import PenaltyModal from './PenaltyModal';
import RecordPaymentModal from './RecordPaymentModal';
import SendReminderModal from './SendReminderModal';
import ReceiptModal from './ReceiptModal';

const formatCurrencyLegacy = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

export default function StudentProfile360({ student, onClose, onEdit, onDelete, initialTab = 'overview' }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [selectedPenaltyFee, setSelectedPenaltyFee] = useState(null);
  const [selectedPaymentFee, setSelectedPaymentFee] = useState(null); // Can now be an array or single object
  const [selectedReminderFee, setSelectedReminderFee] = useState(null);
  const [selectedReceiptFee, setSelectedReceiptFee] = useState(null);
  const [selectedFeesForBulk, setSelectedFeesForBulk] = useState([]);
  const [isBulkMode, setIsBulkMode] = useState(false);

  const handleReceiptClick = (fee) => {
    if (fee.status === 'UNPAID') {
      alert('Fees not paid till now');
    } else {
      setSelectedReceiptFee(fee);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'fees', label: 'Fees & Payments' },
    { id: 'communication', label: 'Communication' }
  ];

  let totalBilled = 0;
  let totalPaid = 0;
  let totalOutstanding = 0;
  let hasUnpaidMandatory = false;
  
  if (student?.studentFees) {
    student.studentFees.forEach(f => {
      const due = Number(f.amountDue);
      const paid = Number(f.amountPaid);
      const waiver = Number(f.waiverAmount);
      const penalty = Number(f.penaltyAmount);
      
      totalBilled += due + penalty;
      totalPaid += paid;
      totalOutstanding += Math.max(0, (due + penalty) - (paid + waiver));
      
      if (f.feeStructure?.feeType?.isVariable === false && f.status !== 'PAID') {
        hasUnpaidMandatory = true;
      }
    });
  }


  return (
    <div className="fixed inset-0 bg-slate-50 z-[100] overflow-y-auto no-scrollbar animate-in slide-in-from-right-8 duration-300">
      <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-8">
        
        {/* Header Section */}
        <div>
          <button 
            onClick={onClose}
            className="text-xs font-bold text-slate-500 hover:text-brand-primary flex items-center gap-1.5 transition-colors mb-6 bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm hover:shadow-md"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Students
          </button>

          <div className="flex flex-col xl:flex-row gap-6 justify-between items-start">
            <div className="flex items-start gap-6 w-full">
              {/* Profile Image */}
              <div className="w-32 h-32 shrink-0 rounded-3xl bg-gradient-to-br from-indigo-50 to-brand-primary/10 border-2 border-white shadow-lg flex items-center justify-center text-4xl font-black text-brand-primary">
                {student.user?.name ? student.user.name.substring(0, 2).toUpperCase() : 'ST'}
              </div>
              
              <div className="pt-2 flex-1 w-full">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
                  <div className="flex items-center gap-4">
                    <h1 className="text-4xl font-black text-slate-800 tracking-tight">{student.user?.name}</h1>
                    {hasUnpaidMandatory ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-xs font-bold border border-amber-100">
                        <div className="w-2 h-2 rounded-full bg-amber-500" />
                        Pending
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold border border-emerald-100">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        Active
                      </span>
                    )}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <button onClick={onEdit} className="p-2.5 bg-white border border-slate-200 text-slate-500 hover:text-brand-primary rounded-xl shadow-sm transition-colors" title="Edit Student">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button className="p-2.5 bg-white border border-slate-200 text-slate-500 hover:text-brand-primary rounded-xl shadow-sm transition-colors" title="Export Data">
                      <Download className="w-4 h-4" />
                    </button>
                    <button onClick={() => { if (onDelete) onDelete(student.id); }} className="p-2.5 bg-white border border-slate-200 text-slate-500 hover:text-rose-600 rounded-xl shadow-sm transition-colors" title="Delete Student">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-x-6 gap-y-4 mt-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Student ID</span>
                    <span className="text-sm font-mono font-bold text-slate-700">{student.id.substring(0,8).toUpperCase()}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Class & Sec</span>
                    <span className="text-sm font-bold text-slate-700">{student.class} — {student.section}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Roll Number</span>
                    <span className="text-sm font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">{student.rollNumber}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Guardian</span>
                    <span className="text-sm font-bold text-slate-700">{student.guardianName || 'N/A'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Contact</span>
                    <span className="text-sm font-medium text-slate-600">{student.guardianPhone || 'N/A'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Email</span>
                    <span className="text-sm font-medium text-slate-600">{student.user?.email}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-slate-200/60 sticky top-0 bg-slate-50/95 backdrop-blur-xl z-10 pt-4">
          <div className="flex gap-8 overflow-x-auto no-scrollbar">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  pb-4 text-sm font-bold transition-all relative whitespace-nowrap
                  ${activeTab === tab.id ? 'text-brand-primary' : 'text-slate-500 hover:text-slate-700'}
                `}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-brand-primary rounded-t-full animate-in zoom-in duration-300" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Contents */}
        <div className="animate-in fade-in duration-500 slide-in-from-bottom-4">
          
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Personal Info */}
              <div className="glass-card rounded-[24px] p-6 border border-white/40 shadow-sm relative group hover:shadow-md transition-shadow">
                <button className="absolute top-6 right-6 text-slate-300 hover:text-brand-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  <Edit2 className="w-4 h-4" />
                </button>
                <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider mb-6 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-500" /> Personal Information
                </h3>
                <div className="space-y-5">
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Date of Birth</div>
                    <div className={`text-xs font-bold flex items-center gap-2 ${student.dateOfBirth ? 'text-slate-700' : 'text-slate-400'}`}>
                      <Calendar className={`w-4 h-4 ${student.dateOfBirth ? 'text-brand-primary' : 'text-slate-400'}`} /> {student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Not Specified'}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Gender</div>
                    <div className={`text-xs font-bold ${student.gender ? 'text-slate-700' : 'text-slate-400'}`}>{student.gender || 'Not Specified'}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Blood Group</div>
                    <div className={`text-xs font-bold ${student.bloodGroup ? 'text-slate-700' : 'text-slate-400'}`}>{student.bloodGroup || 'Not Specified'}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Address</div>
                    <div className={`text-xs font-bold flex items-start gap-2 ${student.address ? 'text-slate-700' : 'text-slate-400'}`}>
                      <MapPin className={`w-4 h-4 shrink-0 mt-0.5 ${student.address ? 'text-brand-primary' : 'text-slate-400'}`} /> 
                      <span>{student.address || 'Not Specified'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Academic Info */}
              <div className="glass-card rounded-[24px] p-6 border border-white/40 shadow-sm relative group hover:shadow-md transition-shadow">
                <button className="absolute top-6 right-6 text-slate-300 hover:text-brand-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  <Edit2 className="w-4 h-4" />
                </button>
                <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider mb-6 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-500" /> Academic Details
                </h3>
                <div className="space-y-5">
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Admission Date</div>
                    <div className={`text-xs font-bold flex items-center gap-2 ${student.admissionDate ? 'text-slate-700' : 'text-slate-400'}`}>
                      <Calendar className="w-4 h-4 text-slate-400" /> {student.admissionDate ? new Date(student.admissionDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Not Specified'}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Admission Number</div>
                    <div className="text-xs font-bold text-slate-700">{student.rollNumber}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Previous School</div>
                    <div className={`text-xs font-bold ${student.previousSchool ? 'text-slate-700' : 'text-slate-400'}`}>{student.previousSchool || 'Not Specified'}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Extracurricular</div>
                    <div className={`text-xs font-bold flex items-center gap-2 ${student.extracurricular ? 'text-slate-700' : 'text-slate-400'}`}>
                      <Award className={`w-4 h-4 ${student.extracurricular ? 'text-brand-primary' : 'text-slate-400'}`} /> {student.extracurricular || 'None recorded'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Guardian Info */}
              <div className="glass-card rounded-[24px] p-6 border border-white/40 shadow-sm relative group hover:shadow-md transition-shadow">
                <button className="absolute top-6 right-6 text-slate-300 hover:text-brand-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  <Edit2 className="w-4 h-4" />
                </button>
                <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider mb-6 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-amber-500" /> Guardian Details
                </h3>
                <div className="space-y-5">
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Primary Guardian</div>
                    <div className="text-xs font-bold text-slate-700">{student.guardianName}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Contact Number</div>
                    <div className="text-xs font-bold text-slate-700 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-slate-400" /> {student.guardianPhone}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Email Address</div>
                    <div className={`text-xs font-bold flex items-center gap-2 ${student.guardianEmail ? 'text-slate-700' : 'text-slate-400'}`}>
                      <Mail className={`w-4 h-4 ${student.guardianEmail ? 'text-brand-primary' : 'text-slate-400'}`} /> {student.guardianEmail || 'Not Specified'}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Emergency Contact</div>
                    <div className={`text-xs font-bold flex items-center gap-2 ${student.emergencyContact ? 'text-slate-700' : 'text-slate-400'}`}>
                      <Phone className={`w-4 h-4 ${student.emergencyContact ? 'text-brand-primary' : 'text-slate-400'}`} /> {student.emergencyContact || 'Not Specified'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* FEES TAB */}
          {activeTab === 'fees' && (
            <div className="space-y-8">
              {/* Financial Summary Card */}
              <div className="glass-card rounded-[32px] p-8 border border-white/40 shadow-premium relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-full blur-3xl -mr-20 -mt-20" />
                
                <div className="flex justify-between items-end mb-8 relative z-10">
                  <div>
                    <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider mb-1">Financial Overview</h3>
                    <p className="text-xs font-medium text-slate-500">Complete summary for academic year 2024-25</p>
                  </div>
                  <button className="text-xs font-bold text-brand-primary hover:text-brand-secondary flex items-center gap-1 transition-colors">
                    View All Payments <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative z-10">
                  <div className="bg-white/60 rounded-2xl p-5 border border-slate-100 shadow-sm">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                      <IndianRupee className="w-3.5 h-3.5 text-slate-400" /> Total Fees
                    </div>
                    <div className="text-2xl font-black text-slate-800">{formatCurrencyLegacy(totalBilled)}</div>
                  </div>
                  <div className="bg-emerald-50/50 rounded-2xl p-5 border border-emerald-100/50 shadow-sm">
                    <div className="text-[10px] font-bold text-emerald-600/70 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Paid Amount
                    </div>
                    <div className="text-2xl font-black text-emerald-600">{formatCurrencyLegacy(totalPaid)}</div>
                  </div>
                  <div className="bg-rose-50/50 rounded-2xl p-5 border border-rose-100/50 shadow-sm">
                    <div className="text-[10px] font-bold text-rose-500/70 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-500" /> Outstanding
                    </div>
                    <div className="text-2xl font-black text-rose-600">{formatCurrencyLegacy(totalOutstanding)}</div>
                  </div>
                  <div className="bg-blue-50/50 rounded-2xl p-5 border border-blue-100/50 shadow-sm">
                    <div className="text-[10px] font-bold text-blue-600/70 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-blue-500" /> Last Payment
                    </div>
                    <div className="text-sm font-bold text-slate-400 mt-2">No Payments Yet</div>
                    <div className="text-[10px] font-medium text-slate-400/80">-</div>
                  </div>
                </div>
              </div>



              {/* Recent Invoices Table */}
              <div className="glass-card rounded-3xl border border-white/40 shadow-premium overflow-hidden bg-white/50">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white/40">
                  <div className="flex items-center gap-4">
                    <h3 className="text-sm font-black text-slate-800">Recent Payments & Fees</h3>
                    {!isBulkMode && (
                      <button
                        onClick={() => setIsBulkMode(true)}
                        className="bg-white border border-slate-200 text-slate-600 hover:text-brand-primary text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all shadow-sm"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Multiple Payments
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {isBulkMode && (
                      <button
                        onClick={() => {
                          setIsBulkMode(false);
                          setSelectedFeesForBulk([]);
                        }}
                        className="text-slate-400 hover:text-slate-600 text-xs font-bold px-3 py-2 transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                    {selectedFeesForBulk.length > 0 && isBulkMode && (
                      <button
                        onClick={() => {
                          const feesToPay = student.studentFees.filter(f => selectedFeesForBulk.includes(f.id));
                          setSelectedPaymentFee(feesToPay);
                        }}
                        className="bg-brand-primary text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-brand-secondary transition-all shadow-md shadow-brand-primary/20 animate-in fade-in"
                      >
                        <Receipt className="w-4 h-4" /> Pay Selected ({selectedFeesForBulk.length})
                      </button>
                    )}
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200/80 bg-slate-50/50 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                        {isBulkMode && (
                          <th className="py-4 pl-6 pr-2 w-10">
                            <input 
                              type="checkbox" 
                              className="w-4 h-4 rounded text-brand-primary border-slate-300 focus:ring-brand-primary/30"
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedFeesForBulk(student.studentFees.filter(f => f.status !== 'PAID').map(f => f.id));
                                } else {
                                  setSelectedFeesForBulk([]);
                                }
                              }}
                              checked={
                                student.studentFees?.filter(f => f.status !== 'PAID').length > 0 &&
                                selectedFeesForBulk.length === student.studentFees?.filter(f => f.status !== 'PAID').length
                              }
                            />
                          </th>
                        )}
                        <th className={`py-4 px-3 ${!isBulkMode ? 'pl-6' : ''}`}>Due Date</th>
                        <th className="py-4 px-3">Fee Type</th>
                        <th className="py-4 px-3">Amount Billed</th>
                        <th className="py-4 px-3">Amount Paid</th>
                        <th className="py-4 px-3">Status</th>
                        <th className="py-4 pr-6 pl-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {student.studentFees && student.studentFees.map(fee => {
                        const isSelectable = fee.status !== 'PAID';
                        return (
                          <tr key={fee.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/80 transition-colors group">
                            {isBulkMode && (
                              <td className="py-4 pl-6 pr-2">
                                {isSelectable && (
                                  <input 
                                    type="checkbox" 
                                    className="w-4 h-4 rounded text-brand-primary border-slate-300 focus:ring-brand-primary/30"
                                    checked={selectedFeesForBulk.includes(fee.id)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedFeesForBulk([...selectedFeesForBulk, fee.id]);
                                      } else {
                                        setSelectedFeesForBulk(selectedFeesForBulk.filter(id => id !== fee.id));
                                      }
                                    }}
                                  />
                                )}
                              </td>
                            )}
                            <td className={`py-4 px-3 font-medium text-slate-600 ${!isBulkMode ? 'pl-6' : ''}`}>
                              {new Date(fee.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </td>
                            <td className="py-4 px-3 font-bold text-slate-800">{fee.feeStructure.feeType.name}</td>
                            <td className="py-4 px-3 font-mono text-slate-600">{formatCurrencyLegacy(Number(fee.amountDue) + Number(fee.penaltyAmount))}</td>
                            <td className="py-4 px-3 font-mono text-emerald-600 font-bold">{formatCurrencyLegacy(Number(fee.amountPaid))}</td>
                            <td className="py-4 px-3">
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold border ${
                                fee.status === 'PAID' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                fee.status === 'PARTIAL' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                              }`}>
                                {fee.status}
                              </span>
                            </td>
                            <td className="py-4 pr-6 pl-3">
                              <div className="flex items-center justify-end gap-2">
                                {fee.status !== 'PAID' ? (
                                  <button onClick={() => setSelectedPaymentFee(fee)} className="flex items-center gap-1.5 px-3 py-1.5 text-brand-primary bg-brand-primary/10 hover:bg-brand-primary hover:text-white text-[10px] font-bold rounded-full transition-colors">
                                    <Receipt className="w-3.5 h-3.5" /> Pay
                                  </button>
                                ) : (
                                  <span className="flex items-center gap-1.5 px-3 py-1.5 text-emerald-600 bg-emerald-50 text-[10px] font-bold rounded-full border border-emerald-100">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Fully Paid
                                  </span>
                                )}
                                <button onClick={() => setSelectedPenaltyFee(fee)} className="flex items-center gap-1.5 px-3 py-1.5 text-rose-600 bg-rose-50 hover:bg-rose-600 hover:text-white text-[10px] font-bold rounded-full transition-colors">
                                  <AlertCircle className="w-3.5 h-3.5" /> Penalty
                                </button>
                                <button onClick={() => setSelectedReminderFee(fee)} className="flex items-center gap-1.5 px-3 py-1.5 text-amber-600 bg-amber-50 hover:bg-amber-500 hover:text-white text-[10px] font-bold rounded-full transition-colors">
                                  <Bell className="w-3.5 h-3.5" /> Remind
                                </button>
                                <button onClick={() => handleReceiptClick(fee)} className="flex items-center gap-1.5 px-3 py-1.5 text-indigo-600 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-[10px] font-bold rounded-full transition-colors">
                                  <DownloadCloud className="w-3.5 h-3.5" /> Receipt
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {(!student.studentFees || student.studentFees.length === 0) && (
                        <tr>
                          <td colSpan="5" className="py-8 text-center text-slate-400 text-xs">No fee profiles assigned to this student.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Activity Log */}
              {(() => {
                const allTxns = (student.studentFees || [])
                  .flatMap(fee => (fee.transactions || []).map(t => ({ ...t, feeName: fee.feeStructure?.feeType?.name })))
                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

                const penaltyEvents = (student.studentFees || [])
                  .filter(f => Number(f.penaltyAmount) > 0)
                  .map(f => ({
                    type: 'penalty',
                    feeName: f.feeStructure?.feeType?.name,
                    amount: Number(f.penaltyAmount),
                    createdAt: f.dueDate,
                    id: `penalty-${f.id}`
                  }));

                const waiverEvents = (student.studentFees || [])
                  .filter(f => Number(f.waiverAmount) > 0)
                  .map(f => ({
                    type: 'waiver',
                    feeName: f.feeStructure?.feeType?.name,
                    amount: Number(f.waiverAmount),
                    reason: f.waiverReason,
                    createdAt: f.dueDate,
                    id: `waiver-${f.id}`
                  }));

                const allEvents = [
                  ...allTxns.map(t => ({ ...t, type: 'payment' })),
                  ...penaltyEvents,
                  ...waiverEvents
                ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

                return (
                  <div className="glass-card rounded-3xl border border-white/40 shadow-premium overflow-hidden bg-white/50">
                    <div className="p-6 border-b border-slate-100 bg-white/40 flex items-center justify-between">
                      <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-brand-primary" /> Activity Log
                      </h3>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{allEvents.length} Events</span>
                    </div>

                    {allEvents.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                          <Activity className="w-5 h-5 text-slate-300" />
                        </div>
                        <p className="text-sm font-bold text-slate-500">No activity yet</p>
                        <p className="text-xs text-slate-400 mt-1">Payment and adjustment events will appear here.</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-50">
                        {allEvents.map((evt, idx) => {
                          const isPayment = evt.type === 'payment';
                          const isPenalty = evt.type === 'penalty';
                          const iconBg = isPayment ? 'bg-emerald-50 text-emerald-600' : isPenalty ? 'bg-rose-50 text-rose-500' : 'bg-blue-50 text-blue-500';
                          const icon = isPayment ? (
                            evt.method === 'UPI' ? <Smartphone className="w-4 h-4" /> :
                            evt.method === 'CARD' ? <CreditCard className="w-4 h-4" /> :
                            evt.method === 'CASH' ? <Banknote className="w-4 h-4" /> :
                            evt.method === 'CHEQUE' ? <Landmark className="w-4 h-4" /> :
                            <Receipt className="w-4 h-4" />
                          ) : isPenalty ? <AlertTriangle className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />;

                          const label = isPayment ? `Payment via ${evt.method || 'System'}` : isPenalty ? 'Penalty Applied' : `Waiver${evt.reason ? ` – ${evt.reason}` : ''}`;
                          const amountColor = isPayment ? 'text-emerald-600' : isPenalty ? 'text-rose-500' : 'text-blue-600';
                          const amountPrefix = isPayment ? '+' : isPenalty ? '+' : '-';

                          return (
                            <div key={evt.id || idx} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/60 transition-colors">
                              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>{icon}</div>
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-bold text-slate-800">{label}</div>
                                <div className="text-[10px] font-medium text-slate-400 mt-0.5">{evt.feeName || 'General'}</div>
                              </div>
                              <div className="text-right shrink-0">
                                <div className={`text-sm font-black ${amountColor}`}>{amountPrefix}{formatCurrencyLegacy(evt.amount)}</div>
                                <div className="text-[10px] font-medium text-slate-400 mt-0.5">
                                  {new Date(evt.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}

          {/* COMMUNICATION TAB */}
          {activeTab === 'communication' && (
             <div className="glass-card rounded-[24px] p-2 border border-white/40 shadow-sm bg-white/50">
               <MessagesView standaloneContactId={student.userId} />
             </div>
          )}
        </div>
      </div>
      
      {selectedPenaltyFee && (
        <PenaltyModal fee={selectedPenaltyFee} onClose={() => setSelectedPenaltyFee(null)} />
      )}
      {selectedPaymentFee && (
        <RecordPaymentModal fee={selectedPaymentFee} onClose={() => setSelectedPaymentFee(null)} />
      )}
      {selectedReminderFee && (
        <SendReminderModal fee={selectedReminderFee} onClose={() => setSelectedReminderFee(null)} />
      )}
      {selectedReceiptFee && (
        (() => {
          const latestTxn = selectedReceiptFee.transactions && selectedReceiptFee.transactions.length > 0 
            ? selectedReceiptFee.transactions[selectedReceiptFee.transactions.length - 1] 
            : null;
            
          let bulkTxns = null;
          if (latestTxn && latestTxn.receiptUrl && latestTxn.receiptUrl.startsWith('TXN-BULK')) {
            bulkTxns = student.studentFees
              .flatMap(f => (f.transactions || []).map(t => ({ ...t, studentFee: f })))
              .filter(t => t.receiptUrl === latestTxn.receiptUrl);
          }
          
          const transactionData = latestTxn ? {
            ...latestTxn,
            student: student,
            bulkTransactions: bulkTxns
          } : { 
            id: selectedReceiptFee.id, 
            amount: selectedReceiptFee.amountPaid, 
            method: 'SYSTEM', 
            status: 'COMPLETED',
            createdAt: new Date().toISOString(),
            studentFee: selectedReceiptFee,
            student: student
          };

          return (
            <ReceiptModal 
              isOpen={true} 
              onClose={() => setSelectedReceiptFee(null)} 
              transaction={transactionData} 
            />
          );
        })()
      )}
    </div>
  );
}
