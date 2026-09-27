import { useState, useEffect } from 'react';
import { adminApi, skillsApi } from '../../api/endpoints';
import { Card, Badge, Modal, LoadingState, ErrorState } from '../../components/ui/Common';
import { Brain, Plus, Trash2, HelpCircle, Sparkles } from 'lucide-react';

export default function AdminAssessmentsPage() {
  const [assessments, setAssessments] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New assessment modal
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false);
  const [assessmentForm, setAssessmentForm] = useState({
    title: '',
    description: '',
    skillId: '',
  });

  // New question modal
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string>('');
  const [questionForm, setQuestionForm] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    explanation: '',
    difficulty: 'intermediate',
  });

  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [assData, skillsData] = await Promise.all([
        adminApi.getAssessments(),
        skillsApi.getAll().catch(() => []),
      ]);
      setAssessments(assData);
      setSkills(skillsData);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to load assessments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminApi.createAssessment({
        title: assessmentForm.title,
        description: assessmentForm.description,
        skillId: assessmentForm.skillId || null,
      });
      setIsAssessmentModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Failed to create assessment');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssessmentId) return;
    setSaving(true);
    try {
      await adminApi.createQuestion({
        assessmentId: selectedAssessmentId,
        question: questionForm.question,
        options: questionForm.options.filter(Boolean),
        correctAnswer: Number(questionForm.correctAnswer),
        explanation: questionForm.explanation,
        difficulty: questionForm.difficulty,
      });
      setIsQuestionModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Failed to add question');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState message="Loading skill verification tests..." />;
  if (error) return <ErrorState message={error} onRetry={fetchData} />;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-primary flex items-center gap-2">
            <Brain className="w-6 h-6" /> Manage Verification Assessments
          </h1>
          <p className="text-sm text-secondary mt-1">
            Build skill quizzes, configure diagnostic multiple-choice questions, and set answer explanations.
          </p>
        </div>
        <button
          onClick={() => {
            setAssessmentForm({ title: '', description: '', skillId: skills[0]?.id || '' });
            setIsAssessmentModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-black transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" /> Create Assessment
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {assessments.map((quiz) => (
          <Card key={quiz.id} className="p-5 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <Badge variant="outline" className="text-[10px] uppercase font-semibold">
                  {quiz.skill?.name || 'General Test'}
                </Badge>
                <span className="text-xs text-secondary font-medium">
                  {quiz._count?.attempts || 0} student attempts
                </span>
              </div>

              <h3 className="text-base font-bold text-primary">{quiz.title}</h3>
              <p className="text-xs text-secondary mt-1 line-clamp-2">{quiz.description}</p>
            </div>

            <div className="pt-3 border-t border-border flex items-center justify-between">
              <span className="text-xs text-secondary flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5" /> {quiz._count?.questions || 0} questions
              </span>

              <button
                onClick={() => {
                  setSelectedAssessmentId(quiz.id);
                  setQuestionForm({
                    question: '',
                    options: ['', '', '', ''],
                    correctAnswer: 0,
                    explanation: '',
                    difficulty: 'intermediate',
                  });
                  setIsQuestionModalOpen(true);
                }}
                className="px-3 py-1.5 bg-muted text-primary hover:bg-primary hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3 h-3" /> Add Question
              </button>
            </div>
          </Card>
        ))}
      </div>

      {/* Assessment Modal */}
      <Modal
        isOpen={isAssessmentModalOpen}
        onClose={() => setIsAssessmentModalOpen(false)}
        title="Create Verification Assessment"
      >
        <form onSubmit={handleCreateAssessment} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-primary block mb-1">Assessment Title *</label>
            <input
              type="text"
              required
              value={assessmentForm.title}
              onChange={(e) => setAssessmentForm({ ...assessmentForm, title: e.target.value })}
              placeholder="e.g. React & TypeScript Practical Assessment"
              className="w-full p-2.5 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="font-bold text-primary block mb-1">Associated Skill</label>
            <select
              value={assessmentForm.skillId}
              onChange={(e) => setAssessmentForm({ ...assessmentForm, skillId: e.target.value })}
              className="w-full p-2.5 border border-border rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">None / General</option>
              {skills.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-bold text-primary block mb-1">Description</label>
            <textarea
              rows={3}
              value={assessmentForm.description}
              onChange={(e) => setAssessmentForm({ ...assessmentForm, description: e.target.value })}
              placeholder="Overview of concepts evaluated in this test..."
              className="w-full p-2.5 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="pt-3 border-t border-border flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAssessmentModalOpen(false)}
              className="px-4 py-2 border border-border rounded-lg text-secondary hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-primary text-white rounded-lg font-bold hover:bg-black disabled:opacity-50"
            >
              {saving ? 'Creating...' : 'Create Assessment'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Question Modal */}
      <Modal
        isOpen={isQuestionModalOpen}
        onClose={() => setIsQuestionModalOpen(false)}
        title="Add Diagnostic Question"
      >
        <form onSubmit={handleCreateQuestion} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-primary block mb-1">Question Prompt *</label>
            <textarea
              required
              rows={2}
              value={questionForm.question}
              onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })}
              placeholder="e.g. Which React hook is best suited for executing subscriptions after DOM updates?"
              className="w-full p-2.5 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* 4 Options */}
          <div className="space-y-2">
            <label className="font-bold text-primary block">Options & Correct Answer</label>
            {questionForm.options.map((opt, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="correctAnswer"
                  checked={questionForm.correctAnswer === idx}
                  onChange={() => setQuestionForm({ ...questionForm, correctAnswer: idx })}
                  className="h-4 w-4 text-primary focus:ring-primary cursor-pointer"
                  title="Mark as correct answer"
                />
                <input
                  type="text"
                  required
                  value={opt}
                  onChange={(e) => {
                    const newOpts = [...questionForm.options];
                    newOpts[idx] = e.target.value;
                    setQuestionForm({ ...questionForm, options: newOpts });
                  }}
                  placeholder={`Option ${idx + 1}`}
                  className="flex-1 p-2 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            ))}
            <p className="text-[11px] text-secondary">Select the radio button next to the correct answer.</p>
          </div>

          <div>
            <label className="font-bold text-primary block mb-1">Explanation (shown after quiz)</label>
            <textarea
              rows={2}
              value={questionForm.explanation}
              onChange={(e) => setQuestionForm({ ...questionForm, explanation: e.target.value })}
              placeholder="Why is this answer correct? Helpful learning tip..."
              className="w-full p-2.5 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="pt-3 border-t border-border flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsQuestionModalOpen(false)}
              className="px-4 py-2 border border-border rounded-lg text-secondary hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-primary text-white rounded-lg font-bold hover:bg-black disabled:opacity-50"
            >
              {saving ? 'Adding...' : 'Save Question'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
