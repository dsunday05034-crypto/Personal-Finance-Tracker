"use client"
import ExpenseCard from "@/components/ExpenseCard";
import { useState, useEffect } from "react";
import Logout from "@/components/Logout";
import { supabase } from "@/lib/supabase";

export default function ExpenseTracker(props) {
    const [category, setCategory] = useState("");
    const [amount, setAmount] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [transactions, setTransactions] = useState([]);

    useEffect(() => {
        fetchTransaction();
    }, []);

    async function fetchTransaction() {
        const { data, error } = await supabase.from("transactions").select("*");
        if (error) {
            console.log(error);
        } else {
            setTransactions(data)
        }
    }

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
                fetchTransaction();
            }}>
                Save
            </button>

            {transactions.map((t) => (
                <ExpenseCard key={t.id} category={t.category} amount={t.amount} />
            ))}
            <Logout />
        </div>
    );
}

