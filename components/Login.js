"use client"
import { supabase } from "@/lib/supabase"
import { useState } from "react"

export default function Login() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    return (
        <div>
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />

            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />

            <button disabled={isSubmitting} onClick={async () => {
                setIsSubmitting(true)
                const { data, error } = await supabase.auth.signInWithPassword({
                    email: email,
                    password: password
                });
                if (!error) {
                    const { data: existingProfile } = await supabase
                        .from("profiles")
                        .select("id")
                        .eq("id", data.user.id)
                        .single()
                    if (!existingProfile) {
                        await supabase.from("profiles").insert({});
                    }
                }
                setIsSubmitting(false)
            }}>
                SignIn
            </button>
        </div >
    );
}