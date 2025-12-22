import { requireDb } from '../service/firebase'
import { collection, getDocs, doc, updateDoc, query, where } from 'firebase/firestore'

export default async function updateProposalsCount() {
  try {
    const db = requireDb();

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
        updatedCount = actualProposalsCount
      }
    }
    return updatedCount
  } catch {
    return 0
  }
}