import React from 'react';
import { InputGroup, Input, Button } from 'reactstrap';
import { Settings, Send } from 'lucide-react';

export default function SearchBar({ value, onChange, onSearch }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (value.trim()) {
      onSearch(value);
    }
  };

  return (
    <div className="search-bar-wrapper">
      <form onSubmit={handleSubmit}>
        <InputGroup className="search-input-group">
          <Input
            type="text"
            placeholder="Search for any keyword, brand, or topic..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="search-input fs-6"
          />
          <Button color="light" className="options-btn">
            <Settings size={18} />
            <span>Options</span>
          </Button>
          <Button color="dark" borsurf type="submit" className="send-btn rounded-2">
            <Send size={20} />
          </Button>
        </InputGroup>
      </form>
    </div>
  );
}