import { useEffect, useState } from "react";

function DashboardPage() {
  const [stats, setStats] = useState({
    students: 0,
    courses: 0,
    results: 0,
    reports: 0,
  });

  const token = localStorage.getItem("access_token");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch students count
        const studentsRes = await fetch("http://localhost:8000/api/students/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const studentsData = await studentsRes.json();

        // Fetch courses count
        const coursesRes = await fetch("http://localhost:8000/api/courses/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const coursesData = await coursesRes.json();

        // Fetch results count
        const resultsRes = await fetch("http://localhost:8000/api/results/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const resultsData = await resultsRes.json();

        // Fetch reports count
        const reportsRes = await fetch("http://localhost:8000/api/reports/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const reportsData = await reportsRes.json();

        setStats({
          students: studentsData.count || 0,
          courses: coursesData.count || 0,
          results: resultsData.count || 0,
          reports: reportsData.count || 0,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
  }, [token]);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold">Students</h2>
          <p className="text-3xl font-bold">{stats.students}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold">Courses</h2>
          <p className="text-3xl font-bold">{stats.courses}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold">Results</h2>
          <p className="text-3xl font-bold">{stats.results}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold">Reports</h2>
          <p className="text-3xl font-bold">{stats.reports}</p>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
