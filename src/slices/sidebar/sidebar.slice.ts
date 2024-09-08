import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "@/store";

export interface SidebarState {
  value: boolean;
}

const initialState = {
  value: true,
} as SidebarState;

export const sidebarSlice = createSlice({
  name: "sidebar",
  initialState,
  reducers: {
    setSidebar: (state, action: PayloadAction<boolean>) => {
      state.value = action.payload;
    },
  },
});

export const { setSidebar } = sidebarSlice.actions;

export const selectSidebar = (state: RootState) => state["sidebar"].value;

export default sidebarSlice.reducer;
