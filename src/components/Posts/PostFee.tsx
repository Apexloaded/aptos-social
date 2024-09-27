import React from 'react';
import * as Popover from '@radix-ui/react-popover';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { AptosIcon } from '../Icons/Icons';

type Props = {
  onInput: (value: string) => void;
  value?: string;
};

function PostFee({ onInput, value }: Props) {
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onInput(e.target.value);
  };

  return (
    <Popover.Root>
      <Popover.Trigger className="outline-none">
        <div className="flex items-center gap-1 border border-primary px-2 rounded-md">
          <p className="text-sm text-primary font-semibold">Set Price</p>
        </div>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="shadow-xl z-50 pt-3 w-60 outline-none border border-medium/20 bg-white overflow-hidden rounded-lg"
          sideOffset={5}
        >
          <div className="pb-1 text-sm px-4">
            <p className="font-bold">Setup post fee</p>
            <p className="text-medium">
              What will users pay to collect your post?
            </p>
          </div>
          <div className="flex flex-col mt-2 outline-primary rounded-lg overflow-hidden bg-white">
            <div className="px-4">
              <Label isRequired={true}>Set Price</Label>
            </div>
            <div className="px-4 flex items-center">
              <AptosIcon />
              <Input
                type={'tel'}
                className="border-none px-2"
                onChange={onChange}
                value={value}
                placeholder="0.00"
                autoFocus={false}
              />
            </div>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

export default PostFee;
