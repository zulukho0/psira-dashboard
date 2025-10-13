import { useEffect, useState } from "react";
import Navbar from "../components/Navbar.jsx";

function DashboardPage() {
  const [stats, setStats] = useState({
    students: 0,
    courses: 0,
    instructors: 0,
    results: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      setErrMsg("");
      try {
        const [studentsRes, coursesRes, instructorsRes, resultsRes] =
          await Promise.all([
            fetch("http://localhost:8000/api/students/", {
              headers: { Authorization: `Bearer ${token}` },
            }),
            fetch("http://localhost:8000/api/courses/", {
              headers: { Authorization: `Bearer ${token}` },
            }),
            fetch("http://localhost:8000/api/instructors/", {
              headers: { Authorization: `Bearer ${token}` },
            }),
            fetch("http://localhost:8000/api/results/", {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);

        if (
          !studentsRes.ok ||
          !coursesRes.ok ||
          !instructorsRes.ok ||
          !resultsRes.ok
        ) {
          throw new Error("Failed to load dashboard metrics");
        }

        const [studentsData, coursesData, instructorsData, resultsData] =
          await Promise.all([
            studentsRes.json(),
            coursesRes.json(),
            instructorsRes.json(),
            resultsRes.json(),
          ]);

        setStats({
          students: studentsData?.count || 0,
          courses: coursesData?.count || 0,
          instructors: instructorsData?.count || 0,
          results: resultsData?.count || 0,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
        setErrMsg(error.message || "Error loading dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [token]);

  const Card = ({ title, value }) => (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-sm text-gray-600">{title}</h2>
      {isLoading ? (
        <div className="mt-2 h-6 bg-gray-100 animate-pulse rounded" />
      ) : (
        <p className="text-3xl font-bold">{value}</p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="max-w-6xl mx-auto p-6">
        <h1 className="text-xl font-semibold mb-4">Dashboard</h1>

        {errMsg && (
          <div className="mb-4 p-3 rounded bg-red-50 text-red-700 text-sm">
            {errMsg}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card title="Students" value={stats.students} />
          <Card title="Courses" value={stats.courses} />
          <Card title="Instructors" value={stats.instructors} />
          <Card title="Results" value={stats.results} />
        </div>
      </main>
    </div>
  );
}

export default DashboardPage;
