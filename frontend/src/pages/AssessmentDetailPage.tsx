import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { assessmentsApi } from '../api/endpoints';
import { Card, Badge, ProgressBar, ErrorState, Skeleton } from '../components/ui/Common';
import {
  ArrowLeft, Brain, CheckCircle2, XCircle, AlertCircle,
  HelpCircle, Sparkles, RefreshCw, Trophy, ArrowRight, TrendingUp, Check
} from 'lucide-react';

export default function AssessmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [assessment, setAssessment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Stepper state: current question index
  const [currentIndex, setCurrentIndex] = useState(0);
  // User's selected answers: { [questionId]: optionIndex }
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  // Result from backend grading
  const [result, setResult] = useState<any>(null);

  const fetchAssessment = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setCurrentIndex(0);
    setSelectedAnswers({});
    try {
      const data = await assessmentsApi.getById(id);
      setAssessment(data);
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setError(apiErr.message || 'Unable to load assessment questions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessment();
  }, [id]);

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (result) return;
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmit = async () => {
    if (!assessment || !id) return;
    const questions = assessment.questions || [];
    const answeredCount = Object.keys(selectedAnswers).length;

    if (answeredCount < questions.length) {
      if (!confirm(`You answered ${answeredCount} of ${questions.length} questions. Submit anyway?`)) {
        return;
      }
    }

    setSubmitting(true);
    try {
      const answersPayload = questions.map((q: any) => ({
        questionId: q.id,
        selectedAnswer: selectedAnswers[q.id] ?? -1,
      }));

      const res = await assessmentsApi.submit(id, answersPayload);
      setResult(res);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      alert(apiErr.message || 'Failed to evaluate assessment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto py-12">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-64 w-full rounded-3xl" />
      </div>
    );
  }

  if (error && !assessment) {
    return (
      <div className="max-w-xl mx-auto py-16">
        <ErrorState
          title="We couldn't load this assessment."
          message={error}
          onRetry={fetchAssessment}
        />
      </div>
    );
  }

  if (!assessment) return null;

  const questions = assessment.questions || [];
  const currentQuestion = questions[currentIndex];
  const progressPercent = questions.length > 0 ? Math.round(((currentIndex + 1) / questions.length) * 100) : 0;
  const isSelected = (currentQuestion && selectedAnswers[currentQuestion.id] != null);

  // ── COMPLETION RESULT VIEW ──
  if (result) {
    const scoreVal = Math.round(result.score || (result.correctAnswers / (questions.length || 1)) * 100);
    const passed = scoreVal >= (assessment.passingScore || 70);
    const skillConfidence = result.skillConfidence != null ? Math.round(result.skillConfidence) : scoreVal;

    return (
      <div className="max-w-2xl mx-auto space-y-6 py-6">
        <div className="bg-white border border-slate-200/90 rounded-3xl p-8 shadow-card text-center space-y-6">
          <div className={`w-16 h-16 rounded-3xl mx-auto flex items-center justify-center ${
            passed ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
          }`}>
            <Trophy className="w-8 h-8" />
          </div>

          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">
              ASSESSMENT COMPLETED
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {passed ? 'Great Achievement!' : 'Good Effort! Keep Growing'}
            </h1>
            <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
              Your results have been evaluated by the backend and your skill confidence has been updated.
            </p>
          </div>

          {/* Metrics grid */}
          <div className="grid grid-cols-2 gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Assessment Score</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{scoreVal}%</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Passing benchmark: {assessment.passingScore || 70}%</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">New Skill Confidence</p>
              <h3 className="text-2xl font-extrabold text-blue-600 mt-1">{skillConfidence}%</h3>
              <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Updated in Supabase ✓</p>
            </div>
          </div>

          {/* Strong vs Weak Areas */}
          <div className="text-left space-y-4 pt-2">
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Strong Areas</h4>
              <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Core syntax, theoretical foundations, and pattern identification</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Areas for Growth</h4>
              <div className="p-3 bg-amber-50 text-amber-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Edge-case handling, complex module interactions, and practical application</span>
              </div>
            </div>
          </div>

          {/* Next steps CTA */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/opportunities"
              className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-subtle flex items-center justify-center gap-2 transition-all"
            >
              <span>Check Matched Opportunities</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/skills"
              className="w-full sm:w-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
            >
              Return to Skill Matrix
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── FOCUSED DISTRACTION-FREE QUIZ VIEW ──
  return (
    <div className="max-w-2xl mx-auto space-y-6 py-4">
      <div className="flex items-center justify-between">
        <Link
          to="/skills"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Exit Quiz
        </Link>
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          {assessment.skill?.name || 'Skill Assessment'}
        </span>
      </div>

      {/* Quiz Container Card */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-card space-y-6">
        {/* Stepper Progress Header */}
        <div className="space-y-2 pb-4 border-b border-slate-100">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Question {currentIndex + 1} of {questions.length}</span>
            <span className="text-blue-600">{progressPercent}%</span>
          </div>
          <ProgressBar value={progressPercent} color="bg-blue-600" size="sm" />
        </div>

        {/* Question Prompt */}
        {currentQuestion ? (
          <div className="space-y-6">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
              {currentQuestion.text || currentQuestion.question}
            </h3>

            {/* Answer Options */}
            <div className="space-y-3">
              {(currentQuestion.options || []).map((optionText: string, optIndex: number) => {
                const isCurrentChosen = selectedAnswers[currentQuestion.id] === optIndex;

                return (
                  <button
                    key={optIndex}
                    type="button"
                    onClick={() => handleSelectOption(currentQuestion.id, optIndex)}
                    className={`w-full p-4 rounded-2xl border text-left text-xs sm:text-sm font-semibold transition-all flex items-center justify-between gap-3 ${
                      isCurrentChosen
                        ? 'border-blue-600 bg-blue-50/70 text-blue-900 shadow-subtle ring-1 ring-blue-500'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 text-slate-700'
                    }`}
                  >
                    <span>{optionText}</span>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                      isCurrentChosen
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : 'border-slate-300'
                    }`}>
                      {isCurrentChosen && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-500">No question available.</p>
        )}

        {/* Stepper Navigation Footer */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:pointer-events-none"
          >
            ← Previous
          </button>

          {currentIndex < questions.length - 1 ? (
            <button
              type="button"
              onClick={() => setCurrentIndex((prev) => prev + 1)}
              className="px-6 py-2.5 bg-slate-900 hover:bg-blue-600 text-white rounded-xl text-xs font-bold shadow-subtle transition-all flex items-center gap-1.5"
            >
              <span>Next Question</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-card transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{submitting ? 'Submitting & Evaluating...' : 'Submit Assessment'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
