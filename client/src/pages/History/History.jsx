import React, { useEffect } from 'react';
import { Container, Row, Col, Card, CardBody } from 'reactstrap';
import { useChat } from '../../api/context/ChatContext';
import { MessageSquare, Clock, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function History() {
  const { chats, chatsLoading, fetchChats, removeChat } = useChat();
  const navigate = useNavigate();

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

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h4 className="fw-semibold">Chat History</h4>
          <p className="text-muted">View and manage your past conversations</p>
        </Col>
      </Row>

      <Row>
        {chatsLoading ? (
          <Col xs={12} className="text-center py-5">
            <div className="spinner-border text-primary" role="status" />
          </Col>
        ) : chats.length === 0 ? (
          <Col xs={12} className="text-center py-5">
            <MessageSquare size={48} className="text-muted mb-3" />
            <h5>No chats yet</h5>
            <p className="text-muted">Start a new conversation to see it here</p>
          </Col>
        ) : (
          chats.map((chat) => (
            <Col xs={12} md={6} lg={4} key={chat._id} className="mb-3">
              <Card 
                className="h-100 cursor-pointer hover-shadow"
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
                      onClick={(e) => {
                        e.stopPropagation();
                        removeChat(chat._id);
                      }}
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
          ))
        )}
      </Row>
    </Container>
  );
}