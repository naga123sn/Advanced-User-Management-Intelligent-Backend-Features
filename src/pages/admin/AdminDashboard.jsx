import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { getAllTickets } from "../../services/ticketService";

const StatCard = ({ label, value, color }) => (
  <div className="bg-white rounded-xl p-5 shadow-sm">
    <p className="text-sm text-gray-500">{label}</p>
    <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getAllTickets()
      .then((res) => {
        const tickets = res.data;
        setStats({
          total: tickets.length,
          pending: tickets.filter((t) => t.status === "pending").length,
          in_progress: tickets.filter((t) => t.status === "in_progress").length,
          resolved: tickets.filter((t) => t.status === "resolved").length,
          low: tickets.filter((t) => t.priority === "low").length,
          medium: tickets.filter((t) => t.priority === "medium").length,
          high: tickets.filter((t) => t.priority === "high").length,
        });
      })
      .catch(() => {});
  }, []);

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

      <h2 className="text-sm font-semibold text-gray-500 uppercase mb-3">Ticket Overview</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Tickets" value={stats?.total ?? "—"} color="text-gray-800" />
        <StatCard label="Pending" value={stats?.pending ?? "—"} color="text-yellow-600" />
        <StatCard label="In Progress" value={stats?.in_progress ?? "—"} color="text-blue-600" />
        <StatCard label="Resolved" value={stats?.resolved ?? "—"} color="text-green-600" />
      </div>

      <h2 className="text-sm font-semibold text-gray-500 uppercase mb-3">Priority Distribution</h2>
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Low Priority" value={stats?.low ?? "—"} color="text-green-600" />
        <StatCard label="Medium Priority" value={stats?.medium ?? "—"} color="text-yellow-600" />
        <StatCard label="High Priority" value={stats?.high ?? "—"} color="text-red-600" />
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
