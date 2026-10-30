'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './PostSection.module.css';
import CreatePostForm from '../CreatePostForm/CreatePostForm';
import { 
  Plus, 
  FileText, 
  Video, 
  Megaphone, 
  HelpCircle, 
  ExternalLink, 
  Calendar, 
  User, 
  Paperclip,
  CheckCircle2,
  FolderOpen
} from 'lucide-react';

export default function PostSection({ 
  posts = [], 
  userRole = 'student', 
  classroomId, 
  onNewPost 
}) {
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Sort newest first safely
  const sortedPosts = Array.isArray(posts)
    ? [...posts].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    : [];

  const handlePostCreated = (newPost) => {
    if (onNewPost) {
      onNewPost(newPost);
    }
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case 'announcement':
        return (
          <span className={`${styles.typeBadge} ${styles.badgeAnnouncement}`}>
            <Megaphone size={14} /> Announcement
          </span>
        );
      case 'material':
        return (
          <span className={`${styles.typeBadge} ${styles.badgeMaterial}`}>
            <FileText size={14} /> Material
          </span>
        );
      case 'google_meet':
      case 'googleMeet':
        return (
          <span className={`${styles.typeBadge} ${styles.badgeGoogleMeet}`}>
            <Video size={14} /> Google Meet
          </span>
        );
      case 'quiz':
        return (
          <span className={`${styles.typeBadge} ${styles.badgeQuiz}`}>
            <HelpCircle size={14} /> Quiz
          </span>
        );
      default:
        return (
          <span className={`${styles.typeBadge} ${styles.badgeAnnouncement}`}>
            <Megaphone size={14} /> Post
          </span>
        );
    }
  };

  const getAccentClass = (type) => {
    switch (type) {
      case 'announcement':
        return styles.cardAccentAnnouncement;
      case 'material':
        return styles.cardAccentMaterial;
      case 'google_meet':
      case 'googleMeet':
        return styles.cardAccentGoogleMeet;
      case 'quiz':
        return styles.cardAccentQuiz;
      default:
        return styles.cardAccentAnnouncement;
    }
  };

  return (
    <div className={styles.postsContainer}>
      <div className={styles.topBar}>
        <div className={styles.topBarLeft}>
          <h2 className={styles.sectionTitle}>Stream & Posts</h2>
          <span className={styles.postCountBadge}>
            {sortedPosts.length} {sortedPosts.length === 1 ? 'post' : 'posts'}
          </span>
        </div>

        {userRole === 'teacher' && (
          <button 
            type="button" 
            className={styles.createPostBtn}
            onClick={() => setShowCreateForm(prev => !prev)}
          >
            <Plus size={16} />
            <span>{showCreateForm ? 'Cancel' : 'Create Post'}</span>
          </button>
        )}
      </div>

      {showCreateForm && (
        <CreatePostForm
          classroomId={classroomId}
          onPostCreated={handlePostCreated}
          onClose={() => setShowCreateForm(false)}
        />
      )}

      {sortedPosts.length === 0 ? (
        <div className={styles.emptyState}>
          <FolderOpen size={48} className={styles.emptyIcon} />
          <h3 className={styles.emptyTitle}>No posts yet</h3>
          <p className={styles.emptyText}>
            {userRole === 'teacher' 
              ? 'Click "Create Post" to share announcements, materials, or meet links with your students.'
              : 'Your teacher has not published any posts or materials in this classroom yet.'}
          </p>
        </div>
      ) : (
        <div className={styles.postsList}>
          {sortedPosts.map((post) => {
            const authorName = post.author?.username || 'Teacher';
            const authorInitial = authorName.charAt(0).toUpperCase();
            const formattedDate = post.createdAt
              ? new Date(post.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })
              : 'Recent';

            const quizId = post.quiz_id?._id || post.quiz_id;

            return (
              <div key={post._id || Math.random()} className={styles.postCard}>
                <div className={`${styles.cardAccent} ${getAccentClass(post.type)}`} />

                <div className={styles.postHeader}>
                  <h3 className={styles.postTitle}>{post.title}</h3>
                  {getTypeBadge(post.type)}
                </div>

                <p className={styles.postContent}>{post.content}</p>

                {/* Google Meet Link Action */}
                {(post.type === 'google_meet' || post.type === 'googleMeet') && post.meetLink && (
                  <div className={styles.actionSection}>
                    <a
                      href={post.meetLink.startsWith('http') ? post.meetLink : `https://${post.meetLink}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.meetButton}
                    >
                      <Video size={16} />
                      <span>Join Google Meet</span>
                      <ExternalLink size={14} />
                    </a>
                  </div>
                )}

                {/* Quiz Link Action */}
                {post.type === 'quiz' && quizId && (
                  <div className={styles.actionSection}>
                    <Link
                      href={`/quiz/${quizId}/attempt`}
                      className={styles.quizButton}
                    >
                      <HelpCircle size={16} />
                      <span>Attempt Quiz</span>
                    </Link>
                  </div>
                )}

                {/* Material Attachments */}
                {post.attachments && post.attachments.length > 0 && (
                  <div className={styles.actionSection}>
                    <div className={styles.attachmentsGrid}>
                      {post.attachments.map((url, idx) => (
                        <a
                          key={idx}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          download
                          className={styles.attachmentItem}
                        >
                          <Paperclip size={14} />
                          <span>PDF Document {idx + 1}</span>
                          <ExternalLink size={12} />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div className={styles.postFooter}>
                  <div className={styles.authorMeta}>
                    <div className={styles.authorAvatar}>
                      {authorInitial}
                    </div>
                    <span>{authorName}</span>
                  </div>

                  <div className={styles.postDate}>
                    <Calendar size={13} />
                    <span>{formattedDate}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}