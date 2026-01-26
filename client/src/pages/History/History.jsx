import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Container, Row, Col, Card, CardBody, Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
import { useChat } from '../../api/context/ChatContext';
import { MessageSquare, Clock, Trash2, MoreVertical, ArrowRight, Pencil, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../api/context/AppContext';
import PageHeader from '../../components/PageHeader/PageHeader';

export default function History() {
  const { chats, chatsLoading, fetchChats, deleteChat, updateChat, chatsPagination } = useChat();
  const { showSuccess, showError } = useApp();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(12);
  const [searchQuery, setSearchQuery] = useState('');
  const [chatToDelete, setChatToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingChatId, setEditingChatId] = useState(null);
  const [titleDraft, setTitleDraft] = useState('');
  const [isSavingTitle, setIsSavingTitle] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [previewTooltip, setPreviewTooltip] = useState(null);

  useEffect(() => {
    fetchChats({ page: currentPage, limit: pageSize });
  }, [fetchChats, currentPage, pageSize]);

  useEffect(() => {
    if (!chatsPagination?.pages) return;
    if (currentPage > chatsPagination.pages) {
      setCurrentPage(Math.max(chatsPagination.pages, 1));
    }
  }, [chatsPagination?.pages, currentPage]);

  useEffect(() => {
    if (!openMenuId) return;
    const handleClick = (event) => {
      const container = document.querySelector(`[data-history-menu="${openMenuId}"]`);
      if (container && !container.contains(event.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [openMenuId]);

  const handleChatClick = (chatId) => {
    navigate(`/chat/${chatId}`);
  };

  const handleNewChat = () => {
    navigate('/chat');
  };

  const formatDate = (date) => {
    if (!date) return 'Unknown date';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const safeChats = Array.isArray(chats) ? chats : [];
  const sortedChats = useMemo(() => (
    [...safeChats].sort((a, b) => {
      const dateA = new Date(a?.updatedAt || a?.createdAt || 0).getTime();
      const dateB = new Date(b?.updatedAt || b?.createdAt || 0).getTime();
      return dateB - dateA;
    })
  ), [safeChats]);

  const filteredChats = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return sortedChats;
    return sortedChats.filter((chat) => {
      const title = (chat?.title || '').toLowerCase();
      const preview = (chat?.preview || '').toLowerCase();
      return title.includes(query) || preview.includes(query);
    });
  }, [sortedChats, searchQuery]);

  const totalChats = searchQuery.trim()
    ? filteredChats.length
    : chatsPagination?.total ?? filteredChats.length;
  const totalPages = Math.max(chatsPagination?.pages || 1, 1);
  const canPrev = currentPage > 1;
  const canNext = currentPage < totalPages;

  const handleDeleteClick = (e, chat) => {
    e.stopPropagation();
    setOpenMenuId(null);
    setChatToDelete(chat);
    setIsDeleteModalOpen(true);
  };

  const startEditTitle = (e, chat) => {
    e.stopPropagation();
    setOpenMenuId(null);
    setEditingChatId(chat._id);
    setTitleDraft(chat.title || '');
  };

  const cancelEditTitle = () => {
    setEditingChatId(null);
    setTitleDraft('');
  };

  const saveTitle = async (chatId) => {
    const nextTitle = titleDraft.trim();
    if (!nextTitle) {
      showError('Title cannot be empty');
      return;
    }
    setIsSavingTitle(true);
    const res = await updateChat(chatId, { title: nextTitle }, { preserveUpdatedAt: true });
    if (!res?.success) {
      showError(res?.message || 'Failed to update chat');
    } else {
      showSuccess('Chat title updated');
      setEditingChatId(null);
      setTitleDraft('');
    }
    setIsSavingTitle(false);
  };

  const confirmDelete = async () => {
    if (!chatToDelete) return;

    setIsDeleting(true);

    // Close modal immediately for smoother UX
    setIsDeleteModalOpen(false);

    try {
      const success = await deleteChat(chatToDelete._id);
      if (success) {
        showSuccess('Chat deleted successfully');
        await fetchChats({ page: currentPage, limit: pageSize });
      } else {
        showError('Failed to delete chat');
      }
    } catch (err) {
      showError(err.message || 'Failed to delete chat');
    } finally {
      setIsDeleting(false);
      setChatToDelete(null);
    }
  };

  const cancelDelete = () => {
    setIsDeleteModalOpen(false);
    setChatToDelete(null);
  };

  const showPreviewTooltip = (event, items) => {
    if (!items || items.length === 0) return;
    const rect = event.currentTarget.getBoundingClientRect();
    setPreviewTooltip({
      items,
      x: rect.left,
      y: rect.top
    });
  };

  const hidePreviewTooltip = () => {
    setPreviewTooltip(null);
  };

  return (
    <div className="history-page">
      <Container className="history-container">
        <div className="history-layout">
          <div className="history-header">
            <Row>
              <Col>
                <div className="history-hero">
                  <PageHeader
                    title="Chat History"
                    subtitle="View and manage your past conversations"
                    showSearch={true}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    searchPlaceholder="Search chats..."
                    showButton={true}
                    buttonText="New Chat"
                    onButtonClick={handleNewChat}
                  />
                  <div className="history-meta">
                    <span className="history-count">{totalChats} chats</span>
                  </div>
                </div>
              </Col>
            </Row>
          </div>

          <div className="history-scroll-area">
            <Row>
              <Col xs={12}>
                {chatsLoading ? (
                  <div className="history-card-list">
                    {Array.from({ length: 6 }).map((_, idx) => (
                      <Card key={`history-skeleton-${idx}`} className="history-card history-card-skeleton">
                        <CardBody className="history-card-body">
                          <div className="history-card-main">
                            <div className="history-card-icon" />
                            <div className="history-card-content">
                              <div className="skeleton-line" style={{ width: '40%' }} />
                              <div className="skeleton-line" style={{ width: '70%' }} />
                            </div>
                          </div>
                        </CardBody>
                      </Card>
                    ))}
                  </div>
                ) : filteredChats.length === 0 ? (
                  <div className="history-empty">
                    <MessageSquare size={46} />
                    <h5>No chats yet</h5>
                    <p>Start a new conversation to see it here.</p>
                    <Button className="history-empty-btn" onClick={handleNewChat}>
                      Start a chat
                    </Button>
                  </div>
                ) : (
                  <div className="history-card-list">
                    {filteredChats.map((chat) => {
                      const isDeletingThisChat = isDeleting && chatToDelete?._id === chat._id;
                      const title = chat.title || 'Untitled chat';
                      const analysisCount = chat.analysisCount ?? 0;
                      const preview = (chat.preview || '').trim();
                      const analysisPreviews = Array.isArray(chat.analysisPreviews) ? chat.analysisPreviews : [];
                      const tooltipItems = analysisPreviews.length
                        ? analysisPreviews
                        : (preview ? [preview] : []);
                      const isEditing = editingChatId === chat._id;
                      return (
                        <Card
                          key={chat._id}
                          className={`history-card ${isDeletingThisChat ? 'is-deleting' : ''}`}
                          onClick={() => {
                            if (!isEditing) handleChatClick(chat._id);
                          }}
                        >
                          <CardBody className="history-card-body">
                            <div className="history-card-main">
                              <div className="history-card-icon">
                                <MessageSquare size={20} />
                              </div>
                              <div className="history-card-content">
                                <div className="history-card-title-row">
                                  {isEditing ? (
                                    <div className="history-title-edit">
                                      <input
                                        className="history-title-input"
                                        value={titleDraft}
                                        onChange={(e) => setTitleDraft(e.target.value)}
                                        onClick={(e) => e.stopPropagation()}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') {
                                            e.preventDefault();
                                            saveTitle(chat._id);
                                          }
                                          if (e.key === 'Escape') {
                                            e.preventDefault();
                                            cancelEditTitle();
                                          }
                                        }}
                                      />
                                      <div className="history-title-actions">
                                        <button
                                          type="button"
                                          className="history-title-btn"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            saveTitle(chat._id);
                                          }}
                                          disabled={isSavingTitle}
                                        >
                                          Save
                                        </button>
                                        <button
                                          type="button"
                                          className="history-title-btn ghost"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            cancelEditTitle();
                                          }}
                                          disabled={isSavingTitle}
                                        >
                                          Cancel
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <h6 className="history-card-title">{title}</h6>
                                  )}
                                </div>
                                <div className="history-card-meta">
                                  <span
                                    className="history-card-meta-item history-card-meta-preview"
                                    onMouseEnter={(e) => showPreviewTooltip(e, tooltipItems)}
                                    onMouseLeave={hidePreviewTooltip}
                                    onFocus={(e) => showPreviewTooltip(e, tooltipItems)}
                                    onBlur={hidePreviewTooltip}
                                  >
                                    <MessageSquare size={14} />
                                    {analysisCount} analyses
                                  </span>
                                  <span className="history-card-meta-item">
                                    <Clock size={14} />
                                    {formatDate(chat.updatedAt || chat.createdAt)}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div
                              className={`history-card-actions ${openMenuId === chat._id ? 'is-menu-open' : ''}`}
                              data-history-menu={chat._id}
                            >
                              <div className="history-card-actions-main">
                                <button
                                  className="history-card-open"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleChatClick(chat._id);
                                  }}
                                >
                                  Open chat
                                  <ArrowRight size={16} />
                                </button>
                                {openMenuId === chat._id ? (
                                  <div
                                    className="history-dropdown history-dropdown-panel"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <button
                                      type="button"
                                      className="history-menu-item"
                                      onClick={(e) => startEditTitle(e, chat)}
                                    >
                                      <Pencil size={16} />
                                      <span>Edit title</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(e) => handleDeleteClick(e, chat)}
                                      className="history-menu-item history-menu-danger"
                                    >
                                      <Trash2 size={16} />
                                      <span>Delete</span>
                                    </button>
                                  </div>
                                ) : null}
                              </div>
                              <button
                                type="button"
                                className="history-card-menu"
                                aria-haspopup="menu"
                                aria-expanded={openMenuId === chat._id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenMenuId((prev) => (prev === chat._id ? null : chat._id));
                                }}
                              >
                                <MoreVertical size={18} />
                              </button>
                            </div>
                          </CardBody>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </Col>
            </Row>
          </div>

          {!chatsLoading && totalPages > 1 ? (
            <div className="history-footer">
              <div className="history-pagination">
                <Button
                  className="history-pagination-btn"
                  color="light"
                  disabled={!canPrev}
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                >
                  <ChevronLeft size={16} className="history-pagination-icon" />
                  <span>Previous</span>
                </Button>
                <span className="history-pagination-meta">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  className="history-pagination-btn"
                  color="light"
                  disabled={!canNext}
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                >
                  <span>Next</span>
                  <ChevronRight size={16} className="history-pagination-icon" />
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </Container>

      <Modal isOpen={isDeleteModalOpen} toggle={cancelDelete} centered>
        <ModalHeader toggle={cancelDelete}>Delete Chat</ModalHeader>
        <ModalBody className="history-modal-body">
          <p className="history-modal-text">
            Are you sure you want to delete{' '}
            <strong>{chatToDelete?.title || 'this chat'}</strong>?
          </p>
          <p className="history-modal-note">
            This action cannot be undone. All messages in this chat will be permanently deleted.
          </p>
        </ModalBody>
        <ModalFooter className="history-modal-footer">
          <Button className="history-modal-cancel" color="light" onClick={cancelDelete} disabled={isDeleting}>
            Cancel
          </Button>
          <Button className="history-modal-delete" color="danger" onClick={confirmDelete} disabled={isDeleting}>
            {isDeleting ? (
              <>
                <span className="skeleton-line skeleton-inline history-delete-loader" style={{ width: '60px', height: '12px' }} />
                <span>Deleting...</span>
              </>
            ) : (
              'Delete'
            )}
          </Button>
        </ModalFooter>
      </Modal>
      {previewTooltip ? createPortal(
        <div className="history-preview-portal" style={{ left: previewTooltip.x, top: previewTooltip.y }}>
          <span className="history-preview-title">Analyses</span>
          <span className="history-preview-list">
            {previewTooltip.items.map((item, index) => (
              <span key={`history-preview-${index}`} className="history-preview-item">
                {item}
              </span>
            ))}
          </span>
        </div>,
        document.body
      ) : null}
    </div>
  );
}
