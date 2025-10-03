'use client'

import { useState } from 'react'

interface ProjectImageProps {
  src?: string
  alt?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  className?: string
  fallback?: string
  projectTitle?: string
}

const sizeClasses = {
  sm: 'w-16 h-12 text-xs',
  md: 'w-32 h-24 text-sm',
  lg: 'w-48 h-36 text-base',
  xl: 'w-64 h-48 text-lg',
  '2xl': 'w-80 h-60 text-xl',
  full: 'w-full h-48 sm:h-64 md:h-80 lg:h-96'
}

export default function ProjectImage({ 
  src, 
  alt, 
  size = 'md', 
  className = '',
  fallback,
  projectTitle
}: ProjectImageProps) {
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)

  // Convert Google Drive URL to proxy URL
  const convertGoogleDriveUrl = (url: string): string => {
    if (!url) return url
    
    // Extract file ID from various Google Drive URL formats
    let fileId: string | null = null
    
    // Handle Google Drive URLs with /view pattern
    const viewMatch = url.match(/\/d\/([a-zA-Z0-9-_]+)\/view/)
    if (viewMatch) {
      fileId = viewMatch[1]
    }
    
    // Handle Google Drive URLs with /file/d/ pattern
    const fileIdMatch = url.match(/\/file\/d\/([a-zA-Z0-9-_]+)/)
    if (fileIdMatch) {
      fileId = fileIdMatch[1]
    }
    
    // Handle Google Drive URLs with /open?id= pattern
    const openMatch = url.match(/\/open\?id=([a-zA-Z0-9-_]+)/)
    if (openMatch) {
      fileId = openMatch[1]
    }
    
    // Handle direct Google Drive URLs with just the ID
    if (url.includes('drive.google.com') && url.includes('id=')) {
      const idMatch = url.match(/id=([a-zA-Z0-9-_]+)/)
      if (idMatch) {
        fileId = idMatch[1]
      }
    }
    
    // If we found a file ID, use our proxy API with higher resolution
    if (fileId) {
      // Request higher resolution images for better quality
      const imageSize = size === 'sm' ? 256 : size === 'md' ? 512 : size === 'lg' ? 1024 : size === 'xl' ? 2048 : 4096
      return `/api/image-proxy?id=${fileId}&size=${imageSize}`
    }
    
    // If it's not a Google Drive URL, return as is
    return url
  }

  const processedSrc = src ? convertGoogleDriveUrl(src) : null
  const fallbackText = fallback || (projectTitle ? projectTitle.slice(0, 2).toUpperCase() : 'PJ')

  // Debug logging
  // if (src) {
  //   console.log('ProjectImage Debug:', {
  //     originalSrc: src,
  //     processedSrc,
  //     isGoogleDrive: src.includes('drive.google.com') || src.includes('docs.google.com'),
  //     projectTitle,
  //     fallback,
  //     fileId: src.match(/\/file\/d\/([a-zA-Z0-9-_]+)/)?.[1] || 'not found'
  //   })
  // }

  if (!processedSrc || imageError) {
    return (
      <div 
        className={`bg-gradient-to-br from-primary/20 via-secondary/20 to-primary/30 rounded-xl sm:rounded-2xl flex items-center justify-center text-primary font-semibold shadow-inner ${sizeClasses[size]} ${className}`}
        title={alt || projectTitle}
      >
        <div className="text-center p-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 sm:w-8 sm:h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <span className="text-sm sm:text-base font-medium text-primary">{fallbackText}</span>
          <p className="text-xs text-primary/70 mt-1 hidden sm:block">Project Image</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${sizeClasses[size]} ${className} overflow-hidden`}>
      {/* Loading State */}
      {imageLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-background-secondary to-background rounded-xl sm:rounded-2xl animate-pulse">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
        </div>
      )}
      
      {/* Image Container */}
      <div className={`relative ${size === 'full' ? 'aspect-video' : 'aspect-[4/3]'} overflow-hidden shadow-lg`}>
        <img
          src={processedSrc}
          alt={alt || projectTitle || 'Project Image'}
          className={`w-full h-full object-cover transition-all duration-300 ${
            imageLoading ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
          } hover:scale-105`}
          onLoad={() => {
            //console.log('Project image loaded successfully:', processedSrc)
            setImageLoading(false)
          }}
          onError={() => {
            //console.log('Project image failed to load:', processedSrc)
            setImageError(true)
            setImageLoading(false)
          }}
          title={alt || projectTitle}
        />
        
        {/* Subtle overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
      </div>
      
      {/* Image loading indicator */}
      {imageLoading && (
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg">
          <div className="w-4 h-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  )
}

// Utility function to get project image props
export function getProjectImageProps(project: any) {
  const props = {
    src: project?.imageUrl,
    alt: project?.title,
    projectTitle: project?.title,
    fallback: project?.title ? 
      project.title.split(' ').map((word: string) => word.charAt(0)).join('').toUpperCase().slice(0, 2) : 
      'PJ'
  }
  
  // Debug logging for getProjectImageProps
  //console.log('getProjectImageProps Debug:', {
  //   projectImageUrl: project?.imageUrl,
  //   projectTitle: project?.title,
  //   finalProps: props
  // })
  
  return props
} 

// Delete project image utility (like avatar delete)
export async function deleteProjectImage(url: string): Promise<void> {
  if (!url) return
  try {
    await fetch('/api/delete-avatar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    })
  } catch (err) {
    console.error('Failed to delete project image:', err)
  }
} 