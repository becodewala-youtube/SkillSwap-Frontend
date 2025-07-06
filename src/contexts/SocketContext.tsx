import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { addMessage, updateUnreadCount } from '../store/slices/messagesSlice';
import { addNotification, updateUnreadCount as updateNotificationCount } from '../store/slices/notificationsSlice';
import { updateRequestStatus } from '../store/slices/requestsSlice';
import toast from 'react-hot-toast';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  joinChat: (requestId: string) => void;
  leaveChat: (requestId: string) => void;
  sendMessage: (requestId: string, receiverId: string, content: string) => void;
  sendTyping: (requestId: string) => void;
  stopTyping: (requestId: string) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const { token, isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (isAuthenticated && token) {
      // Initialize socket connection
      const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
        auth: {
          token,
        },
        transports: ['websocket', 'polling'],
      });

      newSocket.on('connect', () => {
        console.log('Connected to server');
        setIsConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from server');
        setIsConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        setIsConnected(false);
      });

      // Handle new messages
      newSocket.on('new_message', (message) => {
        dispatch(addMessage(message));
        
        // Show toast notification if not in the current chat
        const currentPath = window.location.pathname;
        if (!currentPath.includes(`/chat/${message.requestId}`)) {
          toast.success(`New message from ${message.senderId.name}`);
        }
      });

      // Handle notifications
      newSocket.on('notification', (data) => {
        dispatch(addNotification(data.notification));
        
        // Show toast notification
        toast.success(data.notification.message, {
          duration: 5000,
        });

        // Update request status if it's a request-related notification
        if (data.request && data.notification.type.includes('request')) {
          dispatch(updateRequestStatus({
            requestId: data.request._id,
            status: data.request.status,
          }));
        }
      });

      // Handle typing indicators
      newSocket.on('user_typing', (data) => {
        // Handle typing indicator UI updates
        console.log(`${data.name} is typing...`);
      });

      newSocket.on('user_stop_typing', (data) => {
        // Handle stop typing indicator UI updates
        console.log(`User ${data.userId} stopped typing`);
      });

      // Handle errors
      newSocket.on('error', (error) => {
        console.error('Socket error:', error);
        toast.error(error.message || 'Connection error');
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
        setSocket(null);
        setIsConnected(false);
      };
    } else {
      // Clean up socket if not authenticated
      if (socket) {
        socket.close();
        setSocket(null);
        setIsConnected(false);
      }
    }
  }, [isAuthenticated, token, dispatch]);

  const joinChat = (requestId: string) => {
    if (socket) {
      socket.emit('join_chat', requestId);
    }
  };

  const leaveChat = (requestId: string) => {
    if (socket) {
      socket.emit('leave_chat', requestId);
    }
  };

  const sendMessage = (requestId: string, receiverId: string, content: string) => {
    if (socket) {
      socket.emit('send_message', {
        requestId,
        receiverId,
        content,
      });
    }
  };

  const sendTyping = (requestId: string) => {
    if (socket) {
      socket.emit('typing', { requestId });
    }
  };

  const stopTyping = (requestId: string) => {
    if (socket) {
      socket.emit('stop_typing', { requestId });
    }
  };

  const value = {
    socket,
    isConnected,
    joinChat,
    leaveChat,
    sendMessage,
    sendTyping,
    stopTyping,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};