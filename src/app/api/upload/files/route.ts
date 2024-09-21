import { pinata } from '@/utils/pinata';
import { NextRequest, NextResponse } from 'next/server';
import ShortUniqueId from 'short-unique-id';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File | null;

  console.log(file);
  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }

  try {
    const uid = new ShortUniqueId();
    const fileExtension = file.name.split('.').pop();
    const filename = `${uid.stamp(32)}.${fileExtension}`;
    const mainFile = new File([file], filename, {
      type: file.type,
    });

    const upload = await pinata.upload.file(mainFile);
    return NextResponse.json(
      { message: 'File uploaded successfully', data: upload },
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
