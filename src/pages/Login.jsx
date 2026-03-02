import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, ShieldCheck, User, Loader2, Eye, EyeOff, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

// ─────────────────────────────────────────────
//  Glassmorphism Login Page
// ─────────────────────────────────────────────
export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loadingRole, setLoadingRole] = useState(null); // 'admin' | 'user' | null
  const [error, setError] = useState("");

  const from = location.state?.from?.pathname;

  async function handleDemoLogin(role) {
    setError("");
    setLoadingRole(role);
    try {
      const user = await login(role);
      // Redirect: admin → /admin, user → their profile or home
      if (user.role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        const dest = from && from !== "/login" ? from : user.selectedProfile ? `/${user.selectedProfile}` : "/";
        navigate(dest, { replace: true });
      }
    } catch (e) {
      setError(e.message || "Login failed. Please try again.");
    } finally {
      setLoadingRole(null);
    }
  }

  async function handleFormSubmit(e) {
    e.preventDefault();
    if (!email || !password) { setError("Please enter your credentials."); return; }
    // Determine role from email suffix for demo purposes
    const role = email.includes("admin") ? "admin" : "user";
    await handleDemoLogin(role);
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
      {/* Ambient blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-indigo-500/15 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-violet-500/5 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md px-4"
      >
        {/* Card */}
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl p-8">
          {/* Logo */}
          <div className="flex flex-col items-center gap-3 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-white tracking-tight">NeuroBridge</h1>
              <p className="text-sm text-white/50 mt-0.5">Neuro-inclusive care platform</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-white/60 uppercase tracking-widest">
                Email / ABHA ID
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@neurobridge.in"
                className="w-full rounded-xl border border-white/10 bg-white/8 px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-primary/60 transition"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-white/60 uppercase tracking-widest">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-white/10 bg-white/8 px-4 py-3 pr-11 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-primary/60 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-xs text-red-400 bg-red-400/10 rounded-lg px-3 py-2"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={!!loadingRole}
              className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white shadow-lg shadow-primary/30 hover:bg-primary/90 disabled:opacity-60 transition flex items-center justify-center gap-2"
            >
              {loadingRole === "form" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : "Sign In"}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-white/30">SheBuildsTech Demo Access</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Demo login buttons */}
          <div className="grid grid-cols-2 gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleDemoLogin("admin")}
              disabled={!!loadingRole}
              className="flex flex-col items-center gap-2 rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-4 hover:bg-amber-400/20 disabled:opacity-50 transition text-left"
            >
              {loadingRole === "admin" ? (
                <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
              ) : (
                <ShieldCheck className="w-6 h-6 text-amber-400" />
              )}
              <div>
                <div className="text-sm font-semibold text-amber-300">Admin Demo</div>
                <div className="text-xs text-amber-300/60">Clinical Coordinator</div>
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleDemoLogin("user")}
              disabled={!!loadingRole}
              className="flex flex-col items-center gap-2 rounded-2xl border border-sky-400/30 bg-sky-400/10 px-4 py-4 hover:bg-sky-400/20 disabled:opacity-50 transition text-left"
            >
              {loadingRole === "user" ? (
                <Loader2 className="w-6 h-6 text-sky-400 animate-spin" />
              ) : (
                <User className="w-6 h-6 text-sky-400" />
              )}
              <div>
                <div className="text-sm font-semibold text-sky-300">User Demo</div>
                <div className="text-xs text-sky-300/60">Neurodivergent User</div>
              </div>
            </motion.button>
          </div>

          {/* Footer note */}
          <p className="mt-6 text-center text-xs text-white/25">
            <Sparkles className="inline w-3 h-3 mr-1" />
            Demo credentials are pre-filled. No real data is stored.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
