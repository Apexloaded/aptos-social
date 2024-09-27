'use client';

import React from 'react';
import NewPostForm from './NewPostForm';

function NewPost() {
  return (
    <div className="px-5 py-4 flex items-start space-x-3 bg-white dark:bg-dark rounded-2xl">
      <NewPostForm />
    </div>
  );
}

export default NewPost;
