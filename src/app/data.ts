import { db } from "@/app/lib/firebase.config";
import { doc, setDoc, Timestamp, updateDoc } from "firebase/firestore";

export async function createGroup(group: CustomGroup): Promise<void> {
  const groupChatsRef = doc(db, "groupChats", group.groupChatId);
  await setDoc(groupChatsRef, { ...group });
}

export async function updateGroup(group: CustomGroup): Promise<void> {
  const groupChatsRef = doc(db, "groupChats", group.groupChatId);
  await updateDoc(groupChatsRef, { ...group });
}

export interface CustomGroup {
  members: Array<string>;
  groupChatId: string;
  name: string;
  createdAt: Timestamp;
}

