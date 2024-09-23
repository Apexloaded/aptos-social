'use server';

import { IActionResponse } from '@/interfaces/response.interface';
import { renameFile } from '@/utils/helpers';
import { pinata } from '@/utils/pinata';

export async function uploadFile(formdata: FormData): Promise<IActionResponse> {
  const file = formdata.get('file') as File | null;

  if (!file) {
    return {
      status: false,
      message: 'No file uploaded',
    };
  }

  try {
    const mainFile = renameFile(file);
    const upload = await pinata.upload.file(mainFile);
    return {
      status: true,
      message: 'File uploaded successfully',
      data: upload,
    };
  } catch (error) {
    console.log(error);
    return {
      status: false,
      message: 'Error uploading file',
    };
  }
}

export async function uploadFiles(
  formdata: FormData
): Promise<IActionResponse> {
  const files = formdata.getAll('files') as File[];

  if (files.length === 0) {
    return {
      status: false,
      message: 'No file uploaded',
    };
  }

  try {
    const imgInfo: {
      id: string;
      fileName: string;
      contentType: string;
    }[] = [];

    const newFiles = files.map((f) => {
      const file = renameFile(f);
      const info = {
        id: f.name,
        fileName: file.name,
        contentType: f.type,
      };
      imgInfo.push(info);
      return file;
    });

    const upload = await pinata.upload.fileArray([...newFiles]);
    return {
      status: true,
      message: 'Files uploaded successfully',
      data: { pinned: upload, metadata: imgInfo },
    };
  } catch (error) {
    return {
      status: false,
      message: 'Error uploading files',
    };
  }
}
