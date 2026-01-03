import React from 'react';
import { Row, Col, Card, CardBody, Badge } from 'reactstrap';
import { CheckCircle, XCircle, MinusCircle } from 'lucide-react';

export default function SamplePostsList({ posts }) {
  if (!posts || posts.length === 0) return null;

  const getIcon = (sentiment) => {
    switch (sentiment?.toLowerCase()) {
      case 'positive':
        return <CheckCircle size={14} />;
      case 'negative':
        return <XCircle size={14} />;
      default:
        return <MinusCircle size={14} />;
    }
  };

  const truncateText = (text, maxLength = 80) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <Card className="section-card">
      <CardBody className="p-0">
        <div className="section-header">Sample Posts</div>
        <div className="section-body">
          <Row>
            <Col xs={12}>
              {posts.slice(0, 5).map((post, index) => (
                <div key={index} className="sample-post-item">
                  <div className={`post-icon ${post.sentiment?.toLowerCase()}`}>
                    {getIcon(post.sentiment)}
                  </div>
                  <div className="post-content">
                    <p className="post-text">{truncateText(post.text)}</p>
                    <div className="post-meta">
                      <Badge className={`post-sentiment-badge ${post.sentiment?.toLowerCase()}`}>
                        {post.sentiment}
                      </Badge>
                      <span className="post-platform">{post.platform}</span>
                    </div>
                  </div>
                  <span className="post-confidence">{post.confidence}%</span>
                </div>
              ))}
            </Col>
          </Row>
        </div>
      </CardBody>
    </Card>
  );
}