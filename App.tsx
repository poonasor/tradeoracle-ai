import React, { useState } from 'react';
import { Search, Loader2, BarChart2 } from 'lucide-react';
import { analyzeStock } from './services/geminiService';
import { AnalysisResult, LoadingState } from './types';
import AnalysisDisplay from './components/AnalysisDisplay';

const App: React.FC = () => {
  const [ticker, setTicker] = useState('');
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticker.trim()) return;

    setLoadingState(LoadingState.ANALYZING);
    setError(null);
    setResult(null);

    try {
      const data = await analyzeStock(ticker.toUpperCase());
      setResult(data);
      setLoadingState(LoadingState.SUCCESS);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      setLoadingState(LoadingState.ERROR);
    }
  };

  return (
    <div className="min-h-screen bg-background text-slate-200 p-4 md:p-8 selection:bg-primary selection:text-white">
      <div className="max-w-7xl mx-auto">
        {/* Header Navigation */}
        <header className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <BarChart2 className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">TradeOracle AI</h1>
              <p className="text-xs text-slate-500 font-medium">Technical Analysis Assistant</p>
            </div>
          </div>
          
          <form onSubmit={handleSearch} className="relative w-full md:w-96 group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-500 group-focus-within:text-primary transition-colors" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-4 py-3 bg-surface border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm"
              placeholder="Enter symbol (e.g. AAPL, BTC)..."
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
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing</span>
                </>
              ) : (
                'Analyze'
              )}
            </button>
          </form>
        </header>

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
                    onClick={() => {
                        setTicker(sym);
                        // Small timeout to allow state update before submit if we wanted to auto-submit, 
                        // but simply filling it is good UX.
                    }}
                    className="px-4 py-2 bg-surface hover:bg-slate-700 border border-slate-700 rounded-lg text-sm font-mono text-slate-300 transition-colors"
                  >
                    ${sym}
                  </button>
                ))}
              </div>
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
            <AnalysisDisplay data={result} />
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

function AlertCircle(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" x2="12" y1="8" y2="12" />
      <line x1="12" x2="12.01" y1="16" y2="16" />
    </svg>
  );
}