import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/useAuthStore';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  notifications: any[];
  addNotification: (notification: any) => void;
  clearNotifications: () => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  notifications: [],
  addNotification: () => {},
  clearNotifications: () => {}
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuthStore();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const newSocket = io('/', {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      auth: {
        token: localStorage.getItem('accessToken')
      }
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      newSocket.emit('join_room', `user:${user.id}`);
      newSocket.emit('join_room', 'room:admin');
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('payment_success', (data: any) => {
      setNotifications((prev) => [
        { type: 'PAYMENT', message: `Payment of ₹${data.amount} received successfully`, time: new Date(), ...data },
        ...prev
      ]);
    });

    newSocket.on('payment_received', (data: any) => {
      setNotifications((prev) => [
        { type: 'ADMIN_ALERT', message: `New payment from ${data.user}: ₹${data.amount}`, time: new Date(), ...data },
        ...prev
      ]);
    });

    newSocket.on('user_registered', (data: any) => {
      setNotifications((prev) => [
        { type: 'SYSTEM', message: `New user registered: ${data.name}`, time: new Date(), ...data },
        ...prev
      ]);
    });

    newSocket.on('user_login_alert', (data: any) => {
      setNotifications((prev) => [
        { type: 'SECURITY', message: `New login from ${data.ipAddress}`, time: new Date(), ...data },
        ...prev
      ]);
    });

    newSocket.on('pass_status_changed', (data: any) => {
      setNotifications((prev) => [
        { type: 'BOOKING', message: `Pass ${data.passNumber} status changed to ${data.status}`, time: new Date(), ...data },
        ...prev
      ]);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [isAuthenticated, user?.id]);

  const addNotification = (notification: any) => {
    setNotifications((prev) => [notification, ...prev]);
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <SocketContext.Provider value={{ socket, isConnected, notifications, addNotification, clearNotifications }}>
      {children}
    </SocketContext.Provider>
  );
};