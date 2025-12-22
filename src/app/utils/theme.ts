// Theme configuration for the freelance platform
export const theme = {
  colors: {
    primary: {
      main: '#06A764',
      hover: '#059a5a',
      light: '#e6f7ef',
      contrast: '#ffffff'
    },
    secondary: {
      main: '#013F81',
      hover: '#01356b',
      light: '#e6f0f9',
      contrast: '#ffffff'
    },
    background: {
      primary: '#ffffff',
      secondary: '#f8f9fa',
      tertiary: '#f1f3f4'
    },
    text: {
      primary: '#171717',
      secondary: '#6b7280',
      muted: '#9ca3af',
      inverse: '#ffffff'
    },
    status: {
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6'
    },
    border: {
      default: '#e5e7eb',
      hover: '#d1d5db'
    }
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)'
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem'
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem'
  },
  typography: {
    fontFamily: {
      sans: 'var(--font-geist-sans), Arial, Helvetica, sans-serif',
      mono: 'var(--font-geist-mono), monospace'
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem'
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700'
    }
  }
} as const

// Type definitions for theme
export type ThemeColors = typeof theme.colors
export type ThemeShadows = typeof theme.shadows
export type ThemeBorderRadius = typeof theme.borderRadius
export type ThemeSpacing = typeof theme.spacing
export type ThemeTypography = typeof theme.typography

// Utility functions for theme usage
export const getColor = (colorPath: string) => {
  const path = colorPath.split('.')
  let value: Record<string, unknown> = theme.colors as Record<string, unknown>
  
  for (const key of path) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key] as Record<string, unknown>
    } else {
      return undefined
    }
  }
  
  return value
}

// Common color combinations for different user types
export const userTypeColors = {
  freelancer: {
    primary: theme.colors.primary.main,
    secondary: theme.colors.primary.light,
    accent: theme.colors.status.success
  },
  client: {
    primary: theme.colors.secondary.main,
    secondary: theme.colors.secondary.light,
    accent: theme.colors.status.info
  },
  admin: {
    primary: theme.colors.text.primary,
    secondary: theme.colors.background.secondary,
    accent: theme.colors.status.warning
  }
} as const

// Status colors for different project states
export const projectStatusColors = {
  open: {
    bg: '#ecfdf5',
    text: '#065f46',
    border: '#10b981'
  },
  in_progress: {
    bg: '#eff6ff',
    text: '#1e40af',
    border: '#3b82f6'
  },
  completed: {
    bg: '#f0fdf4',
    text: '#166534',
    border: '#22c55e'
  },
  cancelled: {
    bg: '#fef2f2',
    text: '#991b1b',
    border: '#ef4444'
  }
} as const

export default theme 