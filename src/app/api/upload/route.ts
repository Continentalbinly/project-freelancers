import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { uploadToCloudinary } from '@/service/cloudinary'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const folderType = formData.get('folderType') as string || 'general'
    const subfolder = formData.get('subfolder') as string | undefined
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    if (file.size > 25 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'File too large. Maximum size is 25MB.' },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const timestamp = Date.now()
    const fileName = `${folderType}-${timestamp}-${file.name}`

    // Special case: For profileImage, save to local and return local URL, backup to Cloudinary
    if (folderType === 'profileImage') {
      try {
        // Local storage
        const uploadsDir = join(process.cwd(), 'public', 'uploads', folderType)
        if (!existsSync(uploadsDir)) {
          await mkdir(uploadsDir, { recursive: true })
        }
        const filePath = join(uploadsDir, fileName)
        await writeFile(filePath, buffer)
        const localUrl = `/uploads/${folderType}/${fileName}`

        // Backup to Cloudinary (non-blocking)
        uploadToCloudinary(buffer, fileName, file.type, folderType)
          .then(result => {
            console.log('Backup upload to Cloudinary successful:', result.secure_url)
          })
          .catch(error => {
            console.error('Backup upload to Cloudinary failed:', error)
          })

        return NextResponse.json({
          success: true,
          data: {
            url: localUrl,
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            storage: 'local'
          }
        })
      } catch (localError: any) {
        // fallback to Cloudinary if local fails
        try {
          const result = await uploadToCloudinary(buffer, fileName, file.type, folderType)
          return NextResponse.json({
            success: true,
            data: {
              url: result.secure_url,
              fileName: file.name,
              fileType: file.type,
              fileSize: file.size,
              storage: 'cloudinary',
              cloudinaryId: result.public_id
            }
          })
        } catch (cloudinaryError: any) {
          return NextResponse.json(
            { success: false, error: 'Failed to upload profile image to both local and Cloudinary' },
            { status: 500 }
          )
        }
      }
    }

    // For proposalsImage, upload directly to Cloudinary with subfolder
    if (folderType === 'proposalsImage') {
      try {
        const result = await uploadToCloudinary(buffer, fileName, file.type, folderType, subfolder)
        return NextResponse.json({
          success: true,
          data: {
            url: result.secure_url,
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            storage: 'cloudinary',
            cloudinaryId: result.public_id
          }
        })
      } catch (cloudinaryError: any) {
        console.error('Cloudinary upload failed:', cloudinaryError)
        return NextResponse.json(
          { success: false, error: 'Failed to upload proposal image to Cloudinary' },
          { status: 500 }
        )
      }
    }

    // Default: Try local storage first, then backup to Cloudinary
    try {
      console.log('Attempting local storage upload...')
      
      // Create uploads directory if it doesn't exist
      const uploadsDir = join(process.cwd(), 'public', 'uploads', folderType)
      if (!existsSync(uploadsDir)) {
        await mkdir(uploadsDir, { recursive: true })
      }

      // Save file locally
      const filePath = join(uploadsDir, fileName)
      await writeFile(filePath, buffer)

      // Create public URL
      const localUrl = `/uploads/${folderType}/${fileName}`

      // Also upload to cloud as backup (non-blocking)
      uploadToCloudinary(buffer, fileName, file.type, folderType)
        .then(result => {
          console.log('Backup upload to Cloudinary successful:', result.secure_url)
        })
        .catch(error => {
          console.error('Backup upload to Cloudinary failed:', error)
        })

      console.log('Upload successful to local storage')
      return NextResponse.json({
        success: true,
        data: {
          url: localUrl,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          storage: 'local'
        }
      })

    } catch (localError: any) {
      console.error('Local storage failed:', localError)
      
      // Fallback to Cloudinary
      try {
        console.log('Trying Cloudinary as backup...')
        
        // Upload to Cloudinary using our service
        const result = await uploadToCloudinary(buffer, fileName, file.type, folderType)

        console.log('Upload successful to Cloudinary')
        return NextResponse.json({
          success: true,
          data: {
            url: result.secure_url,
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            storage: 'cloudinary',
            cloudinaryId: result.public_id
          }
        })

      } catch (cloudinaryError: any) {
        console.error('Cloudinary upload failed:', cloudinaryError)
        return NextResponse.json(
          { success: false, error: 'Failed to upload file to both local and cloud storage' },
          { status: 500 }
        )
      }
    }

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { success: false, error: `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  })
} 