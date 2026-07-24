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

  const healthScore = totalOutstanding === 0 ? 98 : 75;

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
                  <div className="text-4xl font-black text-slate-800">{healthScore}%</div>
                  <div className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md mb-1">
                    {healthScore > 90 ? 'Excellent' : 'Healthy'}
                  </div>
                </div>
                
                <div className="space-y-2 text-xs font-bold text-slate-500 relative z-10">
                  <div className="flex justify-between items-center">
                    <span>Attendance</span>
                    <span className="text-emerald-600 flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> 92%</span>
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
                    <span className="text-emerald-600 flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Good</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Documents</span>
                    <span className="text-emerald-600 flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Complete</span>
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
                    <div className="text-xs font-bold text-slate-700 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" /> 15 Aug 2010
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Gender</div>
                    <div className="text-xs font-bold text-slate-700">Male</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Blood Group</div>
                    <div className="text-xs font-bold text-slate-700">O+</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Address</div>
                    <div className="text-xs font-bold text-slate-700 flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" /> 
                      <span>123, Whitefield Main Road, Bangalore, Karnataka, 560066</span>
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
                    <div className="text-xs font-bold text-slate-700 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" /> 01 Apr 2024
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Admission Number</div>
                    <div className="text-xs font-bold text-slate-700">ADM-2024-089</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Previous School</div>
                    <div className="text-xs font-bold text-slate-700">St. Joseph's High School</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Extracurricular</div>
                    <div className="text-xs font-bold text-slate-700 flex items-center gap-2">
                      <Award className="w-4 h-4 text-slate-400" /> Basketball Team, Debate Club
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
                    <div className="text-xs font-bold text-slate-700">{student.guardianName} (Father)</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Contact Number</div>
                    <div className="text-xs font-bold text-slate-700 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-slate-400" /> {student.guardianPhone}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Email Address</div>
                    <div className="text-xs font-bold text-slate-700 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-slate-400" /> guardian@email.com
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Emergency Contact</div>
                    <div className="text-xs font-bold text-slate-700 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-slate-400" /> +91 98765 00000 (Mother)
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
                    <div className="text-sm font-bold text-blue-700 mt-2">12 Jun 2024</div>
                    <div className="text-[10px] font-medium text-blue-500/80">{formatCurrency(15000)} via Card</div>
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 glass-card rounded-[24px] p-6 border border-white/40 shadow-sm space-y-6 bg-white/50">
                <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-brand-primary" /> Performance Overview
                </h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { subject: 'Math', grade: 92 },
                      { subject: 'Science', grade: 88 },
                      { subject: 'English', grade: 95 },
                      { subject: 'History', grade: 82 },
                      { subject: 'Art', grade: 98 }
                    ]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="subject" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                      <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Bar dataKey="grade" fill="#8b5cf6" radius={[6, 6, 0, 0]} barSize={48} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="space-y-6">
                <div className="glass-card rounded-[24px] p-6 border border-white/40 shadow-sm bg-white/50">
                  <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider mb-4 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-500" /> Overall CGPA
                  </h3>
                  <div className="flex items-end gap-2">
                    <span className="text-5xl font-black text-slate-800 tracking-tighter">9.2</span>
                    <span className="text-sm font-bold text-slate-400 mb-1.5">/ 10</span>
                  </div>
                  <div className="mt-4 text-xs text-slate-500 font-medium leading-relaxed">
                    Student is performing exceptionally well in Sciences and Languages.
                  </div>
                </div>
                <div className="glass-card rounded-[24px] p-6 border border-white/40 shadow-sm bg-white/50">
                   <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider mb-4 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-blue-500" /> Teacher Remarks
                  </h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100/50 text-xs font-medium text-slate-600 italic">
                      "Very attentive in class, consistently submits assignments on time and shows great leadership qualities."
                      <div className="mt-2 text-[10px] font-bold text-blue-500 uppercase not-italic">- Mrs. Sharma (Class Teacher)</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* DOCUMENTS TAB (MOCK) */}
          {activeTab === 'documents' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-white/50 p-4 rounded-2xl border border-white/40 shadow-sm">
                <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-500" /> Uploaded Documents
                </h3>
                <button className="bg-brand-primary text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md hover:bg-brand-secondary hover:-translate-y-0.5 transition-all flex items-center gap-2">
                  <UploadCloud className="w-4 h-4" /> Upload Document
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: 'Admission Form', date: '01 Apr 2024', status: 'Verified', icon: FileText },
                  { name: 'Birth Certificate', date: '01 Apr 2024', status: 'Verified', icon: BookOpen },
                  { name: 'Aadhaar Card', date: '05 Apr 2024', status: 'Verified', icon: Shield },
                  { name: 'Transfer Certificate', date: '12 Apr 2024', status: 'Verified', icon: FileText },
                  { name: 'Previous Marksheet', date: '05 Apr 2024', status: 'Verified', icon: Award }
                ].map((doc, idx) => (
                  <div key={idx} className="glass-card rounded-2xl p-5 border border-white/40 shadow-sm flex items-center justify-between group hover:border-brand-primary/30 hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                        <doc.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-700">{doc.name}</div>
                        <div className="text-[10px] text-slate-400 mt-1">Uploaded {doc.date}</div>
                      </div>
                    </div>
                    <button className="w-10 h-10 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-brand-primary hover:text-white hover:shadow-md transition-all">
                      <DownloadCloud className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
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
             <div className="glass-card rounded-[32px] p-8 md:p-12 border border-white/40 shadow-sm bg-white/50 max-w-3xl">
               <h3 className="text-sm font-black uppercase text-slate-800 tracking-wider mb-10 flex items-center gap-2">
                 <Clock className="w-5 h-5 text-indigo-500" /> Chronological Timeline
               </h3>
               <div className="space-y-8 pl-6 border-l-2 border-slate-100 relative">
                  <div className="relative group">
                    <div className="absolute -left-[33px] w-6 h-6 rounded-full bg-emerald-500 border-4 border-white shadow-sm group-hover:scale-125 transition-transform" />
                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm ml-4">
                      <div className="text-sm font-bold text-slate-800">Fee Payment Received</div>
                      <div className="text-xs font-medium text-slate-500 mt-1">₹15,000 paid via Credit Card</div>
                      <div className="text-[10px] font-bold text-slate-400 mt-3 flex items-center gap-1.5"><Clock className="w-3 h-3"/> 12 Jun 2024, 10:45 AM</div>
                    </div>
                  </div>
                  <div className="relative group">
                    <div className="absolute -left-[33px] w-6 h-6 rounded-full bg-amber-500 border-4 border-white shadow-sm group-hover:scale-125 transition-transform" />
                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm ml-4">
                      <div className="text-sm font-bold text-slate-800">Payment Reminder Sent</div>
                      <div className="text-xs font-medium text-slate-500 mt-1">Automated SMS sent to +919876500000</div>
                      <div className="text-[10px] font-bold text-slate-400 mt-3 flex items-center gap-1.5"><Clock className="w-3 h-3"/> 10 Jun 2024, 09:00 AM</div>
                    </div>
                  </div>
                  <div className="relative group">
                    <div className="absolute -left-[33px] w-6 h-6 rounded-full bg-blue-500 border-4 border-white shadow-sm group-hover:scale-125 transition-transform" />
                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm ml-4">
                      <div className="text-sm font-bold text-slate-800">Document Uploaded</div>
                      <div className="text-xs font-medium text-slate-500 mt-1">Transfer Certificate verified by admin</div>
                      <div className="text-[10px] font-bold text-slate-400 mt-3 flex items-center gap-1.5"><Clock className="w-3 h-3"/> 12 Apr 2024, 02:15 PM</div>
                    </div>
                  </div>
                  <div className="relative group">
                    <div className="absolute -left-[33px] w-6 h-6 rounded-full bg-brand-primary border-4 border-white shadow-sm group-hover:scale-125 transition-transform" />
                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm ml-4">
                      <div className="text-sm font-bold text-slate-800">Student Profile Created</div>
                      <div className="text-xs font-medium text-slate-500 mt-1">Admitted to Class 10 Sec A</div>
                      <div className="text-[10px] font-bold text-slate-400 mt-3 flex items-center gap-1.5"><Clock className="w-3 h-3"/> 01 Apr 2024, 11:30 AM</div>
                    </div>
                  </div>
               </div>
             </div>
          )}

        </div>
      </div>
    </div>
  );
}
