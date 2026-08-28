"use client"
import ExpenseTracker from "@/components/ExpenseTracker";
import SignUp from "@/components/SignUp";
import Login from "@/components/Login";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
export default function Home() {
  const [session, setSession] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  console.log("current session:", session)

  return (
    <div>
      <ExpenseTracker />
      <SignUp />
      <Login />
    </div>
  );
}