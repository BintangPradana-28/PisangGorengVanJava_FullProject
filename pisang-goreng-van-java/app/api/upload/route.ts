// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/src/features/auth/authOptions'
import { supabase } from '@/lib/supabase'
import crypto from 'crypto'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_MB = 5

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session)
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    
    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 })
    }

    // 1. ABSOLUTE QUARANTINE: Size Limit Enforcement (Max 2MB)
    const MAX_BYTES = 2 * 1024 * 1024;
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ success: false, error: 'Maksimal ukuran file 2MB' }, { status: 400 })
    }

    // 2. ABSOLUTE QUARANTINE: Magic Bytes Validation (No MIME Spoofing)
    const buffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);
    
    // Check signatures (Hex Headers)
    const isJPEG = uint8Array.length >= 3 && uint8Array[0] === 0xFF && uint8Array[1] === 0xD8 && uint8Array[2] === 0xFF;
    const isPNG = uint8Array.length >= 8 && uint8Array[0] === 0x89 && uint8Array[1] === 0x50 && uint8Array[2] === 0x4E && uint8Array[3] === 0x47;
    const isWEBP = uint8Array.length >= 12 && uint8Array[8] === 0x57 && uint8Array[9] === 0x45 && uint8Array[10] === 0x42 && uint8Array[11] === 0x50;

    if (!isJPEG && !isPNG && !isWEBP) {
      return NextResponse.json({ success: false, error: 'File ditolak: Signature gambar tidak valid (Hanya JPG/PNG/WEBP murni).' }, { status: 400 })
    }

    // 3. CRYPTOGRAPHIC NAMING: No Date.now() predictability
    // Extract strictly validated extension
    let ext = 'jpg';
    if (isPNG) ext = 'png';
    else if (isWEBP) ext = 'webp';

    const safeName = `img_${crypto.randomUUID()}.${ext}`;
    
    // 4. SUPABASE SECURE UPLOAD
    const { error } = await supabase.storage
      .from('menu-images')
      .upload(safeName, buffer, {
        contentType: `image/${ext}`,
        upsert: false
      })

    if (error) {
      console.error("[SUPABASE_UPLOAD_ERR]", error.message)
      return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
    }

    const { data: publicUrlData } = supabase.storage.from('menu-images').getPublicUrl(safeName)

    return NextResponse.json({ success: true, data: { url: publicUrlData.publicUrl } }, { status: 201 })
  } catch (e: unknown) {
    console.error("[UPLOAD_CRITICAL_ERR]", e instanceof Error ? e.message : 'Unknown Error')
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
  }
}

