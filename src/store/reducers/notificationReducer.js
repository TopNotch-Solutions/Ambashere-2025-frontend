import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  notifications: [],
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setNotifications: (state, action) => {
      // console.log("Setting notifications:", action.payload);
      state.notifications = action.payload;
    },
    addNotification: (state, action) => {
      state.notifications.push(action.payload);
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        notification => notification.NotificationID !== action.payload.NotificationID
      );
    },
    markNotificationAsRead: (state, action) => {
      state.notifications = state.notifications.map(notification =>
        notification.NotificationID === action.payload
          ? { ...notification, Viewed: true }
          : notification
      );
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
  },
});

export const { setNotifications, addNotification, removeNotification, markNotificationAsRead, clearNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;
