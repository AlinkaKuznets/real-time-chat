"use client";
import React, { useEffect, useState } from "react";
import "./chatList.css";
import { FaSearch } from "react-icons/fa";
import { IoAddCircleOutline } from "react-icons/io5";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "@/app/lib/firebase.config";
import { userStore } from "@/app/lib/userStore";
import { chatStore } from "../../../lib/chatStore";
import AddUser from "./AddUser";

export default function ChatList() {
  const [addMode, setAddMode] = useState(false);
  const [chats, setChats] = useState([]);

  const { currentUser } = userStore();
  const { chatId, changeChat } = chatStore();

  useEffect(() => {
    const unSub = onSnapshot(
      doc(db, "userchats", currentUser.id),
      async (res) => {
        const items = res.data().chats;

        const promisses = items.map(async (item) => {
          const userDocRef = doc(db, "users", item.receiverId);
          const userDocSnap = await getDoc(userDocRef);

          const user = userDocSnap.data();

          return { ...item, user };
        });

        const chatData = await Promise.all(promisses);
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

    const chatIndex = userChats.findIndex(
      (item) => item.chatId === chat.chatId
    );

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
  return (
    <div className="chat-list">
      <div className="search">
        <div className="search-bar">
          <FaSearch className="w-8 h-6" />
          <input type="text" placeholder="Search" />
        </div>
        <IoAddCircleOutline
          className="w-8 h-8 cursor-pointer"
          onClick={() => {
            setAddMode((prev) => !prev);
          }}
        />
      </div>
      {chats.map((chat) => (
        <div
          className="items"
          key={chat.chatId}
          onClick={() => handleSelect(chat)}
        >
          <img src="./avatar.jpg" alt="" />
          <div className="text">
            <span>{chat.user?.userName}</span>
            <p>{chat.lastMessage}</p>
          </div>
        </div>
      ))}
      {addMode && <AddUser />}
    </div>
  );
}
