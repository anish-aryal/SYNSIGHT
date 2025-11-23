import React from 'react';
import { Container, Navbar, NavbarBrand, Nav, Button } from 'reactstrap';
import { BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function LandingNavbar() {
  return (
    <Navbar light expand="md" className="bg-white border-bottom py-3 d-flex">
      <Container fluid>
        <NavbarBrand href="/" className="d-flex align-items-center gap-2 fw-bold">
          <BarChart3 size={24} className="text-primary" />
          <span>SYNSIGHT</span>
        </NavbarBrand>
        
        <Nav className="ms-auto d-flex align-items-center gap-3" navbar>
          <Link to="/login" className="text-dark text-decoration-none">Log In</Link>
          <Link to="/register">
            <Button color="dark" size="sm" className="px-3 rounded-2">
              Sign Up
            </Button>
          </Link>
        </Nav>
      </Container>
    </Navbar>
  );
}