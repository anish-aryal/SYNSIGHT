import React from 'react';
import { Row, Col, Input, Button, InputGroup } from 'reactstrap';
import { Send, SlidersHorizontal } from 'lucide-react';

// Search Bar UI block for Chat page.

export default function SearchBar({ value, onChange, onSearch }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (value.trim()) {
      onSearch(value);
    }
  };

  // Layout and appearance
  return (
    <Row className="search-bar-wrapper justify-content-center">
      <Col xs={12}>
        <form onSubmit={handleSubmit}>
          <InputGroup className="search-input-group">
            <Input
              type="text"
              placeholder="Ask about any topic, brand, or keyword..."
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="search-input border-0"
            />
            <Button color="link" className="options-btn">
              <SlidersHorizontal size={16} />
              <span>Options</span>
            </Button>
            <Button color="dark" type="submit" className="send-btn rounded-2">
              <Send size={18} />
            </Button>
          </InputGroup>
        </form>
      </Col>
    </Row>
  );
}