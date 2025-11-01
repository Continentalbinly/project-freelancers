import {
  doc,
  getDoc,
  getDocs,
  addDoc,
  collection,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/service/firebase";

/**
 * Ensures a chat room exists for the project (creates one if missing)
 * and returns the room data.
 */
export async function createOrOpenChatRoom(
  projectId: string,
  currentUserId: string
) {
  if (!projectId || !currentUserId) return null;

  // 1️⃣ Get project data
  const projectRef = doc(db, "projects", projectId);
  const projectSnap = await getDoc(projectRef);
  if (!projectSnap.exists()) return null;

  const project = projectSnap.data();
  const clientId = project.clientId;
  const freelancerId = project.acceptedFreelancerId;
  const projectTitle = project.title || "Untitled Project";

  if (!clientId || !freelancerId) return null;

  // 2️⃣ Check existing chat room for this project
  const roomQuery = query(
    collection(db, "chatRooms"),
    where("projectId", "==", projectId)
  );
  const existing = await getDocs(roomQuery);
  if (!existing.empty) {
    const existingDoc = existing.docs[0];
    return { id: existingDoc.id, ...existingDoc.data() };
  }

  // 3️⃣ Load both profiles (optional but improves UX)
  const clientSnap = await getDoc(doc(db, "profiles", clientId));
  const freelancerSnap = await getDoc(doc(db, "profiles", freelancerId));
  const client = clientSnap.exists() ? clientSnap.data() : {};
  const freelancer = freelancerSnap.exists() ? freelancerSnap.data() : {};

  // 4️⃣ Create new chat room
  const newRoom = {
    projectId,
    projectTitle,
    participants: [clientId, freelancerId],
    participantNames: {
      [clientId]: client.fullName || "Client",
      [freelancerId]: freelancer.fullName || "Freelancer",
    },
    participantAvatars: {
      [clientId]: client.avatarUrl || "",
      [freelancerId]: freelancer.avatarUrl || "",
    },
    lastMessage: "Hi, Welcome!",
    lastMessageTime: serverTimestamp(),
    unreadCount: 0,
  };

  const roomRef = await addDoc(collection(db, "chatRooms"), newRoom);

  // 5️⃣ Add first “welcome” message
  await addDoc(collection(db, "chatMessages"), {
    chatRoomId: roomRef.id,
    message: "Hi, Welcome!",
    senderId: clientId,
    receiverId: freelancerId,
    senderName: client.fullName || "Client",
    senderAvatar: client.avatarUrl || "",
    read: false,
    timestamp: serverTimestamp(),
  });

  return { id: roomRef.id, ...newRoom };
}
