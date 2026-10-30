'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import styles from './Classrooms.module.css';
import Navbar from '@/components/navbar/Navbar';
import HomeTab from '@/components/HomeTab/HomeTab';
import PostSection from '@/components/PostSection/PostSection';
import QuizTab from '@/components/QuizTab/QuizTab';
import PeopleTab from '@/components/PeopleTab/PeopleTab';
import AttendanceTab from '@/components/AttendanceTab/AttendanceTab';
import { 
  Home, 
  FileText, 
  ClipboardList, 
  Users, 
  CalendarCheck, 
  Loader2, 
  AlertCircle 
} from 'lucide-react';

export default function ClassroomDashboard() {
  const router = useRouter();
  const { id } = useParams();
  const [classroom, setClassroom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState(null);
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('Home');

  const refetchPosts = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token || !id) return;
    try {
      const postsRes = await fetch(`http://localhost:5000/post/${id}/get`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const postsData = await postsRes.json();
      if (postsRes.ok) {
        setPosts(postsData.posts || []);
      }
    } catch (err) {
      console.error('Failed to refetch posts:', err);
    }
  }, [id]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchClassroom = async () => {
      setLoading(true);
      setError('');
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

        setClassroom(data.classroom);
        setUserRole(data.role);

        // Fetch posts and set properly into state (avoiding mutation bug)
        const postsRes = await fetch(`http://localhost:5000/post/${id}/get`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const postsData = await postsRes.json();
        if (postsRes.ok) {
          setPosts(postsData.posts || []);
        }
      } catch (err) {
        setError(err.message || 'Error loading classroom');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchClassroom();
    }
  }, [id, router]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className={styles.shell}>
          <div className={styles.loadingContainer}>
            <Loader2 size={40} className={styles.loadingSpinner} />
            <p>Loading classroom workspace...</p>
          </div>
        </div>
      </>
    );
  }

  if (error || !classroom) {
    return (
      <>
        <Navbar />
        <div className={styles.shell}>
          <div className={styles.errorContainer}>
            <AlertCircle size={44} color="#ef4444" />
            <h2 className={styles.errorTitle}>Classroom Unavailable</h2>
            <p className={styles.errorText}>
              {error || 'The requested classroom could not be found or you do not have permission to view it.'}
            </p>
            <button onClick={() => router.push('/dashboard')} className={styles.backBtn}>
              Return to Dashboard
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className={styles.shell}>
        {/* Dark Sidebar */}
        <aside className={styles.sidebar}>
          <div className={styles.classHeaderMini}>
            <h3 className={styles.classMiniTitle} title={classroom.name}>
              {classroom.name}
            </h3>
            <span className={styles.classMiniRole}>
              {userRole === 'teacher' ? 'Instructor' : 'Enrolled Student'}
            </span>
          </div>

          <nav className={styles.navGroup}>
            <button
              type="button"
              className={activeTab === 'Home' ? styles.activeTab : styles.tab}
              onClick={() => setActiveTab('Home')}
            >
              {activeTab === 'Home' && <div className={styles.activeIndicator} />}
              <div className={styles.tabIconWrapper}>
                <Home size={18} />
              </div>
              <span>Home</span>
            </button>

            <button
              type="button"
              className={activeTab === 'Posts' ? styles.activeTab : styles.tab}
              onClick={() => setActiveTab('Posts')}
            >
              {activeTab === 'Posts' && <div className={styles.activeIndicator} />}
              <div className={styles.tabIconWrapper}>
                <FileText size={18} />
              </div>
              <span>Posts</span>
            </button>

            <button
              type="button"
              className={activeTab === 'Quizzes' ? styles.activeTab : styles.tab}
              onClick={() => setActiveTab('Quizzes')}
            >
              {activeTab === 'Quizzes' && <div className={styles.activeIndicator} />}
              <div className={styles.tabIconWrapper}>
                <ClipboardList size={18} />
              </div>
              <span>Quizzes</span>
            </button>

            <button
              type="button"
              className={activeTab === 'People' ? styles.activeTab : styles.tab}
              onClick={() => setActiveTab('People')}
            >
              {activeTab === 'People' && <div className={styles.activeIndicator} />}
              <div className={styles.tabIconWrapper}>
                <Users size={18} />
              </div>
              <span>People</span>
            </button>

            <button
              type="button"
              className={activeTab === 'Attendance' ? styles.activeTab : styles.tab}
              onClick={() => setActiveTab('Attendance')}
            >
              {activeTab === 'Attendance' && <div className={styles.activeIndicator} />}
              <div className={styles.tabIconWrapper}>
                <CalendarCheck size={18} />
              </div>
              <span>Attendance</span>
            </button>
          </nav>
        </aside>

        {/* Tab Main Content */}
        <main className={styles.mainContent}>
          <div className={styles.contentWrapper} key={activeTab}>
            {activeTab === 'Home' && (
              <HomeTab
                classroom={classroom}
                userRole={userRole}
                onPostCreated={refetchPosts}
                onNavigateTab={(tab) => setActiveTab(tab)}
              />
            )}

            {activeTab === 'Posts' && (
              <PostSection
                posts={posts}
                userRole={userRole}
                classroomId={id}
                onNewPost={(post) => setPosts((prev) => [post, ...prev])}
              />
            )}

            {activeTab === 'Quizzes' && (
              <QuizTab
                classroomId={id}
                userRole={userRole}
              />
            )}

            {activeTab === 'People' && (
              <PeopleTab
                classroom={classroom}
              />
            )}

            {activeTab === 'Attendance' && (
              <AttendanceTab
                classroom={classroom}
                userRole={userRole}
              />
            )}
          </div>
        </main>
      </div>
    </>
  );
}
