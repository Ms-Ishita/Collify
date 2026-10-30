'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/navbar/Navbar';
import styles from './QuizResults.module.css';
import { 
  CheckCircle2, 
  XCircle, 
  ArrowLeft, 
  Clock, 
  Award, 
  HelpCircle, 
  Check, 
  X, 
  Loader2, 
  AlertCircle,
  Users,
  BarChart3,
  TrendingUp,
  FileText,
  ChevronRight,
  Info
} from 'lucide-react';

export default function QuizResultsPage() {
  const router = useRouter();
  const { quizId } = useParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState(null);
  
  // Student view state
  const [attempt, setAttempt] = useState(null);
  const [quiz, setQuiz] = useState(null);

  // Teacher view state
  const [teacherData, setTeacherData] = useState(null);
  const [selectedStudentAttempt, setSelectedStudentAttempt] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      setError('');

      try {
        // 1. Identify user role
        const meRes = await fetch('http://localhost:5000/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const meData = await meRes.json();
        const role = meData?.user?.role || 'student';
        setUserRole(role);

        // Fetch quiz basic metadata
        try {
          const quizRes = await fetch(`http://localhost:5000/quizzes/${quizId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (quizRes.ok) {
            const quizData = await quizRes.json();
            setQuiz(quizData.quiz);
          }
        } catch (e) {
          console.error('Quiz details fetch failed:', e);
        }

        if (role === 'teacher') {
          // 2a. Teacher Flow: Fetch class leaderboard & all student attempts
          const teacherRes = await fetch(`http://localhost:5000/attempts/quiz/${quizId}/all`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const tData = await teacherRes.json();
          if (!teacherRes.ok) {
            throw new Error(tData.msg || 'Unable to load teacher results for this quiz');
          }
          setTeacherData(tData);
        } else {
          // 2b. Student Flow: Fetch student's own submission report
          const resultRes = await fetch(`http://localhost:5000/attempts/${quizId}/my-result`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const resultData = await resultRes.json();
          if (!resultRes.ok || !resultData.attempt) {
            throw new Error(resultData.msg || 'No submitted attempt found for this quiz');
          }
          setAttempt(resultData.attempt);
        }
      } catch (err) {
        setError(err.message || 'Error loading results');
      } finally {
        setLoading(false);
      }
    };

    if (quizId) {
      fetchResults();
    }
  }, [quizId, router]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className={styles.centerScreen}>
          <Loader2 size={44} className={styles.spinner} />
          <p style={{ color: '#94a3b8', marginTop: '12px' }}>Loading assessment score report...</p>
        </div>
      </>
    );
  }

  const classroomId = quiz?.classroom?._id || quiz?.classroom || teacherData?.classroomId;

  // ----------------------------------------------------
  // TEACHER VIEW: Class Results & Leaderboard Dashboard
  // ----------------------------------------------------
  if (userRole === 'teacher') {
    const attempts = teacherData?.attempts || [];
    const totalMarks = teacherData?.totalMarks || quiz?.totalMarks || 1;
    const title = teacherData?.quizTitle || quiz?.title || 'Quiz Assessment';

    // Summary Analytics
    const totalSubmissions = attempts.length;
    const scores = attempts.map(a => a.score || 0);
    const highestScore = scores.length > 0 ? Math.max(...scores) : 0;
    const lowestScore = scores.length > 0 ? Math.min(...scores) : 0;
    const avgScore = scores.length > 0 
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) 
      : 0;
    const avgPercentage = Math.round((avgScore / totalMarks) * 100);

    const getAvatarBg = (name) => {
      const colors = ['#7c3aed', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#3b82f6'];
      let hash = 0;
      for (let i = 0; i < (name || '').length; i++) hash += name.charCodeAt(i);
      return colors[Math.abs(hash) % colors.length];
    };

    return (
      <>
        <Navbar />
        <div className={styles.pageWrapper}>
          <div className={styles.container}>
            {/* Top Navigation Bar */}
            <div className={styles.topBar}>
              <Link 
                href={classroomId ? `/classrooms/${classroomId}` : '/dashboard'} 
                className={styles.backBtn}
              >
                <ArrowLeft size={16} /> Back to Classroom
              </Link>
              <div style={{ display: 'flex', gap: '10px' }}>
                <span className={styles.tagCorrect}>Teacher View</span>
              </div>
            </div>

            {/* Teacher Dashboard Header */}
            <div className={styles.teacherHeader}>
              <div>
                <span className={styles.quizSubtitle}>Assessment Performance</span>
                <h1 className={styles.quizTitle}>{title}</h1>
                <p style={{ color: '#94a3b8', marginTop: '6px', fontSize: '0.9rem' }}>
                  {totalSubmissions} {totalSubmissions === 1 ? 'student has' : 'students have'} submitted this assessment.
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Max Possible Marks</span>
                <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#f1f5f9' }}>{totalMarks}</div>
              </div>
            </div>

            {/* Analytics Stats Grid */}
            <div className={styles.teacherStatsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statIcon} style={{ background: 'rgba(124, 58, 237, 0.15)', color: '#a78bfa' }}>
                  <Users size={22} />
                </div>
                <div className={styles.statContent}>
                  <span className={styles.statValue}>{totalSubmissions}</span>
                  <span className={styles.statLabel}>Submissions</span>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon} style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
                  <Award size={22} />
                </div>
                <div className={styles.statContent}>
                  <span className={styles.statValue}>{highestScore} / {totalMarks}</span>
                  <span className={styles.statLabel}>Top Score</span>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon} style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#38bdf8' }}>
                  <TrendingUp size={22} />
                </div>
                <div className={styles.statContent}>
                  <span className={styles.statValue}>{avgPercentage}%</span>
                  <span className={styles.statLabel}>Class Average</span>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon} style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
                  <BarChart3 size={22} />
                </div>
                <div className={styles.statContent}>
                  <span className={styles.statValue}>{lowestScore} / {totalMarks}</span>
                  <span className={styles.statLabel}>Lowest Score</span>
                </div>
              </div>
            </div>

            {/* Student Submissions Leaderboard */}
            <div className={styles.leaderboardCard}>
              <div className={styles.leaderboardHeader}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#f8fafc', margin: 0 }}>
                  Student Leaderboard
                </h3>
                <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                  Sorted by Score (Highest First)
                </span>
              </div>

              {attempts.length === 0 ? (
                <div className={styles.emptyLeaderboard}>
                  <Users size={40} style={{ opacity: 0.4, marginBottom: '12px' }} />
                  <p style={{ fontWeight: '600', color: '#cbd5e1' }}>No submissions recorded yet</p>
                  <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    As soon as students complete and submit this quiz, their scores will appear here.
                  </p>
                </div>
              ) : (
                <div className={styles.tableResponsive}>
                  <table className={styles.resultsTable}>
                    <thead>
                      <tr>
                        <th style={{ width: '60px' }}>Rank</th>
                        <th>Student</th>
                        <th>Score</th>
                        <th>Percentage</th>
                        <th>Submitted At</th>
                        <th style={{ textAlign: 'right' }}>Review</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attempts.map((att, index) => {
                        const sScore = att.score || 0;
                        const sPct = Math.round((sScore / totalMarks) * 100);
                        const sName = att.student?.username || 'Student';
                        const sEmail = att.student?.email || 'N/A';
                        const sDate = att.submittedAt 
                          ? new Date(att.submittedAt).toLocaleDateString(undefined, {
                              month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                            })
                          : 'Recent';

                        let pctBg = 'rgba(239, 68, 68, 0.15)';
                        let pctColor = '#f87171';
                        if (sPct >= 70) {
                          pctBg = 'rgba(16, 185, 129, 0.15)';
                          pctColor = '#34d399';
                        } else if (sPct >= 50) {
                          pctBg = 'rgba(245, 158, 11, 0.15)';
                          pctColor = '#fbbf24';
                        }

                        let rankClass = styles.rankOther;
                        if (index === 0) rankClass = styles.rank1;
                        else if (index === 1) rankClass = styles.rank2;
                        else if (index === 2) rankClass = styles.rank3;

                        return (
                          <tr key={att._id || index}>
                            <td>
                              <span className={`${styles.rankBadge} ${rankClass}`}>
                                {index + 1}
                              </span>
                            </td>
                            <td>
                              <div className={styles.studentCell}>
                                <div className={styles.studentAvatar} style={{ background: getAvatarBg(sName) }}>
                                  {sName.charAt(0).toUpperCase()}
                                </div>
                                <div className={styles.studentInfo}>
                                  <span className={styles.studentName}>{sName}</span>
                                  <span className={styles.studentEmail}>{sEmail}</span>
                                </div>
                              </div>
                            </td>
                            <td style={{ fontWeight: '700', color: '#f1f5f9' }}>
                              {sScore} / {totalMarks}
                            </td>
                            <td>
                              <span className={styles.scoreBadge} style={{ background: pctBg, color: pctColor }}>
                                {sPct}%
                              </span>
                            </td>
                            <td style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                              {sDate}
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <button
                                type="button"
                                className={styles.reviewButton}
                                onClick={() => setSelectedStudentAttempt(selectedStudentAttempt?._id === att._id ? null : att)}
                              >
                                {selectedStudentAttempt?._id === att._id ? 'Close' : 'View Answers'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Student Answers Inspection Accordion for Teacher */}
            {selectedStudentAttempt && (
              <div className={styles.reviewSection} style={{ marginTop: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#a78bfa' }}>
                    Exam Breakdown: {selectedStudentAttempt.student?.username} ({selectedStudentAttempt.score} / {totalMarks} Marks)
                  </h3>
                  <button 
                    onClick={() => setSelectedStudentAttempt(null)}
                    className={styles.backBtn}
                    style={{ fontSize: '0.8rem', padding: '4px 10px' }}
                  >
                    Close Review
                  </button>
                </div>

                <div className={styles.questionsList}>
                  {(selectedStudentAttempt.answers || []).map((ans, idx) => {
                    const q = ans.question || {};
                    const selectedIdx = ans.selectedOptionIndex;
                    const correctIdx = q.correctOptionIndex;
                    const isCorrect = selectedIdx === correctIdx;
                    const options = q.options || [];

                    return (
                      <div key={idx} className={`${styles.questionCard} ${isCorrect ? styles.cardCorrect : styles.cardWrong}`}>
                        <div className={styles.questionHeader}>
                          <div className={styles.questionMetaLeft}>
                            <span className={styles.questionNumberBadge}>Q{idx + 1}</span>
                            <span className={isCorrect ? styles.badgeCorrect : styles.badgeWrong}>
                              {isCorrect ? <Check size={13} /> : <X size={13} />}
                              {isCorrect ? 'Correct' : 'Incorrect'}
                            </span>
                          </div>
                          <span className={styles.questionMarks}>{q.marks || 1} mark</span>
                        </div>

                        <p className={styles.questionText}>{q.questionText || 'Question item'}</p>

                        <div className={styles.optionsGrid}>
                          {options.map((opt, optIdx) => {
                            const isStudentPick = optIdx === selectedIdx;
                            const isRightAnswer = optIdx === correctIdx;

                            let optStyle = styles.optionItem;
                            if (isStudentPick && isRightAnswer) optStyle = `${styles.optionItem} ${styles.optionYourCorrect}`;
                            else if (isStudentPick && !isRightAnswer) optStyle = `${styles.optionItem} ${styles.optionYourWrong}`;
                            else if (isRightAnswer) optStyle = `${styles.optionItem} ${styles.optionCorrectNotice}`;

                            return (
                              <div key={optIdx} className={optStyle}>
                                <div className={styles.optionLeft}>
                                  <span className={styles.optionLetter}>{String.fromCharCode(65 + optIdx)}</span>
                                  <span>{typeof opt === 'string' ? opt : opt.text}</span>
                                </div>
                                <div>
                                  {isStudentPick && isRightAnswer && <span className={`${styles.optionTag} ${styles.tagCorrect}`}>Student's Answer ✓</span>}
                                  {isStudentPick && !isRightAnswer && <span className={`${styles.optionTag} ${styles.tagWrong}`}>Student's Answer ✗</span>}
                                  {!isStudentPick && isRightAnswer && <span className={`${styles.optionTag} ${styles.tagCorrect}`}>Correct Answer ✓</span>}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </>
    );
  }

  // ----------------------------------------------------
  // STUDENT VIEW: Individual Score Report
  // ----------------------------------------------------
  if (error || !attempt) {
    return (
      <>
        <Navbar />
        <div className={styles.centerScreen}>
          <AlertCircle size={48} color="#ef4444" />
          <h2 style={{ color: '#ef4444', margin: '8px 0' }}>Results Unavailable</h2>
          <p style={{ color: '#94a3b8', maxWidth: '420px', marginBottom: '20px' }}>
            {error || 'Unable to load attempt report for this assessment.'}
          </p>
          <button onClick={() => router.back()} className={styles.backBtn}>
            <ArrowLeft size={16} /> Go Back
          </button>
        </div>
      </>
    );
  }

  const score = attempt.score || 0;
  const totalMarks = attempt.totalMarks || quiz?.totalMarks || 1;
  const percentage = Math.round((score / totalMarks) * 100);

  let scoreColor = '#ef4444'; // Red < 50%
  let scoreGlow = 'rgba(239, 68, 68, 0.2)';
  if (percentage >= 70) {
    scoreColor = '#10b981'; // Green > 70%
    scoreGlow = 'rgba(16, 185, 129, 0.2)';
  } else if (percentage >= 50) {
    scoreColor = '#f59e0b'; // Yellow 50-70%
    scoreGlow = 'rgba(245, 158, 11, 0.2)';
  }

  const answers = attempt.answers || [];
  const correctCount = answers.filter(a => {
    const q = a.question;
    return q && a.selectedOptionIndex === q.correctOptionIndex;
  }).length;
  const incorrectCount = answers.length - correctCount;

  const formattedDate = attempt.submittedAt
    ? new Date(attempt.submittedAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'Recent';

  return (
    <>
      <Navbar />
      <div className={styles.pageWrapper}>
        <div className={styles.container}>
          {/* Navigation Bar */}
          <div className={styles.topBar}>
            <Link 
              href={classroomId ? `/classrooms/${classroomId}` : '/dashboard'} 
              className={styles.backBtn}
            >
              <ArrowLeft size={16} /> Back to Classroom
            </Link>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              Submitted on {formattedDate}
            </span>
          </div>

          {/* Top Score Card */}
          <div className={styles.scoreCard}>
            <div className={styles.scoreCardGlow} style={{ background: scoreGlow }} />

            <div className={styles.scoreInfo}>
              <span className={styles.quizSubtitle}>Assessment Results</span>
              <h1 className={styles.quizTitle}>
                {attempt.quiz?.title || quiz?.title || 'Quiz Assessment'}
              </h1>

              <div className={styles.scoreStatsRow}>
                <div className={styles.statPill}>
                  <Award size={16} color={scoreColor} />
                  <span><strong>{score}</strong> of {totalMarks} Marks</span>
                </div>

                <div className={styles.statPill}>
                  <CheckCircle2 size={16} color="#10b981" />
                  <span><strong>{correctCount}</strong> Correct</span>
                </div>

                <div className={styles.statPill}>
                  <XCircle size={16} color="#ef4444" />
                  <span><strong>{incorrectCount}</strong> Incorrect</span>
                </div>
              </div>
            </div>

            {/* Circular Percentage Meter */}
            <div className={styles.circleWrapper}>
              <div 
                className={styles.percentCircle}
                style={{ 
                  borderColor: scoreColor,
                  boxShadow: `0 0 24px ${scoreGlow}`
                }}
              >
                <span className={styles.percentText} style={{ color: scoreColor }}>
                  {percentage}%
                </span>
                <span className={styles.percentLabel}>Final Score</span>
              </div>
            </div>
          </div>

          {/* Detailed Question Review */}
          <div className={styles.reviewSection}>
            <div className={styles.reviewHeader}>
              <h2 className={styles.reviewTitle}>Question-by-Question Breakdown</h2>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                {answers.length} {answers.length === 1 ? 'Question' : 'Questions'} Total
              </span>
            </div>

            <div className={styles.questionsList}>
              {answers.map((item, idx) => {
                const q = item.question || {};
                const selectedIdx = item.selectedOptionIndex;
                const correctIdx = q.correctOptionIndex;
                const isCorrect = selectedIdx === correctIdx;
                const options = q.options || [];
                const marks = q.marks || 1;

                return (
                  <div 
                    key={idx} 
                    className={`${styles.questionCard} ${isCorrect ? styles.cardCorrect : styles.cardWrong}`}
                  >
                    <div className={styles.questionHeader}>
                      <div className={styles.questionMetaLeft}>
                        <span className={styles.questionNumberBadge}>Question {idx + 1}</span>
                        <span className={isCorrect ? styles.badgeCorrect : styles.badgeWrong}>
                          {isCorrect ? <Check size={14} /> : <X size={14} />}
                          {isCorrect ? 'Correct Answer' : 'Incorrect Answer'}
                        </span>
                      </div>
                      <span className={styles.questionMarks}>
                        {isCorrect ? `+${marks}` : '0'} / {marks} {marks === 1 ? 'Mark' : 'Marks'}
                      </span>
                    </div>

                    <p className={styles.questionText}>
                      {q.questionText || 'Question text not available'}
                    </p>

                    <div className={styles.optionsGrid}>
                      {options.map((opt, optIdx) => {
                        const optText = typeof opt === 'string' ? opt : opt?.text;
                        const isStudentPick = optIdx === selectedIdx;
                        const isRightAnswer = optIdx === correctIdx;

                        let optionClass = styles.optionItem;
                        if (isStudentPick && isRightAnswer) {
                          optionClass = `${styles.optionItem} ${styles.optionYourCorrect}`;
                        } else if (isStudentPick && !isRightAnswer) {
                          optionClass = `${styles.optionItem} ${styles.optionYourWrong}`;
                        } else if (isRightAnswer) {
                          optionClass = `${styles.optionItem} ${styles.optionCorrectNotice}`;
                        }

                        return (
                          <div key={optIdx} className={optionClass}>
                            <div className={styles.optionLeft}>
                              <span className={styles.optionLetter}>
                                {String.fromCharCode(65 + optIdx)}
                              </span>
                              <span>{optText}</span>
                            </div>

                            <div className={styles.optionTags}>
                              {isStudentPick && isRightAnswer && (
                                <span className={`${styles.optionTag} ${styles.tagCorrect}`}>
                                  Your Answer ✓
                                </span>
                              )}
                              {isStudentPick && !isRightAnswer && (
                                <span className={`${styles.optionTag} ${styles.tagWrong}`}>
                                  Your Choice ✗
                                </span>
                              )}
                              {!isStudentPick && isRightAnswer && (
                                <span className={`${styles.optionTag} ${styles.tagCorrect}`}>
                                  Correct Answer ✓
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {q.explanation && (
                      <div className={styles.explanationBox}>
                        <Info size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                        <div>
                          <strong>Explanation: </strong>
                          <span>{q.explanation}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
