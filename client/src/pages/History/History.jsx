import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, CardBody, Modal, ModalHeader, ModalBody, ModalFooter, Button, Spinner } from 'reactstrap';
import { useChat } from '../../api/context/ChatContext';
import { MessageSquare, Clock, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../api/context/AppContext';
import './History.css';

export default function History() {
  const { chats, chatsLoading, fetchChats, deleteChat } = useChat();
  const { showSuccess, showError } = useApp();
  const navigate = useNavigate();
  const [chatToDelete, setChatToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  const handleChatClick = (chatId) => {
    navigate(`/chat/${chatId}`);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleDeleteClick = (e, chat) => {
    e.stopPropagation();
    setChatToDelete(chat);
    setIsDeleteModalOpen(true);
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

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h4 className="fw-semibold">Chat History</h4>
          <p className="text-muted">View and manage your past conversations</p>
        </Col>
      </Row>

      <Row>
        {chats.length === 0 && !chatsLoading ? (
          <Col xs={12} className="text-center py-5">
            <MessageSquare size={48} className="text-muted mb-3" />
            <h5>No chats yet</h5>
            <p className="text-muted">Start a new conversation to see it here</p>
          </Col>
        ) : (
          chats.map((chat) => {
            const isDeletingThisChat = isDeleting && chatToDelete?._id === chat._id;
            return (
              <Col xs={12} md={6} lg={4} key={chat._id} className="mb-3">
                <Card
                  className={`h-100 cursor-pointer hover-shadow ${isDeletingThisChat ? 'chat-item-deleting' : ''}`}
                  onClick={() => handleChatClick(chat._id)}
                  style={{ cursor: 'pointer' }}
                >
                  <CardBody>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h6 className="mb-0 fw-semibold text-truncate" style={{ maxWidth: '80%' }}>
                        {chat.title}
                      </h6>
                      <button
                        className="btn btn-link text-danger p-0"
                        onClick={(e) => handleDeleteClick(e, chat)}
                        aria-label="Delete chat"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <p className="text-muted small mb-2 text-truncate">
                      {chat.preview || 'No messages'}
                    </p>
                    <div className="d-flex align-items-center gap-3 text-muted small">
                      <span className="d-flex align-items-center gap-1">
                        <MessageSquare size={14} />
                        {chat.analysisCount} analyses
                      </span>
                      <span className="d-flex align-items-center gap-1">
                        <Clock size={14} />
                        {formatDate(chat.updatedAt)}
                      </span>
                    </div>
                  </CardBody>
                </Card>
              </Col>
            );
          })
        )}
      </Row>

      <Modal isOpen={isDeleteModalOpen} toggle={cancelDelete} centered>
        <ModalHeader toggle={cancelDelete}>Delete Chat</ModalHeader>
        <ModalBody>
          <p className="mb-0">
            Are you sure you want to delete{' '}
            <strong>{chatToDelete?.title || 'this chat'}</strong>?
          </p>
          <p className="text-muted mb-0 mt-2" style={{ fontSize: '0.875rem' }}>
            This action cannot be undone. All messages in this chat will be permanently deleted.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button color="light" onClick={cancelDelete} disabled={isDeleting}>
            Cancel
          </Button>
          <Button color="danger" onClick={confirmDelete} disabled={isDeleting}>
            {isDeleting ? (
              <>
                <Spinner size="sm" className="me-2" />
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </Button>
        </ModalFooter>
      </Modal>
    </Container>
  );
}