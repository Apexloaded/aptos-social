'use client';

import React, { useState } from 'react';
import { Button } from '../ui/button';

export default function CreateCollection() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  
  return (
    <>
      <Button size={'sm'}>Add Collection</Button>
    </>
  );
}
