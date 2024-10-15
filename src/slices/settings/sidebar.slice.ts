import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/store';

export interface SidebarState {
  isOpen: boolean;
}

const initialState = {
  isOpen: false,
} as SidebarState;

export const settingSidebarSlice = createSlice({
  name: 'settings-sidebar',
  initialState,
  reducers: {
    openSidebar: (state) => {
      state.isOpen = true;
    },
    closeSidebar: (state) => {
      state.isOpen = false;
    },
  },
});

export const { openSidebar, closeSidebar } = settingSidebarSlice.actions;

export const selectSettingsSidebar = (state: RootState) => state['settings-sidebar'].isOpen;

export default settingSidebarSlice.reducer;
