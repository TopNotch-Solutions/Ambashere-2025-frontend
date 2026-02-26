import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isAuthenticated: false,
  user: {},
  role: (() => {
    try {
      const stored = localStorage.getItem("role");
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  })(),
  token: null, // Store access token
  refreshToken: null, // Store refresh token
  rememberMe: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action) => {
      const { isAuthenticated, user, role, token, refreshToken, rememberMe  } = action.payload; // Include refresh token
      state.isAuthenticated = isAuthenticated;
      state.user = user;
      state.role = role;
      state.token = token;
      state.refreshToken = refreshToken; // Store refresh token in state
      state.rememberMe = rememberMe;

      // Store data in localStorage
      localStorage.setItem("accessToken", token);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("role", JSON.stringify(role));
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = {};
      state.role = null;
      state.token = null;
      state.refreshToken = null; // Clear refresh token on logout
      state.rememberMe = false;

      // Clear localStorage
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      localStorage.removeItem("role");
    },
    updateProfileImage: (state, action) => {
      state.user.ProfileImage = action.payload.ProfileImage;
    },
    updateUserProfile: (state, action) => {
      state.user = { ...state.user, ...action.payload }
    },
    switchRole: (state,action) => {
      state.role = action.payload;
      try {
        localStorage.setItem("role", JSON.stringify(action.payload));
      } catch (e) {}
    },
    refreshToken: (state, action) => {
      state.token = action.payload.token; // Update access token
      state.refreshToken = action.payload.refreshToken; // Update refresh token
    },
  },
});

export const { login, logout, updateProfileImage, updateUserProfile, switchRole, refreshToken } = authSlice.actions;
export default authSlice.reducer;
