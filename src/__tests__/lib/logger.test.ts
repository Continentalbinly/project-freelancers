/**
 * Tests for Logger utility
 */

// Set NODE_ENV to test BEFORE importing logger (important!)
const originalEnv = process.env.NODE_ENV
// Use Object.defineProperty to avoid TypeScript read-only error
Object.defineProperty(process.env, 'NODE_ENV', {
  value: 'test',
  writable: true,
  configurable: true
})

// Mock console methods BEFORE importing logger (important!)
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {})
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {})
const mockConsoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {})

import { logger } from '@/lib/logger'

describe('Logger', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterAll(() => {
    // Restore original NODE_ENV
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: originalEnv,
      writable: true,
      configurable: true
    })
    mockConsoleLog.mockRestore()
    mockConsoleError.mockRestore()
    mockConsoleWarn.mockRestore()
  })


  it('should log info messages', () => {
    logger.info('Test info message', { key: 'value' })
    expect(mockConsoleLog).toHaveBeenCalled()
  })

  it('should log error messages', () => {
    const error = new Error('Test error')
    logger.error('Test error message', error, { context: 'test' })
    expect(mockConsoleError).toHaveBeenCalled()
  })

  it('should log warning messages', () => {
    logger.warn('Test warning', { key: 'value' })
    expect(mockConsoleWarn).toHaveBeenCalled()
  })

  it('should log API errors with context', () => {
    const error = new Error('API error')
    logger.apiError('/api/test', error, { userId: '123' })
    expect(mockConsoleError).toHaveBeenCalled()
  })

  it('should log Firebase errors', () => {
    const error = new Error('Firebase error')
    logger.firebaseError('testOperation', error, { collection: 'users' })
    expect(mockConsoleError).toHaveBeenCalled()
  })
})

