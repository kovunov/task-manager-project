import { createSlice } from "@reduxjs/toolkit";
import { api } from "../services/api";

export interface AuthState {
  user: {
    id?: number;
    email?: string;
    name?: string;
  } | null;
  token: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
};

// Try to load auth state from localStorage on startup
if (typeof window !== "undefined") {
  const storedAuth = localStorage.getItem("auth");
  if (storedAuth) {
    try {
      const parsedAuth = JSON.parse(storedAuth);
      if (parsedAuth.token && parsedAuth.user) {
        initialState.user = parsedAuth.user;
        initialState.token = parsedAuth.token;
        initialState.isAuthenticated = true;
      }
    } catch (e) {}
  }
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;

      if (typeof window !== "undefined") {
        localStorage.removeItem("auth");
      }
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      api.endpoints.login.matchFulfilled,
      (state, { payload }) => {
        state.token = payload.accessToken;
        state.user = payload.user;
        state.isAuthenticated = true;

        if (typeof window !== "undefined") {
          localStorage.setItem(
            "auth",
            JSON.stringify({
              token: payload.accessToken,
              user: payload.user,
            })
          );
        }
      }
    );
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
