import React from "react";

export function getStatusStyle(status) {
  const normalized = String(status || "").trim().toLowerCase();

  if (normalized === "inactive") {
    return { background: "#FEE2E2", color: "#991B1B", border: "#EF4444" };
  }
  if (normalized === "active") {
    return { background: "#DCFCE7", color: "#166534", border: "#22C55E" };
  }
  if (normalized === "done") {
    return { background: "#FEE2E2", color: "#991B1B", border: "#EF4444" };
  }
  if (normalized === "pending") {
    return { background: "#FEF3C7", color: "#92400E", border: "#F59E0B" };
  }
  if (normalized === "in progress") {
    return { background: "#DBEAFE", color: "#1E40AF", border: "#3B82F6" };
  }
  if (
    normalized === "completed" ||
    normalized === "expired" ||
    normalized === "rejected" ||
    normalized === "cancelled" ||
    normalized === "canceled"
  ) {
    return { background: "#FEE2E2", color: "#991B1B", border: "#EF4444" };
  }
  if (
    normalized === "approved" ||
    normalized === "ongoing" ||
    normalized === "renewed"
  ) {
    return { background: "#D1FAE5", color: "#065F46", border: "#10B981" };
  }

  return { background: "#F3F4F6", color: "#374151", border: "#9CA3AF" };
}

export function formatStatusLabel(status) {
  const normalized = String(status || "").trim().toLowerCase();
  if (normalized === "active") return "Active";
  if (normalized === "inactive") return "Inactive";
  if (normalized === "done") return "Done";
  if (normalized === "pending") return "Pending";
  if (normalized === "in progress") return "In Progress";
  if (normalized === "completed") return "Completed";
  return status || "-";
}

export function StatusBadge({ status }) {
  const value = status || "-";
  const style = getStatusStyle(value);

  return (
    <span
      style={{
        display: "inline-block",
        padding: "4px 10px",
        borderRadius: "999px",
        fontSize: "0.75rem",
        fontWeight: 600,
        lineHeight: 1.2,
        backgroundColor: style.background,
        color: style.color,
        border: `1px solid ${style.border}`,
        textTransform: "capitalize",
      }}
    >
      {formatStatusLabel(value)}
    </span>
  );
}

export function renderStatusCell(params) {
  return <StatusBadge status={params.value} />;
}
