import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

interface Message {
  _id: string;
  senderId: {
    _id: string;
    name: string;
    avatar: string;
  };
  receiverId: string;
  requestId: string;
  content: string;
  messageType: 'text' | 'image' | 'file';
  isRead: boolean;
  timestamp: string;
}

interface Conversation {
  request: {
    _id: string;
    senderId: {
      _id: string;
      name: string;
      avatar: string;
    };
    receiverId: {
      _id: string;
      name: string;
      avatar: string;
    };
    senderSkillId: {
      _id: string;
      title: string;
    };
    receiverSkillId: {
      _id: string;
      title: string;
    };
    status: string;
  };
  lastMessage?: Message;
  unreadCount: number;
  otherUser: {
    _id: string;
    name: string;
    avatar: string;
  };
}

interface MessagesState {
  conversations: Conversation[];
  currentMessages: Message[];
  currentRequestId: string | null;
  isLoading: boolean;
  error: string | null;
  unreadCount: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

const initialState: MessagesState = {
  conversations: [],
  currentMessages: [],
  currentRequestId: null,
  isLoading: false,
  error: null,
  unreadCount: 0,
  pagination: {
    page: 1,
    limit: 50,
    total: 0,
    pages: 0,
  },
};

// Async thunks
export const getConversations = createAsyncThunk(
  'messages/getConversations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/messages/conversations');
      return response.data.conversations;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch conversations');
    }
  }
);

export const getMessages = createAsyncThunk(
  'messages/getMessages',
  async ({ requestId, page = 1, limit = 50 }: {
    requestId: string;
    page?: number;
    limit?: number;
  }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/messages/request/${requestId}`, {
        params: { page, limit }
      });
      return {
        messages: response.data.messages,
        pagination: response.data.pagination,
        requestId,
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch messages');
    }
  }
);

export const sendMessage = createAsyncThunk(
  'messages/sendMessage',
  async ({ requestId, content }: {
    requestId: string;
    content: string;
  }, { rejectWithValue }) => {
    try {
      const response = await api.post('/messages', { requestId, content });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send message');
    }
  }
);

export const markMessagesAsRead = createAsyncThunk(
  'messages/markMessagesAsRead',
  async (requestId: string, { rejectWithValue }) => {
    try {
      await api.put(`/messages/read/${requestId}`);
      return requestId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark messages as read');
    }
  }
);

export const getUnreadCount = createAsyncThunk(
  'messages/getUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/messages/unread/count');
      return response.data.unreadCount;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch unread count');
    }
  }
);

const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    addMessage: (state, action) => {
      const message = action.payload;
      if (state.currentRequestId === message.requestId) {
        state.currentMessages.push(message);
      }
      
      // Update conversation's last message
      const conversationIndex = state.conversations.findIndex(
        conv => conv.request._id === message.requestId
      );
      if (conversationIndex !== -1) {
        state.conversations[conversationIndex].lastMessage = message;
        // Move conversation to top
        const conversation = state.conversations.splice(conversationIndex, 1)[0];
        state.conversations.unshift(conversation);
      }
    },
    setCurrentRequestId: (state, action) => {
      state.currentRequestId = action.payload;
    },
    clearCurrentMessages: (state) => {
      state.currentMessages = [];
      state.currentRequestId = null;
    },
    updateUnreadCount: (state, action) => {
      state.unreadCount = action.payload;
    },
    markConversationAsRead: (state, action) => {
      const requestId = action.payload;
      const conversationIndex = state.conversations.findIndex(
        conv => conv.request._id === requestId
      );
      if (conversationIndex !== -1) {
        state.conversations[conversationIndex].unreadCount = 0;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Get conversations
      .addCase(getConversations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getConversations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.conversations = action.payload;
        state.error = null;
      })
      .addCase(getConversations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Get messages
      .addCase(getMessages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getMessages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentMessages = action.payload.messages;
        state.pagination = action.payload.pagination;
        state.currentRequestId = action.payload.requestId;
        state.error = null;
      })
      .addCase(getMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Send message
      .addCase(sendMessage.fulfilled, (state, action) => {
        if (state.currentRequestId === action.payload.requestId) {
          state.currentMessages.push(action.payload);
        }
      })
      
      // Mark messages as read
      .addCase(markMessagesAsRead.fulfilled, (state, action) => {
        const requestId = action.payload;
        
        // Mark messages as read in current messages
        if (state.currentRequestId === requestId) {
          state.currentMessages = state.currentMessages.map(message => ({
            ...message,
            isRead: true,
          }));
        }
        
        // Update conversation unread count
        const conversationIndex = state.conversations.findIndex(
          conv => conv.request._id === requestId
        );
        if (conversationIndex !== -1) {
          state.conversations[conversationIndex].unreadCount = 0;
        }
      })
      
      // Get unread count
      .addCase(getUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      });
  },
});

export const {
  clearError,
  addMessage,
  setCurrentRequestId,
  clearCurrentMessages,
  updateUnreadCount,
  markConversationAsRead,
} = messagesSlice.actions;

export default messagesSlice.reducer;