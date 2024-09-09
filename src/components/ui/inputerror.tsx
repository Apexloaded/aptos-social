import React, { FC } from "react";

type Props = {
  error?: string;
};

const ShowError: FC<Props> = ({ error }) => {
  return <span className="text-danger text-sm">{error}</span>;
};

export default ShowError;
