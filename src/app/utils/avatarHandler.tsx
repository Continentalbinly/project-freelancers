'use client'

import { useState } from 'react'

interface AvatarProps {
  src?: string
  alt?: string
  name?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  className?: string
  fallback?: string
}

const sizeClasses = {
  sm: 'w-6 h-6 text-xs',
  md: 'w-8 h-8 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
  '2xl': 'w-20 h-20 text-xl'
}

export default function Avatar({ 
  src, 
  alt, 
  name, 
  size = 'md', 
  className = '',
  fallback
}: AvatarProps) {
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)

  // Get user initials from name
  const getInitials = (userName: string) => {
    return userName
      .split(' ')
      .map((word: string) => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Use the src directly (no proxy)
  const processedSrc = src || null
  const initials = fallback || (name ? getInitials(name) : 'U')

  if (!processedSrc || imageError) {
    return (
      <div 
        className={`bg-primary rounded-full flex items-center justify-center text-white font-medium ${sizeClasses[size]} ${className}`}
        title={alt || name}
      >
        {initials}
      </div>
    )
  }

  return (
    <div className={`relative ${sizeClasses[size]} ${className} aspect-square`}>
      {imageLoading && (
        <div className="absolute inset-0 bg-background-secondary rounded-full animate-pulse" />
      )}
      <img
        src={processedSrc}
        alt={alt || name || 'Avatar'}
        className={`w-full h-full rounded-full object-cover ${imageLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
        onLoad={() => {
          setImageLoading(false)
        }}
        onError={() => {
          setImageError(true)
          setImageLoading(false)
        }}
        title={alt || name}
      />
    </div>
  )
}

// Utility function to get avatar props from profile
export function getAvatarProps(profile: any, user?: any) {
  const props = {
    src: profile?.avatarUrl,
    alt: profile?.fullName,
    name: profile?.fullName || user?.email || 'User',
    fallback: profile?.fullName ? 
      profile.fullName.split(' ').map((word: string) => word.charAt(0)).join('').toUpperCase().slice(0, 2) : 
      'U'
  }
  return props
}
