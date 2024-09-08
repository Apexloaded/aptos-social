import React from "react";
import BlueCheckMark from "./BlueCheck";
import { routes } from "@/routes";
import Link from "next/link";
import Moment from "react-moment";

type Props = {
  username?: string;
  name?: string;
  createdAt?: string;
};

function CreatorName({ username, name, createdAt }: Props) {
  return (
    <div className="flex flex-col">
      <Link
        href={routes.app.profile(`${username}`)}
        className="flex items-center space-x-1"
      >
        <p className="font-semibold text-sm capitalize text-dark">{name}</p>
        <BlueCheckMark />
        <p className="text-xs text-medium">@{username}</p>
      </Link>
      <p className="text-xs text-medium">
        <Moment fromNow>{createdAt}</Moment>
      </p>
    </div>
  );
}

export default CreatorName;
