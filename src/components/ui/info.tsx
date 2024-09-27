import * as React from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";
import { Info as InfoIcon } from "lucide-react";

export interface InfoProps {
  description: string;
}

export const Info: React.FC<InfoProps> = ({ description }) => {
  return (
    <Tooltip>
      <TooltipTrigger>
        <InfoIcon className="w-4 h-4 text-gray-400" />
      </TooltipTrigger>

      <TooltipContent className="bg-white">
        <p className="max-w-md bg-white text-dark/80">{description}</p>
      </TooltipContent>
    </Tooltip>
  );
};
