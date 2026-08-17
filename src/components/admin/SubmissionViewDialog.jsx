import React from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import "../../assets/style/global/support.css";

export const getInitials = (name) => {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

const SubmissionViewDialog = ({
  open,
  onClose,
  headerLabel,
  headerTitle,
  profile,
  metaCards = [],
  sections = [],
  timeline = [],
  actions,
}) => {
  if (!profile) return null;

  return (
    <Dialog
      className="support-ticket-view-dialog"
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <Box className="support-ticket-view-header">
        <Box>
          <span className="support-ticket-view-header-label">{headerLabel}</span>
          <h3 className="support-ticket-view-header-title">{headerTitle}</h3>
        </Box>
        <IconButton
          aria-label="Close details"
          onClick={onClose}
          className="support-ticket-view-close"
          size="small"
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <DialogContent className="support-ticket-view-body" sx={{ p: 0 }}>
        <Box className="support-ticket-view-profile">
          <span className="support-ticket-view-avatar">
            {getInitials(profile.fullName)}
          </span>
          <Box>
            <p className="support-ticket-view-profile-name">{profile.fullName}</p>
            {profile.metaLines?.map((line) => (
              <p key={line} className="support-ticket-view-profile-meta">
                {line}
              </p>
            ))}
          </Box>
        </Box>

        {metaCards.length > 0 && (
          <Box className="support-ticket-view-meta-grid">
            {metaCards.map((card) => (
              <Box key={card.label} className="support-ticket-view-meta-card">
                <span className="support-ticket-view-meta-label">{card.label}</span>
                {typeof card.value === "string" ? (
                  <span className="support-ticket-view-meta-value">{card.value}</span>
                ) : (
                  card.value
                )}
              </Box>
            ))}
          </Box>
        )}

        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <Box key={section.title} className="support-ticket-view-section">
              <h4 className="support-ticket-view-section-title">
                {Icon ? <Icon /> : null}
                {section.title}
              </h4>
              {section.content ? (
                section.content
              ) : (
                <Box className="support-ticket-view-details-grid">
                  {section.fields.map((field) => (
                    <Box key={field.label} className="support-ticket-view-detail-item">
                      <span className="support-ticket-view-detail-label">
                        {field.label}
                      </span>
                      <span className="support-ticket-view-detail-value">
                        {field.value}
                      </span>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          );
        })}

        {timeline.length > 0 && (
          <Box className="support-ticket-view-section">
            <h4 className="support-ticket-view-section-title">
              <ScheduleOutlinedIcon />
              Timeline
            </h4>
            <div className="support-ticket-view-timeline">
              {timeline.map((item) => (
                <div key={item.label} className="support-ticket-view-timeline-item">
                  <span className="support-ticket-view-timeline-dot" />
                  <div>
                    <p className="support-ticket-view-timeline-label">{item.label}</p>
                    <p className="support-ticket-view-timeline-date">{item.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </Box>
        )}
      </DialogContent>

      <DialogActions className="support-ticket-view-footer" sx={{ p: 0 }}>
        <Button onClick={onClose} className="support-ticket-view-btn" sx={{ color: "#64748b" }}>
          Close
        </Button>
        <Box>{actions}</Box>
      </DialogActions>
    </Dialog>
  );
};

export default SubmissionViewDialog;
