/**
 * Tests for Validation schemas
 */

import { validate, loginSchema, createProposalSchema, createProjectSchema } from '@/lib/validation'

describe('Validation', () => {
  describe('loginSchema', () => {
    it('should validate correct login data', () => {
      const result = validate(loginSchema, {
        email: 'test@example.com',
        password: 'password123',
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.email).toBe('test@example.com')
      }
    })

    it('should reject invalid email', () => {
      const result = validate(loginSchema, {
        email: 'invalid-email',
        password: 'password123',
      })
      expect(result.success).toBe(false)
    })

    it('should reject empty password', () => {
      const result = validate(loginSchema, {
        email: 'test@example.com',
        password: '',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('createProposalSchema', () => {
    it('should validate correct proposal data', () => {
      const result = validate(createProposalSchema, {
        projectId: 'project123',
        coverLetter: 'This is a detailed cover letter with enough content',
        proposedBudget: 1000,
        estimatedDuration: '2 weeks',
      })
      expect(result.success).toBe(true)
    })

    it('should reject short cover letter', () => {
      const result = validate(createProposalSchema, {
        projectId: 'project123',
        coverLetter: 'Short',
        proposedBudget: 1000,
        estimatedDuration: '2 weeks',
      })
      expect(result.success).toBe(false)
    })

    it('should reject negative budget', () => {
      const result = validate(createProposalSchema, {
        projectId: 'project123',
        coverLetter: 'This is a detailed cover letter with enough content',
        proposedBudget: -100,
        estimatedDuration: '2 weeks',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('createProjectSchema', () => {
    it('should validate correct project data', () => {
      const result = validate(createProjectSchema, {
        title: 'Test Project',
        description: 'This is a detailed project description',
        budget: 5000,
        budgetType: 'fixed',
        skillsRequired: ['React', 'TypeScript'],
        category: 'web-development',
      })
      expect(result.success).toBe(true)
    })

    it('should reject short title', () => {
      const result = validate(createProjectSchema, {
        title: 'AB',
        description: 'This is a detailed project description',
        budget: 5000,
        budgetType: 'fixed',
        skillsRequired: ['React'],
        category: 'web-development',
      })
      expect(result.success).toBe(false)
    })

    it('should reject empty skills array', () => {
      const result = validate(createProjectSchema, {
        title: 'Test Project',
        description: 'This is a detailed project description',
        budget: 5000,
        budgetType: 'fixed',
        skillsRequired: [],
        category: 'web-development',
      })
      expect(result.success).toBe(false)
    })
  })
})

