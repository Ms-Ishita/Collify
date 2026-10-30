'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, User, Mail, Lock, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import styles from './Register.module.css';

export default function Register() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student'); // Default: student
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/dashboard');
    }
  }, [router]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password, role }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.username || username);
        localStorage.setItem('role', data.role || role);
        router.push('/dashboard');
      } else {
        setError(data.msg || 'Registration failed. Please try again.');
      }
    } catch (err) {
      console.warn('Register request status:', err.message || err);
      setError('Unable to reach server. Please ensure the backend is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.registerPage}>
      <div className={styles.ambientGlow} />

      <div className={styles.registerCard}>
        {/* Brand Header */}
        <div className={styles.brandHeader}>
          <Link href="/" className={styles.logoIconWrapper} title="Collify Home">
            <BookOpen size={24} />
          </Link>
          <h1 className={styles.title}>Create Account</h1>
          <p className={styles.subtitle}>Join Collify to start learning and teaching</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className={styles.errorBox}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleRegister} className={styles.form}>
          {/* Username */}
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="reg-username">
              Username
            </label>
            <div className={styles.inputWrapper}>
              <span className={styles.inputIcon}>
                <User size={18} />
              </span>
              <input
                id="reg-username"
                type="text"
                placeholder="johndoe"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                className={styles.input}
              />
            </div>
          </div>

          {/* Email */}
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="reg-email">
              Email Address
            </label>
            <div className={styles.inputWrapper}>
              <span className={styles.inputIcon}>
                <Mail size={18} />
              </span>
              <input
                id="reg-email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className={styles.input}
              />
            </div>
          </div>

          {/* Role Selection */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Select Your Role</label>
            <div className={styles.roleSelectorGrid}>
              <div
                type="button"
                className={`${styles.roleCard} ${role === 'student' ? styles.roleCardActive : ''}`}
                onClick={() => setRole('student')}
              >
                <span className={styles.roleEmoji}>👨‍🎓</span>
                <span className={styles.roleTitle}>Student</span>
                <span className={styles.roleSubtitle}>Enroll &amp; Take Quizzes</span>
              </div>

              <div
                type="button"
                className={`${styles.roleCard} ${role === 'teacher' ? styles.roleCardActive : ''}`}
                onClick={() => setRole('teacher')}
              >
                <span className={styles.roleEmoji}>👨‍🏫</span>
                <span className={styles.roleTitle}>Teacher</span>
                <span className={styles.roleSubtitle}>Create &amp; Manage Classes</span>
              </div>
            </div>
          </div>

          {/* Password */}
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="reg-password">
              Password
            </label>
            <div className={styles.inputWrapper}>
              <span className={styles.inputIcon}>
                <Lock size={18} />
              </span>
              <input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                className={`${styles.input} ${styles.inputPassword}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={styles.eyeButton}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={styles.submitBtn}
          >
            {loading ? (
              <>
                <Loader2 size={18} className={styles.spinner} />
                <span>Creating Account...</span>
              </>
            ) : (
              <span>Create Account</span>
            )}
          </button>
        </form>

        <p className={styles.footerText}>
          Already have an account?{' '}
          <Link href="/login" className={styles.footerLink}>
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}