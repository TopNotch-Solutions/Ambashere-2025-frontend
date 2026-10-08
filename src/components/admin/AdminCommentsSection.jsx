import React, { useCallback, useEffect, useState } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import axiosInstance from "../../utils/axiosInstance";
import formatDate from "../global/dateFormatter";

/**
 * Read-only history of admin messages sent when advancing
 * pending → in progress / in progress → completed.
 */
const AdminCommentsSection = ({ entityId, listEndpoint }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchComments = useCallback(async () => {
    if (!entityId || !listEndpoint) return;
    try {
      setLoading(true);
      const response = await axiosInstance.get(listEndpoint);
      setComments(response.data.comments || []);
    } catch (error) {
      console.error("Error fetching admin comments:", error);
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, [entityId, listEndpoint]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  return (
    <Box className="support-ticket-view-section">
      <h4 className="support-ticket-view-section-title">
        <ChatBubbleOutlineIcon />
        Status comments
      </h4>

      {loading ? (
        <Box display="flex" justifyContent="center" py={2}>
          <CircularProgress size={28} sx={{ color: "#0096D6" }} />
        </Box>
      ) : comments.length === 0 ? (
        <Typography variant="body2" sx={{ color: "#94a3b8" }}>
          No status comments yet. Comments appear when an admin advances this
          item (pending → in progress / completed).
        </Typography>
      ) : (
        <div className="admin-comments-list">
          {comments.map((comment) => (
            <div key={comment.id} className="admin-comment-item">
              <div className="admin-comment-meta">
                <span className="admin-comment-author">
                  {comment.adminName || comment.adminCode}
                </span>
                <span className="admin-comment-date">
                  {formatDate(comment.createdAt)}
                </span>
              </div>
              <p className="admin-comment-message">{comment.message}</p>
            </div>
          ))}
        </div>
      )}
    </Box>
  );
};

export default AdminCommentsSection;
