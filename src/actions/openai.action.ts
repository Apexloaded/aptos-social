'use server';

import { openAi, openai } from '@/lib/ai';
import { CoreMessage, streamText } from 'ai';
import { createStreamableValue } from 'ai/rsc';

export async function generateText(prompt: string, formdata: FormData) {
  const stream = createStreamableValue('');
  const image = formdata.get('image') as File | null;

  let messages: CoreMessage[] = [{ role: 'user', content: prompt }];

  if (image) {
    const imageData = await image.arrayBuffer();
    const base64Image = Buffer.from(imageData).toString('base64');
    messages = [
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          {
            type: 'image',
            image: `data:${image.type};base64,${base64Image}`,
          },
        ],
      },
    ];
  }

  (async () => {
    const { textStream } = await streamText({
      model: openai('gpt-4o-mini'),
      messages,
    });

    for await (const delta of textStream) {
      stream.update(delta);
    }

    stream.done();
  })();

  return { output: stream.value };
}

export async function generateImage(
  prompt: string
): Promise<string | undefined> {
  const response = await openAi.images.generate({
    model: 'dall-e-3',
    prompt: prompt,
    n: 1,
    size: '1024x1024',
  });

  const imageUrl = response.data[0].url;
  return imageUrl;
}
