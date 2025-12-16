import React, { useState, useEffect } from "react";
import {
  Search,
  Loader2,
  BarChart2,
  Crown,
  User,
  Lock,
  LogOut,
  Star,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { Route, Routes, useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { analyzeStock } from "./services/geminiService";
import { auth, db } from "./services/firebase";
import { AnalysisResult, LoadingState, UserTier } from "./types";
import AnalysisDisplay from "./components/AnalysisDisplay";
import PaywallModal from "./components/PaywallModal";
import UpgradePage from "./components/UpgradePage";
import DashboardPage from "./components/DashboardPage";

const GUEST_LIMIT = 3;

const App: React.FC = () => {
  const navigate = useNavigate();

  const [ticker, setTicker] = useState("");
  const [loadingState, setLoadingState] = useState<LoadingState>(
    LoadingState.IDLE
  );
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // User & Subscription State
  const [userTier, setUserTier] = useState<UserTier>(UserTier.GUEST);
  const [guestSearchCount, setGuestSearchCount] = useState(0);
  const [showPaywall, setShowPaywall] = useState(false);

  // Initialize from LocalStorage
  useEffect(() => {
    const storedSearches = localStorage.getItem("guest_searches");
    if (storedSearches) {
      const history = JSON.parse(storedSearches);
      setGuestSearchCount(history.length);
    }
  }, []);

  // Sync user tier from Firebase Auth + Firestore
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setUserTier(UserTier.GUEST);
        return;
      }

      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          const data = snap.data() as { tier?: UserTier };
          setUserTier(
            data.tier === UserTier.PAID ? UserTier.PAID : UserTier.GUEST
          );
          if (data.tier === UserTier.PAID) {
            setShowPaywall(false);
          }
          return;
        }

        setUserTier(UserTier.GUEST);
      } catch {
        setUserTier(UserTier.GUEST);
      }
    });

    return () => unsubscribe();
  }, []);

  const executeSearch = async (symbol: string) => {
    if (!symbol.trim()) return;

    // Guest Limit Check
    if (userTier === UserTier.GUEST && guestSearchCount >= GUEST_LIMIT) {
      setShowPaywall(true);
      return;
    }

    setLoadingState(LoadingState.ANALYZING);
    setError(null);
    setResult(null);

    try {
      const data = await analyzeStock(symbol.toUpperCase());
      setResult(data);
      setLoadingState(LoadingState.SUCCESS);

      // Track Guest Usage
      if (userTier === UserTier.GUEST) {
        const storedSearches = JSON.parse(
          localStorage.getItem("guest_searches") || "[]"
        );
        const newHistory = [...storedSearches, symbol.toUpperCase()];
        localStorage.setItem("guest_searches", JSON.stringify(newHistory));
        setGuestSearchCount(newHistory.length);
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      setLoadingState(LoadingState.ERROR);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(ticker);
  };

  const handleUpgradeClick = () => {
    navigate("/upgrade");
  };

  const handleAuthButtonClick = async () => {
    if (userTier === UserTier.PAID) {
      await signOut(auth);
      return;
    }
    navigate("/upgrade");
  };

  const isIdle = loadingState === LoadingState.IDLE;

  return (
    <Routes>
      <Route path="/upgrade" element={<UpgradePage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route
        path="/"
        element={
          <div className="min-h-screen bg-background text-slate-200 p-4 md:p-8 selection:bg-primary selection:text-white relative">
            <PaywallModal
              isOpen={showPaywall}
              onClose={() => setShowPaywall(false)}
              onUpgrade={handleUpgradeClick}
            />

            <div className="max-w-7xl mx-auto">
              {/* Header Navigation */}
              <header className="flex items-center justify-between mb-8 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <BarChart2 className="text-white w-6 h-6" />
                  </div>
                  <div className="hidden md:block">
                    <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                      TradeOracle AI
                      {userTier === UserTier.PAID && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold uppercase tracking-wide border border-amber-500/30">
                          Pro
                        </span>
                      )}
                    </h1>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Header Search - Only visible when not idle */}
                  {!isIdle && (
                    <form
                      onSubmit={handleSearch}
                      className="relative w-full md:w-64 group hidden md:block"
                    >
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-slate-500 group-focus-within:text-primary transition-colors" />
                      </div>
                      <input
                        type="text"
                        className="block w-full pl-9 pr-4 h-10 bg-surface border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm"
                        placeholder="Search ticker..."
                        value={ticker}
                        onChange={(e) => setTicker(e.target.value)}
                        disabled={loadingState === LoadingState.ANALYZING}
                      />
                    </form>
                  )}

                  <button
                    onClick={handleAuthButtonClick}
                    className={`flex items-center gap-2 px-4 h-10 rounded-lg font-medium text-sm transition-all border ${
                      userTier === UserTier.PAID
                        ? "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
                        : "bg-gradient-to-r from-amber-500 to-orange-500 border-transparent text-white shadow-lg shadow-amber-500/20 hover:scale-105"
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

              {/* Content Area */}
              <main>
                {isIdle && (
                  <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8 animate-fade-in -mt-10">
                    <div className="space-y-4">
                      <div className="inline-flex items-center justify-center w-20 h-20 bg-surface rounded-2xl mb-2 ring-1 ring-slate-700 shadow-2xl shadow-blue-900/20 md:hidden">
                        <BarChart2 className="w-10 h-10 text-primary" />
                      </div>
                      <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                        TradeOracle AI
                      </h2>
                      <p className="text-slate-400 text-lg max-w-xl mx-auto leading-relaxed">
                        Institutional-grade technical analysis powered by
                        generative AI.
                        <span className="hidden md:inline">
                          {" "}
                          Identify strategic entry & exit points instantly.
                        </span>
                      </p>
                    </div>

                    {/* CENTRAL SEARCH BAR */}
                    <form
                      onSubmit={handleSearch}
                      className="relative w-full max-w-lg group"
                    >
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="h-6 w-6 text-slate-500 group-focus-within:text-primary transition-colors" />
                      </div>
                      <input
                        type="text"
                        className="block w-full pl-12 pr-14 py-4 bg-surface/50 border border-slate-700 rounded-2xl text-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-xl backdrop-blur-xl"
                        placeholder="Enter stock symbol (e.g. NVDA)"
                        value={ticker}
                        onChange={(e) => setTicker(e.target.value)}
                        autoFocus
                      />
                      <button
                        type="submit"
                        disabled={!ticker}
                        className="absolute right-2 top-2 bottom-2 bg-primary hover:bg-blue-600 text-white w-12 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg shadow-blue-500/20"
                      >
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    </form>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-lg">
                      {["SPY", "TSLA", "NVDA", "BTC-USD"].map((sym) => (
                        <button
                          key={sym}
                          onClick={() => {
                            setTicker(sym);
                            executeSearch(sym);
                          }}
                          className="px-4 py-2 bg-surface hover:bg-slate-700 border border-slate-700 rounded-lg text-sm font-medium text-slate-300 transition-colors"
                        >
                          ${sym}
                        </button>
                      ))}
                    </div>

                    {/* Feature Upsell for Guests */}
                    {userTier === UserTier.GUEST && (
                      <div className="mt-8 pt-8 border-t border-slate-800/50 w-full max-w-3xl">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                          <div className="p-4 rounded-xl bg-slate-800/20 border border-slate-700/30">
                            <div className="flex items-center gap-2 mb-2 text-slate-300">
                              <Lock className="w-4 h-4 text-primary" />
                              <h4 className="font-semibold text-sm">
                                Unlimited Analysis
                              </h4>
                            </div>
                            <p className="text-xs text-slate-500">
                              Remove the 3-search limit and trade without
                              restrictions.
                            </p>
                          </div>
                          <div className="p-4 rounded-xl bg-slate-800/20 border border-slate-700/30">
                            <div className="flex items-center gap-2 mb-2 text-slate-300">
                              <Star className="w-4 h-4 text-primary" />
                              <h4 className="font-semibold text-sm">
                                Personal Watchlist
                              </h4>
                            </div>
                            <p className="text-xs text-slate-500">
                              Save your favorite setups and track performance.
                            </p>
                          </div>
                          <div className="p-4 rounded-xl bg-slate-800/20 border border-slate-700/30">
                            <div className="flex items-center gap-2 mb-2 text-slate-300">
                              <AlertCircle className="w-4 h-4 text-primary" />
                              <h4 className="font-semibold text-sm">
                                Smart Alerts
                              </h4>
                            </div>
                            <p className="text-xs text-slate-500">
                              Get instant notifications when price targets are
                              hit.
                            </p>
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
                      <h3 className="text-xl font-medium text-white">
                        Analyzing Market Data
                      </h3>
                      <p className="text-slate-500 mt-2">
                        Scanning charts, calculating indicators, and identifying
                        patterns...
                      </p>
                    </div>
                  </div>
                )}

                {loadingState === LoadingState.ERROR && (
                  <div className="flex flex-col items-center justify-center min-h-[40vh] text-center max-w-lg mx-auto p-6 bg-red-500/5 border border-red-500/20 rounded-2xl">
                    <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mb-4 text-red-500">
                      <AlertCircle className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">
                      Analysis Failed
                    </h3>
                    <p className="text-slate-400 mb-6">{error}</p>
                    <button
                      onClick={() =>
                        handleSearch({
                          preventDefault: () => {},
                        } as React.FormEvent)
                      }
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
                            ? "bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/20"
                            : "bg-slate-900 text-slate-500 cursor-not-allowed border border-slate-800"
                        }`}
                        onClick={() => alert("Added to watchlist (Mock)")}
                      >
                        {userTier === UserTier.GUEST ? (
                          <Lock className="w-3 h-3" />
                        ) : (
                          <Star className="w-3 h-3" />
                        )}
                        {userTier === UserTier.GUEST
                          ? "Upgrade to Save"
                          : "Save to Watchlist"}
                      </button>
                    </div>
                    <AnalysisDisplay data={result} />
                  </div>
                )}
              </main>

              {/* Footer */}
              <footer className="mt-20 border-t border-slate-800 pt-8 text-center text-slate-600 text-sm pb-8">
                <p>
                  © {new Date().getFullYear()} TradeOracle AI. Powered by Google
                  Gemini.
                </p>
              </footer>
            </div>

            {/* Background Gradient Effect */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
              <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[128px]"></div>
              <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-emerald-600/5 rounded-full blur-[128px]"></div>
            </div>
          </div>
        }
      />
    </Routes>
  );
};

export default App;
