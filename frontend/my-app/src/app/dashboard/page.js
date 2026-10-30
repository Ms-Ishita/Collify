'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  GraduationCap,
  Users,
  Plus,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  Shield,
  Layers,
} from 'lucide-react';
import Navbar from '@/components/navbar/Navbar';
import ClassRoomCard from '@/components/classroom-card/ClassRoomCard';
import styles from './Dashboard.module.css';

export default function DashBoard() {
  const router = useRouter();
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState('');
  const [username, setUsername] = useState('');

  // Form states
  const [joinCode, setJoinCode] = useState('');
  const [classroomName, setClassroomName] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [submittingCreate, setSubmittingCreate] = useState(false);
  const [submittingJoin, setSubmittingJoin] = useState(false);

  // Toast notifications
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const cachedName = localStorage.getItem('username');
    const cachedRole = localStorage.getItem('role');
    if (cachedName) setUsername(cachedName);
    if (cachedRole) setRole(cachedRole);

    const fetchData = async () => {
      setLoading(true);

      // 1. Fetch user details for personalized greeting
      try {
        const userRes = await fetch('http://localhost:5000/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (userRes.ok) {
          const userData = await userRes.json();
          const name = userData.username || userData.user?.username || cachedName || 'Learner';
          setUsername(name);
          localStorage.setItem('username', name);
          if (userData.role || userData.user?.role) {
            const r = userData.role || userData.user?.role;
            setRole(r);
            localStorage.setItem('role', r);
          }
        }
      } catch (err) {
        console.warn('Backend user profile check pending:', err.message);
      }

      // 2. Fetch classrooms
      try {
        const classRes = await fetch('http://localhost:5000/classroom/get', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const classData = await classRes.json();

        if (!classRes.ok) {
          throw new Error(classData.msg || 'Failed to load classrooms');
        }

        // Backend returns `data.classroom`
        setClassrooms(classData.classroom || []);
        if (classData.role) {
          setRole(classData.role);
          localStorage.setItem('role', classData.role);
        }
      } catch (err) {
        if (err.message && (err.message.includes('fetch') || err.message.includes('Failed to fetch'))) {
          showToast('Backend server is offline. Please run "npm start" in backend folder.', 'error');
        } else {
          showToast(err.message || 'Error connecting to server', 'error');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  // Handle Teacher Create Classroom
  const handleCreateClassroom = async (e) => {
    e.preventDefault();
    if (!classroomName.trim()) {
      showToast('Please enter a valid classroom name', 'error');
      return;
    }

    const token = localStorage.getItem('token');
    setSubmittingCreate(true);

    try {
      const response = await fetch('http://localhost:5000/classroom/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: classroomName.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || 'Failed to create classroom');
      }

      const created = {
        _id: data.classroom._id || data.classroom.id,
        name: data.classroom.name,
        joinCode: data.classroom.joinCode,
        createdAt: data.classroom.createdAt || new Date().toISOString(),
      };

      setClassrooms((prev) => [created, ...prev]);
      showToast(`Classroom created! Join Code: ${data.classroom.joinCode}`, 'success');
      setClassroomName('');
      setIsCreateModalOpen(false);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmittingCreate(false);
    }
  };

  // Handle Student Join Classroom
  const handleJoinClassroom = async (e) => {
    e.preventDefault();
    if (!joinCode.trim()) {
      showToast('Please enter a 6-digit join code', 'error');
      return;
    }

    const token = localStorage.getItem('token');
    setSubmittingJoin(true);

    try {
      const response = await fetch('http://localhost:5000/classroom/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ joinCode: joinCode.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || 'Failed to join classroom');
      }

      const joined = {
        _id: data.classroom._id || data.classroom.id,
        name: data.classroom.name,
        joinCode: data.classroom.joinCode,
        createdAt: data.classroom.createdAt || new Date().toISOString(),
      };

      setClassrooms((prev) => [joined, ...prev]);
      showToast('Successfully enrolled in classroom!', 'success');
      setJoinCode('');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmittingJoin(false);
    }
  };

  const isTeacher = role === 'teacher';

  return (
    <div className={styles.dashboardWrapper}>
      <div className={styles.ambientGlow} />

      <Navbar />

      <main className={styles.contentContainer}>
        {/* HEADER */}
        <header className={styles.dashboardHeader}>
          <div className={styles.greetingArea}>
            <h1 className={styles.greetingTitle}>
              {getGreeting()}, <span className={styles.greetingUsername}>{username || 'there'}</span>!
            </h1>
            <p className={styles.headerSubtitle}>
              {isTeacher
                ? 'Manage your learning environments, view attendance, and launch quizzes.'
                : 'Access your active courses, join new classes, and review upcoming tests.'}
            </p>
          </div>

          <div className={styles.headerActions}>
            {isTeacher && (
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className={styles.createClassBtn}
              >
                <Plus size={18} />
                <span>Create Classroom</span>
              </button>
            )}
          </div>
        </header>

        {/* STATS ROW */}
        <section className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIconWrapper}>
              <BookOpen size={24} />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statLabel}>Active Classrooms</span>
              <span className={styles.statValue}>
                {loading ? '—' : classrooms.length}
              </span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={`${styles.statIconWrapper} ${styles.statIconWrapperCyan}`}>
              <Shield size={24} />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statLabel}>Account Role</span>
              <span className={styles.statValue} style={{ textTransform: 'capitalize' }}>
                {role || 'Student'}
              </span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={`${styles.statIconWrapper} ${styles.statIconWrapperEmerald}`}>
              <Layers size={24} />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statLabel}>Platform Status</span>
              <span className={styles.statValue} style={{ fontSize: '1.25rem', color: '#34d399' }}>
                Live &amp; Synced
              </span>
            </div>
          </div>
        </section>

        {/* STUDENT JOIN CLASSROOM FORM (ALWAYS VISIBLE FOR STUDENTS) */}
        {!isTeacher && (
          <section className={styles.studentJoinCard}>
            <div className={styles.studentJoinHeader}>
              <GraduationCap size={22} color="#06b6d4" />
              <h2 className={styles.studentJoinTitle}>Join a Classroom</h2>
            </div>
            <p className={styles.studentJoinDesc}>
              Have a 6-character code from your teacher? Enter it below to instantly enroll.
            </p>
            <form onSubmit={handleJoinClassroom} className={styles.studentJoinForm}>
              <input
                type="text"
                placeholder="e.g. 7A9BC2"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                className={styles.joinInput}
                maxLength={10}
              />
              <button
                type="submit"
                disabled={submittingJoin}
                className={styles.joinSubmitBtn}
              >
                {submittingJoin ? (
                  <>
                    <Loader2 size={16} className={styles.spinner} />
                    <span>Joining...</span>
                  </>
                ) : (
                  <>
                    <span>Enroll Now</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          </section>
        )}

        {/* CLASSROOMS SECTION */}
        <section>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Your Classrooms</h2>
            <span className={styles.classCountBadge}>
              {classrooms.length} {classrooms.length === 1 ? 'Class' : 'Classes'}
            </span>
          </div>

          <div className={styles.classroomGrid}>
            {/* Loading Skeletons */}
            {loading && (
              <>
                <div className={styles.skeletonCard}>
                  <div className={styles.skeletonLineTitle} />
                  <div className={styles.skeletonLineCode} />
                  <div className={styles.skeletonLineDate} />
                </div>
                <div className={styles.skeletonCard}>
                  <div className={styles.skeletonLineTitle} />
                  <div className={styles.skeletonLineCode} />
                  <div className={styles.skeletonLineDate} />
                </div>
                <div className={styles.skeletonCard}>
                  <div className={styles.skeletonLineTitle} />
                  <div className={styles.skeletonLineCode} />
                  <div className={styles.skeletonLineDate} />
                </div>
              </>
            )}

            {/* Empty State */}
            {!loading && classrooms.length === 0 && (
              <div className={styles.emptyState}>
                <div className={styles.emptyIconWrapper}>
                  <BookOpen size={32} />
                </div>
                <h3 className={styles.emptyTitle}>No Classrooms Found</h3>
                <p className={styles.emptySubtitle}>
                  {isTeacher
                    ? "You haven't set up any classrooms yet. Create your first learning space to distribute quizzes and share announcements."
                    : "You are not enrolled in any classrooms yet. Enter your instructor's code above to get started."}
                </p>
                {isTeacher && (
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(true)}
                    className={styles.createClassBtn}
                  >
                    <Plus size={18} />
                    <span>Create Your First Classroom</span>
                  </button>
                )}
              </div>
            )}

            {/* Classrooms List */}
            {!loading &&
              classrooms.map((classroom, idx) => (
                <ClassRoomCard
                  key={classroom._id || classroom.id || idx}
                  classroom={classroom}
                />
              ))}

            {/* Teacher "Add Classroom" Placeholder */}
            {!loading && isTeacher && classrooms.length > 0 && (
              <div
                className={styles.addPlaceholderCard}
                onClick={() => setIsCreateModalOpen(true)}
                title="Create another classroom"
              >
                <div className={styles.addPlaceholderIcon}>
                  <Plus size={22} />
                </div>
                <span className={styles.addPlaceholderText}>Create New Classroom</span>
                <span className={styles.addPlaceholderSubtext}>Generate code &amp; invite students</span>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* TEACHER CREATE CLASSROOM MODAL */}
      {isCreateModalOpen && (
        <div
          className={styles.modalOverlay}
          onClick={() => setIsCreateModalOpen(false)}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Create New Classroom</h3>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className={styles.modalCloseBtn}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateClassroom} className={styles.modalForm}>
              <div>
                <label
                  htmlFor="classroom-name-input"
                  style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1' }}
                >
                  Classroom Name
                </label>
                <input
                  id="classroom-name-input"
                  type="text"
                  placeholder="e.g. Physics 101 - Thermodynamics"
                  value={classroomName}
                  onChange={(e) => setClassroomName(e.target.value)}
                  className={styles.joinInput}
                  style={{ width: '100%' }}
                  autoFocus
                  required
                />
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className={styles.cancelBtn}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingCreate}
                  className={styles.createModalBtn}
                >
                  {submittingCreate ? (
                    <>
                      <Loader2 size={16} className={styles.spinner} />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <span>Create Classroom</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FLOATING TOAST NOTIFICATIONS */}
      {toasts.length > 0 && (
        <div className={styles.toastContainer}>
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`${styles.toast} ${
                toast.type === 'error' ? styles.toastError : styles.toastSuccess
              }`}
            >
              {toast.type === 'error' ? (
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
              ) : (
                <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
              )}
              <span className={styles.toastText}>{toast.message}</span>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className={styles.toastClose}
                aria-label="Close notification"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}