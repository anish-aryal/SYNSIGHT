import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar/Sidebar';

export default function AppLayout() {
  return (
    <>
      <Sidebar />
      <main className="min-vh-100 bg-light main-content">
        <Outlet />
      </main>
    </>
  );
}