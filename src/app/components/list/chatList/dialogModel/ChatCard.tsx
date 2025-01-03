import { chatStore } from "@/app/lib/chatStore";
import { db } from "@/app/lib/firebase.config";
import { userStore } from "@/app/lib/userStore";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";

export default function ChatCard() {
  const [chats, setChats] = useState([]);
  const { currentUser } = userStore();
  const { chatId, changeChat } = chatStore();

  useEffect(() => {
    const unSub = onSnapshot(
      doc(db, "userchats", currentUser.id),
      async (res) => {
        const items = res.data()?.chats || [];

        const promises = items.map(async (item) => {
          try {
            const userDocRef = doc(db, "users", item.receiverId);
            const userDocSnap = await getDoc(userDocRef);

            const user = userDocSnap.data();
            return { ...item, user };
          } catch (error) {
            console.error("Error fetching user document:", error);
            return null;
          }
        });

        const chatData = await Promise.all(promises);
        setChats(chatData.sort((a, b) => b.updatedAt - a.updatedAt));
      }
    );
    return () => {
      unSub();
    };
  }, [currentUser.id]);

  async function handleSelect(chat) {
    const userChats = chats.map((item) => {
      const { user, ...rest } = item;
      return rest;
    });

    const userChatsRef = doc(db, "userchats", currentUser.id);

    try {
      await updateDoc(userChatsRef, {
        chats: userChats,
      });
      changeChat(chat.chatId, chat.user);
    } catch (error) {
      console.log(error);
    }
  }

  return chats.map((chat) => (
    <div className="items" key={chat.chatId} onClick={() => handleSelect(chat)}>
      <img src="./avatar.jpg" alt="" />
      <div className="text">
        <span>{chat.user?.userName}</span>
        <p>{chat.lastMessage}</p>
      </div>
    </div>
  ));
}
