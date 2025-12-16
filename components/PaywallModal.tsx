import React from 'react';
import { Check, X, Star, Zap, Lock } from 'lucide-react';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
}

const PaywallModal: React.FC<PaywallModalProps> = ({ isOpen, onClose, onUpgrade }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl shadow-blue-500/10">
        
        {/* Header */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/20 mb-4 backdrop-blur-md">
            <Star className="w-6 h-6 text-white fill-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Upgrade to Pro</h2>
          <p className="text-blue-100 text-sm">Unlock unlimited AI analysis and advanced tools.</p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          <div className="space-y-3">
             <div className="flex items-center gap-3 text-slate-300">
                <div className="p-1 rounded-full bg-emerald-500/20 text-emerald-400"><Check className="w-3 h-3" /></div>
                <span className="text-sm">Unlimited Stock Searches</span>
             </div>
             <div className="flex items-center gap-3 text-slate-300">
                <div className="p-1 rounded-full bg-emerald-500/20 text-emerald-400"><Check className="w-3 h-3" /></div>
                <span className="text-sm">Save to Watchlist</span>
             </div>
             <div className="flex items-center gap-3 text-slate-300">
                <div className="p-1 rounded-full bg-emerald-500/20 text-emerald-400"><Check className="w-3 h-3" /></div>
                <span className="text-sm">Price Alerts (Email & Push)</span>
             </div>
             <div className="flex items-center gap-3 text-slate-300">
                <div className="p-1 rounded-full bg-emerald-500/20 text-emerald-400"><Check className="w-3 h-3" /></div>
                <span className="text-sm">Export Reports to PDF/CSV</span>
             </div>
          </div>

          <div className="p-4 bg-slate-800 rounded-xl border border-slate-700">
            <div className="flex justify-between items-end mb-1">
              <span className="text-white font-bold text-lg">Pro Plan</span>
              <div className="text-right">
                <span className="text-2xl font-bold text-white">$7.99</span>
                <span className="text-slate-400 text-sm">/mo</span>
              </div>
            </div>
            <p className="text-xs text-slate-500">7-day free trial, cancel anytime.</p>
          </div>

          <button 
            onClick={onUpgrade}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 group"
          >
            <Zap className="w-4 h-4 group-hover:scale-110 transition-transform" />
            Start Free Trial
          </button>
          
          <button 
            onClick={onClose}
            className="w-full py-2 text-sm text-slate-500 hover:text-slate-300 transition-colors"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaywallModal;