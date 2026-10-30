'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import styles from './QuizTab.module.css';
import { 
  ClipboardList, 
  Plus, 
  Clock, 
  Award, 
  HelpCircle, 
  CheckCircle2, 
  Play, 
  BarChart3, 
  AlertCircle, 
  Calendar,
  Sparkles
} from 'lucide-react';

export default function QuizTab({ classroomId, userRole = 'student' }) {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attemptedMap, setAttemptedMap] = useState({});

  const fetchQuizzes = useCallback(async () => {
    if (!classroomId) return;
    setLoading(true);
    setError('');

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5000/quizzes/classroom/${classroomId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.msg || 'Failed to fetch quizzes');
      }

      const quizList = data.quizzes || [];
      setQuizzes(quizList);

      // If student, check which quizzes have already been attempted
      if (userRole === 'student' && quizList.length > 0) {
        const attemptResults = await Promise.all(
          quizList.map(async (q) => {
            try {
              const attemptRes = await fetch(`http://localhost:5000/attempts/${q._id}/my-result`, {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              });
              if (attemptRes.ok) {
                const attemptData = await attemptRes.json();
                return { id: q._id, hasAttempt: !!(attemptData.success && attemptData.attempt) };
              }
            } catch (e) {
              // Ignore individual attempt check errors
            }
            return { id: q._id, hasAttempt: false };
          })
        );

        const newMap = {};
        attemptResults.forEach(item => {
          newMap[item.id] = item.hasAttempt;
        });
        setAttemptedMap(newMap);
      }
    } catch (err) {
      setError(err.message || 'Error loading quizzes');
    } finally {
      setLoading(false);
    }
  }, [classroomId, userRole]);

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  return (
    <div className={styles.quizContainer}>
      <div className={styles.topBar}>
        <div className={styles.topBarLeft}>
          <h2 className={styles.sectionTitle}>Quizzes & Assessments</h2>
          <span className={styles.quizCountBadge}>
            {quizzes.length} {quizzes.length === 1 ? 'quiz' : 'quizzes'}
          </span>
        </div>

        {userRole === 'teacher' && (
          <Link 
            href={`/classrooms/${classroomId}/quiz/create`} 
            className={styles.createQuizBtn}
          >
            <Plus size={16} />
            <span>Create Quiz</span>
          </Link>
        )}
      </div>

      {loading ? (
        <div className={styles.loadingSkeleton}>
          <div className={styles.skeletonCard} />
          <div className={styles.skeletonCard} />
        </div>
      ) : error ? (
        <div className={styles.errorState}>
          <AlertCircle size={32} />
          <p>{error}</p>
          <button onClick={fetchQuizzes} className={styles.retryBtn}>
            Try Again
          </button>
        </div>
      ) : quizzes.length === 0 ? (
        <div className={styles.emptyState}>
          <ClipboardList size={48} className={styles.emptyIcon} />
          <h3 className={styles.emptyTitle}>No quizzes yet</h3>
          <p className={styles.emptyText}>
            {userRole === 'teacher'
              ? 'Create your first quiz with AI generation or craft questions manually to assess your students.'
              : 'There are no active or scheduled quizzes in this classroom at the moment.'}
          </p>
          {userRole === 'teacher' && (
            <Link 
              href={`/classrooms/${classroomId}/quiz/create`} 
              className={styles.createQuizBtn}
              style={{ marginTop: '12px' }}
            >
              <Sparkles size={16} />
              <span>Create First Quiz</span>
            </Link>
          )}
        </div>
      ) : (
        <div className={styles.quizzesGrid}>
          {quizzes.map((quiz) => {
            const isAttempted = attemptedMap[quiz._id] || false;
            const questionCount = quiz.questions?.length || 0;
            const totalMarks = quiz.totalMarks || (questionCount * 1);
            const timeLimit = quiz.timeLimitMinutes || 30;
            const formattedDate = quiz.createdAt
              ? new Date(quiz.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })
              : 'Recent';

            return (
              <div key={quiz._id} className={styles.quizCard}>
                <div className={styles.cardGradientAccent} />

                <div className={styles.cardHeader}>
                  <h3 className={styles.quizTitle}>{quiz.title}</h3>
                  <div className={styles.statusBadges}>
                    {userRole === 'student' && isAttempted && (
                      <span className={styles.attemptedBadge}>
                        <CheckCircle2 size={13} /> Completed
                      </span>
                    )}
                    <span className={quiz.isActive !== false ? styles.activeBadge : styles.inactiveBadge}>
                      {quiz.isActive !== false ? 'Active' : 'Closed'}
                    </span>
                  </div>
                </div>

                {quiz.description && (
                  <p className={styles.quizDescription}>{quiz.description}</p>
                )}

                <div className={styles.quizMetaBar}>
                  <div className={styles.metaItem}>
                    <HelpCircle size={15} className={styles.metaIcon} />
                    <span>{questionCount} {questionCount === 1 ? 'Question' : 'Questions'}</span>
                  </div>

                  <div className={styles.metaItem}>
                    <Award size={15} className={styles.metaIcon} />
                    <span>{totalMarks} Total Marks</span>
                  </div>

                  <div className={styles.metaItem}>
                    <Clock size={15} className={styles.metaIcon} />
                    <span>{timeLimit} Mins Limit</span>
                  </div>
                </div>

                <div className={styles.cardFooter}>
                  <span className={styles.createdAtText}>
                    <Calendar size={13} />
                    <span>Created on {formattedDate}</span>
                  </span>

                  <div className={styles.actionButtons}>
                    {userRole === 'teacher' ? (
                      <Link
                        href={`/quiz/${quiz._id}/results`}
                        className={styles.resultsBtn}
                      >
                        <BarChart3 size={15} />
                        <span>View Results</span>
                      </Link>
                    ) : (
                      <>
                        {isAttempted ? (
                          <Link
                            href={`/quiz/${quiz._id}/results`}
                            className={styles.resultsBtn}
                          >
                            <BarChart3 size={15} />
                            <span>View My Result</span>
                          </Link>
                        ) : (
                          <Link
                            href={`/quiz/${quiz._id}/attempt`}
                            className={styles.attemptBtn}
                          >
                            <Play size={15} />
                            <span>Attempt Quiz</span>
                          </Link>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
