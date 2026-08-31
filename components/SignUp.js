"use client"
import { supabase } from "@/lib/supabase"
import { useState } from "react"

export default function SignUp() {
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
            
            {/* disable the button when signup request is currently in progress, waiting for supabase to respond
            so users don't end up wth an error while trying to create account, or duplicate account */}
            <button disabled={isSubmitting} onClick={async () => {
                setIsSubmitting(true)
                const { data, error } = await supabase.auth.signUp({
                    email: email,
                    password: password,
                });
                setIsSubmitting(false)
            }}>
                SignUp
            </button>
        </div>
    );
}