import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

interface Skill {
  user: any;
  _id: string;
  title: string;
  description: string;
  category: string;
  proficiency: string;
  userId: {
    _id: string;
    name: string;
    avatar: string;
    location: string;
    rating: {
      average: number;
      count: number;
    };
  };
  tags: string[];
  availableDays: string[];
  availableTimeSlots: Array<{ start: string; end: string }>;
  endorsements: Array<{
    userId: string;
    message: string;
    createdAt: string;
  }>;
  rating: {
    average: number;
    count: number;
  };
  exchangeCount: number;
  createdAt: string;
}

interface SkillsState {
  skills: Skill[];
  mySkills: Skill[];
  currentSkill: Skill | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

const initialState: SkillsState = {
  skills: [],
  mySkills: [],
  currentSkill: null,
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 12,
    total: 0,
    pages: 0,
  },
};

// Async thunks
export const searchSkills = createAsyncThunk(
  'skills/searchSkills',
  async (params: {
    q?: string;
    category?: string;
    proficiency?: string;
    location?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
  }, { rejectWithValue }) => {
    try {
      const response = await api.get('/skills/search', { params });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to search skills');
    }
  }
);

export const getMySkills = createAsyncThunk(
  'skills/getMySkills',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/skills/my-skills');
      return response.data.skills;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch skills');
    }
  }
);

export const getSkillById = createAsyncThunk(
  'skills/getSkillById',
  async (skillId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/skills/${skillId}`);
      return response.data.skill;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch skill');
    }
  }
);

export const createSkill = createAsyncThunk(
  'skills/createSkill',
  async (skillData: {
    title: string;
    description: string;
    category: string;
    proficiency: string;
    tags?: string[];
    availableDays?: string[];
    availableTimeSlots?: Array<{ start: string; end: string }>;
  }, { rejectWithValue }) => {
    try {
      const response = await api.post('/skills', skillData);
      return response.data.skill;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create skill');
    }
  }
);

export const updateSkill = createAsyncThunk(
  'skills/updateSkill',
  async ({ skillId, skillData }: {
    skillId: string;
    skillData: Partial<Skill>;
  }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/skills/${skillId}`, skillData);
      return response.data.skill;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update skill');
    }
  }
);

export const deleteSkill = createAsyncThunk(
  'skills/deleteSkill',
  async (skillId: string, { rejectWithValue }) => {
    try {
      await api.delete(`/skills/${skillId}`);
      return skillId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete skill');
    }
  }
);

export const endorseSkill = createAsyncThunk(
  'skills/endorseSkill',
  async ({ userId, skillId, message }: {
    userId: string;
    skillId: string;
    message?: string;
  }, { rejectWithValue }) => {
    try {
      await api.post(`/users/${userId}/skills/${skillId}/endorse`, { message });
      return { skillId, message };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to endorse skill');
    }
  }
);

const skillsSlice = createSlice({
  name: 'skills',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentSkill: (state) => {
      state.currentSkill = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Search skills
      .addCase(searchSkills.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchSkills.fulfilled, (state, action) => {
        state.isLoading = false;
        state.skills = action.payload.skills;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(searchSkills.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Get my skills
      .addCase(getMySkills.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getMySkills.fulfilled, (state, action) => {
        state.isLoading = false;
        state.mySkills = action.payload;
        state.error = null;
      })
      .addCase(getMySkills.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Get skill by ID
      .addCase(getSkillById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getSkillById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentSkill = action.payload;
        state.error = null;
      })
      .addCase(getSkillById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Create skill
      .addCase(createSkill.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createSkill.fulfilled, (state, action) => {
        state.isLoading = false;
        state.mySkills.unshift(action.payload);
        state.error = null;
      })
      .addCase(createSkill.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Update skill
      .addCase(updateSkill.fulfilled, (state, action) => {
        const index = state.mySkills.findIndex(skill => skill._id === action.payload._id);
        if (index !== -1) {
          state.mySkills[index] = action.payload;
        }
        if (state.currentSkill?._id === action.payload._id) {
          state.currentSkill = action.payload;
        }
      })
      
      // Delete skill
      .addCase(deleteSkill.fulfilled, (state, action) => {
        state.mySkills = state.mySkills.filter(skill => skill._id !== action.payload);
        if (state.currentSkill?._id === action.payload) {
          state.currentSkill = null;
        }
      });
  },
});

export const { clearError, clearCurrentSkill } = skillsSlice.actions;
export default skillsSlice.reducer;