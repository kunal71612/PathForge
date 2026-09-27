import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import {
  ArrowRight, Target, BookOpen, Brain, Compass, CheckCircle2, ChevronRight,
  TrendingUp, Award, Zap, Sparkles, AlertTriangle, ShieldCheck
} from 'lucide-react';
import { ReadinessGauge } from '../components/ui/Common';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50/40 text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md border-b border-slate-200/80 z-50 transition-all">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-slate-900 group-hover:bg-blue-600 transition-colors rounded-xl flex items-center justify-center text-white shadow-subtle">
              <ChevronRight className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              PATHFORGE
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm" className="font-medium text-slate-600 hover:text-slate-900">
                Log in
              </Button>
            </Link>
            <Link to="/register">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white shadow-subtle font-medium">
                Start Your Path
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-5 relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/60 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            The Student Growth & Opportunity Engine
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.08] text-slate-900 mb-6">
            Learn with purpose.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-slate-900">
              Prove your skills.
            </span><br />
            Find your opportunity.
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            Turn your career goal into a clear learning path, prove what you know through real assessments, and discover opportunities you're actually prepared for.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-16">
            <Link to="/register" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3.5 text-base shadow-card">
                Start Your Path <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/register" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto font-medium text-slate-700 hover:bg-slate-50 border-slate-300 px-7 py-3.5 text-base">
                Explore Opportunities
              </Button>
            </Link>
          </div>

          {/* Connected Student Journey Visualization */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-card max-w-4xl mx-auto">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
              The PathForge Connected Journey
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 relative">
              {[
                { step: '1', title: 'Goal', sub: 'Choose target role', icon: Target, active: true },
                { step: '2', title: 'Roadmap', sub: 'Structured steps', icon: BookOpen, active: true },
                { step: '3', title: 'Learn', sub: 'Curated resources', icon: Zap, active: true },
                { step: '4', title: 'Assess', sub: 'Skill evaluation', icon: Award, active: true },
                { step: '5', title: 'Confidence', sub: 'Verified scores', icon: Brain, active: true },
                { step: '6', title: 'Opportunity', sub: 'Real matches', icon: Compass, active: true },
                { step: '7', title: 'Apply', sub: 'High readiness', icon: ShieldCheck, active: true },
              ].map((s, idx) => (
                <div
                  key={s.title}
                  className="flex flex-col items-center text-center p-3 rounded-2xl bg-slate-50 border border-slate-100/80 hover:border-blue-300 hover:bg-blue-50/30 transition-all duration-200"
                >
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-blue-600 mb-2 shadow-subtle">
                    <s.icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-900">{s.title}</span>
                  <span className="text-[11px] text-slate-500 mt-0.5 leading-tight">{s.sub}</span>
                  {idx < 6 && (
                    <div className="hidden lg:block absolute top-8 -right-2 text-slate-300">
                      →
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section: How PathForge Works */}
      <section className="py-20 px-5 bg-white border-y border-slate-200/80">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 mb-3">
              How PATHFORGE Works
            </h2>
            <p className="text-base text-slate-600">
              Not another generic opportunity-listing site. A closed-loop career acceleration system.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* 1. Personalized Learning */}
            <div className="bg-slate-50/70 border border-slate-200 rounded-2xl p-6 hover:shadow-subtle transition-all">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold mb-4">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Personalized Learning</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Choose a goal like "Become an AI Engineer" and follow modular roadmaps with vetted docs, tutorials, and practical projects.
              </p>
            </div>

            {/* 2. Skill Confidence */}
            <div className="bg-slate-50/70 border border-slate-200 rounded-2xl p-6 hover:shadow-subtle transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold mb-4">
                <Brain className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Skill Confidence</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Skill ratings are proven, not self-declared. Automatic assessment scoring combined with learning progression yields a verified confidence %.
              </p>
            </div>

            {/* 3. Opportunity Matching */}
            <div className="bg-slate-50/70 border border-slate-200 rounded-2xl p-6 hover:shadow-subtle transition-all">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold mb-4">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Opportunity Matching</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                5-factor weighted algorithm computes real match scores (40% skills, 25% interests, 15% education, 10% category, 10% goal).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Deep Dive: Readiness & Skill Gap */}
      <section className="py-20 px-5 bg-slate-50/50">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-4">
              <TrendingUp className="w-3.5 h-3.5" />
              Readiness & Skill Gaps
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 mb-4 leading-tight">
              Know when you're actually prepared to apply.
            </h2>
            <p className="text-slate-600 mb-6 leading-relaxed">
              Never wonder if you're good enough. For every internship or hackathon, PathForge calculates your exact Readiness Score based on your verified skills and identifies what you need to improve.
            </p>

            <div className="space-y-3 mb-8">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-sm text-slate-700 font-medium">
                  Instant breakdown of skills you already have vs. missing requirements
                </span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-sm text-slate-700 font-medium">
                  One-click links to learn the specific missing skill and take tests
                </span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-sm text-slate-700 font-medium">
                  Prioritized deadline alerts so you never miss an application window
                </span>
              </div>
            </div>

            <Link to="/register">
              <Button className="bg-slate-900 hover:bg-slate-800 text-white font-semibold">
                Build Your Profile Now →
              </Button>
            </Link>
          </div>

          {/* Interactive Card Preview */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-card">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 mb-2">
                  INTERNSHIP
                </span>
                <h3 className="text-lg font-bold text-slate-900">Machine Learning Research Fellow</h3>
                <p className="text-xs text-slate-500">AI Innovation Lab • Deadline in 5 days</p>
              </div>
              <ReadinessGauge percentage={68} size={64} label="READY" />
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 mb-4">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                SKILL MATCH ANALYSIS
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-emerald-700 font-medium bg-emerald-50/70 p-2 rounded-lg border border-emerald-100">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Python (82% Verified)</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-700 font-medium bg-emerald-50/70 p-2 rounded-lg border border-emerald-100">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Git (76% Verified)</span>
                </div>
                <div className="flex items-center gap-1.5 text-amber-700 font-medium bg-amber-50/70 p-2 rounded-lg border border-amber-100">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Machine Learning (42%)</span>
                </div>
                <div className="flex items-center gap-1.5 text-rose-700 font-medium bg-rose-50/70 p-2 rounded-lg border border-rose-100">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  <span>REST APIs (Missing)</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-500">Overall Match: <strong className="text-slate-900 font-semibold">91%</strong></span>
              <span className="text-blue-600 font-semibold cursor-pointer hover:underline">
                View 2 Learning Paths →
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="py-20 px-5 bg-slate-900 text-white relative">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
            Ready to forge your path?
          </h2>
          <p className="text-slate-300 max-w-xl mx-auto mb-8 text-base sm:text-lg">
            Join thousands of ambitious students turning structured practice into dream internships and opportunities.
          </p>
          <Link to="/register">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3.5 text-base shadow-card">
              Create Your Free Account <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-5 border-t border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">PATHFORGE</span>
            <span>•</span>
            <span>Student Growth & Opportunity Platform</span>
          </div>
          <p>© 2026 PATHFORGE. Learn with purpose. Prove your skills.</p>
        </div>
      </footer>
    </div>
  );
}
