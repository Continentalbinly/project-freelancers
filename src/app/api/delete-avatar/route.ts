import { NextRequest, NextResponse } from 'next/server'
import { unlink } from 'fs/promises'
import { join } from 'path'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()
    if (!url) {
      return NextResponse.json({ success: false, error: 'No URL provided' }, { status: 400 })
    }

    // Local file deletion
    if (url.startsWith('/uploads/')) {
      const filePath = join(process.cwd(), 'public', url)
      try {
        await unlink(filePath)
        return NextResponse.json({ success: true, deleted: 'local', url })
      } catch  {
        return NextResponse.json({ success: false, error: 'Failed to delete local file' }, { status: 500 })
      }
    }

    // Cloudinary deletion
    if (url.includes('res.cloudinary.com')) {
      const match = url.match(/\/upload\/v\d+\/(.+)\.[a-zA-Z]+$/)
      const publicId = match ? match[1] : null
      if (!publicId) {
        return NextResponse.json({ success: false, error: 'Could not extract Cloudinary public_id' }, { status: 400 })
      }
      try {
        await cloudinary.uploader.destroy(publicId, { invalidate: true })
        return NextResponse.json({ success: true, deleted: 'cloudinary', publicId })
      } catch  {
        return NextResponse.json({ success: false, error: 'Failed to delete Cloudinary image' }, { status: 500 })
      }
    }

    return NextResponse.json({ success: false, error: 'URL is not a recognized avatar location' }, { status: 400 })
  } catch {
    return NextResponse.json({ success: false, error: 'Unknown error' }, { status: 500 })
  }
} 