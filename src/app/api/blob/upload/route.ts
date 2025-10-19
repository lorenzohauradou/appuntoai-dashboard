import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { auth } from "@/auth";

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname: string) => {
        const session = await auth();
        
        if (!session?.user?.id) {
          throw new Error('Unauthorized');
        }

        return {
          allowedContentTypes: [
            'video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm', 'video/x-matroska',
            'audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/ogg', 'audio/flac', 'audio/aac',
            'text/plain', 'text/markdown', 'text/rtf', 'text/csv'
          ],
          maximumSizeInBytes: 7 * 1024 * 1024 * 1024,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({
            userId: session.user.id,
          }),
        };
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    const message = (error as Error).message;
    const status = message === 'Unauthorized' ? 401 : 400;
    return NextResponse.json(
      { error: message },
      { status },
    );
  }
}

