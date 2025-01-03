import { useEffect, useState } from "react";
import { db } from "@/app/lib/firebase.config";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { create } from "zustand";
import { userStore } from "../../../../lib/userStore";
import { groupChatStore } from "@/app/lib/groupChatStore";
import { createGroup, CustomGroup } from "@/app/data";

export default function GroupCard() {
  const { currentUser } = userStore();
  const [groups, setGroups] = useState([]);
  const changeGroupChat = groupChatStore((state) => state.changeGroupChat);

  useEffect(() => {
    const unSub = onSnapshot(collection(db, "groups"), async (snapshot) => {
      const items = snapshot.docs.map((doc) => ({
        groupChatId: doc.id,
        ...doc.data(),
      }));

      const groupData = await Promise.all(
        items.map(async (item) => {
          try {
            const uniqueMembers = Array.from(new Set(item.members));
            const membersData = await Promise.all(
              uniqueMembers.map(async (memberId) => {
                const userDocRef = doc(db, "users", memberId);
                const userDocSnap = await getDoc(userDocRef);
                return userDocSnap.exists() ? userDocSnap.data() : null;
              })
            );

            return { ...item, membersData: membersData.filter(Boolean) };
          } catch (error) {
            console.error("Error fetching group members:", error);
            return null;
          }
        })
      );
      setGroups(
        groupData.filter(Boolean).sort((a, b) => b.updatedAt - a.updatedAt)
      );
    });

    return () => {
      unSub();
    };
  }, [currentUser]);

  const handleSelectGroup = async (group) => {
    changeGroupChat(group.groupChatId, group.members);

    const updatedGroupChatId = group.groupChatId;

    if (!updatedGroupChatId) {
      console.error("No valid groupChatId found.");
      return;
    }

    const groupChatsRef = doc(db, "groupChats", updatedGroupChatId);

    try {
      const groupDocSnap = await getDoc(groupChatsRef);
      const newGroup: CustomGroup = {
        members: group.members,
        name: group.name,
        groupChatId: updatedGroupChatId,
        createdAt: Timestamp.now(),
      };

      if (groupDocSnap.exists()) {
        // Используйте updateDoc для обновления существующей группы
        await updateDoc(groupChatsRef, {
          name: newGroup.name,
          members: newGroup.members,
          // Добавьте другие поля, которые нужно обновить
        });
      } else {
        // Создайте новую группу
        await createGroup(newGroup);
      }
    } catch (error) {
      console.error("Error updating or setting group chat:", error);
    }
  };

  return (
    <div>
      {groups.map((group) => (
        <div
          className="items"
          key={group.groupChatId}
          onClick={() => handleSelectGroup(group)}
        >
          <img src="./avatar.jpg" alt="" />
          <div className="text">
            <span>{group.name}</span>
            <p>{group.lastMessage}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
