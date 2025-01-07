"use client";
import React, { useEffect, useRef, useState } from "react";
import "./chat.css";
import { MdEmojiEmotions } from "react-icons/md";
import EmojiPicker from "emoji-picker-react";
import {
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/app/lib/firebase.config";
import { chatStore } from "@/app/lib/chatStore";
import { userStore } from "@/app/lib/userStore";
import { groupChatStore } from "@/app/lib/groupChatStore";

export default function Chat() {
  const [openEmoji, setOpenEmoji] = useState(false);
  const [text, setText] = useState("");
  const [chat, setChat] = useState("");
  const [group, setGroup] = useState("");
  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked } = chatStore();
  const { currentUser } = userStore();
  const { groupChatId } = groupChatStore();

  const isBlocked = isCurrentUserBlocked || isReceiverBlocked;

  useEffect(() => {
    if (isCurrentUserBlocked) {
      console.log("Текущий пользователь заблокирован");
    }
  }, [isCurrentUserBlocked]);

  const endRef = useRef(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, group]);

  useEffect(() => {
    if (chatId) {
      const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
        setChat(res.data());
        setGroup("");
      });
      return () => unSub();
    }
  }, [chatId]);

  useEffect(() => {
    if (groupChatId) {
      const unSub = onSnapshot(doc(db, "groupChats", groupChatId), (res) => {
        setGroup(res.data());
        setChat("");
      });
      return () => unSub();
    }
  }, [groupChatId]);

  const handleSend = async () => {
    if (text.trim() === "") return;

    try {
      let chatRef;
      if (groupChatId) {
        chatRef = doc(db, "groupChats", groupChatId);
      } else if (chatId) {
        chatRef = doc(db, "chats", chatId);
      } else {
        console.log("No chat or group chat ID found");
        return;
      }

      await updateDoc(chatRef, {
        messages: arrayUnion({
          senderId: currentUser.id,
          text,
          createdAt: new Date(),
        }),
      });

      await updateDoc(chatRef, {
        lastMessage: {
          text,
          senderId: currentUser.id,
        },
      });

      const userIDs = [currentUser.id];
      if (user) userIDs.push(user.id);

      await Promise.all(
        userIDs.map(async (id) => {
          const userChatsRef = doc(db, "userchats", id);
          const userChatsSnapshot = await getDoc(userChatsRef);

          if (userChatsSnapshot.exists()) {
            const userChatsData = userChatsSnapshot.data();

            if (groupChatId) {
              if (Array.isArray(userChatsData.groups)) {
                const groupIndex = userChatsData.groups.findIndex(
                  (c) => c.groupChatId === groupChatId
                );

                if (groupIndex !== -1) {
                  userChatsData.groups[groupIndex].lastMessage = text;
                  userChatsData.groups[groupIndex].isSeen =
                    id === currentUser.id;
                  userChatsData.groups[groupIndex].updatedAt = Date.now();
                  await updateDoc(userChatsRef, {
                    groups: userChatsData.groups,
                  });
                }
              }
            } else if (chatId) {
              if (Array.isArray(userChatsData.chats)) {
                const chatIndex = userChatsData.chats.findIndex(
                  (c) => c.chatId === chatId
                );

                if (chatIndex !== -1) {
                  userChatsData.chats[chatIndex].lastMessage = text;
                  userChatsData.chats[chatIndex].isSeen = id === currentUser.id;
                  userChatsData.chats[chatIndex].updatedAt = Date.now();
                  await updateDoc(userChatsRef, {
                    chats: userChatsData.chats,
                  });
                }
              }
            }
          }
        })
      );

      setText("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleEmoji = (emoji) => {
    setText((prev) => prev + emoji.emoji);
    setOpenEmoji(false);
  };

  const formatTimestamp = (timestamp) => {
    const options = { hour: "2-digit", minute: "2-digit", hour12: false };
    return timestamp.toLocaleTimeString([], options);
  };

  return (
    <div className="chat">
      <div className="top">
        <div className="user">
          <img src="./avatar.jpg" alt="" />
          <div className="user-information">
            <span>{group ? group.name : user.userName}</span>
            <p>Lorem ipsum dolor sit amet</p>
          </div>
        </div>
      </div>
      <div className="center">
        {(chat?.messages || []).concat(group?.messages || []).map((message) => (
          <div
            className={
              message.senderId === currentUser.id ? "message own" : "message"
            }
            key={message?.createdAt}
          >
            <div className="texts">
              <p>{message.text}</p>
              <span>{formatTimestamp(message.createdAt.toDate())}</span>
            </div>
          </div>
        ))}
        <div ref={endRef}></div>
      </div>
      <div className="bottom">
        <input
          type="text"
          placeholder="Type a message..."
          value={text}
          disabled={isBlocked}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="emoji">
          <MdEmojiEmotions
            className="w-7 h-7"
            onClick={() => setOpenEmoji((prev) => !prev)}
          />
          <div className="picker">
            <EmojiPicker open={openEmoji} onEmojiClick={handleEmoji} />
          </div>
        </div>
        <button
          className="send-button"
          onClick={handleSend}
          disabled={isBlocked}
        >
          Send
        </button>
      </div>
    </div>
  );
}
