'use client';

import Link from 'next/link';
import {
  GraduationCap,
  Sparkles,
  Zap,
  Users,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  Heart,
  Calendar,
  Award,
} from 'lucide-react';
import Navbar from '../components/navbar/Navbar';
import styles from './Landing.module.css';

export default function Home() {
  return (
    <div className={styles.pageWrapper}>
      {/* Ambient Background Glows */}
      <div className={styles.ambientGlowTop} />
      <div className={styles.ambientGlowMid} />
      <div className={styles.ambientGlowRight} />

      {/* Global Navbar */}
      <Navbar />

      {/* HERO SECTION */}
      <section className={styles.heroSection}>
        <div className={styles.heroBadge}>
          <span className={styles.heroBadgeDot} />
          <span>Next-Generation EdTech Platform</span>
        </div>

        <h1 className={styles.heroTitle}>
          Learn Together. <br />
          <span className={styles.gradientText}>Teach Smarter.</span>
        </h1>

        <p className={styles.heroSubtitle}>
          The modern classroom engine built for interactive education. Create smart classrooms,
          generate AI-powered MCQ quizzes in seconds, automate grading, and collaborate effortlessly.
        </p>

        <div className={styles.heroActions}>
          <Link href="/register" className={styles.primaryCta}>
            <span>Get Started Free</span>
            <ArrowRight size={18} />
          </Link>
          <Link href="/login" className={styles.secondaryCta}>
            <span>Sign In</span>
          </Link>
        </div>

        {/* Hero Interactive Showcase Card */}
        <div className={styles.heroShowcase}>
          <div className={styles.showcaseHeader}>
            <div className={styles.windowDots}>
              <span className={`${styles.dot} ${styles.dotRed}`} />
              <span className={`${styles.dot} ${styles.dotYellow}`} />
              <span className={`${styles.dot} ${styles.dotGreen}`} />
            </div>
            <span className={styles.showcaseTitle}>Collify Dashboard Preview</span>
            <span style={{ width: 40 }} />
          </div>

          <div className={styles.showcaseGrid}>
            <div className={styles.showcaseCard}>
              <div className={styles.showcaseCardHeader}>
                <span className={styles.classCodeTag}>CODE: 849201</span>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>34 Students</span>
              </div>
              <h3 className={styles.classItemTitle}>Advanced Computer Science 101</h3>
              <p className={styles.classItemSubtitle}>Data Structures, Algorithms & System Design</p>
              <div className={styles.showcaseProgress}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span style={{ color: '#94a3b8' }}>Weekly Quiz Completion</span>
                  <span style={{ color: '#c084fc', fontWeight: 'bold' }}>82%</span>
                </div>
                <div className={styles.progressBarBg}>
                  <div className={styles.progressBarFill} />
                </div>
              </div>
            </div>

            <div className={styles.showcaseCard}>
              <div className={styles.showcaseCardHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#a855f7' }}>
                  <Sparkles size={16} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>AI Quiz Engine</span>
                </div>
                <span style={{ fontSize: '0.75rem', color: '#22c55e', background: 'rgba(34, 197, 94, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                  Live
                </span>
              </div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                Instant MCQ Generator
              </h4>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5 }}>
                Prompt topic: &quot;Binary Search Trees &amp; Time Complexity&quot;
              </p>
              <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(255, 255, 255, 0.04)', borderRadius: '8px', fontSize: '0.8rem', borderLeft: '3px solid #7c3aed' }}>
                ✓ 5 questions generated &amp; auto-graded instantly
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: FEATURES GRID */}
      <section className={styles.featuresSection}>
        <div className={styles.sectionHeader}>
          <p className={styles.sectionTag}>Features</p>
          <h2 className={styles.sectionTitle}>Built for the modern learning era</h2>
          <p className={styles.sectionSubtitle}>
            Everything educators and students need to run seamless classes, test knowledge, and track academic growth.
          </p>
        </div>

        <div className={styles.featuresGrid}>
          {/* Feature 1 */}
          <div className={styles.featureCard}>
            <div className={styles.featureIconWrapper}>
              <GraduationCap size={26} />
            </div>
            <h3 className={styles.featureTitle}>Smart Classrooms</h3>
            <p className={styles.featureDesc}>
              Create vibrant digital classrooms in seconds. Share quick join codes with students for frictionless enrollment.
            </p>
          </div>

          {/* Feature 2 */}
          <div className={styles.featureCard}>
            <div className={styles.featureIconWrapper}>
              <Sparkles size={26} />
            </div>
            <h3 className={styles.featureTitle}>AI Quiz Generation</h3>
            <p className={styles.featureDesc}>
              Harness cutting-edge AI to instantly generate high-quality multiple choice quizzes on any subject or curriculum topic.
            </p>
          </div>

          {/* Feature 3 */}
          <div className={styles.featureCard}>
            <div className={styles.featureIconWrapper}>
              <Zap size={26} />
            </div>
            <h3 className={styles.featureTitle}>Auto Grading</h3>
            <p className={styles.featureDesc}>
              No more manual grading. Submissions are scored immediately with detailed question breakdown and score summaries.
            </p>
          </div>

          {/* Feature 4 */}
          <div className={styles.featureCard}>
            <div className={styles.featureIconWrapper}>
              <Users size={26} />
            </div>
            <h3 className={styles.featureTitle}>Real-time Collaboration</h3>
            <p className={styles.featureDesc}>
              Publish announcements, share notes, upload learning materials, and launch integrated Google Meet video sessions.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 3: TWO-COLUMN BENEFITS */}
      <section className={styles.benefitsSection}>
        <div className={styles.sectionHeader}>
          <p className={styles.sectionTag}>User Experience</p>
          <h2 className={styles.sectionTitle}>Tailored for Teachers &amp; Students</h2>
          <p className={styles.sectionSubtitle}>
            Purpose-built workflows tailored to empower both educators and learners.
          </p>
        </div>

        <div className={styles.benefitsGrid}>
          {/* For Teachers */}
          <div className={styles.benefitCard}>
            <div className={styles.benefitHeader}>
              <span className={`${styles.benefitBadge} ${styles.badgeTeacher}`}>For Teachers</span>
            </div>
            <h3 className={styles.benefitTitle}>Supercharge your teaching workflow</h3>
            <p className={styles.benefitSubtitle}>
              Reclaim valuable hours spent on test drafting and grading so you can focus on mentoring.
            </p>
            <ul className={styles.benefitList}>
              <li className={styles.benefitItem}>
                <CheckCircle2 size={18} className={styles.checkIcon} />
                <span>Create and organize multiple classes with dedicated join codes</span>
              </li>
              <li className={styles.benefitItem}>
                <CheckCircle2 size={18} className={styles.checkIcon} />
                <span>Generate comprehensive AI quizzes with customizable difficulty and marks</span>
              </li>
              <li className={styles.benefitItem}>
                <CheckCircle2 size={18} className={styles.checkIcon} />
                <span>Gain instant analytics into student performance and question success rates</span>
              </li>
              <li className={styles.benefitItem}>
                <CheckCircle2 size={18} className={styles.checkIcon} />
                <span>Post class feeds, lecture notes, and host live sessions via Google Meet</span>
              </li>
            </ul>
          </div>

          {/* For Students */}
          <div className={styles.benefitCard}>
            <div className={styles.benefitHeader}>
              <span className={`${styles.benefitBadge} ${styles.badgeStudent}`}>For Students</span>
            </div>
            <h3 className={styles.benefitTitle}>Master subjects at your own pace</h3>
            <p className={styles.benefitSubtitle}>
              Stay on top of coursework, test your knowledge, and track your achievements with zero friction.
            </p>
            <ul className={styles.benefitList}>
              <li className={styles.benefitItem}>
                <CheckCircle2 size={18} className={styles.checkIcon} />
                <span>Join any classroom in one click using a unique 6-digit code</span>
              </li>
              <li className={styles.benefitItem}>
                <CheckCircle2 size={18} className={styles.checkIcon} />
                <span>Take interactive quizzes with live timers and instant result feedback</span>
              </li>
              <li className={styles.benefitItem}>
                <CheckCircle2 size={18} className={styles.checkIcon} />
                <span>Access all announcements, slides, and study links from a single hub</span>
              </li>
              <li className={styles.benefitItem}>
                <CheckCircle2 size={18} className={styles.checkIcon} />
                <span>Unified dashboard to oversee all your enrolled courses and upcoming tests</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* SECTION 4: CALL TO ACTION */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaCard}>
          <h2 className={styles.ctaTitle}>Ready to transform your classroom?</h2>
          <p className={styles.ctaSubtitle}>
            Join teachers and students already using Collify to simplify education and boost academic outcomes.
          </p>
          <Link href="/register" className={styles.primaryCta}>
            <span>Get Started Free</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div className={styles.footerContainer}>
          <div className={styles.footerTop}>
            <div className={styles.footerBrand}>
              <BookOpen size={22} color="#7c3aed" />
              <span>Collify</span>
            </div>

            <div className={styles.footerLinks}>
              <Link href="/login" className={styles.footerLink}>Sign In</Link>
              <Link href="/register" className={styles.footerLink}>Register</Link>
              <Link href="/dashboard" className={styles.footerLink}>Dashboard</Link>
            </div>
          </div>

          <div className={styles.footerBottom}>
            <div className={styles.footerLove}>
              <span>Built with</span>
              <Heart size={16} className={styles.heartIcon} fill="#f43f5e" />
              <span>for learning</span>
            </div>
            <p>&copy; {new Date().getFullYear()} Collify Inc. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
