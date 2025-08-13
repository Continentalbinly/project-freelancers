import { auth } from './firebase'

export interface FavoriteResponse {
  success: boolean
  data?: any
  error?: string
  message?: string
  isFavorited?: boolean
}

export async function addToFavorites(projectId: string): Promise<FavoriteResponse> {
  try {
    const user = auth.currentUser
    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    const token = await user.getIdToken()
    const response = await fetch('/api/favorites', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        action: 'add-favorite',
        projectId
      })
    })

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Add to favorites error:', error)
    return { success: false, error: 'Failed to add to favorites' }
  }
}

export async function removeFromFavorites(projectId: string): Promise<FavoriteResponse> {
  try {
    const user = auth.currentUser
    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    const token = await user.getIdToken()
    const response = await fetch('/api/favorites', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        action: 'remove-favorite',
        projectId
      })
    })

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Remove from favorites error:', error)
    return { success: false, error: 'Failed to remove from favorites' }
  }
}

export async function checkFavoriteStatus(projectId: string): Promise<FavoriteResponse> {
  try {
    const user = auth.currentUser
    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    const token = await user.getIdToken()
    const response = await fetch('/api/favorites', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        action: 'check-favorite',
        projectId
      })
    })

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Check favorite status error:', error)
    return { success: false, error: 'Failed to check favorite status' }
  }
}

export async function getUserFavorites(): Promise<FavoriteResponse> {
  try {
    const user = auth.currentUser
    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    const token = await user.getIdToken()
    const response = await fetch('/api/favorites', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        action: 'get-user-favorites'
      })
    })

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Get user favorites error:', error)
    return { success: false, error: 'Failed to get user favorites' }
  }
} 