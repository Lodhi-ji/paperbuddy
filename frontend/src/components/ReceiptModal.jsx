import React, { useRef, useState } from 'react';
import { X, Download, Receipt } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useReactToPrint } from 'react-to-print';
import PrintReceipt from './PrintReceipt';

export default function ReceiptModal({ isOpen, onClose, transaction }) {
  const receiptRef = useRef(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handlePrint = useReactToPrint({
    contentRef: receiptRef,
    documentTitle: `Receipt_${transaction?.id?.substring(0,8)}`,
  });

  if (!isOpen || !transaction) return null;

  const handleDownloadPDF = async () => {
    handlePrint();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0);
  };

  const dateObj = new Date(transaction.createdAt || new Date());
  const receiptId = transaction.receiptUrl?.replace('https://', '').substring(0, 10) || `TXN-${(transaction.id || '').substring(0,8)}`;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 no-print">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-100 rounded-[32px] shadow-2xl flex flex-col animate-in zoom-in-95 duration-200 overflow-hidden border border-slate-200/50">
        
        {/* Header Actions */}
        <div className="flex justify-between items-center px-8 py-5 border-b border-slate-200/60 bg-white/80 backdrop-blur-lg z-10 sticky top-0">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 tracking-tight">
            <Receipt className="w-5 h-5 text-indigo-600" />
            Transaction Receipt
          </h2>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleDownloadPDF}
              disabled={isGenerating}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold shadow-md hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {isGenerating ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Download className="w-4 h-4" />}
              {isGenerating ? 'Generating...' : 'Download PDF'}
            </button>
            <button 
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-200/50 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar">
          
          {/* THE RECEIPT (Target for PDF) - Strict A4 Proportions */}
          <div className="flex justify-center shadow-xl max-w-[21cm] mx-auto">
             <PrintReceipt transaction={transaction} ref={receiptRef} />
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
