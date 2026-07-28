import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api';
import { useAuthStore } from '../store/authStore';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import StudentProfile360 from '../components/StudentProfile360';
import TransactionCenter from '../components/TransactionCenter';
import {
  Users,
  Search,
  CheckCircle,
  AlertTriangle,
  Loader2,
} from 'lucide-react';

export default function AccountantDashboard() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('outstanding-dues');
  
  // States for Student Directory
  const [studentSearch, setStudentSearch] = useState('');
  const [studentFilterClass, setStudentFilterClass] = useState('');
  
  // States for Student 360 View
  const [profileStudentId, setProfileStudentId] = useState(null);
  const [profileStudentTab, setProfileStudentTab] = useState('overview');

  // Fetch all students (accountants have same access to view directory as admin)
  const { data: students, isLoading: studentsLoading } = useQuery({
    queryKey: ['accountantAllStudents'],
    queryFn: () => api.get('/school-admin/students'),
    enabled: (activeTab === 'students-all' || activeTab === 'outstanding-dues') && !profileStudentId,
  });

  // States for Transaction Center
  const [txnSearch, setTxnSearch] = useState('');
  const [txnMethod, setTxnMethod] = useState('');
  const [txnStatus, setTxnStatus] = useState('');

  const { data: accountantTransactions, isLoading: accountantTxnsLoading } = useQuery({
    queryKey: ['accountantTransactions', txnSearch, txnMethod, txnStatus],
    queryFn: () => api.get(`/accountant/transactions?search=${txnSearch}&method=${txnMethod}&status=${txnStatus}`),
    enabled: activeTab === 'transactions' && !profileStudentId,
  });

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="flex h-screen bg-slate-50/50 overflow-hidden">
      <Sidebar activeTab={activeTab} setActiveTab={(tab) => { setActiveTab(tab); setProfileStudentId(null); }} />

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <Header user={user} />

        <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 md:px-8 pb-4 md:pb-8 pt-0 relative z-10 scroll-smooth">
          
          {/* PROFILE VIEW */}
          {profileStudentId && (() => {
            const student = students?.find(s => s.id === profileStudentId);
            if (!student) return null;
            return (
              <StudentProfile360
                student={student}
                onClose={() => setProfileStudentId(null)}
                initialTab={profileStudentTab}
                onEdit={() => {}}
                onDelete={() => {}}
              />
            );
          })()}

          {/* DIRECTORY VIEW */}
          {!profileStudentId && (activeTab === 'students-all' || activeTab === 'outstanding-dues') && (
            <div className="flex flex-col gap-8 max-w-[1400px] mx-auto">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-black text-slate-800 tracking-tight">
                    {activeTab === 'outstanding-dues' ? 'Outstanding Dues' : 'Student Directory'}
                  </h2>
                  <p className="text-sm font-medium text-slate-500 mt-1">
                    {activeTab === 'outstanding-dues' ? 'Students with pending payments requiring action.' : 'Search students and view their profiles to record payments.'}
                  </p>
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
                  <select
                    value={studentFilterClass || ''}
                    onChange={(e) => setStudentFilterClass(e.target.value)}
                    className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-600 focus:border-brand-primary/50 focus:ring-2 focus:ring-brand-primary/20 outline-none"
                  >
                    <option value="">All Classes</option>
                    {[...Array(12)].map((_, i) => (
                      <option key={i + 1} value={String(i + 1)}>Class {i + 1}</option>
                    ))}
                  </select>
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
                        </tr>
                      </thead>
                      <tbody>
                        {students
                          .filter(s => {
                            if (activeTab === 'outstanding-dues') {
                              const hasPending = s.studentFees?.some(f => f.status === 'UNPAID' || f.status === 'PARTIAL');
                              if (!hasPending) return false;
                            }
                            const matchSearch = s.user.name.toLowerCase().includes(studentSearch.toLowerCase()) || s.rollNumber.toLowerCase().includes(studentSearch.toLowerCase());
                            const matchClass = studentFilterClass ? s.class === studentFilterClass : true;
                            return matchSearch && matchClass;
                          })
                          .map((st) => {
                          const totalAssigned = st.studentFees?.reduce((sum, f) => sum + Number(f.amountDue), 0) || 0;
                          const hasUnpaidMandatory = st.studentFees?.some(f => f.feeStructure?.feeType?.isVariable === false && f.status !== 'PAID');
                          
                          return (
                            <tr 
                              key={st.id} 
                              onClick={() => { 
                                setProfileStudentTab(activeTab === 'outstanding-dues' ? 'fees' : 'overview'); 
                                setProfileStudentId(st.id); 
                              }}
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
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TRANSACTION CENTER VIEW */}
          {!profileStudentId && activeTab === 'transactions' && (
            <TransactionCenter
              transactions={accountantTransactions}
              txnsLoading={accountantTxnsLoading}
              txnSearch={txnSearch} setTxnSearch={setTxnSearch}
              txnMethod={txnMethod} setTxnMethod={setTxnMethod}
              txnStatus={txnStatus} setTxnStatus={setTxnStatus}
              setProfileStudentId={setProfileStudentId}
            />
          )}

        </div>
      </main>
    </div>
  );
}
