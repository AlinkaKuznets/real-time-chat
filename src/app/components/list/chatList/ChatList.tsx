"use client";
import React, { useEffect, useState } from "react";
import "./chatList.css";
import { FaSearch } from "react-icons/fa";
import { FaUserGroup } from "react-icons/fa6";
import { IoAddCircleOutline } from "react-icons/io5";
import { collection, doc, getDoc, getDocs, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "@/app/lib/firebase.config";
import { userStore } from "@/app/lib/userStore";
import { chatStore } from "../../../lib/chatStore";
import AddUser from "./AddUser";
import CreateGroup from "./CreateGroup";
import { groupStore } from "@/app/lib/groupStore";

export default function ChatList() {
  const [addMode, setAddMode] = useState(false);
  const [chats, setChats] = useState([]);
  const [groupMode, setGroupMode] = useState(false);
  const [groups, setGroups] = useState([]);

  const { currentUser } = userStore();
  if (!currentUser || !currentUser.id) {
    console.error("Current user is not defined.");
  }
  const { chatId, changeChat } = chatStore();
  const { groupId } = groupStore();

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

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const groupsSnapshot = await getDocs(collection(db, "groups"));
        const groupsData = groupsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setGroups(groupsData);
      } catch (error) {
        console.error("Error fetching groups:", error);
      }
    };

    fetchGroups();
  }, []);

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
        <FaUserGroup
          className="w-8 h-8 cursor-pointer"
          onClick={() => {
            setGroupMode((prev) => !prev);
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
       {groups.map((group) => (
        <div
          className="items"
          key={group.id}
          onClick={() => handleSelect({ chatId: group.id, isGroup: true })}
        >
          <img src="./avatar.jpg" alt="" />
          <div className="text">
            <span>{group.name}</span>
            <p>{group.lastMessage}</p>
          </div>
        </div>
      ))}

      {addMode && <AddUser />}
      {groupMode && <CreateGroup />}
    </div>
  );
}
