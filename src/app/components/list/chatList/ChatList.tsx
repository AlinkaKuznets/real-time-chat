"use client";
import React, { useEffect, useState } from "react";
import "./chatList.css";
import { FaSearch } from "react-icons/fa";
import { FaUserGroup } from "react-icons/fa6";
import { IoAddCircleOutline } from "react-icons/io5";
import { userStore } from "@/app/lib/userStore";
import AddUser from "./AddUser";
import CreateGroup from "./CreateGroup";
import ChatCard from "./dialogModel/chatCard";
import GroupCard from "./dialogModel/groupCard";
import { groupChatStore } from "@/app/lib/groupChatStore";

export default function ChatList() {
  const [addMode, setAddMode] = useState(false);
  const [groupMode, setGroupMode] = useState(false);

  const { currentUser } = userStore();
  const { groupChatId } = groupChatStore();

  return (
    <div className="chat-list" key={currentUser.id}>
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
      <ChatCard key={currentUser.id} />
      <GroupCard/>
      {addMode && <AddUser />}
      {groupMode && <CreateGroup />}
    </div>
  );
}
