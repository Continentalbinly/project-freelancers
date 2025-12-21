import { requireDb } from '../service/firebase'
import { collection, getDocs, doc, updateDoc, query, where } from 'firebase/firestore'

async function updateProposalsCount() {
  try {
    const db = requireDb();
    //console.log('Starting proposals count update...')
    
    // Get all projects
    const projectsSnapshot = await getDocs(collection(db, 'projects'))
    //console.log(`Found ${projectsSnapshot.size} projects`)
    
    let updatedCount = 0
    
    for (const projectDoc of projectsSnapshot.docs) {
      const projectId = projectDoc.id
      const projectData = projectDoc.data()
      
      // Count proposals for this project
      const proposalsQuery = query(
        collection(db, 'proposals'),
        where('projectId', '==', projectId)
      )
      const proposalsSnapshot = await getDocs(proposalsQuery)
      const actualProposalsCount = proposalsSnapshot.size
      
      // Update project if count is different
      if (projectData.proposalsCount !== actualProposalsCount) {
        await updateDoc(doc(db, 'projects', projectId), {
          proposalsCount: actualProposalsCount,
          updatedAt: new Date()
        })
        //console.log(`Updated project ${projectId}: ${projectData.proposalsCount} → ${actualProposalsCount}`)
        updatedCount++
      }
    }
    
    //console.log(`Update complete! Updated ${updatedCount} projects.`)
  } catch (error) {
    //console.error('Error updating proposals count:', error)
  }
}

// Run the update
updateProposalsCount() 