import { auth } from './firebase'

export interface ProposalData {
  projectId: string
  coverLetter: string
  proposedRate: number
  proposedBudget?: number
  estimatedDuration: string
}

export interface ProposalResponse {
  success: boolean
  data?: Record<string, unknown>
  error?: string
  message?: string
}

export async function createProposal(proposalData: ProposalData): Promise<ProposalResponse> {
  try {
    if (!auth) {
      return { success: false, error: 'Authentication not initialized' }
    }
    const user = auth.currentUser
    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    const token = await user.getIdToken()
    const response = await fetch('/api/proposals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        action: 'create-proposal',
        ...proposalData
      })
    })

    const data = await response.json()
    return data
  } catch (_error) {
    //console.error('Create proposal error:', _error)
    return { success: false, error: 'Failed to create proposal' }
  }
}

export async function getProposals(projectId: string): Promise<ProposalResponse> {
  try {
    if (!auth) {
      return { success: false, error: 'Authentication not initialized' }
    }
    const user = auth.currentUser
    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    const token = await user.getIdToken()
    const response = await fetch('/api/proposals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        action: 'get-proposals',
        projectId
      })
    })

    const data = await response.json()
    return data
  } catch (_error) {
    //console.error('Get proposals error:', _error)
    return { success: false, error: 'Failed to get proposals' }
  }
}

export async function updateProposalStatus(
  proposalId: string, 
  status: 'accepted' | 'rejected' | 'pending'
): Promise<ProposalResponse> {
  try {
    if (!auth) {
      return { success: false, error: 'Authentication not initialized' }
    }
    const user = auth.currentUser
    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    const token = await user.getIdToken()
    const response = await fetch('/api/proposals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        action: 'update-proposal-status',
        proposalId,
        status,
        processedBy: user.uid
      })
    })

    const data = await response.json()
    return data
  } catch (_error) {
    //console.error('Update proposal status error:', _error)
    return { success: false, error: 'Failed to update proposal status' }
  }
} 