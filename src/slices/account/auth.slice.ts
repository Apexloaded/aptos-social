import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "@/store";

export interface AuthState {
  value: boolean;
}

const initialState = {
  value: false,
} as AuthState;

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuth: (state, action: PayloadAction<boolean>) => {
      state.value = action.payload;
    },
  },
});

export const { setAuth } = authSlice.actions;

export const selectAuth = (state: RootState) => state['auth'].value

export default authSlice.reducer;
