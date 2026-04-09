import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import LedgerView from "./pages/LedgerView";
import SchemaBuilder from "./pages/SchemaBuilder";
import AddEntry from "./pages/AddEntry";

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 md:p-8">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/ledgers/:ledgerId" element={
              <ProtectedRoute>
                <LedgerView />
              </ProtectedRoute>
            } />
            
            <Route path="/ledgers/:ledgerId/schema-builder" element={
              <ProtectedRoute>
                <SchemaBuilder />
              </ProtectedRoute>
            } />
            
            <Route path="/ledgers/:ledgerId/add-entry" element={
              <ProtectedRoute>
                <AddEntry />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
