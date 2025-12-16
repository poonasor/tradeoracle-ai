import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Crown, Loader2, Lock, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "../services/firebase";
import { UserTier } from "../types";

const UpgradePage: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkoutMessage, setCheckoutMessage] = useState<string | null>(null);

  const [uid, setUid] = useState<string | null>(null);
  const [currentTier, setCurrentTier] = useState<UserTier>(UserTier.GUEST);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoadingProfile(true);
      try {
        if (!user) {
          setUid(null);
          setCurrentTier(UserTier.GUEST);
          return;
        }

        setUid(user.uid);

        try {
          const snap = await getDoc(doc(db, "users", user.uid));
          if (snap.exists()) {
            const data = snap.data() as { tier?: UserTier };
            setCurrentTier(
              data.tier === UserTier.PAID ? UserTier.PAID : UserTier.GUEST
            );
          } else {
            try {
              await setDoc(
                doc(db, "users", user.uid),
                {
                  email: user.email || null,
                  tier: UserTier.GUEST,
                  createdAt: serverTimestamp(),
                },
                { merge: true }
              );
            } catch {
              // Ignore until Firestore rules are configured
            }
            setCurrentTier(UserTier.GUEST);
          }
        } catch {
          setCurrentTier(UserTier.GUEST);
        }
      } finally {
        setLoadingProfile(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "1") {
      setCheckoutMessage(
        "Payment complete. Your subscription will be activated shortly."
      );
      return;
    }
    if (params.get("canceled") === "1") {
      setCheckoutMessage("Checkout canceled. You were not charged.");
      return;
    }
    setCheckoutMessage(null);
  }, []);

  const canProceed = useMemo(() => {
    if (uid) return true;
    return email.trim().length > 3 && password.length >= 6;
  }, [uid, email, password]);

  const handleStartCheckout = async (e?: React.FormEvent) => {
    e?.preventDefault();

    setSubmitting(true);
    setError(null);

    try {
      let effectiveUid = uid;

      if (!effectiveUid) {
        const cred = await createUserWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );
        effectiveUid = cred.user.uid;
        try {
          await setDoc(
            doc(db, "users", cred.user.uid),
            {
              email: cred.user.email || email.trim(),
              tier: UserTier.GUEST,
              createdAt: serverTimestamp(),
            },
            { merge: true }
          );
        } catch {
          // Ignore until Firestore rules are configured
        }
      }

      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uid: effectiveUid }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || "Failed to start Stripe checkout.");
      }

      const data = (await res.json()) as { url?: string };
      if (!data.url) {
        throw new Error("Stripe checkout URL missing from server response.");
      }

      window.location.href = data.url;
    } catch (err: any) {
      setError(err?.message || "Failed to start Stripe checkout.");
    } finally {
      setSubmitting(false);
    }
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
            <Crown className="w-5 h-5 text-amber-400" />
            <span className="text-white font-semibold">Upgrade to Pro</span>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white">
              Create your account
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Register to manage your subscription and unlock Pro features.
            </p>

            <form onSubmit={handleStartCheckout} className="mt-6 space-y-4">
              {checkoutMessage && (
                <div className="text-sm text-slate-300 bg-slate-800 border border-slate-700 rounded-lg p-3">
                  {checkoutMessage}
                </div>
              )}

              <label className="block">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Email
                </span>
                <div className="mt-2 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="w-4 h-4 text-slate-500" />
                  </div>
                  <input
                    type="email"
                    className="block w-full pl-10 pr-3 h-10 bg-surface border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    placeholder="you@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={submitting}
                  />
                </div>
              </label>

              <label className="block">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Password
                </span>
                <div className="mt-2 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="w-4 h-4 text-slate-500" />
                  </div>
                  <input
                    type="password"
                    className="block w-full pl-10 pr-3 h-10 bg-surface border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={submitting}
                  />
                </div>
              </label>

              {error && (
                <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={
                  !canProceed || submitting || currentTier === UserTier.PAID
                }
                className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold transition-colors flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : null}
                {currentTier === UserTier.PAID
                  ? "Already Pro"
                  : "Continue to Stripe Checkout"}
              </button>
            </form>
          </div>

          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white">Pro Plan</h2>
            <p className="text-sm text-slate-400 mt-1">
              Unlimited analysis + watchlist and alerts.
            </p>

            <div className="mt-6 p-4 bg-slate-800 rounded-xl border border-slate-700">
              <div className="flex justify-between items-end mb-1">
                <span className="text-white font-bold text-lg">$7.99</span>
                <span className="text-slate-400 text-sm">/mo</span>
              </div>
              <p className="text-xs text-slate-500">
                7-day free trial, cancel anytime.
              </p>
            </div>

            <div className="mt-6">
              {loadingProfile ? (
                <div className="flex items-center gap-2 text-slate-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading account...
                </div>
              ) : (
                <div className="text-sm text-slate-300">
                  Status:{" "}
                  <span
                    className={
                      currentTier === UserTier.PAID
                        ? "text-amber-400 font-semibold"
                        : "text-slate-300 font-semibold"
                    }
                  >
                    {currentTier === UserTier.PAID ? "Pro" : "Free"}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[128px]"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-emerald-600/5 rounded-full blur-[128px]"></div>
      </div>
    </div>
  );
};

export default UpgradePage;
