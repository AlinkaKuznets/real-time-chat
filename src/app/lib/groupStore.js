import { create } from "zustand";
import { userStore } from "./userStore";
import { addDoc, collection } from "firebase/firestore";
import { db } from "./firebase.config";

export const groupStore = create((set) => ({
  groupId: null,
  members: [],
  createdAt: new Date(),
  blockedMembers: [],

  createGroup: async (groupName, selectedUsers) => {
    const currentUser = userStore.getState().currentUser;

    try {
      const addedUsers = selectedUsers.map((user) => user.id);
      const newGroupRef = await addDoc(collection(db, "groups"), {
        name: groupName,
        members: [...addedUsers, currentUser.id],
        createdAt: new Date(),
      });
      set({ groupId: newGroupRef.id });
    } catch (error) {
      console.error(error);
    }
  },

  changeGroup: (groupId, members) => {
    set({
      groupId,
      members,
      createdAt: new Date(),
      blockedMembers: [],
    });
  },

  blockMember: (memberId) => {
    set((state) => ({
      blockedMembers: [...state.blockedMembers, memberId],
    }));
  },

  unblockMember: (memberId) => {
    set((state) => ({
      blockedMembers: state.blockedMembers.filter((id) => id !== memberId),
    }));
  },
}));
