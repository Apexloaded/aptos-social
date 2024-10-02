'use server';

import { aptosClient } from '@/utils/aptosClient';
import { isAuthenticated } from './auth.action';
import { MODULE_ADDRESS } from '@/config/constants';
import { getUserByName } from '@/aptos/view/profile.view';
import { Notification } from '@/models/notifications.model';

export async function createMentionNotification(content: string) {
  try {
    const isAuth = await isAuthenticated();

    if (!isAuth) {
      throw new Error('Unauthorized');
    }

    const mentionRegex = /@(\w+)/g;
    const mentions = content.match(mentionRegex);

    if (mentions) {
      for (const mention of mentions) {
        const username = mention.slice(1);
        const mentionedUser = await getUserByName(username);

        if (mentionedUser) {
          await Notification.create({
            wallet: mentionedUser.wallet,
            type: 'mention',
            content: `${session.user.username} mentioned you in a post`,
            relatedUserId: session.user.id,
            relatedPostId: null, // You might want to create a Post model and reference it here
            read: false,
          });
        }
      }
    }

    return { success: true, message: 'Post created and notifications sent' };
  } catch (error) {
    console.error('Error creating mention notification:', error);
    throw new Error('Failed to create mention notification');
  }
}
