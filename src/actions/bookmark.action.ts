'use server';

import { IAddBookmark } from '@/interfaces/bookmark.interface';
import { IActionResponse } from '@/interfaces/response.interface';
import Bookmark from '@/models/bookmark.model';

export const addBookmark = async (
  payload: IAddBookmark
): Promise<IActionResponse> => {
  try {
    const bookmark = await Bookmark.create(payload);
    return {
      status: true,
      message: 'success',
      data: { address: bookmark.address, postId: bookmark.postId },
    };
  } catch (error: any) {
    return { status: false, message: `${error.message}` };
  }
};

export const removeBookmark = async (
  id: string,
  address: string
): Promise<IActionResponse> => {
  try {
    await Bookmark.deleteOne({ postId: id, address });
    return {
      status: true,
      message: 'success',
    };
  } catch (error: any) {
    return { status: false, message: `${error.message}` };
  }
};

export const getBookmarkByPostId = async (
  id: string
): Promise<IActionResponse> => {
  try {
    const bookmark = await Bookmark.findOne({ postId: id });
    return {
      status: true,
      message: 'success',
      data: { address: bookmark.address, postId: bookmark.postId },
    };
  } catch (error: any) {
    return { status: false, message: `${error.message}` };
  }
};

export const getAllBookmarks = async (
  address: string
): Promise<IActionResponse> => {
  try {
    const bookmarks = await Bookmark.find({ address });
    console.log(bookmarks);
    return {
      status: true,
      message: 'success',
      data: bookmarks.map((b) => {
        return {
          postId: b.postId,
          address: b.address,
        };
      }),
    };
  } catch (error: any) {
    return { status: false, message: `${error.message}` };
  }
};
