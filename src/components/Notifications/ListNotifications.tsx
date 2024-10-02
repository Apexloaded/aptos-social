'use client';
import React from 'react';
import Link from 'next/link';
import { EllipsisVertical } from 'lucide-react';
import CreatorPFP from '../Creator/CreatorPFP';
import { Button } from '../ui/button';

function ListNotifications() {
  return (
    <div className="flex items-start justify-between cursor-pointer px-5 bg-white dark:bg-dark">
      <div className="w-14 flex justify-center">
        <CreatorPFP username="johndoe" name="John Doe" />
      </div>
      <div className="flex-1">
        Here
        <Button>Add Notification</Button>
      </div>
    </div>
  );
}

export default ListNotifications;
