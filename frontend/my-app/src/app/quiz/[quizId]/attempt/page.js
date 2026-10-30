'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/navbar/Navbar';
import styles from './QuizAttempt.module.css';
import { 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  Loader2, 
  BarChart3, 
  ArrowLeft 
} from 'lucide-react';

export default function QuizAttemptPage() {
  const router = useRouter();
  const { quizId } = useParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);

  const [attemptId, setAttemptId] = useState(null);
  const [quizTitle, setQuizTitle] = useState('Quiz Assessment');
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Map of questionId -> selectedOptionIndex
  const [selectedAnswers, setSelectedAnswers] = useState({});

  // Timer in seconds
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef(null);

  // Submission & Modal state
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Submit attempt function
  const submitAttempt = useCallback(async (forcedAnswers = null) => {
    if (submitting) return;

    const answersState = forcedAnswers || selectedAnswers;
    const token = localStorage.getItem('token');
    if (!token || !attemptId) return;

    setSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);

    try {
      const answersPayload = questions
        .filter(q => answersState[q._id] !== undefined)
        .map(q => ({
          question: q._id,
          selectedOptionIndex: answersState[q._id]
        }));

      const res = await fetch(`http://localhost:5000/attempts/${attemptId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ answers: answersPayload })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.msg || 'Submission failed');
      }

      router.push(`/quiz/${quizId}/results`);
    } catch (err) {
      console.error('Submit error:', err);
      setError(err.message || 'Error submitting attempt');
      setSubmitting(false);
    }
  }, [attemptId, questions, selectedAnswers, submitting, quizId, router]);

  // Start attempt on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const startQuiz = async () => {
      setLoading(true);
      setError('');

      try {
        const res = await fetch(`http://localhost:5000/attempts/${quizId}/start`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await res.json();

        if (!res.ok) {
          if (data.msg && data.msg.toLowerCase().includes('already submitted')) {
            setAlreadySubmitted(true);
            setLoading(false);
            return;
          }
          throw new Error(data.msg || 'Unable to start quiz');
        }

        setAttemptId(data.attemptId);
        setQuizTitle(data.quizTitle || 'Quiz Assessment');
        setQuestions(data.questions || []);

        const initialSeconds = (data.timeLimitMinutes || 30) * 60;
        setTimeLeft(initialSeconds);
      } catch (err) {
        setError(err.message || 'Failed to start quiz session');
      } finally {
        setLoading(false);
      }
    };

    if (quizId) {
      startQuiz();
    }
  }, [quizId, router]);

  // Timer countdown hook using useRef
  useEffect(() => {
    if (timeLeft <= 0 || !attemptId || submitting) return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          submitAttempt();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timeLeft, attemptId, submitting, submitAttempt]);

  // Format time remaining
  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (optIndex) => {
    const currentQ = questions[currentIndex];
    if (!currentQ) return;
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQ._id]: optIndex
    }));
  };

  // Already submitted state
  if (alreadySubmitted) {
    return (
      <>
        <Navbar />
        <div className={styles.centerScreen}>
          <CheckCircle2 size={54} color="#10b981" />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '8px 0' }}>Quiz Already Completed</h2>
          <p style={{ color: '#94a3b8', maxWidth: '420px', marginBottom: '20px' }}>
            You have already submitted your answers for this quiz. You can review your final score and detailed breakdown now.
          </p>
          <Link href={`/quiz/${quizId}/results`} className={styles.submitHeaderBtn}>
            <BarChart3 size={16} style={{ display: 'inline', marginRight: '6px' }} />
            View My Results
          </Link>
        </div>
      </>
    );
  }

  // Loading state
  if (loading) {
    return (
      <>
        <Navbar />
        <div className={styles.centerScreen}>
          <Loader2 size={44} className={styles.spinner} />
          <p style={{ color: '#94a3b8', marginTop: '12px' }}>Preparing quiz questions...</p>
        </div>
      </>
    );
  }

  // Error state
  if (error && !attemptId) {
    return (
      <>
        <Navbar />
        <div className={styles.centerScreen}>
          <AlertCircle size={50} color="#ef4444" />
          <h2 style={{ color: '#ef4444', margin: '8px 0' }}>Error Starting Quiz</h2>
          <p style={{ color: '#94a3b8', maxWidth: '420px', marginBottom: '20px' }}>{error}</p>
          <button onClick={() => router.back()} className={styles.navBtn}>
            <ArrowLeft size={16} /> Return Back
          </button>
        </div>
      </>
    );
  }

  const currentQ = questions[currentIndex] || {};
  // Handle backend sending `option` or `options`
  const currentOptions = currentQ.option || currentQ.options || [];
  const selectedOptionIndex = selectedAnswers[currentQ._id];
  const answeredCount = Object.keys(selectedAnswers).length;
  const isTimerCritical = timeLeft < 60;

  return (
    <>
      <Navbar />
      <div className={styles.pageWrapper}>
        <div className={styles.attemptLayout}>
          {/* Header Bar */}
          <header className={styles.quizHeader}>
            <div className={styles.headerLeft}>
              <h1 className={styles.quizTitle}>{quizTitle}</h1>
              <span className={styles.progressInfo}>
                Question {currentIndex + 1} of {questions.length} • {answeredCount} answered
              </span>
            </div>

            <div className={styles.headerRight}>
              <div className={`${styles.timerBadge} ${isTimerCritical ? styles.timerCritical : ''}`}>
                <Clock size={18} />
                <span>{formatTimer(timeLeft)}</span>
              </div>

              <button
                type="button"
                onClick={() => setShowConfirmModal(true)}
                className={styles.submitHeaderBtn}
                disabled={submitting}
              >
                Submit Quiz
              </button>
            </div>
          </header>

          {/* Main Content: Question Box & Navigator */}
          <div className={styles.mainGrid}>
            {/* Left: Active Question Box */}
            <main className={styles.questionBox}>
              <div>
                <div className={styles.questionMetaBar}>
                  <span className={styles.questionBadge}>
                    Question {currentIndex + 1}
                  </span>
                  <span className={styles.marksBadge}>
                    {currentQ.marks || 1} {(currentQ.marks || 1) === 1 ? 'Mark' : 'Marks'}
                  </span>
                </div>

                <h2 className={styles.questionText}>
                  {currentQ.questionText || 'Loading question...'}
                </h2>

                {/* 4 Options Cards */}
                <div className={styles.optionsList}>
                  {currentOptions.map((opt, idx) => {
                    const isSelected = selectedOptionIndex === idx;
                    const letter = String.fromCharCode(65 + idx);
                    const optText = typeof opt === 'string' ? opt : (opt.text || '');

                    return (
                      <div
                        key={idx}
                        className={`${styles.optionCard} ${isSelected ? styles.optionCardSelected : ''}`}
                        onClick={() => handleSelectOption(idx)}
                      >
                        <div className={`${styles.optionLetterBadge} ${isSelected ? styles.optionLetterSelected : ''}`}>
                          {letter}
                        </div>
                        <span className={styles.optionTextLabel}>{optText}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Prev / Next controls */}
              <div className={styles.navControls}>
                <button
                  type="button"
                  onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                  disabled={currentIndex === 0 || submitting}
                  className={styles.navBtn}
                >
                  <ChevronLeft size={18} />
                  <span>Previous</span>
                </button>

                {currentIndex < questions.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                    disabled={submitting}
                    className={`${styles.navBtn} ${styles.nextBtn}`}
                  >
                    <span>Next</span>
                    <ChevronRight size={18} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowConfirmModal(true)}
                    disabled={submitting}
                    className={styles.submitHeaderBtn}
                  >
                    Review & Submit
                  </button>
                )}
              </div>
            </main>

            {/* Right: Question Navigator Grid */}
            <aside className={styles.navigatorBox}>
              <h3 className={styles.navigatorTitle}>
                <span>Question Grid</span>
                <span className={styles.answeredCount}>
                  {answeredCount}/{questions.length}
                </span>
              </h3>

              <div className={styles.navigatorGrid}>
                {questions.map((q, idx) => {
                  const isAnswered = selectedAnswers[q._id] !== undefined;
                  const isCurrent = currentIndex === idx;

                  return (
                    <button
                      key={q._id || idx}
                      type="button"
                      onClick={() => setCurrentIndex(idx)}
                      className={`
                        ${styles.navNumBtn} 
                        ${isAnswered ? styles.navNumAnswered : ''} 
                        ${isCurrent ? styles.navNumCurrent : ''}
                      `}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              <div className={styles.legendBar}>
                <div className={styles.legendItem}>
                  <div className={`${styles.legendDot} ${styles.legendDotAnswered}`} />
                  <span>Answered</span>
                </div>
                <div className={styles.legendItem}>
                  <div className={`${styles.legendDot} ${styles.legendDotUnanswered}`} />
                  <span>Unanswered</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowConfirmModal(true)}
                className={styles.submitAllBtn}
                disabled={submitting}
              >
                Submit Attempt
              </button>
            </aside>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalCard}>
            <h3 className={styles.modalTitle}>Confirm Submission</h3>
            <p className={styles.modalDesc}>
              Are you sure you want to finalize and submit your answers? Once submitted, you cannot change your choices.
            </p>

            <div className={styles.modalStats}>
              <div className={styles.modalStatItem}>
                <span className={styles.modalStatVal} style={{ color: '#10b981' }}>
                  {answeredCount}
                </span>
                <span className={styles.modalStatLabel}>Answered</span>
              </div>
              <div className={styles.modalStatItem}>
                <span className={styles.modalStatVal} style={{ color: '#f59e0b' }}>
                  {questions.length - answeredCount}
                </span>
                <span className={styles.modalStatLabel}>Unanswered</span>
              </div>
              <div className={styles.modalStatItem}>
                <span className={styles.modalStatVal}>
                  {questions.length}
                </span>
                <span className={styles.modalStatLabel}>Total</span>
              </div>
            </div>

            <div className={styles.modalActions}>
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className={styles.modalCancelBtn}
                disabled={submitting}
              >
                Back to Quiz
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowConfirmModal(false);
                  submitAttempt();
                }}
                className={styles.modalConfirmBtn}
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Yes, Submit Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
