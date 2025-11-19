// client/src/App.jsx
import { useState } from "react";
import Dashboard from "./components/Dashboard";

function App() {
  return (
    <div className="app">
      <header className="topbar">
        <h1>Social Sentiment Dashboard</h1>
      </header>

      <div className="layout">
        <aside className="sidebar">
          {/* history, filters, nav items later */}
          <p>Search History</p>
        </aside>

        <main className="main">
          <Dashboard />
        </main>
      </div>
    </div>
  );
}

export default App;
