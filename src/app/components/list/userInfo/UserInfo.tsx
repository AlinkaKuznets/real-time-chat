import React from "react";
import Avatar from "../../../../../public/avatar.jpg";
import { IoIosMore } from "react-icons/io";
import { FaPencilAlt } from "react-icons/fa";
import "./userInfo.css";
import { userStore } from "@/app/lib/userStore";

export default function UserInfo() {
  const { currentUser } = userStore();
  return (
    <div className="userInfo">
      <div className="user-name">
        <img src={Avatar.src} alt="" />
        <h2>{currentUser.userName}</h2>
      </div>
      <div className="user-icons">
        <IoIosMore />
        <FaPencilAlt />
      </div>
    </div>
  );
}
