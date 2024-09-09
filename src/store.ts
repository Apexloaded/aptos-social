import { configureStore } from "@reduxjs/toolkit";
import sidebarReducer from "./slices/sidebar/sidebar.slice";
import postSelectedReducer from "./slices/posts/post-selected.slice";

export const store = configureStore({
  reducer: {
    sidebar: sidebarReducer,
    "post-selected": postSelectedReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
