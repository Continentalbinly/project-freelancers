/**
 * Tests for Firebase service utilities
 */

import { handleFirebaseError, successResponse } from '@/service/firebase'

// Mock Firebase to avoid initialization issues in tests
jest.mock('@/service/firebase', () => {
  const actual = jest.requireActual('@/service/firebase')
  return {
    ...actual,
    db: null,
    auth: null,
    storage: null,
  }
})

describe('Firebase Service', () => {
  describe('handleFirebaseError', () => {
    it('should handle Error instances', () => {
      const error = new Error('Test error')
      const result = handleFirebaseError(error)
      expect(result.success).toBe(false)
      expect(result.error).toBe('Test error')
    })

    it('should handle unknown error types', () => {
      const result = handleFirebaseError('string error')
      expect(result.success).toBe(false)
      expect(result.error).toBe('An unexpected error occurred')
    })
  })

  describe('successResponse', () => {
    it('should create success response with data', () => {
      const data = { id: '123', name: 'Test' }
      const result = successResponse(data)
      expect(result.success).toBe(true)
      expect(result.data).toEqual(data)
    })

    it('should include optional message', () => {
      const result = successResponse({ id: '123' }, 'Operation successful')
      expect(result.success).toBe(true)
      expect(result.message).toBe('Operation successful')
    })
  })
})

