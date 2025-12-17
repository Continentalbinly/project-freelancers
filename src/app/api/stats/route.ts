import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/service/firebase'
import { collection, getDocs, query, where } from 'firebase/firestore'

export async function GET() {
  try {
    // Get all profiles to count freelancers and clients
    const profilesRef = collection(db, 'profiles')
    const profilesSnapshot = await getDocs(profilesRef)
    
    let freelancerCount = 0
    let clientCount = 0
    let totalEarned = 0
    let totalSpent = 0
    
    profilesSnapshot.forEach((doc) => {
      const data = doc.data() as any
      const role = data.role

      if (role === 'freelancer') {
        freelancerCount++
        totalEarned += data.totalEarned || 0
      }

      if (role === 'client') {
        clientCount++
        totalSpent += data.totalSpent || 0
      }
    })
    
    // Get all projects to count total projects
    const projectsRef = collection(db, 'projects')
    const projectsSnapshot = await getDocs(projectsRef)
    const projectCount = projectsSnapshot.size
    
    // Calculate total earned from completed projects
    let totalEarnedFromProjects = 0
    projectsSnapshot.forEach((doc) => {
      const data = doc.data()
      if (data.status === 'completed' && data.budget) {
        totalEarnedFromProjects += data.budget
      }
    })
    
    return NextResponse.json({
      success: true,
      data: {
        freelancers: freelancerCount,
        clients: clientCount,
        projects: projectCount,
        totalEarned: totalEarnedFromProjects,
        totalEarnedFromProfiles: totalEarned,
        totalSpent: totalSpent,
        // Additional stats for about page
        completedProjects: projectsSnapshot.docs.filter(doc => doc.data().status === 'completed').length,
        activeProjects: projectsSnapshot.docs.filter(doc => doc.data().status === 'open' || doc.data().status === 'in_progress').length,
        totalBudget: projectsSnapshot.docs.reduce((sum, doc) => sum + (doc.data().budget || 0), 0)
      }
    })
  } catch (error) {
    //console.error('Error fetching platform stats:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch platform statistics' },
      { status: 500 }
    )
  }
} 