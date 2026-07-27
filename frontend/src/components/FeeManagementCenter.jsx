import React, { useState } from 'react';
import { 
  Layers, 
  Plus, 
  Settings, 
  Trash2, 
  Edit2, 
  Users, 
  TrendingUp, 
  CheckCircle2, 
  Calendar,
  AlertTriangle,
  Loader2,
  PieChart as PieChartIcon,
  IndianRupee,
  Clock,
  ArrowRight,
  Copy,
  BookOpen
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

export default function FeeManagementCenter({
  feeTypes,
  structures,
  students,
  typeName, setTypeName,
  typeDesc, setTypeDesc,
  typeRecurring, setTypeRecurring,
  handleCreateFeeType,
  createFeeTypeMutation,
  fsType, setFsType,
  fsClass, setFsClass,
  fsAcademicYear, setFsAcademicYear,
  fsAmount, setFsAmount,
  fsDueDate, setFsDueDate,
  handleCreateFeeStructure,
  createFeeStructureMutation
}) {
  const [activeTab, setActiveTab] = useState('categories');
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  const tabs = [
    { id: 'categories', label: 'Fee Categories' },
    { id: 'structures', label: 'Class Fee Structures' },
    { id: 'templates', label: 'Fee Templates' },
    { id: 'sessions', label: 'Academic Sessions' }
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const COLORS = ['#6366F1', '#EC4899', '#10B981', '#F59E0B', '#3B82F6', '#8B5CF6'];

  // Calculate dynamic stats for each Category Card
  const getStatsForType = (typeId) => {
    const typeStructures = structures?.filter(s => s.feeTypeId === typeId) || [];
    const structureIds = typeStructures.map(s => s.id);
    
    let studentCount = 0;
    if (students && structureIds.length > 0) {
      students.forEach(student => {
        const hasFee = student.studentFees?.some(sf => structureIds.includes(sf.feeStructureId));
        if (hasFee) studentCount++;
      });
    }
    
    let avgAmount = 0;
    if (typeStructures.length > 0) {
      const totalAmount = typeStructures.reduce((sum, s) => sum + Number(s.amount), 0);
      avgAmount = totalAmount / typeStructures.length;
    }
    
    return { studentCount, avgAmount };
  };

  // Group real structures by class grade
  const classGrouped = {};
  if (structures && structures.length > 0) {
    structures.forEach(s => {
      const className = s.class;
      if (!classGrouped[className]) {
        classGrouped[className] = {
          class: className,
          categories: 0,
          amount: 0,
          academicYear: s.academicYear,
          feeTypeIds: new Set()
        };
      }
      classGrouped[className].categories++;
      classGrouped[className].amount += Number(s.amount);
      classGrouped[className].feeTypeIds.add(s.feeTypeId);
    });
  }
  const realStructures = Object.values(classGrouped).map(g => ({
    class: `Grade ${g.class}`,
    rawClass: g.class,
    categories: g.feeTypeIds.size,
    amount: g.amount,
    academicYear: g.academicYear,
  })).sort((a, b) => a.rawClass.localeCompare(b.rawClass, undefined, { numeric: true }));

  const getStudentsCountForClass = (className) => {
    const classStudents = students?.filter(st => st.class === className) || [];
    const assignedCount = classStudents.filter(st => st.studentFees?.length > 0).length;
    return { total: classStudents.length, assigned: assignedCount };
  };

  // Dynamic fee assignment progress metrics
  const totalStudents = students?.length || 0;
  const assignedStudents = students?.filter(st => st.studentFees && st.studentFees.length > 0).length || 0;
  const assignmentProgress = totalStudents ? Math.round((assignedStudents / totalStudents) * 100) : 0;

  // Dynamic category distribution data
  const categoryAmounts = {};
  if (structures && structures.length > 0) {
    structures.forEach(s => {
      const typeName = s.feeType?.name || 'Other';
      categoryAmounts[typeName] = (categoryAmounts[typeName] || 0) + Number(s.amount);
    });
  }
  const totalStructureAmt = Object.values(categoryAmounts).reduce((a, b) => a + b, 0);
  const pieData = Object.keys(categoryAmounts).map((name, idx) => ({
    name,
    value: totalStructureAmt ? Math.round((categoryAmounts[name] / totalStructureAmt) * 100) : 0,
    color: COLORS[idx % COLORS.length]
  }));

  const mockTemplates = [
    { name: 'CBSE Primary', classes: 'Grade 1-5', amount: 15000 },
    { name: 'CBSE Secondary', classes: 'Grade 6-10', amount: 22000 },
    { name: 'Science Stream', classes: 'Grade 11-12', amount: 35000 },
    { name: 'Commerce Stream', classes: 'Grade 11-12', amount: 32000 }
  ];

  return (
    <div className="animate-in fade-in duration-500 space-y-8">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <Settings className="w-8 h-8 text-brand-primary" /> Fee Configuration
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-2 max-w-xl">
            Manage every fee category, class structure and academic session from one centralized workspace.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setActiveTab('categories')}
            className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold shadow-sm hover:shadow-md hover:border-brand-primary/30 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4 text-brand-primary" /> New Category
          </button>
          <button 
            onClick={() => { setActiveTab('structures'); setShowGenerateModal(true); }}
            className="px-5 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-bold shadow-md hover:bg-brand-secondary hover:-translate-y-0.5 transition-all flex items-center gap-2"
          >
            <Layers className="w-4 h-4" /> Generate Structure
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-[20px] p-5 border border-white/40 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl -mr-8 -mt-8" />
          <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Fee Categories</h3>
          <div className="text-3xl font-black text-slate-800">{feeTypes?.length || 0}</div>
        </div>
        <div className="glass-card rounded-[20px] p-5 border border-white/40 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl -mr-8 -mt-8" />
          <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Recurring Fees</h3>
          <div className="text-3xl font-black text-slate-800">{feeTypes?.filter(f => f.isRecurring).length || 0}</div>
        </div>
        <div className="glass-card rounded-[20px] p-5 border border-white/40 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl -mr-8 -mt-8" />
          <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Active Structures</h3>
          <div className="text-3xl font-black text-slate-800">{structures?.length || 0}</div>
        </div>
        <div className="glass-card rounded-[20px] p-5 border border-white/40 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute top-0 right-0 w-24 h-24 bg-brand-primary/10 rounded-full blur-2xl -mr-8 -mt-8" />
          <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 flex items-center gap-2">
            Students Assigned
          </h3>
          <div className="text-3xl font-black text-slate-800">{students?.length || 0}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200/60 sticky top-0 bg-slate-50/90 backdrop-blur-md z-10 pt-2">
        <div className="flex gap-8 overflow-x-auto no-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setShowGenerateModal(false); }}
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
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* TAB 1: CATEGORIES */}
        {activeTab === 'categories' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Panel: Create Form (30%) */}
            <div className="lg:col-span-4">
              <div className="glass-card rounded-[24px] p-6 border border-white/40 shadow-sm sticky top-24">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-6 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-indigo-500" /> Create Category
                </h3>
                
                <form onSubmit={handleCreateFeeType} className="space-y-5 text-xs font-bold text-slate-600">
                  <div>
                    <label className="block mb-1.5 text-[10px] uppercase tracking-widest text-slate-400">Category Name *</label>
                    <input
                      type="text"
                      value={typeName}
                      onChange={(e) => setTypeName(e.target.value)}
                      placeholder="e.g. Tuition Fee"
                      className="w-full glass-input text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1.5 text-[10px] uppercase tracking-widest text-slate-400">Description</label>
                    <textarea
                      value={typeDesc}
                      onChange={(e) => setTypeDesc(e.target.value)}
                      placeholder="Brief description of this fee"
                      className="w-full glass-input text-sm h-24 resize-none"
                    />
                  </div>
                  <label className="flex items-start gap-3 cursor-pointer p-4 rounded-xl border border-slate-200/60 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={typeRecurring}
                      onChange={(e) => setTypeRecurring(e.target.checked)}
                      className="mt-0.5 rounded border-slate-300 text-brand-primary focus:ring-brand-primary"
                    />
                    <div>
                      <div className="text-sm font-bold text-slate-700">Recurring Fee</div>
                      <div className="text-[10px] font-medium text-slate-500 mt-1">Check this if the fee is charged periodically (e.g. Monthly Transport) rather than one-time (e.g. Admission).</div>
                    </div>
                  </label>
                  
                  <button
                    type="submit"
                    disabled={createFeeTypeMutation.isPending}
                    className="w-full glass-btn-primary flex items-center justify-center gap-2 py-3 mt-4 text-sm"
                  >
                    {createFeeTypeMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Category'}
                  </button>
                </form>
              </div>
            </div>

            {/* Right Panel: Existing Categories (70%) */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-black text-slate-800">Existing Categories</h3>
                <div className="text-xs font-bold text-slate-400">{feeTypes?.length || 0} Total</div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {feeTypes && feeTypes.length > 0 ? (
                  feeTypes.map((type) => (
                    <div key={type.id} className="glass-card rounded-2xl p-5 border border-white/40 shadow-sm group hover:border-brand-primary/30 hover:shadow-md transition-all">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                            type.isRecurring ? 'bg-indigo-50 text-indigo-500' : 'bg-emerald-50 text-emerald-500'
                          }`}>
                            <Layers className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-800">{type.name}</h4>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] uppercase font-black tracking-widest mt-1 ${
                              type.isRecurring ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'
                            }`}>
                              {type.isRecurring ? 'Recurring' : 'One Time'}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-1.5 text-slate-400 hover:text-brand-primary rounded-lg hover:bg-slate-50 transition-colors"><Edit2 className="w-4 h-4"/></button>
                          <button className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-colors"><Trash2 className="w-4 h-4"/></button>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-xs">
                        <div className="font-bold text-slate-500 flex items-center gap-1.5">
                          <Users className="w-4 h-4 text-slate-400" /> Assigned to {getStatsForType(type.id).studentCount} Students
                        </div>
                        <div className="font-mono font-bold text-slate-700 bg-slate-50 px-2 py-1 rounded">Avg {formatCurrency(getStatsForType(type.id).avgAmount)}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-12 text-center text-slate-400 text-sm font-bold">
                    No fee categories found. Create one to get started.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CLASS FEE STRUCTURES */}
        {activeTab === 'structures' && (
          <div className="space-y-6">
            {!showGenerateModal ? (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-sm font-black text-slate-800">Configured Class Structures</h3>
                  <button 
                    onClick={() => setShowGenerateModal(true)}
                    className="bg-brand-primary text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md hover:bg-brand-secondary hover:-translate-y-0.5 transition-all flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Generate New Structure
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {realStructures.length > 0 ? (
                    realStructures.map((struct, idx) => {
                      const classStats = getStudentsCountForClass(struct.rawClass);
                      return (
                        <div key={idx} className="glass-card rounded-[24px] p-6 border border-white/40 shadow-sm group hover:shadow-md transition-all">
                          <div className="flex justify-between items-start mb-6">
                            <div>
                              <h4 className="text-xl font-black text-slate-800 tracking-tight">{struct.class}</h4>
                              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">AY {struct.academicYear}</div>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-50 to-brand-primary/10 border border-white shadow-sm flex items-center justify-center text-brand-primary font-black">
                              {struct.categories}
                            </div>
                          </div>
                          
                          <div className="space-y-3 mb-6">
                            <div className="flex justify-between items-center text-xs font-bold text-slate-600">
                              <span>Total Categories</span>
                              <span>{struct.categories} Active</span>
                            </div>
                            <div className="flex justify-between items-center text-xs font-bold text-slate-600">
                              <span>Total Annual Fee</span>
                              <span className="text-emerald-600 font-black">{formatCurrency(struct.amount)}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs font-bold text-slate-600">
                              <span>Students Assigned</span>
                              <span>{classStats.assigned} / {classStats.total}</span>
                            </div>
                          </div>
                          
                          <button className="w-full py-2.5 rounded-xl border border-slate-200 bg-white text-brand-primary text-xs font-bold hover:bg-brand-primary hover:text-white hover:border-brand-primary transition-colors flex justify-center items-center gap-2">
                            View Complete Breakdown <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })
                  ) : (
                    <div className="col-span-full py-12 text-center text-slate-400 text-sm font-bold">
                      No class fee structures configured yet. Create one to get started.
                    </div>
                  )}
                </div>

                {/* Assignment Progress & Insights Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
                  <div className="lg:col-span-2 glass-card rounded-[24px] p-6 border border-white/40 shadow-sm flex flex-col justify-center">
                     <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider mb-6 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Fee Assignment Progress
                      </h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-end">
                          <div>
                            <div className="text-3xl font-black text-slate-800">{assignmentProgress}%</div>
                            <div className="text-xs font-medium text-slate-500">of active students assigned a structure</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold text-slate-700">{assignedStudents} / {totalStudents}</div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase">Students</div>
                          </div>
                        </div>
                        <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${assignmentProgress}%` }} />
                        </div>
                      </div>
                  </div>
                  
                  <div className="glass-card rounded-[24px] p-6 border border-white/40 shadow-sm">
                    <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider mb-2 flex items-center gap-2">
                      <PieChartIcon className="w-4 h-4 text-indigo-500" /> Category Distribution
                    </h3>
                    <div className="h-32 w-full mt-4">
                      {pieData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={pieData}
                              innerRadius={30}
                              outerRadius={50}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'bold' }} />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center text-slate-400 text-xs font-semibold text-center">No categories mapped.</div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              // Generate Form View
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative">
                <div className="glass-card rounded-[32px] p-8 border border-white/40 shadow-premium relative z-10">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                      <Settings className="w-5 h-5 text-indigo-600" /> Generate New Structure
                    </h3>
                    <button 
                      onClick={() => setShowGenerateModal(false)}
                      className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>

                  <form onSubmit={(e) => { handleCreateFeeStructure(e); setShowGenerateModal(false); }} className="space-y-5 text-xs font-bold text-slate-600">
                    <div>
                      <label className="block mb-1.5 text-[10px] uppercase tracking-widest text-slate-400">Choose Fee Category *</label>
                      <select
                        value={fsType}
                        onChange={(e) => setFsType(e.target.value)}
                        className="w-full glass-input text-sm h-12"
                        required
                      >
                        <option value="">Select Category</option>
                        {feeTypes?.map((t) => (
                          <option key={t.id} value={t.id}>{t.name} ({t.isRecurring ? 'Recurring' : 'One Time'})</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        <label className="block mb-1.5 text-[10px] uppercase tracking-widest text-slate-400">Target Class *</label>
                        <input
                          type="text"
                          value={fsClass}
                          onChange={(e) => setFsClass(e.target.value)}
                          placeholder="e.g. 10"
                          className="w-full glass-input text-sm h-12"
                          required
                        />
                      </div>
                      <div>
                        <label className="block mb-1.5 text-[10px] uppercase tracking-widest text-slate-400">Academic Year *</label>
                        <input
                          type="text"
                          value={fsAcademicYear}
                          onChange={(e) => setFsAcademicYear(e.target.value)}
                          placeholder="2025-2026"
                          className="w-full glass-input text-sm h-12"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        <label className="block mb-1.5 text-[10px] uppercase tracking-widest text-slate-400">Billing Amount (INR) *</label>
                        <div className="relative">
                          <IndianRupee className="w-4 h-4 text-slate-400 absolute left-4 top-4" />
                          <input
                            type="number"
                            value={fsAmount}
                            onChange={(e) => setFsAmount(e.target.value)}
                            placeholder="5000"
                            className="w-full glass-input text-sm h-12 pl-10"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block mb-1.5 text-[10px] uppercase tracking-widest text-slate-400">Payment Due Date *</label>
                        <input
                          type="date"
                          value={fsDueDate}
                          onChange={(e) => setFsDueDate(e.target.value)}
                          className="w-full glass-input text-sm h-12"
                          required
                        />
                      </div>
                    </div>

                    <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl flex items-start gap-3 text-xs text-emerald-700 font-semibold mt-4">
                      <AlertTriangle className="w-5 h-5 text-emerald-500 shrink-0" />
                      <div>
                        <strong>Auto-Assign Engine Active:</strong> Submitting this will automatically generate and assign this fee to all students currently registered in Grade {fsClass || 'X'}.
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={createFeeStructureMutation.isPending}
                      className="w-full glass-btn-primary flex items-center justify-center gap-2 py-3.5 mt-6 text-sm"
                    >
                      {createFeeStructureMutation.isPending ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        'Generate & Auto-Assign to Class'
                      )}
                    </button>
                  </form>
                </div>
                
                {/* Real-time Preview Card */}
                <div className="hidden lg:block relative z-0">
                  <div className="sticky top-24">
                     <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider mb-6 flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-indigo-500" /> Structure Preview
                     </h3>
                     <div className="glass-card rounded-[32px] p-8 border border-white/40 shadow-premium bg-gradient-to-b from-white to-slate-50/50">
                        <div className="text-center mb-8 border-b border-slate-100 pb-8">
                          <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-brand-primary">
                            <Layers className="w-8 h-8" />
                          </div>
                          <h4 className="text-xl font-black text-slate-800">Grade {fsClass || '[Class]'}</h4>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">AY {fsAcademicYear || '202X-2X'}</p>
                        </div>
                        
                        <div className="space-y-4 mb-8">
                           <div className="flex justify-between items-center text-sm font-bold">
                             <span className="text-slate-600">Existing Categories</span>
                             <span className="text-slate-400 text-xs italic">3 Categories (~₹15,000)</span>
                           </div>
                           <div className="flex justify-between items-center text-sm font-bold bg-brand-primary/5 p-3 rounded-xl border border-brand-primary/10">
                             <span className="text-brand-primary flex items-center gap-2">
                               <Plus className="w-3 h-3" /> New Category
                             </span>
                             <span className="text-brand-primary">{fsAmount ? formatCurrency(fsAmount) : '₹0'}</span>
                           </div>
                        </div>
                        
                        <div className="pt-6 border-t border-slate-200 flex justify-between items-end">
                           <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Est. Total</span>
                           <span className="text-3xl font-black text-slate-800">{formatCurrency(15000 + Number(fsAmount || 0))}</span>
                        </div>
                     </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: TEMPLATES (MOCK) */}
        {activeTab === 'templates' && (
          <div className="space-y-6">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-black text-slate-800">Reusable Fee Templates</h3>
                <button className="bg-brand-primary text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md hover:bg-brand-secondary hover:-translate-y-0.5 transition-all flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Create Template
                </button>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               {mockTemplates.map((template, idx) => (
                 <div key={idx} className="glass-card rounded-[24px] p-6 border border-white/40 shadow-sm group hover:border-brand-primary/30 transition-all cursor-pointer">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Copy className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-black text-slate-800 mb-1">{template.name}</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Applies to: {template.classes}</p>
                    
                    <div className="text-lg font-black text-slate-700 mb-6">{formatCurrency(template.amount)}</div>
                    
                    <button className="w-full py-2.5 rounded-xl bg-slate-50 text-brand-primary text-xs font-bold hover:bg-brand-primary hover:text-white transition-colors">
                      Apply Template
                    </button>
                 </div>
               ))}
             </div>
          </div>
        )}

        {/* TAB 4: SESSIONS (MOCK) */}
        {activeTab === 'sessions' && (
           <div className="glass-card rounded-[32px] p-8 md:p-12 border border-white/40 shadow-sm max-w-3xl">
             <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider mb-8 flex items-center gap-2">
               <Calendar className="w-5 h-5 text-indigo-500" /> Academic Sessions
             </h3>
             
             <div className="space-y-4">
               <div className="p-5 rounded-2xl border-2 border-brand-primary/20 bg-brand-primary/5 flex justify-between items-center">
                 <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center font-black text-brand-primary">
                     25
                   </div>
                   <div>
                     <h4 className="text-base font-black text-slate-800">2025-2026</h4>
                     <p className="text-xs font-bold text-slate-500 mt-0.5">Currently Active • {students?.length || 0} Students Enrolled</p>
                   </div>
                 </div>
                 <span className="px-3 py-1 bg-brand-primary text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-sm">
                   Active Session
                 </span>
               </div>
               
               <div className="p-5 rounded-2xl border border-slate-200 bg-white/50 flex justify-between items-center opacity-70">
                 <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-400">
                     26
                   </div>
                   <div>
                     <h4 className="text-base font-black text-slate-600">2026-2027</h4>
                     <p className="text-xs font-bold text-slate-400 mt-0.5">Upcoming • Draft Mode</p>
                   </div>
                 </div>
                 <button className="px-4 py-2 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-lg shadow-sm hover:text-brand-primary transition-colors">
                   Configure
                 </button>
               </div>
             </div>
           </div>
        )}

      </div>
    </div>
  );
}
