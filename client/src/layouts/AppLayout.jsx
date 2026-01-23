import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Container, Row, Col } from 'reactstrap';
import Sidebar from '../components/Sidebar/Sidebar';

export default function AppLayout() {
  const location = useLocation();
  const isChatRoute = location.pathname.startsWith('/chat');

  return (
    <>
      <Sidebar />
      <main className="min-vh-100 bg-light main-content">
        {isChatRoute ? (
          <Outlet />
        ) : (
          <Container fluid className="app-shell">
            <Row className="justify-content-center">
              <Col xs={12} lg={11} xl={10} xxl={9} className="app-shell-col">
                <Outlet />
              </Col>
            </Row>
          </Container>
        )}
      </main>
    </>
  );
}
