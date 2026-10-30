'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/navbar/Navbar';
import styles from './QuizCreate.module.css';
import { 
  ArrowLeft, 
  Sparkles, 
  Plus, 
  Trash2, 
  Check, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  FileText, 
  Clock, 
  Award, 
  HelpCircle, 
  ChevronRight,
  Info
} from 'lucide-react';

export default function CreateQuizPage() {
  const router = useRouter();
  const { id } = useParams();

  // Step state: 1 (Details), 2 (Questions)
  const [step, setStep] = useState(1);
  const [loadingClass, setLoadingClass] = useState(true);
  const [authError, setAuthError] = useState('');

  // Step 1 Details
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(30);

  // Step 2 Mode: 'ai' or 'manual'
  const [mode, setMode] = useState('ai');

  // AI Generator Form State
  const [aiTopic, setAiTopic] = useState('');
  const [aiCount, setAiCount] = useState(5);
  const [aiDifficulty, setAiDifficulty] = useState('Medium');
  const [generatingAi, setGeneratingAi] = useState(false);

  // Manual Question Inline Form State
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualQuestionText, setManualQuestionText] = useState('');
  const [manualOptions, setManualOptions] = useState(['', '', '', '']);
  const [manualCorrectIndex, setManualCorrectIndex] = useState(0);
  const [manualMarks, setManualMarks] = useState(1);
  const [manualExplanation, setManualExplanation] = useState('');

  // Unified Questions Array
  const [questions, setQuestions] = useState([]);

  // Saving State
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ type: '', message: '' });

  // Verify access & teacher role on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const verifyTeacher = async () => {
      try {
        const res = await fetch(`http://localhost:5000/classroom/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.msg || 'Classroom not found');
        }
        if (data.role !== 'teacher') {
          setAuthError('Access restricted: Only the classroom teacher can create quizzes.');
        }
      } catch (err) {
        setAuthError(err.message || 'Error verifying classroom access');
      } finally {
        setLoadingClass(false);
      }
    };

    if (id) {
      verifyTeacher();
    }
  }, [id, router]);

  // Handle Step 1 Submit
  const handleProceedToStep2 = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setToast({ type: 'error', message: 'Please provide a quiz title to proceed.' });
      return;
    }
    setToast({ type: '', message: '' });
    setStep(2);
  };

  // AI Generation Handler
  const handleAiGenerate = async (e) => {
    e.preventDefault();
    if (!aiTopic.trim()) {
      setToast({ type: 'error', message: 'Please enter a topic to generate questions.' });
      return;
    }

    setGeneratingAi(true);
    setToast({ type: '', message: '' });

    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5000/quizzes/ai-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          topic: aiTopic.trim(),
          numQuestions: Number(aiCount),
          difficulty: aiDifficulty,
          classroomId: id
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.msg || 'AI generation failed');
      }

      const generated = (data.questions || []).map(q => ({
        questionText: q.questionText || '',
        options: (q.options || []).map((opt, i) => ({
          text: typeof opt === 'string' ? opt : (opt.text || ''),
          isCorrect: i === (q.correctOptionIndex ?? 0)
        })),
        correctOptionIndex: q.correctOptionIndex ?? 0,
        marks: q.marks || (aiDifficulty === 'Hard' ? 3 : aiDifficulty === 'Medium' ? 2 : 1),
        explanation: q.explanation || ''
      }));

      // Append generated questions to unified list
      setQuestions(prev => [...prev, ...generated]);
      setToast({ type: 'success', message: `Successfully generated ${generated.length} questions!` });
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to generate questions with AI' });
    } finally {
      setGeneratingAi(false);
    }
  };

  // Manual Question Addition
  const handleAddManualQuestion = (e) => {
    e.preventDefault();
    if (!manualQuestionText.trim()) {
      setToast({ type: 'error', message: 'Question text is required.' });
      return;
    }

    const emptyOpts = manualOptions.some(opt => !opt.trim());
    if (emptyOpts) {
      setToast({ type: 'error', message: 'All 4 options must be filled in.' });
      return;
    }

    const newQuestion = {
      questionText: manualQuestionText.trim(),
      options: manualOptions.map((opt, idx) => ({
        text: opt.trim(),
        isCorrect: idx === manualCorrectIndex
      })),
      correctOptionIndex: manualCorrectIndex,
      marks: Number(manualMarks) || 1,
      explanation: manualExplanation.trim()
    };

    setQuestions(prev => [...prev, newQuestion]);

    // Reset manual form
    setManualQuestionText('');
    setManualOptions(['', '', '', '']);
    setManualCorrectIndex(0);
    setManualMarks(1);
    setManualExplanation('');
    setShowManualForm(false);
    setToast({ type: 'success', message: 'Question added successfully.' });
  };

  // Modify question item
  const updateQuestionText = (index, newText) => {
    setQuestions(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], questionText: newText };
      return copy;
    });
  };

  const updateQuestionOption = (qIndex, optIndex, newText) => {
    setQuestions(prev => {
      const copy = [...prev];
      const optsCopy = [...copy[qIndex].options];
      optsCopy[optIndex] = { ...optsCopy[optIndex], text: newText };
      copy[qIndex] = { ...copy[qIndex], options: optsCopy };
      return copy;
    });
  };

  const updateCorrectOption = (qIndex, newCorrectIdx) => {
    setQuestions(prev => {
      const copy = [...prev];
      const optsCopy = copy[qIndex].options.map((opt, idx) => ({
        ...opt,
        isCorrect: idx === newCorrectIdx
      }));
      copy[qIndex] = {
        ...copy[qIndex],
        correctOptionIndex: newCorrectIdx,
        options: optsCopy
      };
      return copy;
    });
  };

  const updateQuestionMarks = (index, newMarks) => {
    setQuestions(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], marks: Math.max(1, parseInt(newMarks) || 1) };
      return copy;
    });
  };

  const deleteQuestion = (index) => {
    setQuestions(prev => prev.filter((_, i) => i !== index));
  };

  // Total marks preview
  const totalMarksPreview = questions.reduce((acc, q) => acc + (q.marks || 1), 0);

  // Save Complete Quiz
  const handleSaveQuiz = async () => {
    if (questions.length === 0) {
      setToast({ type: 'error', message: 'You must add at least one question before saving.' });
      return;
    }

    setSaving(true);
    setToast({ type: '', message: '' });

    const token = localStorage.getItem('token');
    try {
      // 1. Create quiz entity
      const createRes = await fetch('http://localhost:5000/quizzes/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          classroomId: id,
          timeLimitMinutes: Number(timeLimitMinutes) || 30
        })
      });

      const createData = await createRes.json();
      if (!createRes.ok) {
        throw new Error(createData.msg || 'Failed to create quiz');
      }

      const quizId = createData.quiz?.id || createData.quiz?._id;

      // 2. Add questions in bulk
      const bulkRes = await fetch(`http://localhost:5000/quizzes/${quizId}/bulk-add-questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          questions: questions.map(q => ({
            questionText: q.questionText,
            options: q.options.map(opt => ({ text: opt.text })),
            correctOptionIndex: q.correctOptionIndex,
            marks: q.marks || 1
          }))
        })
      });

      if (!bulkRes.ok) {
        // Fallback: Add individually if bulk route was not found
        for (const q of questions) {
          await fetch(`http://localhost:5000/quizzes/${quizId}/add-question`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              questionText: q.questionText,
              options: q.options.map(opt => ({ text: opt.text, isCorrect: opt.isCorrect })),
              correctOptionIndex: q.correctOptionIndex,
              marks: q.marks || 1
            })
          });
        }
      }

      setToast({
        type: 'success',
        message: 'Quiz created successfully! Redirecting back to classroom...'
      });

      setTimeout(() => {
        router.push(`/classrooms/${id}`);
      }, 2000);
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Error saving quiz' });
    } finally {
      setSaving(false);
    }
  };

  if (loadingClass) {
    return (
      <>
        <Navbar />
        <div className={styles.pageWrapper}>
          <div className={styles.container} style={{ textAlign: 'center', paddingTop: '100px' }}>
            <Loader2 size={36} className={styles.spinner} color="#7c3aed" />
            <p style={{ marginTop: '14px', color: '#94a3b8' }}>Loading quiz builder...</p>
          </div>
        </div>
      </>
    );
  }

  if (authError) {
    return (
      <>
        <Navbar />
        <div className={styles.pageWrapper}>
          <div className={styles.container} style={{ textAlign: 'center', paddingTop: '80px' }}>
            <AlertCircle size={44} color="#ef4444" style={{ margin: '0 auto 16px auto' }} />
            <h2 style={{ color: '#ef4444' }}>Unauthorized</h2>
            <p style={{ color: '#94a3b8', marginBottom: '24px' }}>{authError}</p>
            <Link href={`/classrooms/${id}`} className={styles.secondaryBtn}>
              Back to Classroom
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className={styles.pageWrapper}>
        <div className={styles.container}>
          <Link href={`/classrooms/${id}`} className={styles.backLink}>
            <ArrowLeft size={16} />
            <span>Back to Classroom</span>
          </Link>

          <div className={styles.pageHeader}>
            <div className={styles.titleArea}>
              <h1 className={styles.pageTitle}>Create New Quiz</h1>
              <p className={styles.pageSubtitle}>
                Design an interactive assessment for your students with AI assistance or manual drafting
              </p>
            </div>

            {/* Wizard Progress Indicator */}
            <div className={styles.wizardProgress}>
              <div className={`${styles.stepBubble} ${step === 1 ? styles.stepActive : styles.stepCompleted}`}>
                {step > 1 ? <Check size={14} /> : <span>1</span>}
                <span>Quiz Details</span>
              </div>
              <div className={styles.stepLine} />
              <div className={`${styles.stepBubble} ${step === 2 ? styles.stepActive : ''}`}>
                <span>2</span>
                <span>Questions ({questions.length})</span>
              </div>
            </div>
          </div>

          {toast.message && (
            <div className={`${styles.statusToast} ${toast.type === 'success' ? styles.statusToastSuccess : styles.statusToastError}`}>
              {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              <span>{toast.message}</span>
            </div>
          )}

          {/* STEP 1: Quiz Details */}
          {step === 1 && (
            <div className={styles.card}>
              <form onSubmit={handleProceedToStep2} className={styles.formGrid}>
                <div className={styles.inputGroup}>
                  <label htmlFor="quiz-title" className={styles.label}>
                    <span>Quiz Title *</span>
                  </label>
                  <input
                    id="quiz-title"
                    type="text"
                    className={styles.input}
                    placeholder="e.g., Mid-Term Physics Assessment: Mechanics & Gravitation"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="quiz-desc" className={styles.label}>
                    <span>Description (Optional)</span>
                    <span className={styles.labelHint}>Shown to students before starting</span>
                  </label>
                  <textarea
                    id="quiz-desc"
                    className={styles.textarea}
                    placeholder="Provide context, instructions, or rules for this assessment..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="quiz-time" className={styles.label}>
                    <span>Time Limit (Minutes) *</span>
                    <span className={styles.labelHint}>Default: 30 minutes</span>
                  </label>
                  <input
                    id="quiz-time"
                    type="number"
                    min="1"
                    max="300"
                    className={styles.input}
                    value={timeLimitMinutes}
                    onChange={(e) => setTimeLimitMinutes(e.target.value)}
                    required
                  />
                </div>

                <div className={styles.wizardFooter}>
                  <Link href={`/classrooms/${id}`} className={styles.secondaryBtn}>
                    Cancel
                  </Link>
                  <button type="submit" className={styles.primaryBtn}>
                    <span>Continue to Questions</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 2: Add Questions */}
          {step === 2 && (
            <div className={styles.card}>
              {/* Mode Switcher */}
              <div className={styles.modeTabs}>
                <button
                  type="button"
                  onClick={() => setMode('ai')}
                  className={`${styles.modeTabBtn} ${mode === 'ai' ? styles.modeTabAiActive : ''}`}
                >
                  <Sparkles size={16} className={styles.aiSparkleIcon} />
                  <span>✨ AI Generate</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMode('manual')}
                  className={`${styles.modeTabBtn} ${mode === 'manual' ? styles.modeTabActive : ''}`}
                >
                  <FileText size={16} />
                  <span>✏️ Manual Drafting</span>
                </button>
              </div>

              {/* AI GENERATOR PANEL */}
              {mode === 'ai' && (
                <div className={styles.aiPanel}>
                  <div className={styles.aiPanelGlow} />
                  <div className={styles.aiHeader}>
                    <h3 className={styles.aiTitle}>
                      <Sparkles size={18} className={styles.aiSparkleIcon} />
                      AI Question Generator
                    </h3>
                  </div>

                  <form onSubmit={handleAiGenerate} className={styles.aiFormGrid}>
                    <div className={styles.inputGroup}>
                      <label className={styles.label}>Topic / Syllabus</label>
                      <input
                        type="text"
                        className={styles.input}
                        placeholder="e.g., Newton's Laws of Motion and Equilibrium"
                        value={aiTopic}
                        onChange={(e) => setAiTopic(e.target.value)}
                        disabled={generatingAi}
                        required
                      />
                    </div>

                    <div className={styles.inputGroup}>
                      <label className={styles.label}>Questions (1-15)</label>
                      <input
                        type="number"
                        min="1"
                        max="15"
                        className={styles.input}
                        value={aiCount}
                        onChange={(e) => setAiCount(e.target.value)}
                        disabled={generatingAi}
                        required
                      />
                    </div>

                    <div className={styles.inputGroup}>
                      <label className={styles.label}>Difficulty</label>
                      <select
                        className={styles.select}
                        value={aiDifficulty}
                        onChange={(e) => setAiDifficulty(e.target.value)}
                        disabled={generatingAi}
                      >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                    </div>

                    <div style={{ gridColumn: '1 / -1', marginTop: '4px' }}>
                      <button
                        type="submit"
                        className={styles.aiGenerateBtn}
                        disabled={generatingAi}
                        style={{ width: '100%' }}
                      >
                        {generatingAi ? (
                          <>
                            <Loader2 size={18} className={styles.spinner} />
                            <span>Generating quiz with AI...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles size={18} />
                            <span>✨ Generate with AI</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* MANUAL QUESTION ADD BUTTON & INLINE FORM */}
              <div style={{ marginBottom: '24px' }}>
                {!showManualForm ? (
                  <button
                    type="button"
                    onClick={() => setShowManualForm(true)}
                    className={styles.secondaryBtn}
                  >
                    <Plus size={16} />
                    <span>+ Add Manual Question</span>
                  </button>
                ) : (
                  <form onSubmit={handleAddManualQuestion} className={styles.inlineFormCard}>
                    <h4 className={styles.inlineFormTitle}>
                      <Plus size={16} /> Add Custom MCQ Question
                    </h4>

                    <div className={styles.inputGroup}>
                      <label className={styles.label}>Question Text *</label>
                      <textarea
                        className={styles.textarea}
                        placeholder="Type question statement here..."
                        value={manualQuestionText}
                        onChange={(e) => setManualQuestionText(e.target.value)}
                        required
                      />
                    </div>

                    <div className={styles.inputGroup}>
                      <label className={styles.label}>
                        <span>Options (Select the correct radio button) *</span>
                      </label>
                      <div className={styles.optionsEditorGrid}>
                        {manualOptions.map((opt, i) => (
                          <div 
                            key={i} 
                            className={`${styles.optionInputRow} ${manualCorrectIndex === i ? styles.optionInputRowSelected : ''}`}
                          >
                            <input
                              type="radio"
                              name="manual-correct"
                              className={styles.radioInput}
                              checked={manualCorrectIndex === i}
                              onChange={() => setManualCorrectIndex(i)}
                            />
                            <input
                              type="text"
                              className={styles.optionText}
                              placeholder={`Option ${String.fromCharCode(65 + i)}`}
                              value={opt}
                              onChange={(e) => {
                                const newOpts = [...manualOptions];
                                newOpts[i] = e.target.value;
                                setManualOptions(newOpts);
                              }}
                              required
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '14px' }}>
                      <div className={styles.inputGroup}>
                        <label className={styles.label}>Marks</label>
                        <input
                          type="number"
                          min="1"
                          max="20"
                          className={styles.input}
                          value={manualMarks}
                          onChange={(e) => setManualMarks(e.target.value)}
                        />
                      </div>

                      <div className={styles.inputGroup}>
                        <label className={styles.label}>Explanation (Optional)</label>
                        <input
                          type="text"
                          className={styles.input}
                          placeholder="Brief reason for the correct answer"
                          value={manualExplanation}
                          onChange={(e) => setManualExplanation(e.target.value)}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                      <button
                        type="button"
                        onClick={() => setShowManualForm(false)}
                        className={styles.secondaryBtn}
                      >
                        Cancel
                      </button>
                      <button type="submit" className={styles.primaryBtn}>
                        Save Question Locally
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* QUESTIONS LIST SECTION */}
              <div className={styles.questionsListSection}>
                <div className={styles.listHeaderBar}>
                  <h3 className={styles.listTitle}>
                    <HelpCircle size={18} color="#7c3aed" />
                    Quiz Questions ({questions.length})
                  </h3>
                  <div className={styles.statsPreviewBadge}>
                    Total Marks: <strong style={{ color: '#c4b5fd' }}>{totalMarksPreview}</strong>
                  </div>
                </div>

                {questions.length === 0 ? (
                  <div className={styles.emptyQuestionsNotice}>
                    No questions added yet. Use "AI Generate" above or click "+ Add Manual Question" to get started.
                  </div>
                ) : (
                  questions.map((q, qIdx) => (
                    <div key={qIdx} className={styles.questionCard}>
                      <div className={styles.questionTop}>
                        <span className={styles.questionNumberBadge}>
                          Question {qIdx + 1}
                        </span>

                        <div className={styles.questionActions}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#94a3b8' }}>
                            <span>Marks:</span>
                            <input
                              type="number"
                              min="1"
                              max="20"
                              value={q.marks || 1}
                              onChange={(e) => updateQuestionMarks(qIdx, e.target.value)}
                              style={{
                                width: '48px',
                                padding: '3px 6px',
                                background: 'rgba(0,0,0,0.4)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '4px',
                                color: '#f1f5f9',
                                textAlign: 'center'
                              }}
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => deleteQuestion(qIdx)}
                            className={`${styles.iconBtn} ${styles.deleteBtn}`}
                            title="Delete Question"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>

                      {/* Editable Question Text */}
                      <input
                        type="text"
                        className={styles.questionTextInput}
                        value={q.questionText}
                        onChange={(e) => updateQuestionText(qIdx, e.target.value)}
                        placeholder="Question statement"
                      />

                      {/* 4 Editable Options with Correct Indicator */}
                      <div className={styles.optionsDisplayGrid}>
                        {q.options.map((opt, optIdx) => {
                          const isCorrect = q.correctOptionIndex === optIdx;
                          return (
                            <div
                              key={optIdx}
                              className={`${styles.optionDisplayItem} ${isCorrect ? styles.optionDisplayCorrect : ''}`}
                            >
                              <input
                                type="radio"
                                name={`correct-${qIdx}`}
                                checked={isCorrect}
                                onChange={() => updateCorrectOption(qIdx, optIdx)}
                                className={styles.radioInput}
                                title="Set as correct answer"
                              />
                              <input
                                type="text"
                                value={opt.text}
                                onChange={(e) => updateQuestionOption(qIdx, optIdx, e.target.value)}
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  color: 'inherit',
                                  flex: 1,
                                  fontSize: '0.88rem'
                                }}
                              />
                              {isCorrect && <Check size={14} color="#10b981" />}
                            </div>
                          );
                        })}
                      </div>

                      {/* AI Explanation Box if available */}
                      {q.explanation && (
                        <div className={styles.explanationBox}>
                          <Info size={15} style={{ flexShrink: 0, marginTop: '2px' }} />
                          <span><strong>Explanation:</strong> {q.explanation}</span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* STEP 2 FOOTER */}
              <div className={styles.wizardFooter}>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className={styles.secondaryBtn}
                  disabled={saving}
                >
                  <ArrowLeft size={16} />
                  <span>Back to Details</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveQuiz}
                  className={styles.primaryBtn}
                  disabled={saving || questions.length === 0}
                >
                  {saving ? (
                    <>
                      <Loader2 size={16} className={styles.spinner} />
                      <span>Saving Quiz...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      <span>Save & Publish Quiz ({questions.length} questions)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
