import { MODULE_ADDRESS } from '@/config/constants';
import { aptosClient } from '@/utils/aptosClient';
import { NextRequest, NextResponse } from 'next/server';

async function listenToMentions() {
  try {
    const events = await aptosClient().getModuleEventsByEventType({
      eventType: `${MODULE_ADDRESS}::events::PostCreated`,
    });
    // Process each event (send notifications, etc.)
    for (const event of events) {
      await handleOffchainNotification(event);
    }
  } catch (error) {
    console.error('Error fetching mention events:', error);
  }
}

async function handleOffchainNotification(event: any) {
  const { post_id, author, timestamp } = event.data;
  console.log(post_id);
}

export async function GET(request: NextRequest) {}
