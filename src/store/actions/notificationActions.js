import axiosInstance from "../../utils/axiosInstance";
import { setNotifications } from "../reducers/notificationReducer"; 

export const fetchNotifications = () => async (dispatch) => {
  try {
    const response = await axiosInstance.get("/notifications");
    dispatch(setNotifications(response.data)); // Use the setNotifications action
  } catch (error) {
    console.error("Failed to fetch notifications", error);
  }
};

export const markNotificationRead = (id) => async (dispatch) => {
  try {
    await axiosInstance.put(`/notifications/${id}/markAsRead`);
    dispatch({ type: "MARK_NOTIFICATION_AS_READ", payload: id });
  } catch (error) {
    console.error("Failed to mark notification as read", error);
  }
};

export const addNotification = (notification) => async (dispatch) => {
  try {
    const response = await axiosInstance.post('/notifications/createNotifications', notification);
    dispatch({ type: 'ADD_NOTIFICATION', payload: response.data });
  } catch (error) {
    console.error('Failed to add notification', error);
  }
};