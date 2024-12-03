"use client";

import React from "react";
import { auth } from "../../lib/firebase.config";

const LogoutButton = () => {
  return (
    <button
      className="logout"
      onClick={() => {
        auth.signOut();
      }}
    >
      Logout
    </button>
  );
};

export default LogoutButton;
