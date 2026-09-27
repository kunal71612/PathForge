import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ChevronRight, Target, Brain, Compass, Sparkles, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionExpired = searchParams.get('expired') === '1';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotNotice, setForgotNotice] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setError(apiErr.message || 'Invalid email or password. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white text-slate-900">
      {/* Left Branding / Journey Showcase Column */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 text-white p-12 flex-col justify-between relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-blue-600/15 blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-indigo-600/15 blur-3xl" />

        {/* Top brand header */}
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-10 h-10 bg-blue-600 group-hover:bg-blue-500 transition-colors rounded-xl flex items-center justify-center shadow-lg">
              <ChevronRight className="w-6 h-6 text-white stroke-[2.5]" />
            </div>
            <span className="text-xl font-extrabold tracking-tight">PATHFORGE</span>
          </Link>
          <div className="mt-8">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-blue-300 text-xs font-semibold uppercase tracking-wider mb-4 border border-white/10">
              <Sparkles className="w-3.5 h-3.5" />
              Student Growth Engine
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight leading-tight">
              Turn what you learn into opportunities you're ready for.
            </h2>
            <p className="mt-3 text-slate-400 text-sm leading-relaxed max-w-md">
              Log in to access your customized roadmap, test your skills, and check live readiness for internships and hackathons.
            </p>
          </div>
        </div>

        {/* Visual learning / opportunity path preview */}
        <div className="relative z-10 my-8 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
            Your Active Loop
          </p>
          <div className="space-y-3.5">
            <div className="flex items-center gap-3.5 p-3 rounded-xl bg-white/5 border border-white/5">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Target Goal</p>
                <p className="text-[11px] text-slate-400">AI Engineer • Python & ML Track</p>
              </div>
            </div>
            <div className="flex items-center gap-3.5 p-3 rounded-xl bg-white/5 border border-white/5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Brain className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Verified Confidence</p>
                <p className="text-[11px] text-slate-400">Python 82% • Git 76% • ML 42%</p>
              </div>
            </div>
            <div className="flex items-center gap-3.5 p-3 rounded-xl bg-white/5 border border-white/5">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Matched Opportunities</p>
                <p className="text-[11px] text-slate-400">91% Match • 68% Readiness Score</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom tagline */}
        <div className="relative z-10 text-xs text-slate-500">
          Learn with purpose. Prove your skills. Find your opportunity.
        </div>
      </div>

      {/* Right Login Card Column */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-slate-50/50">
        <div className="w-full max-w-md bg-white border border-slate-200/90 rounded-3xl p-8 sm:p-10 shadow-card">
          {/* Mobile brand header */}
          <div className="lg:hidden text-center mb-6">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                <ChevronRight className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="text-lg font-bold tracking-tight">PATHFORGE</span>
            </Link>
          </div>

          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Welcome back</h1>
            <p className="text-sm text-slate-500 mt-1">Sign in to resume your learning and applications</p>
          </div>

          {sessionExpired && (
            <div className="mb-5 p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Your session has expired. Please sign in again.</span>
            </div>
          )}

          {error && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                id="login-email"
                label="Email Address"
                type="email"
                placeholder="name@student.local"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="login-password" className="text-xs font-semibold text-slate-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setForgotNotice(true)}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  Forgot password?
                </button>
              </div>
              <Input
                id="login-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full"
              />
              {forgotNotice && (
                <p className="text-[11px] text-slate-500 mt-1.5 p-2 bg-slate-50 rounded-lg border border-slate-200">
                  Self-service password reset is currently unavailable in this MVP environment. Please contact an administrator or register a new account.
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-subtle mt-2"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-600">
              Don't have an account yet?{' '}
              <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700 hover:underline">
                Create Account
              </Link>
            </p>
          </div>

          {/* Quick Demo Login Hint */}
          <div className="mt-6 p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-500">
            <p className="font-semibold text-slate-700 mb-1">Demo Credentials:</p>
            <div className="flex justify-between text-[11px]">
              <span>Student: <code className="text-slate-700 font-mono">demo@student.local</code></span>
              <span>Pass: <code className="text-slate-700 font-mono">demo1234</code></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
