"use client"
import ExpenseCard from "@/components/ExpenseCard";
import { supabase } from "@/lib/supabase";
import { useState } from "react";
import { useEffect } from "react";

export default function ExpenseTracker(props) {
    const [category, setCategory] = useState("")
    const [amount, setAmount] = useState(0)

    useEffect(() => {
        testFetch();
    }, []);

    async function testFetch() {
        const { data, error } = await supabase.from("transactions").select("*");
        console.log("data:", data)
        console.log("error:", error)
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

            <button onClick={() => console.log(category, amount)}>
                Display
            </button>

            <ExpenseCard category={category} amount={amount} />
        </div>
    );
}

