import React, { useState } from "react";
import "./addUser.css";
import {
  arrayUnion,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/app/lib/firebase.config";
import { userStore } from "@/app/lib/userStore";

export default function AddUser() {
  const [user, setUser] = useState(null);
  const { currentUser } = userStore();

  async function handleSearch(e) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const userName = formData.get("userName");

    try {
      const userRef = collection(db, "users");
      const q = query(userRef, where("userName", "==", userName));
      const querySnapShot = await getDocs(q);

      if (!querySnapShot.empty) {
        setUser(querySnapShot.docs[0].data());
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function handleAdd() {
    const chatRef = collection(db, "chats");
    const userChatsRef = collection(db, "userchats");

    try {
      const newChatRef = doc(chatRef);
      await setDoc(newChatRef, {
        createdAt: serverTimestamp(),
        messages: [],
      });

      await updateDoc(doc(userChatsRef, user.id), {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          receiverId: currentUser.id,
          updatedAt: Date.now(),
        }),
      });

      await updateDoc(doc(userChatsRef, currentUser.id), {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          receiverId: user.id,
          updatedAt: Date.now(),
        }),
      });

      console.log(newChatRef);
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="add-user">
      <form onSubmit={handleSearch}>
        <input type="text" placeholder="UserName" name="userName"></input>
        <button type="submit">Search</button>
      </form>
      {user && (
        <div className="user">
          <div className="detail">
            <img src="./avatar.jpg" />
            <span>{user.userName}</span>
            <button onClick={handleAdd}>Add User</button>
          </div>
        </div>
      )}
    </div>
  );
}
