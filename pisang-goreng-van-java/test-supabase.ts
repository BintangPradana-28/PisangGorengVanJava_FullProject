import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load .env manual untuk script standalone
dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

console.log('Testing koneksi ke Supabase...')
console.log('URL:', supabaseUrl)

const supabase = createClient(supabaseUrl, supabaseKey)

async function testUpload() {
  try {
    const dummyContent = 'Hello, this is a test image file content!'
    const buffer = Buffer.from(dummyContent, 'utf-8')
    const testFileName = `test_upload_${Date.now()}.txt`

    console.log(`Mencoba mengunggah file: ${testFileName} ke bucket 'menu-images'...`)

    const { data, error } = await supabase.storage
      .from('menu-images')
      .upload(testFileName, buffer, {
        contentType: 'text/plain',
        upsert: false
      })

    if (error) {
      console.error('❌ Gagal mengunggah file!')
      console.error('Error Details:', error.message)
      return
    }

    console.log('✅ File berhasil diunggah!')
    console.log('Upload Data:', data)

    // Mendapatkan Public URL
    const { data: publicUrlData } = supabase.storage.from('menu-images').getPublicUrl(testFileName)
    console.log('🔗 Public URL:', publicUrlData.publicUrl)

    // Opsional: Hapus file setelah ditest
    console.log('Merapikan... menghapus file test dari bucket...')
    const { error: deleteError } = await supabase.storage.from('menu-images').remove([testFileName])
    if (deleteError) {
      console.error('⚠️ Gagal menghapus file test:', deleteError.message)
    } else {
      console.log('✅ File test berhasil dihapus dari bucket.')
    }

    console.log('Semua test Supabase berjalan lancar! 🎉')

  } catch (err) {
    console.error('Terjadi kesalahan fatal:', err)
  }
}

testUpload()
