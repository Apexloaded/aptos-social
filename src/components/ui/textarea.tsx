import * as React from 'react';
import { Textarea } from '@headlessui/react';

import { cn } from '@/lib/utils';

export interface TextAreaProps
  extends React.DetailedHTMLProps<
    React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    HTMLTextAreaElement
  > {}

const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, ...props }, ref) => {
    return (
      <Textarea
        className={cn(
          'block w-full resize-none rounded-lg py-1.5 px-3 text-sm/6 bg-white',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
TextArea.displayName = 'TextArea';

export { TextArea };
