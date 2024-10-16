import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "@/store";
import { IPostItem } from "@/interfaces/feed.interface";

export interface PostSelect {
  post?: IPostItem;
}

const initialState = {
  post: undefined,
} as PostSelect;

export const postSelectedSlice = createSlice({
  name: "post-selected",
  initialState,
  reducers: {
    selectPost: (state, action: PayloadAction<IPostItem>) => {
      console.log(action.payload);
      state.post = action.payload;
    },
  },
});

export const { selectPost } = postSelectedSlice.actions;

export const selectedPost = (state: RootState) => state["post-selected"].post;

export default postSelectedSlice.reducer;
