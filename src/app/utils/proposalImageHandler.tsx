'use client'

import { useState } from 'react'

interface ProposalImageProps {
  src?: string
  alt?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  className?: string
  fallback?: string
  proposalTitle?: string
  type?: 'work-sample' | 'attachment' | 'portfolio'
}

const sizeClasses = {
  sm: 'w-12 h-12 text-xs',
  md: 'w-16 h-16 text-sm',
  lg: 'w-24 h-24 text-base',
  xl: 'w-32 h-32 text-lg',
  '2xl': 'w-40 h-40 text-xl'
}

export default function ProposalImage({ 
  src, 
  alt, 
  size = 'md', 
  className = '',
  fallback,
  proposalTitle,
  type = 'work-sample'
}: ProposalImageProps) {
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)

  // Use the src directly (no proxy processing)
  const processedSrc = src || null
  const fallbackText = fallback || (proposalTitle ? proposalTitle.slice(0, 2).toUpperCase() : 'PR')

  // Get appropriate icon based on type
  const getTypeIcon = () => {
    switch (type) {
      case 'work-sample':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )
      case 'attachment':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
        )
      case 'portfolio':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        )
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        )
    }
  }

  // Debug logging
  if (src) {
    console.log('ProposalImage Debug:', {
      originalSrc: src,
      processedSrc,
      proposalTitle,
      type,
      fallback
    })
  }

  if (!processedSrc || imageError) {
    return (
      <div 
        className={`bg-gradient-to-br from-secondary-light to-primary-light rounded-lg flex items-center justify-center text-white font-medium ${sizeClasses[size]} ${className}`}
        title={alt || proposalTitle}
      >
        <div className="text-center">
          {getTypeIcon()}
          <span className="text-xs block mt-1">{fallbackText}</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${sizeClasses[size]} ${className} aspect-square`}>
      {imageLoading && (
        <div className="absolute inset-0 bg-background-secondary rounded-lg animate-pulse" />
      )}
      <img
        src={processedSrc}
        alt={alt || proposalTitle || 'Proposal Image'}
        className={`w-full h-full rounded-lg object-cover ${imageLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
        onLoad={() => {
          console.log('Proposal image loaded successfully:', processedSrc)
          setImageLoading(false)
        }}
        onError={() => {
          console.log('Proposal image failed to load:', processedSrc)
          setImageError(true)
          setImageLoading(false)
        }}
        title={alt || proposalTitle}
      />
    </div>
  )
}

// Utility function to get proposal image props
export function getProposalImageProps(proposal: any, type: 'work-sample' | 'attachment' | 'portfolio' = 'work-sample') {
  const props = {
    src: proposal?.imageUrl || proposal?.workSampleUrl,
    alt: proposal?.title || 'Proposal Work Sample',
    proposalTitle: proposal?.title,
    type,
    fallback: proposal?.title ? 
      proposal.title.split(' ').map((word: string) => word.charAt(0)).join('').toUpperCase().slice(0, 2) : 
      'PR'
  }
  
  // Debug logging for getProposalImageProps
  console.log('getProposalImageProps Debug:', {
    proposalImageUrl: proposal?.imageUrl,
    proposalWorkSampleUrl: proposal?.workSampleUrl,
    proposalTitle: proposal?.title,
    type,
    finalProps: props
  })
  
  return props
} 