import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AuthState, AuthUser } from '@/types/auth';

const initialState: AuthState = {
  user: null,
  sessionId: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    registerUser: (state, action: PayloadAction<AuthUser & { sessionId: string }>) => {
      const { sessionId, ...user } = action.payload;
      state.user = user;
      state.sessionId = sessionId;
    },
    setSessionId: (state, action: PayloadAction<string>) => {
      state.sessionId = action.payload;
    },
    logoutUser: state => {
      state.sessionId = null;
    },
  },
});

export const { registerUser, setSessionId, logoutUser } = authSlice.actions;

export default authSlice.reducer;
