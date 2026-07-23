import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { getAdminSupabase } from '@/lib/adminAuth';
import { uploadObjectToR2 } from '@/lib/r2';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const IMAGE_TYPES = new Set(['image/jpeg','image/jpg','image/png','image/x-png','image/webp','image/avif','image/heic','image/heif']);
const IMAGE_EXTENSIONS = new Set(['jpg','jpeg','png','webp','avif','heic','heif']);
const VIDEO_TYPES = new Set(['video/mp4','video/webm','video/quicktime']);

function safeName(name: string) {
  return name.replace(/\.[^/.]+$/, '').toLowerCase().replace(/[^a-z0-9а-яёіїєґąęłńóśźż_-]+/gi, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 70) || 'media';
}

export async function POST(request: NextRequest) {
  try {
    const { error: authError, supabase } = await getAdminSupabase(request);
    if (authError || !supabase) return NextResponse.json({ error: authError }, { status: 401 });
    const form = await request.formData();
    const file = form.get('file');
    const mediaType = String(form.get('media_type') || '');
    if (!(file instanceof File)) return NextResponse.json({ error: 'Файл не выбран' }, { status: 400 });
    if (mediaType !== 'image' && mediaType !== 'video') return NextResponse.json({ error: 'Неизвестный тип медиа' }, { status: 400 });

    const original = Buffer.from(await file.arrayBuffer());
    let body: Buffer = original;
    let contentType = file.type;
    let extension = file.name.split('.').pop()?.toLowerCase() || '';
    let width: number | null = null;
    let height: number | null = null;

    if (mediaType === 'image') {
      const normalizedType = file.type.toLowerCase().trim();
      const isAllowedImage =
        IMAGE_TYPES.has(normalizedType) || IMAGE_EXTENSIONS.has(extension);

      if (!isAllowedImage || file.size > 30 * 1024 * 1024) {
        return NextResponse.json(
          { error: 'Поддерживаются JPG, PNG, WEBP, AVIF, HEIC и HEIF до 30 MB' },
          { status: 400 },
        );
      }

      try {
        body = await sharp(original, { limitInputPixels: 70_000_000 })
          .rotate()
          .resize({
            width: 3000,
            height: 3000,
            fit: 'inside',
            withoutEnlargement: true,
          })
          .webp({ quality: 90, effort: 5 })
          .toBuffer();
      } catch {
        return NextResponse.json(
          {
            error:
              'Не удалось обработать фото. Выберите его ещё раз или сохраните как JPG, PNG либо WEBP.',
          },
          { status: 400 },
        );
      }

      const meta = await sharp(body).metadata();
      width = meta.width || null;
      height = meta.height || null;
      contentType = 'image/webp';
      extension = 'webp';
    } else {
      if (!VIDEO_TYPES.has(file.type) || file.size > 150 * 1024 * 1024) return NextResponse.json({ error: 'Поддерживаются MP4, WebM и MOV до 150 MB' }, { status: 400 });
    }

    const key = `site/builder/${mediaType}/${Date.now()}-${safeName(file.name)}-${crypto.randomUUID()}.${extension}`;
    const url = await uploadObjectToR2({ key, body, contentType });
    const { data, error } = await supabase.from('builder_media').insert({ media_type: mediaType, url, r2_key: key, original_filename: file.name, mime_type: contentType, size_bytes: body.length, width, height }).select('*').single();
    if (error || !data) return NextResponse.json({ error: error?.message || 'Не удалось сохранить медиа' }, { status: 500 });
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Ошибка загрузки' }, { status: 500 });
  }
}
