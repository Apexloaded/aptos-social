'use client';

import React, { useState, useMemo } from 'react';
import { RE_DIGIT } from '@/utils/helpers';

type IOTPForm = {
  onChange: (data?: string | null | undefined | number) => void;
  valueLength?: number;
};
function OTPForm({ onChange, valueLength = 6 }: IOTPForm) {
  const [otp, setOtp] = useState('');

  const valueItems = useMemo(() => {
    const valueArray = otp.split('');
    const items: Array<string> = [];

    for (let i = 0; i < valueLength; i++) {
      const char = valueArray[i];

      if (RE_DIGIT.test(char)) {
        items.push(char);
      } else {
        items.push('');
      }
    }

    return items;
  }, [otp, valueLength]);

  const onInputChange = (e: any, id: number) => {
    const target = e.target;
    let targetValue = target.value;
    const isValueDigit = RE_DIGIT.test(targetValue);

    if (!isValueDigit && targetValue != '') return;
    targetValue = isValueDigit ? targetValue : ' ';

    const newValue = otp.substring(0, id) + targetValue + otp.substring(id + 1);

    setOtp(newValue);
    onChange(newValue);

    if (isValueDigit) {
      const nextElementSibiling =
        target.nextElementSibling as HTMLInputElement | null;

      if (nextElementSibiling) {
        nextElementSibiling.focus();
      }
    }
  };

  const onKeyDown = (e: any) => {
    const target = e.target as HTMLInputElement;

    if (e.key !== 'Backspace' || target.value !== '') return;

    const prevElSibling =
      target.previousElementSibling as HTMLInputElement | null;
    if (prevElSibling) {
      prevElSibling.focus();
    }
  };

  return (
    <div className="flex max-w-sm justify-center mx-auto gap-x-3">
      {valueItems.map((digit, id) => (
        <input
          key={id}
          inputMode={'numeric'}
          autoComplete={'one-time-code'}
          maxLength={1}
          type={'password'}
          value={digit}
          onChange={(e) => onInputChange(e, id)}
          onKeyDown={onKeyDown}
          className="border text-center h-11 w-11 rounded-sm focus:outline-primary"
        />
      ))}
    </div>
  );
}

export default OTPForm;
