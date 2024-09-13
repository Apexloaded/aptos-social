import React, { FC } from "react";
import { FieldError, FieldErrorsImpl, Merge } from "react-hook-form";

type Props = {
  error?:
    | string
    | FieldError
    | Merge<FieldError, FieldErrorsImpl<any>>
    | undefined;
};

const ShowError: FC<Props> = ({ error }) => {
  return <span className="text-danger text-sm">{error?.toString()}</span>;
};

export default ShowError;
