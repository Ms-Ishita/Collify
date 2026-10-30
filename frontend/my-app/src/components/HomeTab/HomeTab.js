'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './Home.module.css';
import { 
  Copy, 
  Check, 
  Users, 
  Sparkles, 
  FileText, 
  ClipboardList, 
  ArrowRight, 
  GraduationCap, 
  ShieldCheck, 
  BookOpen 
} from 'lucide-react';

export default function HomeTab({ 
  classroom, 
  userRole = 'student', 
  onPostCreated, 
  onNavigateTab 
}) {
  const [copied, setCopied] = useState(false);

  if (!classroom) return null;

  const handleCopyCode = async () => {
    if (!classroom.joinCode) return;
    try {
      await navigator.clipboard.writeText(classroom.joinCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy join code', e);
    }
  };

  const studentCount = classroom.students?.length || 0;
  const teacherUsername = classroom.teacher?.username || 'Teacher';

  return (
    <div className={styles.homeContainer}>
      {/* Hero Classroom Banner Card */}
      <div className={styles.heroCard}>
        <div className={styles.heroGlow} />

        <div className={styles.heroTopRow}>
          <span className={`${styles.roleBadge} ${userRole === 'teacher' ? styles.badgeTeacher : styles.badgeStudent}`}>
            {userRole === 'teacher' ? (
              <>
                <ShieldCheck size={14} /> Teacher Mode
              </>
            ) : (
              <>
                <GraduationCap size={14} /> Student Mode
              </>
            )}
          </span>

          {classroom.joinCode && (
            <button 
              type="button" 
              onClick={handleCopyCode} 
              className={styles.copyCodeBtn}
              title="Click to copy join code"
            >
              <span>Join Code:</span>
              <span className={styles.codeHighlight}>{classroom.joinCode}</span>
              {copied ? (
                <>
                  <Check size={14} color="#10b981" />
                  <span className={styles.copiedToast}>Copied!</span>
                </>
              ) : (
                <Copy size={14} />
              )}
            </button>
          )}
        </div>

        <h1 className={styles.classroomTitle}>{classroom.name}</h1>

        <p className={styles.teacherInfo}>
          <BookOpen size={16} color="#94a3b8" />
          <span>Instructed by <strong className={styles.teacherName}>{teacherUsername}</strong></span>
        </p>

        <div className={styles.statsBar}>
          <div className={styles.statItem}>
            <div className={styles.statIconWrapper}>
              <Users size={18} />
            </div>
            <div className={styles.statData}>
              <span className={styles.statValue}>
                {studentCount} {studentCount === 1 ? 'Student' : 'Students'}
              </span>
              <span className={styles.statLabel}>Enrolled in classroom</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Quick Actions</h2>
        </div>

        <div className={styles.actionsGrid}>
          {userRole === 'teacher' ? (
            <>
              <Link 
                href={`/classrooms/${classroom._id}/quiz/create`} 
                className={`${styles.actionCard} ${styles.actionCardPurple}`}
              >
                <div className={`${styles.actionIconBox} ${styles.iconBoxPurple}`}>
                  <Sparkles size={22} />
                </div>
                <h3 className={styles.actionTitle}>
                  Create New Quiz
                  <ArrowRight size={16} className={styles.actionArrow} />
                </h3>
                <p className={styles.actionDescription}>
                  Craft MCQ questions manually or use AI to generate complete quizzes with explanations instantly.
                </p>
              </Link>

              <button 
                type="button" 
                onClick={() => onNavigateTab && onNavigateTab('Posts')}
                className={`${styles.actionCard} ${styles.actionCardCyan}`}
              >
                <div className={`${styles.actionIconBox} ${styles.iconBoxCyan}`}>
                  <FileText size={22} />
                </div>
                <h3 className={styles.actionTitle}>
                  Create New Post
                  <ArrowRight size={16} className={styles.actionArrow} />
                </h3>
                <p className={styles.actionDescription}>
                  Publish announcements, upload lecture PDF notes, or schedule live Google Meet sessions.
                </p>
              </button>

              <button 
                type="button" 
                onClick={() => onNavigateTab && onNavigateTab('People')}
                className={`${styles.actionCard} ${styles.actionCardEmerald}`}
              >
                <div className={`${styles.actionIconBox} ${styles.iconBoxEmerald}`}>
                  <Users size={22} />
                </div>
                <h3 className={styles.actionTitle}>
                  View Class Roster
                  <ArrowRight size={16} className={styles.actionArrow} />
                </h3>
                <p className={styles.actionDescription}>
                  Inspect enrolled students, verify roster count, and check classroom participant emails.
                </p>
              </button>
            </>
          ) : (
            <>
              <button 
                type="button" 
                onClick={() => onNavigateTab && onNavigateTab('Quizzes')}
                className={`${styles.actionCard} ${styles.actionCardPurple}`}
              >
                <div className={`${styles.actionIconBox} ${styles.iconBoxPurple}`}>
                  <ClipboardList size={22} />
                </div>
                <h3 className={styles.actionTitle}>
                  Take Quizzes
                  <ArrowRight size={16} className={styles.actionArrow} />
                </h3>
                <p className={styles.actionDescription}>
                  Attempt scheduled quizzes, test your knowledge, and inspect instant scoring breakdowns.
                </p>
              </button>

              <button 
                type="button" 
                onClick={() => onNavigateTab && onNavigateTab('Posts')}
                className={`${styles.actionCard} ${styles.actionCardCyan}`}
              >
                <div className={`${styles.actionIconBox} ${styles.iconBoxCyan}`}>
                  <FileText size={22} />
                </div>
                <h3 className={styles.actionTitle}>
                  Class Activity & Stream
                  <ArrowRight size={16} className={styles.actionArrow} />
                </h3>
                <p className={styles.actionDescription}>
                  Stay updated with teacher announcements, download study material, and join live meet calls.
                </p>
              </button>

              <button 
                type="button" 
                onClick={() => onNavigateTab && onNavigateTab('People')}
                className={`${styles.actionCard} ${styles.actionCardEmerald}`}
              >
                <div className={`${styles.actionIconBox} ${styles.iconBoxEmerald}`}>
                  <Users size={22} />
                </div>
                <h3 className={styles.actionTitle}>
                  Class Members
                  <ArrowRight size={16} className={styles.actionArrow} />
                </h3>
                <p className={styles.actionDescription}>
                  Connect with fellow classmates and see teacher contact details for this course.
                </p>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}