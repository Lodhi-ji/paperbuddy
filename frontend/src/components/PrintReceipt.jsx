import React, { forwardRef } from 'react';
import { Building2, MapPin, Phone, Mail, CheckCircle2 } from 'lucide-react';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

const PrintReceipt = forwardRef(({ transaction }, ref) => {
  if (!transaction) return null;

  const dateObj = new Date(transaction.createdAt || new Date());
  const dateStr = dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const receiptId = transaction.receiptUrl?.replace('https://', '').substring(0, 10) || `TXN-${(transaction.id || '').substring(0,8)}`;

  return (
    <div 
      ref={ref} 
      className="bg-white max-w-[21cm] w-full mx-auto relative text-left"
      style={{ minHeight: '29.7cm', padding: '10mm 15mm' }} // A4 aspect ratio & padding
    >
      
      {/* Top Color Bar */}
      <div className="absolute top-0 left-0 right-0 h-3 bg-indigo-900" />

      {/* Header Section */}
      <div className="pt-8 pb-10 border-b border-slate-200">
        <div className="flex justify-between items-start">
          
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-indigo-900 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Greenwood</h1>
                <p className="text-xs font-bold text-indigo-600 tracking-widest uppercase">International School</p>
              </div>
            </div>
            
            <div className="space-y-1.5 text-[13px] text-slate-500 font-medium">
              <p className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-slate-400" /> 123 Education Boulevard, New Delhi, 110001</p>
              <p className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-slate-400" /> +91 98765 43210</p>
              <p className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-slate-400" /> accounts@greenwood.edu</p>
            </div>
          </div>

          {/* Receipt Meta */}
          <div className="text-right">
            <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter mb-6">Receipt</h2>
            
            <table className="ml-auto text-[13px] text-slate-600">
              <tbody>
                <tr>
                  <td className="pr-4 py-1 font-bold text-slate-400 uppercase tracking-wider text-[10px]">Receipt No</td>
                  <td className="py-1 font-mono font-bold text-slate-800">{receiptId.toUpperCase()}</td>
                </tr>
                <tr>
                  <td className="pr-4 py-1 font-bold text-slate-400 uppercase tracking-wider text-[10px]">Date</td>
                  <td className="py-1 font-semibold text-slate-800">{dateStr}</td>
                </tr>
                <tr>
                  <td className="pr-4 py-1 font-bold text-slate-400 uppercase tracking-wider text-[10px]">Time</td>
                  <td className="py-1 font-semibold text-slate-800">{timeStr}</td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>
      </div>

      {/* Billed To & Status Section */}
      <div className="flex justify-between items-end py-10">
        <div>
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Received From</h3>
          <div className="text-lg font-bold text-slate-900">{transaction.studentFee?.student?.user?.name || 'Student Name'}</div>
          <div className="text-sm font-semibold text-slate-600 mt-1">Class {transaction.studentFee?.student?.class || 'N/A'}</div>
          {transaction.studentFee?.student?.rollNumber && (
            <div className="text-sm font-mono text-slate-500 mt-1">Roll No: {transaction.studentFee.student.rollNumber}</div>
          )}
        </div>

        <div className="text-right">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Payment Status</h3>
          {transaction.status === 'SUCCESS' ? (
            <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-4 py-1.5 rounded-lg text-sm font-bold shadow-sm">
              <CheckCircle2 className="w-4 h-4" /> Paid in Full
            </div>
          ) : transaction.status === 'PENDING' ? (
            <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 border border-amber-200/60 px-4 py-1.5 rounded-lg text-sm font-bold shadow-sm">
              Pending Clearance
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 bg-rose-50 text-rose-700 border border-rose-200/60 px-4 py-1.5 rounded-lg text-sm font-bold shadow-sm">
              Payment Failed
            </div>
          )}
          <div className="mt-3 text-sm font-medium text-slate-500">
            Paid via <span className="font-bold text-slate-700">{transaction.method || transaction.paymentMethod || 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Line Items Table */}
      <div className="mb-12">
        <table className="w-full text-left">
          <thead>
            <tr className="border-y-2 border-slate-800 text-[11px] font-black uppercase tracking-widest text-slate-900">
              <th className="py-4 px-2 w-[60%]">Description</th>
              <th className="py-4 px-2 text-center w-[15%]">Term</th>
              <th className="py-4 px-2 text-right w-[25%]">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-200">
              <td className="py-5 px-2">
                <div className="font-bold text-slate-800 text-[15px]">
                  {transaction.studentFee?.feeStructure?.feeType?.name || 'Tuition Fee'}
                </div>
                <div className="text-xs text-slate-500 mt-1 font-medium">
                  Fee Collection for Academic Year {transaction.studentFee?.feeStructure?.academicYear || '2025-2026'}
                </div>
              </td>
              <td className="py-5 px-2 text-center font-medium text-slate-600 text-sm">
                Q1
              </td>
              <td className="py-5 px-2 text-right font-mono font-semibold text-slate-900 text-[15px]">
                {formatCurrency(transaction.amount)}
              </td>
            </tr>
            
            {transaction.waiverAmount > 0 && (
              <tr className="border-b border-slate-200 text-emerald-600">
                <td className="py-4 px-2">
                  <div className="font-bold text-[14px]">Discount / Waiver Applied</div>
                </td>
                <td className="py-4 px-2 text-center font-medium text-sm">-</td>
                <td className="py-4 px-2 text-right font-mono font-semibold text-[15px]">
                  -{formatCurrency(transaction.waiverAmount)}
                </td>
              </tr>
            )}
            
            {transaction.penaltyAmount > 0 && (
              <tr className="border-b border-slate-200 text-rose-600">
                <td className="py-4 px-2">
                  <div className="font-bold text-[14px]">Late Fee Penalty</div>
                </td>
                <td className="py-4 px-2 text-center font-medium text-sm">-</td>
                <td className="py-4 px-2 text-right font-mono font-semibold text-[15px]">
                  +{formatCurrency(transaction.penaltyAmount)}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Totals Section */}
      <div className="flex justify-end mb-16">
        <div className="w-[320px]">
          <table className="w-full text-right text-[14px]">
            <tbody>
              <tr>
                <td className="py-2 text-slate-500 font-medium">Subtotal</td>
                <td className="py-2 font-mono font-semibold text-slate-800">{formatCurrency(transaction.amount)}</td>
              </tr>
              <tr>
                <td className="py-2 text-slate-500 font-medium">Tax / Convenience Fee (0%)</td>
                <td className="py-2 font-mono font-semibold text-slate-800">{formatCurrency(0)}</td>
              </tr>
              <tr className="border-t-2 border-slate-800">
                <td className="py-4 font-black text-slate-900 text-[16px] uppercase tracking-wider">Total Paid</td>
                <td className="py-4 font-mono font-black text-indigo-700 text-2xl">{formatCurrency(transaction.amount)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Authorization Signature */}
      <div className="flex justify-between items-end border-b border-slate-200 pb-8 mb-8">
        <div className="w-48 text-center">
          <div className="border-b border-slate-400 h-12 mb-2 relative">
            {/* Simulated Signature */}
            <div className="absolute inset-0 flex items-end justify-center font-serif italic text-2xl text-slate-800 opacity-60" style={{ transform: 'rotate(-5deg)' }}>
              Authorized
            </div>
          </div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Authorized Signatory</div>
        </div>

        {/* Paid Stamp */}
        {transaction.status === 'SUCCESS' && (
          <div className="w-32 h-32 rounded-full border-[6px] border-emerald-600/20 flex flex-col items-center justify-center -rotate-12 select-none pointer-events-none">
            <span className="text-emerald-600 font-black text-2xl tracking-widest uppercase">PAID</span>
            <span className="text-emerald-600/80 font-bold text-[10px] mt-1">{dateStr}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center text-[11px] font-medium text-slate-400">
        <p>This is a computer-generated receipt. If you have any questions, please contact accounts@greenwood.edu.</p>
        <p className="mt-1">Generated on {new Date().toLocaleString('en-GB')}</p>
      </div>

    </div>
  );
});

export default PrintReceipt;
