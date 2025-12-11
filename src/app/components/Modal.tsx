import React from 'react'

interface ModalProps {
  title?: string
  icon?: React.ReactNode
  children: React.ReactNode
  onClose: () => void
}

export default function Modal({ title, icon, children, onClose }: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-background rounded-xl shadow-2xl max-w-md w-full p-8 relative transition-all duration-200 border border-border">
        <button suppressHydrationWarning
          onClick={onClose}
          className="absolute top-4 right-4 text-text-muted hover:text-text-primary text-2xl font-bold focus:outline-none"
          aria-label="Close"
        >
          ×
        </button>
        {(title || icon) && (
          <div className="flex items-center mb-6 gap-2">
            {icon && <span className="text-2xl text-primary">{icon}</span>}
            {title && <h3 className="text-xl font-semibold  ">{title}</h3>}
          </div>
        )}
        <div className="space-y-4">{children}</div>
      </div>
    </div>
  )
} 