import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Search, 
  Filter, 
  Download, 
  ArrowRight, 
  ChevronUp,
  CreditCard,
  ChevronDown,
  History,
  CheckCircle2,
  AlertCircle,
  Plus,
  IndianRupee,
  Calendar,
  FileText,
  Loader2,
  UploadCloud,
  ShieldCheck,
  UserCircle2,
  X
} from 'lucide-react';

export default function FinancialAdjustmentsWorkspace({
  unpaidFees,
  students,
  studentSearch, setStudentSearch,
  selectedClassFilter, setSelectedClassFilter,
  selectedFeeId, setSelectedFeeId,
  actionType, setActionType,
  actionAmount, setActionAmount,
  actionReason, setActionReason,
  handleApplyAction,
  applyWaiverMutation,
  applyPenaltyMutation,
  actionMessage, setActionMessage
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uiAdjustmentType, setUiAdjustmentType] = useState('waiver'); // 'scholarship', 'discount', 'waiver', 'penalty', 'correction'
  const [notes, setNotes] = useState('');

  const calculations = React.useMemo(() => {
    let pendingCount = 0;
    let todayCount = 0;
    let totalWaivers = 0;
    let totalPenalties = 0;

    if (students) {
      students.forEach(student => {
        student.studentFees?.forEach(fee => {
          const waiver = Number(fee.waiverAmount) || 0;
          const penalty = Number(fee.penaltyAmount) || 0;

          totalWaivers += waiver;
          totalPenalties += penalty;

          if (fee.status === 'UNPAID' || fee.status === 'PARTIAL') {
            pendingCount++;
          }

          if ((waiver > 0 || penalty > 0) && (fee.status === 'UNPAID' || fee.status === 'PARTIAL')) {
            todayCount++;
          }
        });
      });
    }

    return {
      pendingCount,
      todayCount,
      totalWaivers,
      totalPenalties
    };
  }, [students]);

  // Sync internal UI state with actual backend action type
  useEffect(() => {
    if (['scholarship', 'discount', 'waiver'].includes(uiAdjustmentType)) {
      setActionType('waiver');
      if (uiAdjustmentType === 'scholarship') setActionReason('Scholarship');
      if (uiAdjustmentType === 'discount') setActionReason('Discount');
      if (uiAdjustmentType === 'waiver') setActionReason(''); // Clear so they can type custom reason
    } else if (uiAdjustmentType === 'penalty') {
      setActionType('penalty');
    } else if (uiAdjustmentType === 'correction') {
      setActionType('waiver'); // Backend limitation fallback
      setActionReason('Manual Correction');
    }
  }, [uiAdjustmentType, setActionType, setActionReason]);

  const [activeFee, setActiveFee] = useState(null);
  
  // Checkbox state
  const [selectedRowIds, setSelectedRowIds] = useState(new Set());

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRowIds(new Set(unpaidFees?.map(f => f.id) || []));
    } else {
      setSelectedRowIds(new Set());
    }
  };

  const handleSelectRow = (id) => {
    const newSet = new Set(selectedRowIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedRowIds(newSet);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  };
  
  const handleOpenModal = (fee) => {
    setActiveFee(fee);
    setSelectedFeeId(fee.id);
    setActionMessage('');
    setActionAmount('');
    setUiAdjustmentType('waiver');
    setIsModalOpen(true);
    // Prevent background scrolling
    document.body.style.overflow = 'hidden';
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setSelectedFeeId(null);
    }, 300); // Wait for animation
    // Restore background scrolling
    document.body.style.overflow = 'auto';
  };

  const renderBadge = (type) => {
    const styles = {
      waiver: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      penalty: 'bg-rose-50 text-rose-600 border-rose-100',
      discount: 'bg-blue-50 text-blue-600 border-blue-100',
      scholarship: 'bg-purple-50 text-purple-600 border-purple-100',
      correction: 'bg-slate-100 text-slate-600 border-slate-200',
    };
    const style = styles[type] || styles.waiver;
    return (
      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-black tracking-widest border ${style}`}>
        {type}
      </span>
    );
  };



  return (
    <div className="relative">
      {/* Background Dashboard (Remains completely untouched) */}
      <div className="animate-in fade-in duration-500 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-brand-primary" /> Financial Adjustments
            </h1>
            <p className="text-sm font-medium text-slate-500 mt-2 max-w-xl">
              Manage fee waivers, scholarships, discounts and penalties with complete audit tracking.
            </p>
          </div>
          <button className="px-5 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-bold shadow-md hover:bg-brand-secondary hover:-translate-y-0.5 transition-all flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Adjustment
          </button>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card rounded-[20px] p-5 border border-white/40 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
            <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Pending Adjustments</h3>
            <div className="text-3xl font-black text-slate-800">{calculations.pendingCount}</div>
          </div>
          <div className="glass-card rounded-[20px] p-5 border border-white/40 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
            <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Today's Adjustments</h3>
            <div className="text-3xl font-black text-slate-800">{calculations.todayCount}</div>
          </div>
          <div className="glass-card rounded-[20px] p-5 border border-white/40 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
            <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Total Waivers</h3>
            <div className="text-3xl font-black text-emerald-600">{formatCurrency(calculations.totalWaivers)}</div>
          </div>
          <div className="glass-card rounded-[20px] p-5 border border-white/40 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
            <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 flex items-center gap-2">
              Penalties Applied
            </h3>
            <div className="text-3xl font-black text-rose-600">{formatCurrency(calculations.totalPenalties)}</div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="glass-card rounded-[32px] p-6 md:p-8 border border-white/40 shadow-premium min-h-[600px]">
          
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-4 mb-8 w-full">
            <div className="relative flex-1 min-w-[250px] md:max-w-md">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  placeholder="Search student..."
                  className="pl-10 w-full glass-input text-sm h-10 rounded-xl !border-[1.5px] !border-slate-400 focus:!border-brand-primary"
                />
              </div>
              
              <div className="relative">
                <select 
                  value={selectedClassFilter}
                  onChange={(e) => setSelectedClassFilter(e.target.value)}
                  className="glass-input appearance-none text-sm h-10 rounded-xl font-semibold text-slate-600 pl-4 !pr-10 !border-[1.5px] !border-slate-400"
                >
                  <option value="">Class</option>
                  <option value="10">Class 10</option>
                  <option value="9">Class 9</option>
                </select>
                <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>

              <div className="relative hidden lg:block">
                <select className="glass-input appearance-none text-sm h-10 rounded-xl font-semibold text-slate-600 pl-4 !pr-10 !border-[1.5px] !border-slate-400">
                  <option value="">Fee Category</option>
                </select>
                <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>

              <div className="relative hidden xl:block">
                <select className="glass-input appearance-none text-sm h-10 rounded-xl font-semibold text-slate-600 pl-4 !pr-10 !border-[1.5px] !border-slate-400">
                  <option value="">Status</option>
                </select>
                <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>

              <label className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer ml-2 hidden lg:flex">
                <input type="checkbox" defaultChecked className="rounded border-slate-300 text-brand-primary" />
                Outstanding Only
              </label>
          </div>

          {/* Table */}
          {unpaidFees && unpaidFees.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-100 text-slate-400 font-black uppercase tracking-widest text-[10px]">
                    <th className="pb-4 pl-4 pr-6 w-16">
                      <input 
                        type="checkbox" 
                        className="rounded border-[1.5px] border-slate-400 text-brand-primary focus:ring-brand-primary cursor-pointer" 
                        checked={unpaidFees?.length > 0 && selectedRowIds.size === unpaidFees.length}
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th className="pb-4 pr-6 w-1/4">Student</th>
                    <th className="pb-4 px-6 w-[15%]">Class</th>
                    <th className="pb-4 px-6 w-[20%]">Fee Category</th>
                    <th className="pb-4 px-6 text-right w-[15%]">Outstanding Amount</th>
                    <th className="pb-4 px-6 text-center">Adjustment Status</th>
                    <th className="pb-4 text-right pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {unpaidFees.map((fee) => (
                    <tr key={fee.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                      <td className="py-4 pl-4 pr-6">
                        <input 
                          type="checkbox" 
                          className="rounded border-[1.5px] border-slate-400 text-brand-primary focus:ring-brand-primary cursor-pointer" 
                          checked={selectedRowIds.has(fee.id)}
                          onChange={() => handleSelectRow(fee.id)}
                        />
                      </td>
                      <td className="py-4 pr-6">
                        <div className="font-extrabold text-slate-800">{fee.student.user.name}</div>
                        <div className="text-[10px] font-mono text-slate-400">{fee.student.rollNumber}</div>
                      </td>
                      <td className="py-4 px-6 text-slate-600 font-bold text-xs">Grade {fee.student.class}</td>
                      <td className="py-4 px-6">
                        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg border border-slate-200 bg-white shadow-sm text-xs font-bold text-slate-700">
                           <CreditCard className="w-3.5 h-3.5 text-slate-400" /> {fee.feeStructure.feeType.name}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right font-black text-slate-800">
                        {formatCurrency(
                          Math.max(0, Number(fee.amountDue) + Number(fee.penaltyAmount || 0) - Number(fee.amountPaid || 0) - Number(fee.waiverAmount || 0))
                        )}
                      </td>
                      <td className="py-4 px-6">
                        {(fee.waiverAmount > 0 || fee.penaltyAmount > 0) ? (
                           <div className="flex items-center justify-center gap-1">
                             {fee.waiverAmount > 0 && renderBadge('waiver')}
                             {fee.penaltyAmount > 0 && renderBadge('penalty')}
                           </div>
                        ) : (
                          <div className="text-center">
                            <span className="text-[10px] uppercase font-bold text-slate-400">—</span>
                          </div>
                        )}
                      </td>
                      <td className="py-4 text-right pr-4">
                        <button
                          onClick={() => handleOpenModal(fee)}
                          className="px-4 py-2 rounded-xl font-bold text-xs border bg-white border-slate-200 hover:border-brand-primary hover:text-brand-primary text-slate-600 shadow-sm transition-all group-hover:shadow-md flex items-center gap-1.5 ml-auto"
                        >
                          Manage <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-32 text-center flex flex-col items-center">
              <div className="w-20 h-20 bg-brand-primary/5 rounded-full flex items-center justify-center mb-4">
                <BarChart3 className="w-8 h-8 text-brand-primary/40" />
              </div>
              <h3 className="text-lg font-black text-slate-800">No pending adjustments</h3>
              <p className="text-sm text-slate-500 mt-2 max-w-sm">
                Select any invoice or change your filters to configure its financial adjustment.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Financial Command Center Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
          
          {/* Blurred Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-900/30 backdrop-blur-md"
            onClick={handleCloseModal}
          />

          {/* Centered Modal */}
          {activeFee && (
            <div className="relative z-10 w-full max-w-[1100px] h-full max-h-[85vh] bg-white rounded-[24px] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
              
              {/* Modal Header */}
              <div className="flex justify-between items-center px-8 py-5 border-b border-slate-100 bg-white z-10 shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center border border-indigo-100 shadow-inner">
                    <UserCircle2 className="w-7 h-7" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-800 leading-tight">Financial Adjustment</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-bold text-slate-600">{activeFee.student.user.name}</span>
                      <span className="text-[10px] font-black uppercase text-slate-400 bg-slate-100 px-2 py-0.5 rounded">Roll: {activeFee.student.rollNumber}</span>
                      <span className="text-[10px] font-black uppercase text-slate-400 bg-slate-100 px-2 py-0.5 rounded">Grade {activeFee.student.class}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="text-right hidden sm:block">
                    <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Outstanding</div>
                    <div className="text-lg font-black text-rose-600 leading-tight">{formatCurrency(activeFee.amountDue)}</div>
                  </div>
                  <button 
                    onClick={handleCloseModal}
                    className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors bg-slate-50"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Two Column Layout Body */}
              <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-slate-50/50">
                
                {/* LEFT COLUMN: Adjustment Form (60%) */}
                <div className="w-full lg:w-[60%] flex flex-col overflow-y-auto border-r border-slate-100 bg-white">
                  <div className="p-8 flex-1">
                    
                    {actionMessage && (
                      <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-bold rounded-xl flex items-start gap-2 mb-6">
                         <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500" /> {actionMessage}
                      </div>
                    )}

                    <form id="adjustment-modal-form" onSubmit={(e) => { e.preventDefault(); handleApplyAction(e); }} className="space-y-8">
                      
                      {/* Adjustment Type selector */}
                      <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-3">Adjustment Type</label>
                        <div className="flex flex-wrap gap-3">
                          {['scholarship', 'discount', 'waiver', 'penalty', 'correction'].map((type) => (
                            <button
                              key={type}
                              type="button"
                              onClick={() => setUiAdjustmentType(type)}
                              className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all border ${
                                uiAdjustmentType === type 
                                  ? 'bg-slate-800 text-white border-slate-800 shadow-md ring-2 ring-slate-800/20'
                                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                              }`}
                            >
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Inputs Row */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Amount</label>
                          <div className="relative">
                            <IndianRupee className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
                            <input
                              type="number"
                              value={actionAmount}
                              onChange={(e) => setActionAmount(e.target.value)}
                              placeholder="0.00"
                              className="w-full glass-input h-12 pl-11 font-mono font-bold text-lg"
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Effective Date</label>
                          <div className="relative">
                            <Calendar className="w-4 h-4 text-slate-400 absolute left-4 top-4" />
                            <input
                              type="date"
                              defaultValue={new Date().toISOString().split('T')[0]}
                              className="w-full glass-input h-12 pl-10 font-bold text-slate-600"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      {/* Reason (Conditional) */}
                      {(uiAdjustmentType === 'waiver' || uiAdjustmentType === 'penalty') && (
                        <div className="animate-in fade-in slide-in-from-top-2">
                          <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Reason</label>
                          <input
                            type="text"
                            value={actionReason}
                            onChange={(e) => setActionReason(e.target.value)}
                            placeholder="e.g. Late fee for missing deadline"
                            className="w-full glass-input h-12 font-semibold text-slate-600"
                            required
                          />
                        </div>
                      )}

                      {/* Notes & Upload */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5" /> Internal Notes
                          </label>
                          <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Optional notes for auditing..."
                            className="w-full glass-input h-28 resize-none font-medium text-slate-600 p-3"
                          />
                        </div>
                        <div>
                           <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-1.5">
                            Supporting Document
                          </label>
                          <div className="w-full h-28 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors flex flex-col items-center justify-center text-slate-400 cursor-pointer">
                            <UploadCloud className="w-6 h-6 mb-2 text-indigo-400" />
                            <span className="text-xs font-bold text-slate-500">Upload PDF / Image</span>
                          </div>
                        </div>
                      </div>

                    </form>
                  </div>
                </div>

                {/* RIGHT COLUMN: Simulator & History (40%) */}
                <div className="w-full lg:w-[40%] flex flex-col bg-slate-50 overflow-y-auto">
                  <div className="p-8 space-y-8">
                    
                    {/* Live Fee Simulator Card */}
                    <div className="glass-card rounded-[24px] p-6 shadow-lg bg-gradient-to-br from-slate-900 to-slate-800 text-white relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-40 h-40 bg-brand-primary/20 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
                      <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none" />
                      
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-brand-primary" /> Live Fee Simulator
                      </h4>
                      
                      <div className="space-y-4 font-mono">
                        <div className="flex justify-between items-center text-slate-300 text-sm">
                          <span>Original Fee</span>
                          <span>{formatCurrency(activeFee.amountDue)}</span>
                        </div>
                        
                        {Number(actionAmount) > 0 && (
                          <div className={`flex justify-between items-center text-sm animate-in fade-in slide-in-from-right-4 ${
                            uiAdjustmentType === 'penalty' ? 'text-rose-400' : 'text-emerald-400'
                          }`}>
                            <span className="capitalize">{uiAdjustmentType}</span>
                            <span>
                              {uiAdjustmentType === 'penalty' ? '+' : '-'} {formatCurrency(actionAmount)}
                            </span>
                          </div>
                        )}
                        
                        <div className="pt-4 mt-4 border-t border-slate-700/80 flex justify-between items-end text-white">
                          <span className="text-xs font-black uppercase tracking-widest text-slate-400">Final Payable</span>
                          <span className="text-3xl font-black tabular-nums">
                            {formatCurrency(
                              Math.max(0, 
                                Number(activeFee.amountDue) 
                                - Number(activeFee.amountPaid || 0) 
                                + (uiAdjustmentType === 'penalty' ? Number(actionAmount || 0) : Number(activeFee.penaltyAmount || 0))
                                - (uiAdjustmentType !== 'penalty' ? Number(actionAmount || 0) : Number(activeFee.waiverAmount || 0))
                              )
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Audit Timeline */}
                    <div>
                      <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider mb-6 flex items-center gap-2">
                        <History className="w-4 h-4 text-slate-400" /> Audit Timeline
                      </h4>
                      
                      <div className="flex flex-col items-center justify-center py-10 px-6 bg-white border-2 border-dashed border-slate-200 rounded-2xl text-center shadow-sm">
                        <div className="w-12 h-12 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-4">
                          <History className="w-5 h-5" />
                        </div>
                        <h5 className="text-sm font-bold text-slate-700 mb-1.5">No Adjustments Recorded</h5>
                        <p className="text-xs font-medium text-slate-400 max-w-[220px] leading-relaxed">
                          There are currently no manual financial adjustments for this fee. Any adjustments made will appear here.
                        </p>
                      </div>
                    </div>

                  </div>
                </div>
              </div>

              {/* Bottom Footer Actions */}
              <div className="px-8 py-5 border-t border-slate-100 bg-white flex justify-between items-center shrink-0">
                <div className="hidden md:flex items-center gap-3 text-xs text-slate-500 font-medium max-w-md">
                  <ShieldCheck className="w-8 h-8 text-emerald-500/50 shrink-0" />
                  <p>This adjustment will immediately update the student's outstanding balance and create an immutable audit record.</p>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                  <button 
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 md:flex-none px-6 py-3 rounded-xl border border-slate-200 bg-white text-slate-600 text-sm font-bold hover:bg-slate-50 hover:text-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="button"
                    onClick={(e) => {
                      const form = document.getElementById('adjustment-modal-form');
                      if (form.reportValidity()) {
                        handleApplyAction(e);
                      }
                    }}
                    disabled={applyWaiverMutation.isPending || applyPenaltyMutation.isPending}
                    className={`flex-1 md:flex-none px-8 py-3 rounded-xl text-white text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 ${
                      uiAdjustmentType === 'penalty' 
                        ? 'bg-rose-500 hover:bg-rose-600 hover:-translate-y-0.5 shadow-rose-500/20' 
                        : 'bg-emerald-500 hover:bg-emerald-600 hover:-translate-y-0.5 shadow-emerald-500/20'
                    }`}
                  >
                    {(applyWaiverMutation.isPending || applyPenaltyMutation.isPending) ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      `Apply ${uiAdjustmentType.charAt(0).toUpperCase() + uiAdjustmentType.slice(1)}`
                    )}
                  </button>
                </div>
              </div>

            </div>
          )}
        </div>
      )}
    </div>
  );
}
