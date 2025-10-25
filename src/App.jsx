import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import StudentsPage from './features/students/pages/StudentsPage.jsx';
import CoursesPage from './features/courses/pages/CoursesPage.jsx';
import InstructorsPage from './features/instructors/pages/InstructorsPage.jsx';
import ClassesPage from './features/classes/pages/ClassesPage.jsx';
<<<<<<< Updated upstream
import ManageStudentsPage from './features/classes/pages/ManageStudentsPage.jsx';
=======
import ManageClassesPage from './features/classes/pages/ManageClassesPage.jsx';
import ManageSubjectsPage from './features/courses/pages/ManageSubjectsPage.jsx';
>>>>>>> Stashed changes
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
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/instructors" element={<InstructorsPage />} />
            <Route path="/classes" element={<ClassesPage />} />
<<<<<<< Updated upstream
            <Route path="/classes/:id/students" element={<ManageStudentsPage />} />
=======
            <Route path="/classes/:id/manage" element={<ManageClassesPage />} />
            <Route path="/courses/:courseId/subjects" element={<ManageSubjectsPage />} />
>>>>>>> Stashed changes
          </Route>


          {/* Fallback */}
          <Route path="*" element={<div className="p-6">Not found</div>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}