import React, { useState } from "react";
import { IoIosCheckmarkCircle } from "react-icons/io";
import "./createGroup.css";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/app/lib/firebase.config";
import {groupStore} from '@/app/lib/groupStore'

export default function CreateGroup() {
  const [user, setUser] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupName, setGroupName] = useState("");

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

  const handleAddUser = (user) => {
    if (!selectedUsers.some((u) => u.id === user.id)) {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const handleRemoveUser = (userId) => {
    setSelectedUsers(selectedUsers.filter((user) => user.id !== userId));
  };

  const handleCreateGroup = async () => {
    await groupStore.getState().createGroup(groupName, selectedUsers);
    setGroupName("");
    setSelectedUsers([]);
    setUser(null);

  };

  return (
    <div className="create-group">
      <form onClick={handleSearch}>
        <input type="text" placeholder="UserName" name="userName"></input>
        <button type="submit">Search</button>
      </form>
      {user && (
        <div>
          <div className="users">
            <img src="./avatar.jpg" alt="Avatar" />
            <span>{user.userName}</span>
            <button onClick={() => handleAddUser(user)}>Add</button>
          </div>
          <div className="selected-users">
            <h3>Selected Users:</h3>
            {selectedUsers.map((user) => (
              <div key={user.id} className="detail">
                <img src="./avatar.jpg" alt="Avatar" />
                <span>{user.userName}</span>
                <button onClick={() => handleRemoveUser(user.id)}>
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="groups-input">
        <input
          type="text"
          placeholder="Group Name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
        />
        <button onClick={handleCreateGroup}>Create Group</button>
      </div>
    </div>
  );
}
