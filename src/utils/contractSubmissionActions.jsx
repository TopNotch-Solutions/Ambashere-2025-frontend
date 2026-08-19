import React from "react";
import { Button, CircularProgress, Tooltip } from "@mui/material";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";

const NEXT_STATUS = {
  pending: "in progress",
  "in progress": "completed",
};

export function renderContractViewButton({ row, onView }) {
  return (
    <Button
      size="small"
      variant="contained"
      startIcon={<VisibilityOutlinedIcon sx={{ fontSize: 16 }} />}
      onClick={() => onView(row)}
      className="support-ticket-view-btn"
      sx={{
        minWidth: 0,
        px: 1.5,
        backgroundColor: "rgba(0, 150, 214, 0.12)",
        color: "#0096D6",
        boxShadow: "none",
        "&:hover": {
          backgroundColor: "rgba(0, 150, 214, 0.2)",
          boxShadow: "none",
        },
      }}
    >
      View
    </Button>
  );
}

export function renderContractStatusActionButton({
  row,
  currentAdminCode,
  updatingId,
  onAdvance,
  normalizeCode,
  assignedTooltipPrefix = "Assigned to",
}) {
  if (!row) return null;

  const status = String(row.subscription_status || "").trim().toLowerCase();
  const nextStatus = NEXT_STATUS[status];
  const isCancelled = status === "cancelled" || status === "canceled";
  const isCompleted = status === "completed" || isCancelled || !nextStatus;
  const assignedCode = normalizeCode(row.assignedAdminCode);
  const isAssignedToOther =
    status === "in progress" &&
    assignedCode &&
    assignedCode !== currentAdminCode;
  const isDisabled =
    isCompleted || isAssignedToOther || updatingId === row.id;

  const buttonLabel = (() => {
    if (updatingId === row.id) {
      return <CircularProgress size={16} sx={{ color: "#fff" }} />;
    }
    if (isCancelled) return "Cancelled";
    if (isCompleted) return "Completed";
    if (isAssignedToOther) return "Assigned elsewhere";
    if (status === "pending") return "Assign & start";
    return "Mark completed";
  })();

  const button = (
    <Button
      size="small"
      variant="contained"
      disabled={isDisabled}
      onClick={() => {
        if (isCancelled || isCompleted) return;
        onAdvance(row);
      }}
      className="support-ticket-view-btn"
      sx={{
        backgroundColor: isCancelled
          ? "#FCA5A5"
          : isCompleted
            ? "#9CA3AF"
            : isAssignedToOther
              ? "#9CA3AF"
              : nextStatus === "in progress"
                ? "#F59E0B"
                : "#16A34A",
        textTransform: "none",
        color: "#fff",
        px: 2,
        "&:hover": {
          backgroundColor: isDisabled
            ? undefined
            : nextStatus === "in progress"
              ? "#D97706"
              : "#15803D",
        },
        "&.Mui-disabled": {
          backgroundColor: isCancelled
            ? "#FCA5A5"
            : isCompleted || isAssignedToOther
              ? "#D1D5DB"
              : undefined,
          color: "#fff",
        },
      }}
    >
      {buttonLabel}
    </Button>
  );

  if (isCancelled) {
    return (
      <Tooltip title="This submission was cancelled by the employee and cannot be updated.">
        <span>{button}</span>
      </Tooltip>
    );
  }

  if (isAssignedToOther) {
    return (
      <Tooltip
        title={`${assignedTooltipPrefix} ${row.assignedAdminName}. Only they can complete this submission.`}
      >
        <span>{button}</span>
      </Tooltip>
    );
  }

  return button;
}

export function renderContractCancelButton({
  row,
  updatingId,
  onCancel,
}) {
  if (!row) return null;

  const status = String(row.subscription_status || "").trim().toLowerCase();
  const canCancel = status === "in progress" || status === "completed";

  if (!canCancel) return null;

  const isUpdating = updatingId === row.id;

  return (
    <Tooltip title="Cancel this submission and notify the employee. Admins are copied on the email.">
      <span>
        <Button
          size="small"
          variant="contained"
          disabled={isUpdating}
          onClick={() => onCancel(row)}
          className="support-ticket-view-btn"
          sx={{
            backgroundColor: "#DC2626",
            textTransform: "none",
            color: "#fff",
            px: 2,
            "&:hover": {
              backgroundColor: isUpdating ? undefined : "#B91C1C",
            },
            "&.Mui-disabled": {
              backgroundColor: "#FCA5A5",
              color: "#fff",
            },
          }}
        >
          {isUpdating ? (
            <CircularProgress size={16} sx={{ color: "#fff" }} />
          ) : (
            "Cancel"
          )}
        </Button>
      </span>
    </Tooltip>
  );
}
