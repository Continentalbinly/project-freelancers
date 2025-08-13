/**
 * Currency utilities for Lao Kip (LAK) handling
 */

// Currency configuration
export const CURRENCY_CONFIG = {
  code: 'LAK',
  symbol: '₭',
  name: 'Lao Kip',
  locale: 'lo-LA',
  decimalPlaces: 0, // LAK typically doesn't use decimal places
  exchangeRates: {
    USD: 1 / 20000, // Approximate rate (1 USD ≈ 20,000 LAK)
    EUR: 1 / 22000, // Approximate rate (1 EUR ≈ 22,000 LAK)
    THB: 1 / 600,   // Approximate rate (1 THB ≈ 600 LAK)
  }
}

/**
 * Format amount in Lao Kip
 * @param amount - Amount in LAK
 * @param options - Formatting options
 * @returns Formatted currency string
 */
export const formatLAK = (
  amount: number, 
  options: {
    showSymbol?: boolean
    showCode?: boolean
    compact?: boolean
    minimumFractionDigits?: number
    maximumFractionDigits?: number
  } = {}
) => {
  const {
    showSymbol = true,
    showCode = false,
    compact = false,
    minimumFractionDigits = 0,
    maximumFractionDigits = 0
  } = options

  // Handle zero and negative values
  if (amount === 0) {
    return showSymbol ? `${CURRENCY_CONFIG.symbol}0` : '0'
  }

  // Format the number
  let formattedAmount: string

  if (compact && amount >= 1000000) {
    // Format millions
    formattedAmount = (amount / 1000000).toFixed(1)
    formattedAmount = `${formattedAmount}M`
  } else if (compact && amount >= 1000) {
    // Format thousands
    formattedAmount = (amount / 1000).toFixed(1)
    formattedAmount = `${formattedAmount}K`
  } else {
    // Regular formatting
    formattedAmount = amount.toLocaleString('en-US', {
      minimumFractionDigits,
      maximumFractionDigits
    })
  }

  // Build the final string
  let result = formattedAmount

  if (showSymbol) {
    result = `${CURRENCY_CONFIG.symbol}${result}`
  }

  if (showCode) {
    result = `${result} ${CURRENCY_CONFIG.code}`
  }

  return result
}

/**
 * Convert amount from USD to LAK
 * @param usdAmount - Amount in USD
 * @returns Amount in LAK
 */
export const convertUSDToLAK = (usdAmount: number): number => {
  return Math.round(usdAmount * (1 / CURRENCY_CONFIG.exchangeRates.USD))
}

/**
 * Convert amount from LAK to USD
 * @param lakAmount - Amount in LAK
 * @returns Amount in USD
 */
export const convertLAKToUSD = (lakAmount: number): number => {
  return Math.round(lakAmount * CURRENCY_CONFIG.exchangeRates.USD * 100) / 100
}

/**
 * Format budget range for projects
 * @param minBudget - Minimum budget in LAK
 * @param maxBudget - Maximum budget in LAK
 * @param budgetType - Type of budget (fixed/hourly)
 * @returns Formatted budget string
 */
export const formatBudgetRange = (
  minBudget: number, 
  maxBudget: number, 
  budgetType: 'fixed' | 'hourly' = 'fixed'
): string => {
  const minFormatted = formatLAK(minBudget, { compact: true })
  const maxFormatted = formatLAK(maxBudget, { compact: true })
  
  const typeLabel = budgetType === 'hourly' ? '/hr' : ''
  
  if (minBudget === maxBudget) {
    return `${minFormatted}${typeLabel}`
  }
  
  return `${minFormatted} - ${maxFormatted}${typeLabel}`
}

/**
 * Format hourly rate
 * @param rate - Hourly rate in LAK
 * @returns Formatted hourly rate string
 */
export const formatHourlyRate = (rate: number): string => {
  return formatLAK(rate, { compact: true }) + '/hr'
}

/**
 * Calculate total earnings from completed projects
 * @param projects - Array of completed projects
 * @returns Total earnings in LAK
 */
export const calculateTotalEarnings = (projects: Array<{ budget: number }>): number => {
  return projects.reduce((total, project) => total + project.budget, 0)
}

/**
 * Format earnings for display
 * @param earnings - Earnings in LAK
 * @returns Formatted earnings string
 */
export const formatEarnings = (earnings: number): string => {
  return formatLAK(earnings, { compact: true })
}

/**
 * Validate currency input
 * @param value - Input value
 * @returns Whether the input is valid
 */
export const isValidCurrencyInput = (value: string): boolean => {
  const numericValue = parseFloat(value.replace(/[^\d.-]/g, ''))
  return !isNaN(numericValue) && numericValue >= 0
}

/**
 * Parse currency input to number
 * @param value - Input value
 * @returns Parsed number or 0 if invalid
 */
export const parseCurrencyInput = (value: string): number => {
  const numericValue = parseFloat(value.replace(/[^\d.-]/g, ''))
  return isNaN(numericValue) ? 0 : Math.max(0, numericValue)
}

// Example usage and test functions
export const currencyExamples = {
  // Basic formatting
  basic: formatLAK(50000), // "₭50,000"
  compact: formatLAK(1500000, { compact: true }), // "₭1.5M"
  noSymbol: formatLAK(25000, { showSymbol: false }), // "25,000"
  withCode: formatLAK(100000, { showCode: true }), // "₭100,000 LAK"
  
  // Hourly rates
  hourlyRate: formatHourlyRate(300000), // "₭300K/hr"
  
  // Budget ranges
  budgetRange: formatBudgetRange(500000, 1000000), // "₭500K - ₭1M"
  hourlyRange: formatBudgetRange(200000, 500000, 'hourly'), // "₭200K - ₭500K/hr"
  
  // Earnings
  earnings: formatEarnings(2500000), // "₭2.5M"
  
  // Conversions
  usdToLak: convertUSDToLAK(50), // 1000000 (1M LAK)
  lakToUsd: convertLAKToUSD(1000000), // 50 (USD)
} 