import React from "react";
import { Row, Col, Button, InputGroup, Input } from "reactstrap";
import { Search, Plus } from "lucide-react";

export default function PageHeader({
  title,
  subtitle,
  showSearch = false,
  searchQuery = "",
  onSearchChange = () => {},
  searchPlaceholder = "Search...",
  showButton = false,
  buttonText = "New",
  buttonIcon = Plus,
  onButtonClick = () => {},
  customActions = null,
}) {
  const ButtonIcon = buttonIcon;

  return (
    <Row className="syn-page-header">
      <Col>
        <div className="syn-title">{title}</div>
        {subtitle ? <div className="syn-subtitle">{subtitle}</div> : null}
      </Col>

      {(showSearch || showButton || customActions) && (
        <Col xs="auto" className="syn-page-header-actions">
          {showSearch ? (
            <InputGroup className="syn-search">
              <Button type="button" className="syn-search-btn" aria-label="Search">
                <Search size={18} />
              </Button>

              <Input
                type="text"
                className="syn-search-input"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </InputGroup>
          ) : null}

          {showButton ? (
            <Button
              type="button"
              className="syn-btn-primary syn-btn-inline"
              onClick={onButtonClick}
            >
              <ButtonIcon size={16} />
              <span>{buttonText}</span>
            </Button>
          ) : null}

          {customActions}
        </Col>
      )}
    </Row>
  );
}
