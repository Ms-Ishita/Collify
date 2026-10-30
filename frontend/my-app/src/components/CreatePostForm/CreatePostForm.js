'use client';

import { useState } from 'react';
import styles from './PostForm.module.css';
import { 
  Megaphone, 
  Video, 
  FileText, 
  Upload, 
  X, 
  Send, 
  AlertCircle, 
  CheckCircle2, 
  Loader2,
  Link as LinkIcon
} from 'lucide-react';

export default function CreatePostForm({ 
  classroomId, 
  classroom, 
  onPostCreated, 
  onClose, 
  setShowForm 
}) {
  const targetId = classroomId || classroom?._id;
  const [postType, setPostType] = useState('announcement');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [meetLink, setMeetLink] = useState('');
  const [materialUrl, setMaterialUrl] = useState('');
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  const handleClose = () => {
    if (onClose) onClose();
    if (setShowForm) setShowForm(false);
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (files.length + selectedFiles.length > 5) {
      setStatus({ type: 'error', message: 'You can upload a maximum of 5 PDF files.' });
      return;
    }
    const nonPdfs = selectedFiles.filter(f => f.type !== 'application/pdf' && !f.name.toLowerCase().endsWith('.pdf'));
    if (nonPdfs.length > 0) {
      setStatus({ type: 'error', message: 'Only PDF documents are allowed for class materials.' });
      return;
    }
    setFiles(prev => [...prev, ...selectedFiles].slice(0, 5));
    setStatus({ type: '', message: '' });
  };

  const removeFile = (indexToRemove) => {
    setFiles(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });

    if (!title.trim() || !content.trim()) {
      setStatus({ type: 'error', message: 'Please provide both a title and description.' });
      return;
    }

    if (postType === 'google_meet' && !meetLink.trim()) {
      setStatus({ type: 'error', message: 'Please enter a valid Google Meet link.' });
      return;
    }

    if (postType === 'material' && files.length === 0 && !materialUrl.trim()) {
      setStatus({ type: 'error', message: 'Please attach at least one PDF file or provide a resource link.' });
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setStatus({ type: 'error', message: 'You must be logged in to create a post.' });
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('type', postType);
      formData.append('title', title.trim());
      formData.append('content', content.trim());

      if (postType === 'google_meet') {
        formData.append('meetLink', meetLink.trim());
      }

      if (postType === 'material' && materialUrl.trim()) {
        formData.append('material_URL', materialUrl.trim());
      }

      if (files.length > 0) {
        files.forEach(file => {
          formData.append('attachments', file);
        });
      }

      const res = await fetch(`http://localhost:5000/post/${targetId}/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.msg || 'Failed to create post');
      }

      setStatus({ type: 'success', message: 'Post created successfully!' });

      if (onPostCreated) {
        onPostCreated(data.post);
      }

      // Reset fields
      setTitle('');
      setContent('');
      setMeetLink('');
      setMaterialUrl('');
      setFiles([]);
      setPostType('announcement');

      setTimeout(() => {
        handleClose();
      }, 1000);
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Error creating post' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.formOverlay}>
      <div className={styles.formHeader}>
        <h3 className={styles.formTitle}>
          <FileText size={18} color="#7c3aed" />
          Create New Class Post
        </h3>
        <button 
          type="button" 
          onClick={handleClose} 
          className={styles.closeBtn}
          disabled={submitting}
        >
          <X size={18} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.typeSelector}>
          <button
            type="button"
            className={`${styles.typeBtn} ${postType === 'announcement' ? styles.typeBtnActive : ''}`}
            onClick={() => setPostType('announcement')}
            disabled={submitting}
          >
            <Megaphone size={16} />
            <span>Announcement</span>
          </button>

          <button
            type="button"
            className={`${styles.typeBtn} ${postType === 'material' ? styles.typeBtnActive : ''}`}
            onClick={() => setPostType('material')}
            disabled={submitting}
          >
            <FileText size={16} />
            <span>Material</span>
          </button>

          <button
            type="button"
            className={`${styles.typeBtn} ${postType === 'google_meet' ? styles.typeBtnActive : ''}`}
            onClick={() => setPostType('google_meet')}
            disabled={submitting}
          >
            <Video size={16} />
            <span>Google Meet</span>
          </button>
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="post-title" className={styles.label}>Title</label>
          <input
            id="post-title"
            type="text"
            className={styles.input}
            placeholder={
              postType === 'announcement' 
                ? 'e.g., Midterm Exam Schedule Announced'
                : postType === 'material'
                ? 'e.g., Lecture 5 - Thermodynamics Slides'
                : 'e.g., Live Q&A and Doubt Clearing Session'
            }
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={submitting}
            required
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="post-content" className={styles.label}>Description / Content</label>
          <textarea
            id="post-content"
            className={styles.textarea}
            rows={4}
            placeholder="Write the details, instructions, or notes for your students..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={submitting}
            required
          />
        </div>

        {postType === 'google_meet' && (
          <div className={styles.inputGroup}>
            <label htmlFor="meet-link" className={styles.label}>Google Meet Link</label>
            <input
              id="meet-link"
              type="url"
              className={styles.input}
              placeholder="https://meet.google.com/xxx-xxxx-xxx"
              value={meetLink}
              onChange={(e) => setMeetLink(e.target.value)}
              disabled={submitting}
              required
            />
          </div>
        )}

        {postType === 'material' && (
          <>
            <div className={styles.inputGroup}>
              <label htmlFor="material-link" className={styles.label}>Resource Link (Optional)</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="material-link"
                  type="url"
                  className={styles.input}
                  placeholder="https://drive.google.com/... or resource URL"
                  value={materialUrl}
                  onChange={(e) => setMaterialUrl(e.target.value)}
                  disabled={submitting}
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>PDF Attachments (Max 5, 10MB each)</label>
              <div className={styles.fileDropZone}>
                <input
                  type="file"
                  accept="application/pdf"
                  multiple
                  className={styles.hiddenFileInput}
                  onChange={handleFileChange}
                  disabled={submitting || files.length >= 5}
                />
                <Upload size={24} color="#94a3b8" />
                <span className={styles.fileDropText}>
                  Click or drag PDF files to attach
                </span>
                <span className={styles.fileDropSubtext}>
                  {files.length}/5 files selected
                </span>
              </div>

              {files.length > 0 && (
                <div className={styles.fileList}>
                  {files.map((file, idx) => (
                    <div key={idx} className={styles.fileItem}>
                      <span>📄 {file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
                      <button
                        type="button"
                        className={styles.removeFileBtn}
                        onClick={() => removeFile(idx)}
                        disabled={submitting}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {status.message && (
          <div className={`${styles.statusMessage} ${status.type === 'success' ? styles.statusSuccess : styles.statusError}`}>
            {status.type === 'success' ? (
              <CheckCircle2 size={16} />
            ) : (
              <AlertCircle size={16} />
            )}
            <span>{status.message}</span>
          </div>
        )}

        <div className={styles.formActions}>
          <button
            type="button"
            onClick={handleClose}
            className={styles.cancelBtn}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={styles.submitBtn}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 size={16} className={styles.spinner} />
                <span>Publishing...</span>
              </>
            ) : (
              <>
                <Send size={16} />
                <span>Publish Post</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
