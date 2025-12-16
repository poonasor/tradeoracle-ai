import React, { useEffect, useState } from "react";
import { ArrowLeft, Crown, Loader2, LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../services/firebase";
import { UserTier } from "../types";

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [uid, setUid] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [tier, setTier] = useState<UserTier>(UserTier.GUEST);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "1") {
      setMessage(
        "Payment complete. Your subscription will be activated shortly."
      );
    } else {
      setMessage(null);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      try {
        if (!user) {
          navigate("/upgrade");
          return;
        }

        setUid(user.uid);
        setEmail(user.email || null);

        try {
          const snap = await getDoc(doc(db, "users", user.uid));
          if (snap.exists()) {
            const data = snap.data() as { tier?: UserTier };
            setTier(
              data.tier === UserTier.PAID ? UserTier.PAID : UserTier.GUEST
            );
            return;
          }
        } catch {
          // Ignore read errors until Firestore rules are configured
        }

        setTier(UserTier.GUEST);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await signOut(auth);
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background text-slate-200 p-4 md:p-8 selection:bg-primary selection:text-white relative">
      <div className="max-w-3xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-slate-300" />
            <span className="text-white font-semibold">Dashboard</span>
          </div>
        </header>

        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6">
          {message && (
            <div className="text-sm text-slate-300 bg-slate-800 border border-slate-700 rounded-lg p-3">
              {message}
            </div>
          )}

          {loading ? (
            <div className="flex items-center gap-2 text-slate-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading...
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-slate-400">Signed in as</div>
                  <div className="text-white font-semibold break-all">
                    {email || "(no email)"}
                  </div>
                  <div className="text-xs text-slate-500 break-all mt-1">
                    UID: {uid}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-amber-400" />
                  <span
                    className={
                      tier === UserTier.PAID
                        ? "text-amber-400 font-semibold"
                        : "text-slate-300 font-semibold"
                    }
                  >
                    {tier === UserTier.PAID ? "Pro" : "Free"}
                  </span>
                </div>
              </div>

              {tier !== UserTier.PAID && (
                <div className="text-sm text-slate-400">
                  If you just paid, your Pro status will show here after it’s
                  activated.
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => navigate("/upgrade")}
                  className="px-4 h-10 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium transition-colors"
                >
                  Manage Subscription
                </button>

                <button
                  onClick={handleSignOut}
                  className="ml-auto flex items-center gap-2 px-4 h-10 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[128px]"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-emerald-600/5 rounded-full blur-[128px]"></div>
      </div>
    </div>
  );
};

export default DashboardPage;
