import React, { useEffect, useMemo, useState } from 'react';
import {
  MessageSquare,
  PencilLine,
  Trash2,
  Check,
  X,
  ArrowUp,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { useApp } from '../../api/context/AppContext';
import { useAuth } from '../../api/context/AuthContext';
import projectService from '../../api/services/projectService';
import * as analysisService from '../../api/services/analysisService';
import reportService from '../../api/services/reportService';

const SERVICE_MAP = {
  project: {
    add: projectService.addProjectComment,
    update: projectService.updateProjectComment,
    remove: projectService.deleteProjectComment
  },
  analysis: {
    add: analysisService.addAnalysisComment,
    update: analysisService.updateAnalysisComment,
    remove: analysisService.deleteAnalysisComment
  },
  report: {
    add: reportService.addReportComment,
    update: reportService.updateReportComment,
    remove: reportService.deleteReportComment
  }
};

const normalizeText = (value) => (typeof value === 'string' ? value.trim() : '');
const formatRelativeTime = (value) => {
  if (!value) return 'Just now';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Just now';
  const diffMs = Date.now() - parsed.getTime();
  if (diffMs < 60000) return 'Just now';
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export default function HeaderComments({
  entityType,
  entityId,
  initialComments = [],
  className = ''
}) {
  const { showError, showSuccess } = useApp();
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [draft, setDraft] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [action, setAction] = useState(null);
  const [seeded, setSeeded] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setSeeded(false);
  }, [entityId]);

  useEffect(() => {
    if (seeded) return;
    if (!Array.isArray(initialComments)) return;
    setComments(initialComments);
    setSeeded(true);
  }, [initialComments, seeded]);

  const handlers = useMemo(() => SERVICE_MAP[entityType], [entityType]);
  const displayName = user?.fullName || user?.name || 'You';
  const avatarInitial = (displayName || 'U').trim().charAt(0).toUpperCase();

  if (!entityId || !handlers) return null;

  const isBusy = Boolean(action);

  const applyResponse = (response, fallbackUpdater) => {
    if (response?.success) {
      if (Array.isArray(response.data)) {
        setComments(response.data);
      } else if (typeof fallbackUpdater === 'function') {
        setComments(fallbackUpdater);
      }
      return true;
    }
    return false;
  };

  const handleAdd = async () => {
    const text = normalizeText(draft);
    if (!text) {
      showError('Please enter a comment.');
      return;
    }

    setAction({ type: 'add' });
    try {
      const response = await handlers.add(entityId, text);
      if (applyResponse(response, (prev) => [...prev, { _id: Date.now().toString(), text }])) {
        setDraft('');
        showSuccess('Comment added');
      } else {
        throw new Error(response?.message || 'Failed to add comment');
      }
    } catch (error) {
      const message = error?.response?.data?.message || error.message || 'Failed to add comment';
      showError(message);
    } finally {
      setAction(null);
    }
  };

  const handleDraftKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleAdd();
    }
  };

  const handleEdit = (comment) => {
    setEditingId(comment?._id || null);
    setEditingText(comment?.text || '');
  };

  const handleUpdate = async (commentId) => {
    const text = normalizeText(editingText);
    if (!text) {
      showError('Please enter a comment.');
      return;
    }

    setAction({ type: 'edit', id: commentId });
    try {
      const response = await handlers.update(entityId, commentId, text);
      if (
        applyResponse(response, (prev) =>
          prev.map((item) => (item._id === commentId ? { ...item, text } : item))
        )
      ) {
        showSuccess('Comment updated');
        setEditingId(null);
        setEditingText('');
      } else {
        throw new Error(response?.message || 'Failed to update comment');
      }
    } catch (error) {
      const message = error?.response?.data?.message || error.message || 'Failed to update comment';
      showError(message);
    } finally {
      setAction(null);
    }
  };

  const handleDelete = async (commentId) => {
    setAction({ type: 'delete', id: commentId });
    try {
      const response = await handlers.remove(entityId, commentId);
      if (
        applyResponse(response, (prev) => prev.filter((item) => item._id !== commentId))
      ) {
        showSuccess('Comment deleted');
      } else {
        throw new Error(response?.message || 'Failed to delete comment');
      }
    } catch (error) {
      const message = error?.response?.data?.message || error.message || 'Failed to delete comment';
      showError(message);
    } finally {
      setAction(null);
    }
  };

  return (
    <div
      className={`header-comments ${!isOpen ? 'is-collapsed' : ''} ${className}`.trim()}
    >
      <div className="header-comments-header">
        <div className="header-comments-title">
          <MessageSquare size={16} />
          <span>Comments</span>
        </div>
        <div className="header-comments-header-actions">
          <span className="header-comments-count">{comments.length}</span>
          <button
            type="button"
            className="header-comments-toggle"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-expanded={isOpen}
            aria-label={isOpen ? 'Hide comments' : 'Show comments'}
          >
            {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            <span>{isOpen ? 'Hide' : 'Show'}</span>
          </button>
        </div>
      </div>

      {isOpen ? (
        <>
          <div className="header-comments-composer">
            <div className="header-comments-avatar">{avatarInitial}</div>
            <div className="header-comments-composer-body">
              <textarea
                className="header-comments-composer-input"
                placeholder="Add a comment..."
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={handleDraftKeyDown}
                rows={1}
              />
              <button
                type="button"
                className="header-comments-send"
                onClick={handleAdd}
                disabled={isBusy}
                aria-label="Send comment"
              >
                <ArrowUp size={14} />
              </button>
            </div>
          </div>

          <div className="header-comments-list">
            {comments.length === 0 ? null : comments.map((comment) => {
                const isEditing = editingId === comment._id;
                const isActing = action?.id === comment._id;
                const commentTime = formatRelativeTime(comment.updatedAt || comment.createdAt);
                return (
                  <div key={comment._id} className="header-comments-item">
                    <div className="header-comments-item-top">
                      <div className="header-comments-item-meta">
                        <div className="header-comments-item-avatar">{avatarInitial}</div>
                        <div className="header-comments-item-meta-text">
                          <span className="header-comments-item-name">{displayName}</span>
                          <span className="header-comments-item-time">{commentTime}</span>
                        </div>
                      </div>
                      <div className="header-comments-item-actions">
                        {isEditing ? (
                          <>
                            <button
                              type="button"
                              className="header-comments-icon-btn"
                              onClick={() => handleUpdate(comment._id)}
                              disabled={isActing}
                              aria-label="Save comment"
                            >
                              <Check size={14} />
                            </button>
                            <button
                              type="button"
                              className="header-comments-icon-btn"
                              onClick={() => {
                                setEditingId(null);
                                setEditingText('');
                              }}
                              disabled={isActing}
                              aria-label="Cancel edit"
                            >
                              <X size={14} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              className="header-comments-icon-btn"
                              onClick={() => handleEdit(comment)}
                              disabled={isBusy}
                              aria-label="Edit comment"
                            >
                              <PencilLine size={14} />
                            </button>
                            <button
                              type="button"
                              className="header-comments-icon-btn"
                              onClick={() => handleDelete(comment._id)}
                              disabled={isBusy}
                              aria-label="Delete comment"
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    {isEditing ? (
                      <textarea
                        className="header-comments-edit-input"
                        value={editingText}
                        onChange={(event) => setEditingText(event.target.value)}
                        rows={3}
                      />
                    ) : (
                      <p className="header-comments-text">{comment.text}</p>
                    )}
                  </div>
                );
              })}
          </div>
        </>
      ) : null}
    </div>
  );
}
