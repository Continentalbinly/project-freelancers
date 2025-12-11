'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { addToFavorites, removeFromFavorites, checkFavoriteStatus } from '@/service/favorite-client'

interface FavoriteButtonProps {
  projectId: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
  showText?: boolean
  isProjectOwner?: boolean
}

export default function FavoriteButton({ 
  projectId, 
  size = 'md', 
  className = '',
  showText = false,
  isProjectOwner = false
}: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(false)
  const [loading, setLoading] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const { user } = useAuth()

  // Check initial favorite status
  useEffect(() => {
    if (user && projectId && !initialized) {
      checkInitialStatus()
    }
  }, [user, projectId, initialized])

  const checkInitialStatus = async () => {
    try {
      const result = await checkFavoriteStatus(projectId)
      if (result.success) {
        setIsFavorited(result.isFavorited || false)
      }
      setInitialized(true)
    } catch (error) {
      //console.error('Error checking favorite status:', error)
      setInitialized(true)
    }
  }

  const handleToggleFavorite = async () => {
    if (!user) {
      // Redirect to login or show login modal
      return
    }

    setLoading(true)
    try {
      if (isFavorited) {
        const result = await removeFromFavorites(projectId)
        if (result.success) {
          setIsFavorited(false)
        }
      } else {
        const result = await addToFavorites(projectId)
        if (result.success) {
          setIsFavorited(true)
        }
      }
    } catch (error) {
      //console.error('Error toggling favorite:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-6 h-6'
      case 'lg':
        return 'w-8 h-8'
      default:
        return 'w-7 h-7'
    }
  }

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4'
      case 'lg':
        return 'w-6 h-6'
      default:
        return 'w-5 h-5'
    }
  }

  if (!user) {
    return null // Don't show favorite button for non-authenticated users
  }

  // Don't show favorite button for project owners
  if (isProjectOwner) {
    return null
  }

  return (
    <button suppressHydrationWarning
      onClick={handleToggleFavorite}
      disabled={loading}
      className={`flex items-center justify-center rounded-full transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
        isFavorited 
          ? 'bg-error/10 text-error hover:bg-error/20' 
          : 'text-text-muted hover:text-text-secondary'
      } ${getSizeClasses()} ${className}`}
      title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      {loading ? (
        <div className={`animate-spin rounded-full border-2 border-current border-t-transparent ${getIconSize()}`} />
      ) : (
        <svg 
          className={getIconSize()} 
          fill={isFavorited ? 'currentColor' : 'none'} 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
          />
        </svg>
      )}
      {showText && (
        <span className="ml-2 text-sm font-medium">
          {isFavorited ? 'Favorited' : 'Favorite'}
        </span>
      )}
    </button>
  )
} 