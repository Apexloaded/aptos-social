import { PinResponse } from "pinata-web3";

export interface IActionResponse {
  status: boolean;
  message?: string;
  data?: any;
}

export interface ErrorResponse {
  errors: string;
}


export type IUploadFilesResponse = {
  pinned: PinResponse;
  metadata: {
    id: string;
    fileName: string;
    contentType: string;
  }[];
};