import { renameFile } from '@/utils/helpers';
import { pinata } from '@/utils/pinata';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const files = formData.getAll('files') as File[];

  if (files.length === 0) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
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
    return NextResponse.json(
      {
        message: 'Files uploaded successfully',
        data: { pinned: upload, metadata: imgInfo },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error saving file:', error);
    return NextResponse.json(
      { error: 'Error uploading file' },
      { status: 500 }
    );
  }
}
