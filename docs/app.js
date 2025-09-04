const { useState } = React;
const { createRoot } = ReactDOM;
const { HashRouter, Routes, Route, Link } = ReactRouterDOM;

function Landing() {
  return (
    <div className="container">
      <h1>Trip Management System</h1>
      <p>University of Haifa - International Studies</p>
      <div>
        <Link to="/admin"><button>Administrator App</button></Link>
        <Link to="/student"><button>Student App</button></Link>
      </div>
    </div>
  );
}

function AdminApp() {
  return (
    <div className="container">
      <h2>Administrator Dashboard</h2>
      <p>Manage students, events, registrations, attendance, and reports.</p>
      <Link to="/"><button>Back</button></Link>
    </div>
  );
}

function StudentApp() {
  return (
    <div className="container">
      <h2>Student Dashboard</h2>
      <p>View trips, manage registrations, balance, and notifications.</p>
      <Link to="/"><button>Back</button></Link>
    </div>
  );
}

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/admin" element={<AdminApp />} />
        <Route path="/student" element={<StudentApp />} />
      </Routes>
    </HashRouter>
  );
}

const root = createRoot(document.getElementById("app"));
root.render(<App />);
