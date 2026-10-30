'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './AttendanceTab.module.css';
import { 
  CalendarCheck, 
  Check, 
  Clock, 
  X, 
  Users, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  History, 
  Award,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export default function AttendanceTab({ classroom, userRole = 'student' }) {
  const classroomId = classroom?._id;
  const enrolledStudents = classroom?.students || [];

  // Helper: Today's date YYYY-MM-DD
  const getTodayStr = () => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  };

  const [selectedDate, setSelectedDate] = useState(getTodayStr());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ type: '', message: '' });

  // Teacher State: mapping studentId -> status ('Present' | 'Late' | 'Absent')
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [historyList, setHistoryList] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // Student State
  const [studentSummary, setStudentSummary] = useState(null);

  // 1. Fetch Session Attendance (Teacher)
  const fetchSessionAttendance = useCallback(async (date) => {
    if (!classroomId) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5000/attendance/${classroomId}/session/${date}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      
      const recordMap = {};
      // Default all enrolled students to Present first
      enrolledStudents.forEach(s => {
        recordMap[s._id] = 'Present';
      });

      // Override if already recorded
      if (data.attendance && Array.isArray(data.attendance.records)) {
        data.attendance.records.forEach(r => {
          const sId = r.student?._id || r.student;
          if (sId) recordMap[sId] = r.status;
        });
      }

      setAttendanceRecords(recordMap);
    } catch (err) {
      console.error('Fetch session attendance error:', err);
    }
  }, [classroomId, enrolledStudents]);

  // 2. Fetch History (Teacher)
  const fetchHistory = useCallback(async () => {
    if (!classroomId) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5000/attendance/${classroomId}/history`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setHistoryList(data.history || []);
      }
    } catch (err) {
      console.error('Fetch history error:', err);
    }
  }, [classroomId]);

  // 3. Fetch Student Attendance (Student)
  const fetchStudentAttendance = useCallback(async () => {
    if (!classroomId) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5000/attendance/${classroomId}/my-attendance`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setStudentSummary(data);
      }
    } catch (err) {
      console.error('Fetch student attendance error:', err);
    }
  }, [classroomId]);

  useEffect(() => {
    setLoading(true);
    if (userRole === 'teacher') {
      Promise.all([fetchSessionAttendance(selectedDate), fetchHistory()])
        .finally(() => setLoading(false));
    } else {
      fetchStudentAttendance()
        .finally(() => setLoading(false));
    }
  }, [userRole, selectedDate, fetchSessionAttendance, fetchHistory, fetchStudentAttendance]);

  // Status Change for Student (Teacher)
  const setStatus = (studentId, status) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  // Mark All Present (Teacher)
  const markAllPresent = () => {
    const updated = {};
    enrolledStudents.forEach(s => {
      updated[s._id] = 'Present';
    });
    setAttendanceRecords(updated);
    setToast({ type: 'success', message: 'All students marked Present' });
    setTimeout(() => setToast({ type: '', message: '' }), 2500);
  };

  // Save Attendance to Backend (Teacher)
  const handleSaveAttendance = async () => {
    setSaving(true);
    setToast({ type: '', message: '' });

    const token = localStorage.getItem('token');
    try {
      const payloadRecords = enrolledStudents.map(s => ({
        studentId: s._id,
        status: attendanceRecords[s._id] || 'Present'
      }));

      const res = await fetch(`http://localhost:5000/attendance/${classroomId}/record`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          date: selectedDate,
          records: payloadRecords
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.msg || 'Failed to save attendance');
      }

      setToast({ type: 'success', message: `Attendance saved for ${selectedDate}!` });
      fetchHistory(); // Refresh history
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Error saving attendance' });
    } finally {
      setSaving(false);
      setTimeout(() => setToast({ type: '', message: '' }), 3500);
    }
  };

  const getAvatarBg = (name) => {
    const colors = ['#7c3aed', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#3b82f6'];
    let hash = 0;
    for (let i = 0; i < (name || '').length; i++) hash += name.charCodeAt(i);
    return colors[Math.abs(hash) % colors.length];
  };

  if (loading) {
    return (
      <div className={styles.emptyBox}>
        <Loader2 size={36} className="spinner" style={{ color: '#7c3aed', margin: '0 auto 12px' }} />
        <p>Loading attendance workspace...</p>
      </div>
    );
  }

  // ----------------------------------------------------
  // TEACHER ATTENDANCE WORKSPACE
  // ----------------------------------------------------
  if (userRole === 'teacher') {
    const totalCount = enrolledStudents.length;
    const presentCount = Object.values(attendanceRecords).filter(v => v === 'Present').length;
    const lateCount = Object.values(attendanceRecords).filter(v => v === 'Late').length;
    const absentCount = Object.values(attendanceRecords).filter(v => v === 'Absent').length;

    return (
      <div className={styles.container}>
        {/* Top Action Bar */}
        <div className={styles.topBar}>
          <div className={styles.titleArea}>
            <h2 className={styles.title}>Daily Attendance Sheet</h2>
            <p className={styles.subtitle}>
              {presentCount} Present • {lateCount} Late • {absentCount} Absent out of {totalCount} enrolled students
            </p>
          </div>

          <div className={styles.controlsArea}>
            <div className={styles.dateInputWrapper}>
              <CalendarCheck size={16} color="#94a3b8" />
              <input 
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className={styles.dateInput}
              />
            </div>

            <button 
              type="button" 
              onClick={markAllPresent} 
              className={styles.markAllBtn}
            >
              <Check size={15} />
              <span>Mark All Present</span>
            </button>

            <button 
              type="button" 
              onClick={handleSaveAttendance} 
              className={styles.saveBtn}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 size={16} className="spinner" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>Save Attendance</span>
                </>
              )}
            </button>
          </div>
        </div>

        {toast.message && (
          <div className={`${styles.toast} ${toast.type === 'success' ? styles.toastSuccess : styles.toastError}`}>
            {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{toast.message}</span>
          </div>
        )}

        {/* Attendance Roster Table */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Student Attendance Roster ({selectedDate})</h3>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              Click status button to toggle attendance
            </span>
          </div>

          {enrolledStudents.length === 0 ? (
            <div className={styles.emptyBox}>
              <Users size={40} style={{ opacity: 0.4, marginBottom: '12px' }} />
              <p style={{ fontWeight: '600', color: '#cbd5e1' }}>No students enrolled in this classroom yet</p>
              <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                Share your classroom code ({classroom?.joinCode}) with students so they can join.
              </p>
            </div>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th style={{ width: '60px' }}>#</th>
                    <th>Student Name</th>
                    <th>Email Address</th>
                    <th style={{ textAlign: 'right' }}>Mark Status</th>
                  </tr>
                </thead>
                <tbody>
                  {enrolledStudents.map((student, idx) => {
                    const currentStatus = attendanceRecords[student._id] || 'Present';
                    return (
                      <tr key={student._id || idx}>
                        <td>{idx + 1}</td>
                        <td>
                          <div className={styles.studentInfo}>
                            <div className={styles.avatar} style={{ background: getAvatarBg(student.username) }}>
                              {(student.username || 'S').charAt(0).toUpperCase()}
                            </div>
                            <span className={styles.studentName}>{student.username}</span>
                          </div>
                        </td>
                        <td className={styles.studentEmail}>{student.email}</td>
                        <td style={{ textAlign: 'right' }}>
                          <div className={styles.statusButtonGroup}>
                            <button
                              type="button"
                              className={`${styles.statusToggle} ${currentStatus === 'Present' ? styles.statusToggleActivePresent : ''}`}
                              onClick={() => setStatus(student._id, 'Present')}
                            >
                              Present
                            </button>
                            <button
                              type="button"
                              className={`${styles.statusToggle} ${currentStatus === 'Late' ? styles.statusToggleActiveLate : ''}`}
                              onClick={() => setStatus(student._id, 'Late')}
                            >
                              Late
                            </button>
                            <button
                              type="button"
                              className={`${styles.statusToggle} ${currentStatus === 'Absent' ? styles.statusToggleActiveAbsent : ''}`}
                              onClick={() => setStatus(student._id, 'Absent')}
                            >
                              Absent
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Past Sessions History Toggle */}
        <div className={styles.card}>
          <div 
            className={styles.cardHeader} 
            style={{ cursor: 'pointer', marginBottom: showHistory ? '20px' : '0' }}
            onClick={() => setShowHistory(!showHistory)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <History size={18} color="#7c3aed" />
              <h3 className={styles.cardTitle}>Attendance History Log ({historyList.length} Sessions)</h3>
            </div>
            {showHistory ? <ChevronUp size={18} color="#94a3b8" /> : <ChevronDown size={18} color="#94a3b8" />}
          </div>

          {showHistory && (
            <div>
              {historyList.length === 0 ? (
                <p style={{ color: '#94a3b8', fontSize: '0.88rem' }}>No past attendance records found.</p>
              ) : (
                <div className={styles.tableWrapper}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Present</th>
                        <th>Late</th>
                        <th>Absent</th>
                        <th>Attendance Rate</th>
                        <th style={{ textAlign: 'right' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historyList.map((session) => (
                        <tr key={session.id || session.date}>
                          <td style={{ fontWeight: '600', color: '#f1f5f9' }}>{session.date}</td>
                          <td style={{ color: '#34d399' }}>{session.presentCount}</td>
                          <td style={{ color: '#fbbf24' }}>{session.lateCount}</td>
                          <td style={{ color: '#f87171' }}>{session.absentCount}</td>
                          <td>
                            <span 
                              className={styles.statusBadge}
                              style={{
                                background: session.attendanceRate >= 75 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                color: session.attendanceRate >= 75 ? '#34d399' : '#f87171'
                              }}
                            >
                              {session.attendanceRate}%
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              type="button"
                              className={styles.statusToggle}
                              style={{ color: '#a78bfa' }}
                              onClick={() => setSelectedDate(session.date)}
                            >
                              Edit Session
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // STUDENT ATTENDANCE WORKSPACE
  // ----------------------------------------------------
  const totalClasses = studentSummary?.totalClasses || 0;
  const present = studentSummary?.present || 0;
  const late = studentSummary?.late || 0;
  const absent = studentSummary?.absent || 0;
  const percentage = studentSummary?.percentage ?? 100;
  const logs = studentSummary?.logs || [];

  let ringColor = '#10b981';
  let ringGlow = 'rgba(16, 185, 129, 0.25)';
  let statusText = 'Excellent Standing';
  if (percentage < 75) {
    ringColor = '#ef4444';
    ringGlow = 'rgba(239, 68, 68, 0.25)';
    statusText = 'Attendance Warning: Below 75%';
  } else if (percentage < 85) {
    ringColor = '#f59e0b';
    ringGlow = 'rgba(245, 158, 11, 0.25)';
    statusText = 'Good Attendance';
  }

  return (
    <div className={styles.container}>
      {/* Student Overview Header */}
      <div className={styles.studentOverviewCard}>
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: '0.82rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: ringColor }}>
            {statusText}
          </span>
          <h2 className={styles.title} style={{ marginTop: '4px' }}>My Attendance Overview</h2>
          <p className={styles.subtitle} style={{ marginTop: '6px' }}>
            Classroom: {classroom?.name} • Keep attendance above 75% for assessment eligibility.
          </p>

          <div className={styles.studentMetricsGrid} style={{ marginTop: '20px' }}>
            <div className={styles.metricBox}>
              <span className={styles.metricValue}>{totalClasses}</span>
              <span className={styles.metricLabel}>Total Sessions</span>
            </div>
            <div className={styles.metricBox}>
              <span className={styles.metricValue} style={{ color: '#34d399' }}>{present}</span>
              <span className={styles.metricLabel}>Present</span>
            </div>
            <div className={styles.metricBox}>
              <span className={styles.metricValue} style={{ color: '#fbbf24' }}>{late}</span>
              <span className={styles.metricLabel}>Late</span>
            </div>
            <div className={styles.metricBox}>
              <span className={styles.metricValue} style={{ color: '#f87171' }}>{absent}</span>
              <span className={styles.metricLabel}>Absent</span>
            </div>
          </div>
        </div>

        {/* Percentage Gauge */}
        <div 
          className={styles.circleGauge} 
          style={{ borderColor: ringColor, boxShadow: `0 0 24px ${ringGlow}` }}
        >
          <span className={styles.circlePercent} style={{ color: ringColor }}>
            {percentage}%
          </span>
          <span className={styles.circleLabel}>Attended</span>
        </div>
      </div>

      {/* Date-by-Date Log */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>Daily Attendance Log</h3>
          <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
            {logs.length} Recorded Sessions
          </span>
        </div>

        {logs.length === 0 ? (
          <div className={styles.emptyBox}>
            <CalendarCheck size={40} style={{ opacity: 0.4, marginBottom: '12px' }} />
            <p style={{ fontWeight: '600', color: '#cbd5e1' }}>No attendance sessions marked yet</p>
            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Your teacher will take attendance during class lectures.
            </p>
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Session Date</th>
                  <th>Status</th>
                  <th>Remarks / Notes</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, idx) => {
                  let badgeStyle = styles.badgePresent;
                  if (log.status === 'Late') badgeStyle = styles.badgeLate;
                  else if (log.status === 'Absent') badgeStyle = styles.badgeAbsent;

                  return (
                    <tr key={idx}>
                      <td style={{ fontWeight: '600', color: '#f1f5f9' }}>{log.date}</td>
                      <td>
                        <span className={`${styles.statusBadge} ${badgeStyle}`}>
                          {log.status === 'Present' && '✓ Present'}
                          {log.status === 'Late' && '⏱ Late'}
                          {log.status === 'Absent' && '✗ Absent'}
                        </span>
                      </td>
                      <td style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                        {log.remarks || 'Standard lecture session'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
