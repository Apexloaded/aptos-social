import { configureStore } from '@reduxjs/toolkit';
import sidebarReducer from './slices/sidebar/sidebar.slice';
import settingsSidebarReducer from './slices/settings/sidebar.slice';
import postSelectedReducer from './slices/posts/post-selected.slice';
import authReducer from './slices/account/auth.slice';
import hideBalanceReducer from './slices/account/hide-balance.slice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    sidebar: sidebarReducer,
    'settings-sidebar': settingsSidebarReducer,
    'post-selected': postSelectedReducer,
    'hide-balance': hideBalanceReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
