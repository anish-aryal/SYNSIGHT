import React from 'react';
import { Outlet } from 'react-router-dom';
import { Container, Row, Col } from 'reactstrap';
import Sidebar from '../components/Sidebar/Sidebar';

// App Layout layout wrapper and page chrome.

export default function AppLayout() {
  // Layout and appearance
  return (
    <>
      <Sidebar mode="mobile" />
      <Container fluid className="app-layout">
        <Row className="app-layout-row">
          <Col lg={2} className="sidebar-col d-none d-lg-block">
            <div className="app-sidebar">
              <Sidebar mode="desktop" />
            </div>
          </Col>
          <Col xs={12} lg={10} className="content-col">
            <main className="main-content">
              <Outlet />
            </main>
          </Col>
        </Row>
      </Container>
    </>
  );
}
