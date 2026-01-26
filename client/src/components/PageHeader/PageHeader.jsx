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
            <InputGroup style={{ width: 280 }}>
              <Button
                type="button"
                className="syn-icon-btn"
                style={{
                  borderTopRightRadius: 0,
                  borderBottomRightRadius: 0,
                  border: "1px solid var(--syn-border)",
                  background: "var(--syn-surface)",
                }}
                aria-label="Search"
              >
                <Search size={18} />
              </Button>

              <Input
                type="text"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                style={{
                  border: "1px solid var(--syn-border)",
                  borderLeft: "none",
                  borderTopRightRadius: "var(--syn-radius-btn)",
                  borderBottomRightRadius: "var(--syn-radius-btn)",
                  borderTopLeftRadius: 0,
                  borderBottomLeftRadius: 0,
                  background: "var(--syn-surface)",
                  height: 36,
                  fontSize: "14px",
                }}
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
