import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { storageService } from "@/server/storage/storage.service";
import { prisma } from "@/lib/prisma";
import type { MediaType } from "@prisma/client";

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

const MIME_TO_TYPE: Record<string, MediaType> = {
  "image/jpeg": "IMAGE",
  "image/jpg": "IMAGE",
  "image/png": "IMAGE",
  "image/webp": "IMAGE",
  "image/gif": "IMAGE",
  "image/svg+xml": "IMAGE",
  "video/mp4": "VIDEO",
  "video/webm": "VIDEO",
  "application/pdf": "DOCUMENT",
};

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.AUTH_SECRET });
  if (!token) {
    return NextResponse.json({ error: "Giriş yapmanız gerekiyor" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Geçersiz form verisi" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) {
    return NextResponse.json({ error: "Dosya seçilmedi" }, { status: 400 });
  }

  const mediaType = MIME_TO_TYPE[file.type];
  if (!mediaType) {
    return NextResponse.json(
      { error: `Desteklenmeyen dosya türü: ${file.type}. İzin verilenler: JPEG, PNG, WebP, GIF, SVG, MP4, WebM, PDF` },
      { status: 400 }
    );
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: `Dosya boyutu ${(file.size / 1024 / 1024).toFixed(1)} MB. Maksimum: 10 MB` },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  let width: number | undefined;
  let height: number | undefined;

  if (mediaType === "IMAGE" && file.type !== "image/svg+xml") {
    try {
      const sharp = (await import("sharp")).default;
      const meta = await sharp(buffer).metadata();
      width = meta.width;
      height = meta.height;
    } catch {
      // sharp isteğe bağlı
    }
  }

  const key = storageService.generateKey(file.name);

  let uploadResult: { url: string; key: string };
  try {
    uploadResult = await storageService.upload({ key, body: buffer, contentType: file.type });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Dosya yüklenemedi, lütfen tekrar deneyin" },
      { status: 500 }
    );
  }

  const alt = (formData.get("alt") as string | null) || null;

  const media = await prisma.media.create({
    data: {
      url: uploadResult.url,
      key: uploadResult.key,
      mimeType: file.type,
      type: mediaType,
      size: file.size,
      width: width ?? null,
      height: height ?? null,
      alt,
    },
  });

  return NextResponse.json(media, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.AUTH_SECRET });
  if (!token) {
    return NextResponse.json({ error: "Giriş yapmanız gerekiyor" }, { status: 401 });
  }

  let body: { id: string; key: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek gövdesi" }, { status: 400 });
  }

  const { id, key } = body;
  if (!id || !key) {
    return NextResponse.json({ error: "id ve key alanları zorunludur" }, { status: 400 });
  }

  try {
    await storageService.delete(key);
  } catch {
    // Depolama alanında bulunamazsa DB kaydını yine de sil
  }

  await prisma.media.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
