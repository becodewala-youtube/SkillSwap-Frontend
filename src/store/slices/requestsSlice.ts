import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

interface SkillExchangeRequest {
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
    category: string;
  };
  receiverSkillId: {
    _id: string;
    title: string;
    category: string;
  };
  message: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
  scheduledDate?: string;
  duration: number;
  meetingType: 'online' | 'in-person' | 'flexible';
  meetingDetails?: {
    platform?: string;
    link?: string;
    location?: string;
    notes?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface RequestsState {
  sentRequests: SkillExchangeRequest[];
  receivedRequests: SkillExchangeRequest[];
  currentRequest: SkillExchangeRequest | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    sent: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
    received: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

const initialState: RequestsState = {
  sentRequests: [],
  receivedRequests: [],
  currentRequest: null,
  isLoading: false,
  error: null,
  pagination: {
    sent: { page: 1, limit: 10, total: 0, pages: 0 },
    received: { page: 1, limit: 10, total: 0, pages: 0 },
  },
};

// Async thunks
export const sendSkillRequest = createAsyncThunk(
  'requests/sendSkillRequest',
  async (requestData: {
    receiverSkillId: string;
    senderSkillId: string;
    message?: string;
    scheduledDate?: string;
    duration?: number;
    meetingType?: string;
  }, { rejectWithValue }) => {
    try {
      const response = await api.post('/requests', requestData);
      return response.data.request;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send request');
    }
  }
);

export const getSentRequests = createAsyncThunk(
  'requests/getSentRequests',
  async (params: { page?: number; limit?: number; status?: string }, { rejectWithValue }) => {
    try {
      const response = await api.get('/requests/sent', { params });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch sent requests');
    }
  }
);

export const getReceivedRequests = createAsyncThunk(
  'requests/getReceivedRequests',
  async (params: { page?: number; limit?: number; status?: string }, { rejectWithValue }) => {
    try {
      const response = await api.get('/requests/received', { params });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch received requests');
    }
  }
);

export const getRequestById = createAsyncThunk(
  'requests/getRequestById',
  async (requestId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/requests/${requestId}`);
      return response.data.request;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch request');
    }
  }
);

export const acceptRequest = createAsyncThunk(
  'requests/acceptRequest',
  async ({ requestId, scheduledDate, meetingDetails }: {
    requestId: string;
    scheduledDate?: string;
    meetingDetails?: any;
  }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/requests/${requestId}/accept`, {
        scheduledDate,
        meetingDetails,
      });
      return response.data.request;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to accept request');
    }
  }
);

export const rejectRequest = createAsyncThunk(
  'requests/rejectRequest',
  async ({ requestId, reason }: { requestId: string; reason?: string }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/requests/${requestId}/reject`, { reason });
      return response.data.request;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to reject request');
    }
  }
);

export const completeRequest = createAsyncThunk(
  'requests/completeRequest',
  async (requestId: string, { rejectWithValue }) => {
    try {
      const response = await api.put(`/requests/${requestId}/complete`);
      return response.data.request;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to complete request');
    }
  }
);

export const cancelRequest = createAsyncThunk(
  'requests/cancelRequest',
  async ({ requestId, reason }: { requestId: string; reason?: string }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/requests/${requestId}/cancel`, { reason });
      return response.data.request;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel request');
    }
  }
);

const requestsSlice = createSlice({
  name: 'requests',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentRequest: (state) => {
      state.currentRequest = null;
    },
    updateRequestStatus: (state, action) => {
      const { requestId, status } = action.payload;
      
      // Update in sent requests
      const sentIndex = state.sentRequests.findIndex(req => req._id === requestId);
      if (sentIndex !== -1) {
        state.sentRequests[sentIndex].status = status;
      }
      
      // Update in received requests
      const receivedIndex = state.receivedRequests.findIndex(req => req._id === requestId);
      if (receivedIndex !== -1) {
        state.receivedRequests[receivedIndex].status = status;
      }
      
      // Update current request
      if (state.currentRequest?._id === requestId) {
        state.currentRequest.status = status;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Send skill request
      .addCase(sendSkillRequest.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendSkillRequest.fulfilled, (state, action) => {
        state.isLoading = false;
        state.sentRequests.unshift(action.payload);
        state.error = null;
      })
      .addCase(sendSkillRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Get sent requests
      .addCase(getSentRequests.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getSentRequests.fulfilled, (state, action) => {
        state.isLoading = false;
        state.sentRequests = action.payload.requests;
        state.pagination.sent = action.payload.pagination;
        state.error = null;
      })
      .addCase(getSentRequests.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Get received requests
      .addCase(getReceivedRequests.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getReceivedRequests.fulfilled, (state, action) => {
        state.isLoading = false;
        state.receivedRequests = action.payload.requests;
        state.pagination.received = action.payload.pagination;
        state.error = null;
      })
      .addCase(getReceivedRequests.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Get request by ID
      .addCase(getRequestById.fulfilled, (state, action) => {
        state.currentRequest = action.payload;
      })
      
      // Accept request
      .addCase(acceptRequest.fulfilled, (state, action) => {
        const requestId = action.payload._id;
        const receivedIndex = state.receivedRequests.findIndex(req => req._id === requestId);
        if (receivedIndex !== -1) {
          state.receivedRequests[receivedIndex] = action.payload;
        }
        if (state.currentRequest?._id === requestId) {
          state.currentRequest = action.payload;
        }
      })
      
      // Reject request
      .addCase(rejectRequest.fulfilled, (state, action) => {
        const requestId = action.payload._id;
        const receivedIndex = state.receivedRequests.findIndex(req => req._id === requestId);
        if (receivedIndex !== -1) {
          state.receivedRequests[receivedIndex] = action.payload;
        }
        if (state.currentRequest?._id === requestId) {
          state.currentRequest = action.payload;
        }
      })
      
      // Complete request
      .addCase(completeRequest.fulfilled, (state, action) => {
        const requestId = action.payload._id;
        
        // Update in both arrays
        const sentIndex = state.sentRequests.findIndex(req => req._id === requestId);
        if (sentIndex !== -1) {
          state.sentRequests[sentIndex] = action.payload;
        }
        
        const receivedIndex = state.receivedRequests.findIndex(req => req._id === requestId);
        if (receivedIndex !== -1) {
          state.receivedRequests[receivedIndex] = action.payload;
        }
        
        if (state.currentRequest?._id === requestId) {
          state.currentRequest = action.payload;
        }
      })
      
      // Cancel request
      .addCase(cancelRequest.fulfilled, (state, action) => {
        const requestId = action.payload._id;
        
        // Update in both arrays
        const sentIndex = state.sentRequests.findIndex(req => req._id === requestId);
        if (sentIndex !== -1) {
          state.sentRequests[sentIndex] = action.payload;
        }
        
        const receivedIndex = state.receivedRequests.findIndex(req => req._id === requestId);
        if (receivedIndex !== -1) {
          state.receivedRequests[receivedIndex] = action.payload;
        }
        
        if (state.currentRequest?._id === requestId) {
          state.currentRequest = action.payload;
        }
      });
  },
});

export const { clearError, clearCurrentRequest, updateRequestStatus } = requestsSlice.actions;
export default requestsSlice.reducer;