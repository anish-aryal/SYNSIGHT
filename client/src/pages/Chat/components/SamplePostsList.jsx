import React, { useState } from 'react';
import { Row, Col, Card, CardBody } from 'reactstrap';
import { CheckCircle, XCircle, MinusCircle } from 'lucide-react';

export default function SamplePostsList({ posts }) {
  if (!posts || posts.length === 0) return null;
  const [expandedPosts, setExpandedPosts] = useState(() => new Set());

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

  const maxLength = 120;
  const truncateText = (text, length = maxLength) => {
    if (!text) return '';
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
  };

  const togglePost = (index) => {
    setExpandedPosts((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  return (
    <Card className="section-card">
      <CardBody className="p-0">
        <div className="section-header">Sample Posts</div>
        <div className="section-body">
          <Row>
            <Col xs={12}>
              {posts.slice(0, 5).map((post, index) => {
                const sentimentClass = post.sentiment?.toLowerCase() || 'neutral';
                const sentimentLabel = post.sentiment || 'Neutral';
                const text = post.text || '';
                const isLong = text.length > maxLength;
                const isExpanded = expandedPosts.has(index);

                return (
                  <div key={index} className="sample-post-item">
                    <div className={`post-icon ${sentimentClass}`}>
                      {getIcon(sentimentClass)}
                    </div>
                    <div className="post-content">
                      <div className="post-text-row">
                        <p className="post-text">
                          {isExpanded ? text : truncateText(text)}
                        </p>
                        {isLong && (
                          <button
                            type="button"
                            className="post-toggle"
                            onClick={() => togglePost(index)}
                            aria-expanded={isExpanded}
                          >
                            {isExpanded ? 'Show less' : 'Read more'}
                          </button>
                        )}
                      </div>
                      <div className="post-meta">
                        <span className={`pill pill-${sentimentClass} pill-sm post-sentiment-pill`}>
                          {sentimentLabel}
                        </span>
                        <span className="post-platform">{post.platform}</span>
                      </div>
                    </div>
                    {typeof post.confidence === 'number' && (
                      <span className="post-confidence">{post.confidence}%</span>
                    )}
                  </div>
                );
              })}
            </Col>
          </Row>
        </div>
      </CardBody>
    </Card>
  );
}
