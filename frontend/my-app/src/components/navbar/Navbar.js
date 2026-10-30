'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { GraduationCap, LogOut, LayoutDashboard } from 'lucide-react';
import styles from './Navbar.module.css';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const cachedName = localStorage.getItem('username');
    if (cachedName) {
      setUsername(cachedName);
    }

    if (!token) {
      setIsLoggedIn(false);
      setLoadingUser(false);
      return;
    }

    setIsLoggedIn(true);

    const fetchUserProfile = async () => {
      try {
        const response = await fetch('http://localhost:5000/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const name = data.username || data.user?.username || cachedName || 'User';
          setUsername(name);
          localStorage.setItem('username', name);
          if (data.role || data.user?.role) {
            localStorage.setItem('role', data.role || data.user?.role);
          }
        } else {
          if (response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('username');
            localStorage.removeItem('role');
            setIsLoggedIn(false);
          }
        }
      } catch (err) {
        console.warn('Backend server connection pending:', err.message || err);
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    setIsLoggedIn(false);
    setUsername('');
    router.push('/login');
  };

  const firstLetter = username ? username.charAt(0).toUpperCase() : 'U';

  return (
    <header className={styles.navbar}>
      <div className={styles.navContainer}>
        {/* Simple & Bold Collify Brand Logo */}
        <Link href="/" className={styles.brand} title="Collify">
          <div className={styles.logoIconBox}>
            <GraduationCap size={22} className={styles.logoIcon} />
          </div>
          <span className={styles.brandName}>
            Colli<span className={styles.brandAccent}>fy</span>
          </span>
        </Link>

        {/* Right Action Area */}
        <div className={styles.navActions}>
          {loadingUser ? (
            <div className={styles.loadingPlaceholder} />
          ) : isLoggedIn ? (
            <div className={styles.userSection}>
              {pathname !== '/dashboard' && (
                <Link href="/dashboard" className={styles.dashboardLink}>
                  <LayoutDashboard size={16} />
                  <span>Dashboard</span>
                </Link>
              )}

              <div className={styles.profileBadge}>
                <div className={styles.avatarCircle}>{firstLetter}</div>
                <span className={styles.usernameDisplay}>{username}</span>
              </div>

              <button
                onClick={handleLogout}
                className={styles.logoutBtn}
                title="Sign out of Collify"
                aria-label="Logout"
              >
                <LogOut size={16} />
                <span className={styles.logoutText}>Sign Out</span>
              </button>
            </div>
          ) : (
            <div className={styles.authLinks}>
              <Link href="/login" className={styles.signInBtn}>
                Sign In
              </Link>
              <Link href="/register" className={styles.signUpBtn}>
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
