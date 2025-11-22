import React from 'react';
import { Button, InputGroup, Input } from 'reactstrap';
import { Search, Plus } from 'lucide-react';
import './PageHeader.css';

export default function PageHeader({ 
  title, 
  subtitle, 
  showSearch = false,
  searchQuery = '',
  onSearchChange = () => {},
  searchPlaceholder = 'Search...',
  showButton = false,
  buttonText = 'New',
  buttonIcon = Plus,
  onButtonClick = () => {},
  customActions = null
}) {
  const ButtonIcon = buttonIcon;

  return (
    <div className="page-header d-flex justify-content-between align-items-start mb-4">
      <div>
        <h4 className="fw-semibold mb-1">{title}</h4>
        <p className="text-muted mb-0">{subtitle}</p>
      </div>
      
      {(showSearch || showButton || customActions) && (
        <div className="d-flex gap-2">
          {showSearch && (
            <InputGroup style={{ width: '250px' }}>
              <Button color="light" className="border border-end-0">
                <Search size={18} />
              </Button>
              <Input
                type="text"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="border-start-0"
              />
            </InputGroup>
          )}
          
          {showButton && (
            <Button 
              className="gradient-primary border-0 d-flex align-items-center gap-2 px-3"
              onClick={onButtonClick}
            >
              <ButtonIcon size={18} />
              <span>{buttonText}</span>
            </Button>
          )}

          {customActions}
        </div>
      )}
    </div>
  );
}