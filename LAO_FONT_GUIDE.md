# Translation System with Automatic Lao Font Support

This guide explains the new translation system that automatically applies Noto Sans Lao font for Lao text rendering.

## Overview

The platform now uses a **locale-based translation system** with **automatic Lao font support**. This approach is cleaner, more maintainable, and automatically handles font selection based on the current language.

## Implementation Details

### 1. Font Loading
- **Font**: Noto Sans Lao from Google Fonts
- **Weights**: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)
- **Subsets**: Lao script support
- **CSS Variable**: `--font-noto-sans-lao`

### 2. CSS Configuration
The font is automatically applied via CSS in `src/app/globals.css`:
```css
/* Apply Lao font to elements with Lao language attribute */
*:lang(lo),
*[lang="lo"] {
  font-family: var(--font-lao), var(--font-sans), Arial, Helvetica, sans-serif;
}
```

### 3. Translation System
- **Hook**: `useTranslation()` for direct text access
- **Component**: `Translation` for automatic language attributes
- **Files**: `src/lib/i18n/en.ts` and `src/lib/i18n/lo.ts`

## Usage

### Method 1: Translation Component (Recommended)
```tsx
import Translation from '@/lib/i18n/Translation'

// Automatically applies language attribute and font
<Translation tKey="welcome" className="text-text-secondary" />
```

### Method 2: useTranslation Hook
```tsx
import { useTranslation } from '@/lib/i18n/useTranslation'

function MyComponent() {
  const { t, currentLanguage } = useTranslation()
  
  return (
    <span lang={currentLanguage} className="text-text-secondary">
      {t('welcome')}
    </span>
  )
}
```

### Method 3: Manual Language Attribute
```tsx
<span lang="lo" className="text-text-secondary">
  ຍິນດີຕ້ອນຮັບ
</span>
```

## Features

### 1. Automatic Font Selection
- Lao text automatically uses Noto Sans Lao font
- English text uses the default font
- No manual font detection needed

### 2. Language Switching
```tsx
const { changeLanguage } = useTranslation()

// Switch to Lao
changeLanguage('lo')

// Switch to English
changeLanguage('en')
```

### 3. Translation Keys
Add new translations in `src/lib/i18n/en.ts` and `src/lib/i18n/lo.ts`:
```ts
// en.ts
const en = {
  welcome: 'Welcome',
  home: 'Home',
  // Add more keys...
}

// lo.ts
const lo = {
  welcome: 'ຍິນດີຕ້ອນຮັບ',
  home: 'ໜ້າຫຼັກ',
  // Add more keys...
}
```

## Components Using the System

### 1. Footer Language Switcher
Updated to use the new translation system.

### 2. Cookie Consent
Can be updated to use `Translation` component for Lao text.

### 3. All UI Components
Use `Translation` component or `useTranslation` hook for any translatable text.

## Testing

Visit `/test-translation` to see examples of:
- Language switching
- Translation component usage
- Hook usage
- Mixed content examples

## Best Practices

1. **Use Translation Component** for most UI text
2. **Use useTranslation Hook** for dynamic content
3. **Add language attributes** when using the hook directly
4. **Keep translation keys consistent** between languages
5. **Test both languages** to ensure proper font rendering

## Benefits

- ✅ **No manual font detection** needed
- ✅ **Automatic language attributes** via Translation component
- ✅ **Clean, maintainable code**
- ✅ **Type-safe translation keys**
- ✅ **Easy to add new languages**
- ✅ **Automatic font switching** based on language

## Browser Support

Noto Sans Lao is supported in all modern browsers and provides fallbacks to system fonts if needed.

## Performance

The font is loaded efficiently through Google Fonts with proper subsetting for Lao script only, minimizing download size. 