import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { addNotification } from '../store/actions/notificationActions'
import socket from './socket'; // Import your socket

const NotificationsListener = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    socket.on('notification', (notification) => {
      dispatch(addNotification(notification)); // Add new notification to the store
    });

    return () => {
      socket.off('notification');
    };
  }, [dispatch]);

  return null;
};

export default NotificationsListener;
