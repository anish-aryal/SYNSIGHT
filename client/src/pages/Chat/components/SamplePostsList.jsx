import React, { useEffect, useState } from 'react';
import { Row, Col, Card, CardBody } from 'reactstrap';
import { CheckCircle, XCircle, MinusCircle } from 'lucide-react';

// Sample Posts List UI block for Chat page.

export default function SamplePostsList({ posts, pageSize = 5 }) {
  if (!posts || posts.length === 0) return null;
  const [expandedPosts, setExpandedPosts] = useState(() => new Set());
  const [page, setPage] = useState(0);

  useEffect(() => {
    setPage(0);
    setExpandedPosts(new Set());
  }, [posts]);

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

  const totalPosts = posts.length;
  const totalPages = Math.max(1, Math.ceil(totalPosts / pageSize));
  const safePage = Math.min(page, totalPages - 1);
  const startIndex = safePage * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalPosts);
  const pagePosts = posts.slice(startIndex, endIndex);

  // Layout and appearance
  return (
    <Card className="section-card">
      <CardBody className="p-0">
        <div className="section-header sample-posts-header">
          <span>Sample Posts</span>
          <span className="sample-posts-count">
            Showing {startIndex + 1}-{endIndex} of {totalPosts}
          </span>
        </div>
        <div className="section-body">
          <Row>
            <Col xs={12}>
              {pagePosts.map((post, index) => {
                const postKey = post.id || post._id || post.url || `${startIndex + index}`;
                const sentimentClass = post.sentiment?.toLowerCase() || 'neutral';
                const sentimentLabel = post.sentiment || 'Neutral';
                const text = post.text || '';
                const isLong = text.length > maxLength;
                const isExpanded = expandedPosts.has(postKey);

                return (
                  <div key={postKey} className="sample-post-item">
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
                            onClick={() => togglePost(postKey)}
                            aria-expanded={isExpanded}
                          >
                            {isExpanded ? 'Less' : 'More'}
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
          {totalPages > 1 && (
            <div className="sample-posts-pagination">
              <button
                type="button"
                className="sample-posts-page-btn"
                onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
                disabled={safePage === 0}
              >
                Previous
              </button>
              <span className="sample-posts-page-indicator">
                Page {safePage + 1} of {totalPages}
              </span>
              <button
                type="button"
                className="sample-posts-page-btn primary"
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages - 1))}
                disabled={safePage === totalPages - 1}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
