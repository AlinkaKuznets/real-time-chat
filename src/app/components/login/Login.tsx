"use client";
import React, { useState } from "react";
import "./login.css";
import { FormControl, TextField } from "@mui/material";
import "react-toastify/ReactToastify.css";
import { toast } from "react-toastify";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../../lib/firebase.config";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../lib/firebase.config";

export default function Login() {
  const [loading, setLoading] = useState(false);

  async function handleRegister(e) {
    setLoading(true);
    e.preventDefault();

    const formData = new FormData(e.target);
    const { userName, email, password } = Object.fromEntries(formData);

    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);

      await setDoc(doc(db, "users", res.user.uid), {
        userName,
        email,
        id: res.user.uid,
        blocked: [],
      });

      await setDoc(doc(db, "userchats", res.user.uid), {
        chats: [],
      });

      toast.success("Account created! You can login now!");
    } catch (err) {
      console.log(err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);
    const { email, password } = Object.fromEntries(formData);

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login">
      <div className="item">
        <h2>Welcome back!</h2>
        <form onSubmit={handleLogin}>
          <FormControl className="">
            <TextField
              name="email"
              required
              id="outlined-required"
              label="Email"
            />
            <TextField
              name="password"
              required
              id="outlined-required"
              label="Password"
            />
            <button disabled={loading}>
              {loading ? "Loading" : "Sign In"}
            </button>
          </FormControl>
        </form>
      </div>
      <div className="separator"></div>
      <div className="item">
        <h2>Create an Account</h2>
        <form onSubmit={handleRegister}>
          <FormControl className="flex-col items-center">
            <TextField
              required
              name="userName"
              id="outlined"
              label="User Name"
            />
            <TextField required name="email" id="outlined" label="Email" />
            <TextField
              required
              name="password"
              id="outlined"
              label="Password"
            />
            <button type="submit" disabled={loading}>
              {loading ? "Loading" : "Sign Up"}
            </button>
          </FormControl>
        </form>
      </div>
    </div>
  );
}
