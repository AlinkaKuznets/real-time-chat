import React, { useEffect, useState } from "react";
import "./details.css";
import { FaArrowUp } from "react-icons/fa6";
import { auth, db } from "../../lib/firebase.config";
import { useStore } from "zustand";
import { chatStore } from "@/app/lib/chatStore";
import { userStore } from "@/app/lib/userStore";
import {
  doc,
  onSnapshot,
  updateDoc,
  arrayRemove,
  arrayUnion,
} from "firebase/firestore";
import { getUserById } from "@/app/lib/getElementById";
import { groupChatStore } from "@/app/lib/groupChatStore";

export default function Details() {
  const user = useStore(chatStore, (state) => state.user);
  const { members, groupId } = groupChatStore();
  const { currentUser } = useStore(userStore);
  const { changeBlock, changeChat } = useStore(chatStore);
  const [usernames, setUsernames] = useState({});
  const [isReceiverBlocked, setIsReceiverBlocked] = useState(false);

  useEffect(() => {
    const fetchUsernames = async () => {
      if (members.length > 0) {
        const fetchedUsernames = await Promise.all(
          members.map(async (memberId) => {
            const userData = await getUserById(memberId);
            return { id: memberId, userName: userData?.userName || "Unknown" };
          })
        );
        setUsernames(
          Object.fromEntries(
            fetchedUsernames.map(({ id, userName }) => [id, userName])
          )
        );
      }
    };
    fetchUsernames();
  }, [members]);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "users", currentUser.id), (doc) => {
      const data = doc.data();
      if (data) {
        const blockedUsers = data.blocked || [];
        const blocked = blockedUsers.includes(user.id);
        setIsReceiverBlocked(blocked);
        changeBlock(blocked);
        chatStore.setState({ isCurrentUserBlocked: blocked });
      }
    });

    return () => unsubscribe();
  }, [currentUser.id, user.id]);

  async function handleBlock() {
    const userDocRef = doc(db, "users", currentUser.id);
    try {
      await updateDoc(userDocRef, {
        blocked: isReceiverBlocked ? arrayRemove(user.id) : arrayUnion(user.id),
      });
      setIsReceiverBlocked(!isReceiverBlocked);
      changeChat(!isReceiverBlocked);
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="details">
      {members.length === 0 ? (
        <div className="user">
          <img src="./avatar.jpg" alt="User Avatar" />
          <h2>{user?.userName}</h2>
          <p>Lorem, ipsum dolor sit amet consectetur</p>
          <button onClick={handleBlock}>
            {isReceiverBlocked ? "User Blocked" : "Block User"}
          </button>
        </div>
      ) : (
        <div className="groupUser">
          <h1>Members:</h1>
          {members.map((memberId) => (
            <div className="list-members" key={memberId}>
              <img src="./avatar.jpg" alt="User Avatar" />
              <div className="user-info">
                <h2>{usernames[memberId]}</h2>
                <p>Lorem, ipsum dolor sit amet</p>
              </div>
              <button>Block User</button>
            </div>
          ))}
        </div>
      )}
      <div className="info">
        <div className="option">
          <div className="title">
            <span>Chat Setting</span>
            <FaArrowUp className="flex w-7 h-7 items-end bg-[#4c22a770] p-1 rounded-full ml-36 cursor-pointer" />
          </div>
        </div>
        <button className="logout" onClick={() => auth.signOut()}>
          Logout
        </button>
      </div>
    </div>
  );
}
