'use client';

import styles from './PeopleTab.module.css';
import { ShieldCheck, GraduationCap, Mail, Users, UserCheck } from 'lucide-react';

const AVATAR_PALETTES = [
  { bg: 'linear-gradient(135deg, #7c3aed, #6366f1)', color: '#ffffff' },
  { bg: 'linear-gradient(135deg, #06b6d4, #3b82f6)', color: '#ffffff' },
  { bg: 'linear-gradient(135deg, #10b981, #059669)', color: '#ffffff' },
  { bg: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#ffffff' },
  { bg: 'linear-gradient(135deg, #ec4899, #8b5cf6)', color: '#ffffff' },
  { bg: 'linear-gradient(135deg, #f43f5e, #e11d48)', color: '#ffffff' },
  { bg: 'linear-gradient(135deg, #8b5cf6, #d946ef)', color: '#ffffff' },
  { bg: 'linear-gradient(135deg, #14b8a6, #0284c7)', color: '#ffffff' }
];

function getAvatarStyle(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_PALETTES.length;
  return AVATAR_PALETTES[index];
}

export default function PeopleTab({ classroom }) {
  if (!classroom) return null;

  const teacher = classroom.teacher || {};
  const students = Array.isArray(classroom.students) ? classroom.students : [];

  const teacherInitial = (teacher.username || 'T').charAt(0).toUpperCase();
  const teacherPalette = getAvatarStyle(teacher.username || 'Teacher');

  return (
    <div className={styles.peopleContainer}>
      {/* Teacher Section */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            <ShieldCheck size={20} color="#7c3aed" />
            Instructor
          </h2>
        </div>

        <div className={styles.teacherGrid}>
          <div className={styles.personCard}>
            <div 
              className={styles.avatar} 
              style={{ background: teacherPalette.bg, color: teacherPalette.color }}
            >
              {teacherInitial}
            </div>

            <div className={styles.personInfo}>
              <h3 className={styles.personName}>{teacher.username || 'Course Instructor'}</h3>
              {teacher.email && (
                <p className={styles.personEmail}>
                  <Mail size={13} />
                  <span>{teacher.email}</span>
                </p>
              )}
            </div>

            <span className={`${styles.roleTag} ${styles.roleTeacher}`}>
              Teacher
            </span>
          </div>
        </div>
      </section>

      {/* Students Section */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            <Users size={20} color="#06b6d4" />
            Enrolled Students
          </h2>
          <span className={styles.countBadge}>
            {students.length} {students.length === 1 ? 'student' : 'students'}
          </span>
        </div>

        {students.length === 0 ? (
          <div className={styles.emptyState}>
            <UserCheck size={44} className={styles.emptyIcon} />
            <h3 className={styles.emptyTitle}>No students enrolled yet</h3>
            <p className={styles.emptyText}>
              Share the classroom join code{' '}
              <strong style={{ color: '#c4b5fd' }}>{classroom.joinCode}</strong> with your students so they can enter this classroom.
            </p>
          </div>
        ) : (
          <div className={styles.studentsGrid}>
            {students.map((student) => {
              const username = student.username || 'Student';
              const initial = username.charAt(0).toUpperCase();
              const palette = getAvatarStyle(username);

              return (
                <div key={student._id || Math.random()} className={styles.personCard}>
                  <div 
                    className={styles.avatar} 
                    style={{ background: palette.bg, color: palette.color }}
                  >
                    {initial}
                  </div>

                  <div className={styles.personInfo}>
                    <h3 className={styles.personName}>{username}</h3>
                    {student.email && (
                      <p className={styles.personEmail}>
                        <Mail size={13} />
                        <span>{student.email}</span>
                      </p>
                    )}
                  </div>

                  <span className={`${styles.roleTag} ${styles.roleStudent}`}>
                    Student
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
