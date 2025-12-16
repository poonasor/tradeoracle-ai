import React, { useState, useEffect } from 'react';
import { Search, Loader2, BarChart2, Crown, User, Lock, LogOut, Star, AlertCircle } from 'lucide-react';
import { analyzeStock } from './services/geminiService';
import { AnalysisResult, LoadingState, UserTier } from './types';
import AnalysisDisplay from './components/AnalysisDisplay';
import PaywallModal from './components/PaywallModal';

const GUEST_LIMIT = 3;

const App: React.FC = () => {
  const [ticker, setTicker] = useState('');
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // User & Subscription State
  const [userTier, setUserTier] = useState<UserTier>(UserTier.GUEST);
  const [guestSearchCount, setGuestSearchCount] = useState(0);
  const [showPaywall, setShowPaywall] = useState(false);

  // Initialize from LocalStorage
  useEffect(() => {
    const storedSearches = localStorage.getItem('guest_searches');
    if (storedSearches) {
      const history = JSON.parse(storedSearches);
      setGuestSearchCount(history.length);
    }
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticker.trim()) return;

    // Guest Limit Check
    if (userTier === UserTier.GUEST && guestSearchCount >= GUEST_LIMIT) {
      setShowPaywall(true);
      return;
    }

    setLoadingState(LoadingState.ANALYZING);
    setError(null);
    setResult(null);

    try {
      const data = await analyzeStock(ticker.toUpperCase());
      setResult(data);
      setLoadingState(LoadingState.SUCCESS);

      // Track Guest Usage
      if (userTier === UserTier.GUEST) {
        const storedSearches = JSON.parse(localStorage.getItem('guest_searches') || '[]');
        // We track just the count effectively for this demo, but storing tickers is better
        const newHistory = [...storedSearches, ticker.toUpperCase()];
        localStorage.setItem('guest_searches', JSON.stringify(newHistory));
        setGuestSearchCount(newHistory.length);
      }

    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      setLoadingState(LoadingState.ERROR);
    }
  };

  // Mock "Sign In / Upgrade" function for demo purposes
  const toggleUserTier = () => {
    if (userTier === UserTier.GUEST) {
      setUserTier(UserTier.PAID);
      setShowPaywall(false);
      alert("Demo: You are now logged in as a Paid Subscriber.");
    } else {
      setUserTier(UserTier.GUEST);
      alert("Demo: You are logged out (Guest Mode).");
    }
  };

  return (
    <div className="min-h-screen bg-background text-slate-200 p-4 md:p-8 selection:bg-primary selection:text-white relative">
      <PaywallModal 
        isOpen={showPaywall} 
        onClose={() => setShowPaywall(false)} 
        onUpgrade={toggleUserTier}
      />

      <div className="max-w-7xl mx-auto">
        {/* Header Navigation */}
        <header className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <BarChart2 className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                TradeOracle AI
                {userTier === UserTier.PAID && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold uppercase tracking-wide border border-amber-500/30">Pro</span>
                )}
              </h1>
              <p className="text-xs text-slate-500 font-medium">Technical Analysis Assistant</p>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
             <form onSubmit={handleSearch} className="relative w-full md:w-80 group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-500 group-focus-within:text-primary transition-colors" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-4 py-3 bg-surface border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm"
                placeholder="Enter symbol (e.g. AAPL)..."
                value={ticker}
                onChange={(e) => setTicker(e.target.value)}
                disabled={loadingState === LoadingState.ANALYZING}
              />
              <button
                type="submit"
                disabled={loadingState === LoadingState.ANALYZING || !ticker}
                className="absolute right-2 top-2 bottom-2 bg-slate-700 hover:bg-primary text-white px-4 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loadingState === LoadingState.ANALYZING ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Analyze'
                )}
              </button>
            </form>

            <button 
              onClick={toggleUserTier}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium text-sm transition-all border ${
                userTier === UserTier.PAID 
                  ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                  : 'bg-gradient-to-r from-amber-500 to-orange-500 border-transparent text-white shadow-lg shadow-amber-500/20 hover:scale-105'
              }`}
            >
              {userTier === UserTier.PAID ? (
                <>
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </>
              ) : (
                <>
                  <Crown className="w-4 h-4 fill-white" />
                  <span>Upgrade to Pro</span>
                </>
              )}
            </button>
          </div>
        </header>

        {/* Guest Usage Indicator */}
        {userTier === UserTier.GUEST && (
          <div className="mb-6 flex justify-center">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-slate-800/50 rounded-full border border-slate-700 backdrop-blur-sm">
               <span className="text-xs text-slate-400">Guest Searches:</span>
               <div className="flex gap-1">
                 {[...Array(GUEST_LIMIT)].map((_, i) => (
                   <div 
                    key={i} 
                    className={`w-2 h-2 rounded-full ${i < guestSearchCount ? 'bg-primary' : 'bg-slate-600'}`}
                   />
                 ))}
               </div>
               <span className="text-xs text-slate-400 ml-1">{GUEST_LIMIT - guestSearchCount} remaining</span>
            </div>
          </div>
        )}

        {/* Content Area */}
        <main>
          {loadingState === LoadingState.IDLE && (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-6 animate-fade-in">
              <div className="w-24 h-24 bg-surface rounded-full flex items-center justify-center mb-4 ring-1 ring-slate-700">
                <BarChart2 className="w-10 h-10 text-slate-600" />
              </div>
              <h2 className="text-2xl font-bold text-white">Ready to Analyze the Markets</h2>
              <p className="text-slate-400 max-w-md">
                Enter a stock ticker above to let our AI gather historical data, identify key levels, and formulate a technical trading strategy.
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                {['SPY', 'TSLA', 'NVDA', 'BTC-USD'].map(sym => (
                  <button 
                    key={sym}
                    onClick={() => setTicker(sym)}
                    className="px-4 py-2 bg-surface hover:bg-slate-700 border border-slate-700 rounded-lg text-sm font-mono text-slate-300 transition-colors"
                  >
                    ${sym}
                  </button>
                ))}
              </div>

              {/* Feature Upsell for Guests */}
              {userTier === UserTier.GUEST && (
                <div className="mt-12 pt-12 border-t border-slate-800 w-full max-w-2xl">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                    <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
                      <Lock className="w-5 h-5 text-slate-500 mb-2" />
                      <h4 className="font-semibold text-slate-300 text-sm">Unlimited Analysis</h4>
                      <p className="text-xs text-slate-500 mt-1">Remove the 3-search limit.</p>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
                      <Lock className="w-5 h-5 text-slate-500 mb-2" />
                      <h4 className="font-semibold text-slate-300 text-sm">Personal Watchlist</h4>
                      <p className="text-xs text-slate-500 mt-1">Save your favorite setups.</p>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
                      <Lock className="w-5 h-5 text-slate-500 mb-2" />
                      <h4 className="font-semibold text-slate-300 text-sm">Smart Alerts</h4>
                      <p className="text-xs text-slate-500 mt-1">Get notified on price targets.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {loadingState === LoadingState.ANALYZING && (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-6 animate-pulse">
               <div className="relative w-20 h-20">
                 <div className="absolute inset-0 border-4 border-slate-700 rounded-full"></div>
                 <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
               </div>
               <div className="text-center">
                 <h3 className="text-xl font-medium text-white">Analyzing Market Data</h3>
                 <p className="text-slate-500 mt-2">Scanning charts, calculating indicators, and identifying patterns...</p>
               </div>
            </div>
          )}

          {loadingState === LoadingState.ERROR && (
            <div className="flex flex-col items-center justify-center min-h-[40vh] text-center max-w-lg mx-auto p-6 bg-red-500/5 border border-red-500/20 rounded-2xl">
              <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mb-4 text-red-500">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Analysis Failed</h3>
              <p className="text-slate-400 mb-6">{error}</p>
              <button 
                onClick={() => handleSearch({ preventDefault: () => {} } as React.FormEvent)}
                className="bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {loadingState === LoadingState.SUCCESS && result && (
            <div className="space-y-6">
              {/* Mock Watchlist Button */}
              <div className="flex justify-end">
                <button 
                  disabled={userTier === UserTier.GUEST}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    userTier === UserTier.PAID 
                      ? 'bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/20' 
                      : 'bg-slate-900 text-slate-500 cursor-not-allowed border border-slate-800'
                  }`}
                  onClick={() => alert("Added to watchlist (Mock)")}
                >
                  {userTier === UserTier.GUEST ? <Lock className="w-3 h-3" /> : <Star className="w-3 h-3" />}
                  {userTier === UserTier.GUEST ? 'Upgrade to Save' : 'Save to Watchlist'}
                </button>
              </div>
              <AnalysisDisplay data={result} />
            </div>
          )}
        </main>
        
        {/* Footer */}
        <footer className="mt-20 border-t border-slate-800 pt-8 text-center text-slate-600 text-sm pb-8">
          <p>© {new Date().getFullYear()} TradeOracle AI. Powered by Google Gemini.</p>
        </footer>
      </div>
      
      {/* Background Gradient Effect */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[128px]"></div>
          <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-emerald-600/5 rounded-full blur-[128px]"></div>
      </div>
    </div>
  );
};

export default App;
