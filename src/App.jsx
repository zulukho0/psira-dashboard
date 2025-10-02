import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import StudentsPage from './pages/StudentsPage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { AuthProvider } from './context/AuthContext.jsx';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<LoginPage />} />

          {/* Protected */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/students" element={<StudentsPage />} />
            {/* Future:
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/classes" element={<ClassesPage />} />
            <Route path="/results" element={<ResultsPage />} />
            <Route path="/instructors" element={<InstructorsPage />} />
            */}
          </Route>

          {/* Fallback */}
          <Route path="*" element={<div className="p-6">Not found</div>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}