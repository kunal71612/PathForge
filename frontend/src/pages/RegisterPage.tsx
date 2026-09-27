import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ChevronRight, CheckCircle2, AlertCircle, Shield, Sparkles } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Password requirements validation checks
  const hasMinLength = password.length >= 6;
  const hasConfirmMatch = password.length > 0 && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!hasMinLength) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter identical passwords.');
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password);
      // Seamlessly navigate to Dashboard upon successful account creation
      navigate('/dashboard');
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setError(apiErr.message || 'Registration failed. Please check your information.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white text-slate-900">
      {/* Left Column: Value Proposition & Student Promise */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-blue-600/15 blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-indigo-600/15 blur-3xl" />

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
              Join the Platform
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight leading-tight">
              Start proving your skills with purpose.
            </h2>
            <p className="mt-3 text-slate-400 text-sm leading-relaxed max-w-md">
              Create your account to unlock curated roadmaps, automated skill verification quizzes, and direct matches to verified opportunities.
            </p>
          </div>
        </div>

        {/* Feature Checkmarks */}
        <div className="relative z-10 my-8 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Objective Skill Confidence</p>
              <p className="text-xs text-slate-400">Score-backed ratings verified through assessments.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Smart Match & Readiness Algorithm</p>
              <p className="text-xs text-slate-400">Understand your match % and required skill gaps.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Full Application Tracker</p>
              <p className="text-xs text-slate-400">Track deadlines and stages from Saved to Selected.</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-slate-500">
          Already part of PathForge? Sign in to resume where you left off.
        </div>
      </div>

      {/* Right Column: Registration Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-slate-50/50">
        <div className="w-full max-w-md bg-white border border-slate-200/90 rounded-3xl p-8 sm:p-10 shadow-card">
          <div className="lg:hidden text-center mb-6">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                <ChevronRight className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="text-lg font-bold tracking-tight">PATHFORGE</span>
            </Link>
          </div>

          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Create your account</h1>
            <p className="text-sm text-slate-500 mt-1">Start your student journey today with real skill tracking</p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                id="register-name"
                label="Full Name"
                type="text"
                placeholder="Ada Lovelace"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full"
              />
            </div>

            <div>
              <Input
                id="register-email"
                label="Email Address"
                type="email"
                placeholder="ada@student.local"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full"
              />
            </div>

            <div>
              <Input
                id="register-password"
                label="Password"
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full"
              />
            </div>

            <div>
              <Input
                id="register-confirm-password"
                label="Confirm Password"
                type="password"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full"
              />
            </div>

            {/* Password Requirement Indicators */}
            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1.5 text-xs">
              <div className="flex items-center gap-2">
                <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[10px] font-bold ${hasMinLength ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                  {hasMinLength ? '✓' : '•'}
                </span>
                <span className={hasMinLength ? 'text-emerald-700 font-medium' : 'text-slate-500'}>
                  At least 6 characters
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[10px] font-bold ${hasConfirmMatch ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                  {hasConfirmMatch ? '✓' : '•'}
                </span>
                <span className={hasConfirmMatch ? 'text-emerald-700 font-medium' : 'text-slate-500'}>
                  Passwords match
                </span>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading || !hasMinLength || !hasConfirmMatch}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-subtle mt-2 disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Create Account & Start'}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-600">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700 hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
