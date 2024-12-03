"use client";
import React from "react";
import "./details.css";
import { FaArrowUp } from "react-icons/fa6";
import { auth } from "../../lib/firebase.config";

export default function Details() {
  return (
    <div className="details">
      <div className="user">
        <img src="./avatar.jpg" />
        <h2>Kek Lol</h2>
        <p>Lorem, ipsum dolor sit amet consectetur</p>
      </div>
      <div className="info">
        <div className="option">
          <div className="title">
            <span>Chat Setting</span>
            <FaArrowUp className="flex w-7 h-7 items-end bg-[#4c22a770] p-1 rounded-full ml-36 cursor-pointer" />
          </div>
        </div>
        <button>Block User</button>
        <button
          className="logout"
          onClick={() => {
            auth.signOut();
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}
