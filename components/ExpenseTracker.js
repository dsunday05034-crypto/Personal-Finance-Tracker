"use client"
import ExpenseCard from "@/components/ExpenseCard";
import { useState } from "react";
import Logout from "@/components/Logout";
import { supabase } from "@/lib/supabase";

export default function ExpenseTracker(props) {
    const [category, setCategory] = useState("")
    const [amount, setAmount] = useState(0)
    const [isSubmitting, setIsSubmitting] = useState(false)

    return (
        <div>
            <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
            />

            <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
            />

            <button disabled={isSubmitting} onClick={async () => {
                setIsSubmitting(true)
                const { data, error } = await supabase.from("transactions").insert({
                    category: category,
                    amount: amount,
                    user_id: props.session.user.id,
                });
                setIsSubmitting(false)
            }}>
                Save
            </button>

            <ExpenseCard category={category} amount={amount} />
            <Logout />
        </div>
    );
}

