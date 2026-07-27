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
  Bell
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

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

export default function StudentProfile360({ student, onClose }) {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'academic', label: 'Academic' },
    { id: 'fees', label: 'Fees & Payments' },
    { id: 'attendance', label: 'Attendance' },
    { id: 'documents', label: 'Documents' },
    { id: 'communication', label: 'Communication' },
    { id: 'activity', label: 'Activity Log' }
  ];

  let totalBilled = 0;
  let totalPaid = 0;
  let totalOutstanding = 0;
  
  if (student?.studentFees) {
    student.studentFees.forEach(f => {
      const due = Number(f.amountDue);
      const paid = Number(f.amountPaid);
      const waiver = Number(f.waiverAmount);
      const penalty = Number(f.penaltyAmount);
      
      totalBilled += due + penalty;
      totalPaid += paid;
      totalOutstanding += Math.max(0, (due + penalty) - (paid + waiver));
    });
  }

  const healthScore = totalBilled > 0 ? Math.round(((totalBilled - totalOutstanding) / totalBilled) * 100) : null;

  return (
    <div className="absolute inset-0 bg-slate-50/95 backdrop-blur-xl z-[50] overflow-y-auto no-scrollbar animate-in slide-in-from-right-8 duration-300">
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
            <div className="flex items-start gap-6">
              {/* Profile Image */}
              <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-indigo-50 to-brand-primary/10 border-2 border-white shadow-lg flex items-center justify-center text-4xl font-black text-brand-primary">
                {student.user?.name ? student.user.name.substring(0, 2).toUpperCase() : 'ST'}
              </div>
              
              <div className="pt-2">
                <div className="flex items-center gap-4 mb-2">
                  <h1 className="text-4xl font-black text-slate-800 tracking-tight">{student.user?.name}</h1>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold border border-emerald-100">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    Active
                  </span>
                </div>
                
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mt-4">
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
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Email</span>
                    <span className="text-sm font-medium text-slate-600">{student.user?.email}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side: Health Score & Actions */}
            <div className="flex flex-col gap-4 min-w-[320px]">
              <div className="glass-card p-5 rounded-2xl border border-white/40 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-150" />
                <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-500" /> Student Health Score
                </h3>
                
                <div className="flex items-end gap-3 mb-4">
                  <div className="text-4xl font-black text-slate-800">{healthScore !== null ? `${healthScore}%` : 'N/A'}</div>
                  {healthScore !== null && (
                    <div className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md mb-1">
                      {healthScore > 90 ? 'Excellent' : 'Healthy'}
                    </div>
                  )}
                </div>
                
                <div className="space-y-2 text-xs font-bold text-slate-500 relative z-10">
                  <div className="flex justify-between items-center">
                    <span>Attendance</span>
                    <span className="text-slate-400 flex items-center gap-1">Not Recorded</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Fee Status</span>
                    {totalOutstanding > 0 ? (
                      <span className="text-amber-500 flex items-center gap-1"><AlertCircle className="w-3 h-3"/> Partial</span>
                    ) : (
                      <span className="text-emerald-600 flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Clear</span>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Academic</span>
                    <span className="text-slate-400 flex items-center gap-1">No Data</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Documents</span>
                    <span className="text-slate-400 flex items-center gap-1">Pending</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button className="p-2.5 bg-white border border-slate-200 text-slate-500 hover:text-brand-primary rounded-xl shadow-sm transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button className="p-2.5 bg-white border border-slate-200 text-slate-500 hover:text-brand-primary rounded-xl shadow-sm transition-colors">
                  <Download className="w-4 h-4" />
                </button>
                <button className="p-2.5 bg-white border border-slate-200 text-slate-500 hover:text-rose-600 rounded-xl shadow-sm transition-colors">
                  <MoreVertical className="w-4 h-4" />
                </button>
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
                    <div className="text-xs font-bold text-slate-400 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" /> Not Specified
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
                    <div className="text-2xl font-black text-slate-800">{formatCurrency(totalBilled)}</div>
                  </div>
                  <div className="bg-emerald-50/50 rounded-2xl p-5 border border-emerald-100/50 shadow-sm">
                    <div className="text-[10px] font-bold text-emerald-600/70 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Paid Amount
                    </div>
                    <div className="text-2xl font-black text-emerald-600">{formatCurrency(totalPaid)}</div>
                  </div>
                  <div className="bg-rose-50/50 rounded-2xl p-5 border border-rose-100/50 shadow-sm">
                    <div className="text-[10px] font-bold text-rose-500/70 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-500" /> Outstanding
                    </div>
                    <div className="text-2xl font-black text-rose-600">{formatCurrency(totalOutstanding)}</div>
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

              {/* Quick Actions */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button className="glass-card rounded-2xl p-5 border border-white/40 shadow-sm flex flex-col items-center justify-center gap-3 hover:-translate-y-1 hover:shadow-md hover:border-brand-primary/30 transition-all group">
                  <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary group-hover:scale-110 transition-transform">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-700">Record Payment</span>
                </button>
                <button className="glass-card rounded-2xl p-5 border border-white/40 shadow-sm flex flex-col items-center justify-center gap-3 hover:-translate-y-1 hover:shadow-md hover:border-brand-primary/30 transition-all group">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
                    <DownloadCloud className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-700">Download Receipt</span>
                </button>
                <button className="glass-card rounded-2xl p-5 border border-white/40 shadow-sm flex flex-col items-center justify-center gap-3 hover:-translate-y-1 hover:shadow-md hover:border-brand-primary/30 transition-all group">
                  <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                    <Bell className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-700">Send Reminder</span>
                </button>
                <button className="glass-card rounded-2xl p-5 border border-white/40 shadow-sm flex flex-col items-center justify-center gap-3 hover:-translate-y-1 hover:shadow-md hover:border-brand-primary/30 transition-all group">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-700">Message Guardian</span>
                </button>
              </div>

              {/* Recent Invoices Table */}
              <div className="glass-card rounded-3xl border border-white/40 shadow-premium overflow-hidden bg-white/50">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white/40">
                  <h3 className="text-sm font-black text-slate-800">Recent Payments & Fees</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200/80 bg-slate-50/50 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                        <th className="py-4 pl-6 pr-3">Due Date</th>
                        <th className="py-4 px-3">Fee Type</th>
                        <th className="py-4 px-3">Amount Billed</th>
                        <th className="py-4 px-3">Amount Paid</th>
                        <th className="py-4 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {student.studentFees && student.studentFees.map(fee => {
                        return (
                          <tr key={fee.id} className="border-b border-slate-100 last:border-0 hover:bg-white/60 transition-colors">
                            <td className="py-4 pl-6 pr-3 font-medium text-slate-600">
                              {new Date(fee.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </td>
                            <td className="py-4 px-3 font-bold text-slate-800">{fee.feeStructure.feeType.name}</td>
                            <td className="py-4 px-3 font-mono text-slate-600">{formatCurrency(Number(fee.amountDue) + Number(fee.penaltyAmount))}</td>
                            <td className="py-4 px-3 font-mono text-emerald-600 font-bold">{formatCurrency(Number(fee.amountPaid))}</td>
                            <td className="py-4 px-3">
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold border ${
                                fee.status === 'PAID' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                fee.status === 'PARTIAL' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                              }`}>
                                {fee.status}
                              </span>
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
            </div>
          )}

          {/* ACADEMIC TAB (MOCK) */}
          {activeTab === 'academic' && (
             <div className="glass-card rounded-[24px] p-8 border border-white/40 shadow-sm text-center py-32 bg-white/50">
               <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100 shadow-inner">
                 <BookOpen className="w-10 h-10 text-slate-300" />
               </div>
               <h3 className="text-lg font-black text-slate-700 mb-2">No Academic Records</h3>
               <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">Academic records will appear here once examinations are graded and published.</p>
             </div>
          )}

          {/* DOCUMENTS TAB (MOCK) */}
          {activeTab === 'documents' && (
             <div className="glass-card rounded-[24px] p-8 border border-white/40 shadow-sm text-center py-32 bg-white/50">
               <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100 shadow-inner">
                 <FileText className="w-10 h-10 text-slate-300" />
               </div>
               <h3 className="text-lg font-black text-slate-700 mb-2">No Documents Uploaded</h3>
               <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">There are currently no documents associated with this student's profile.</p>
             </div>
          )}

          {/* ATTENDANCE TAB (MOCK) */}
          {activeTab === 'attendance' && (
             <div className="glass-card rounded-[24px] p-8 border border-white/40 shadow-sm text-center py-32 bg-white/50">
               <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100 shadow-inner">
                 <Calendar className="w-10 h-10 text-slate-300" />
               </div>
               <h3 className="text-lg font-black text-slate-700 mb-2">Attendance Module Coming Soon</h3>
               <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">This module will provide detailed calendar views, leave requests, and monthly attendance charts.</p>
             </div>
          )}

          {/* COMMUNICATION TAB (MOCK) */}
          {activeTab === 'communication' && (
             <div className="glass-card rounded-[24px] p-8 border border-white/40 shadow-sm text-center py-32 bg-white/50">
               <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100 shadow-inner">
                 <Mail className="w-10 h-10 text-slate-300" />
               </div>
               <h3 className="text-lg font-black text-slate-700 mb-2">Communication Hub</h3>
               <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">Track all SMS, Email, and WhatsApp messages sent to parents from this centralized hub.</p>
             </div>
          )}

          {/* ACTIVITY LOG TAB (MOCK) */}
          {activeTab === 'activity' && (
             <div className="glass-card rounded-[24px] p-8 border border-white/40 shadow-sm text-center py-32 bg-white/50">
               <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100 shadow-inner">
                 <Clock className="w-10 h-10 text-slate-300" />
               </div>
               <h3 className="text-lg font-black text-slate-700 mb-2">No Recent Activity</h3>
               <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">There is no recent activity recorded for this student.</p>
             </div>
          )}

        </div>
      </div>
    </div>
  );
}
