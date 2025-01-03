import { create } from "zustand";

export const groupChatStore = create((set) => ({
  groupChatId: null,
  members: [],
  name: null,
  changeGroupChat: (groupChatId, members) => {
    return set({
      groupChatId,
      members,
      name,
    });
  },
}));
