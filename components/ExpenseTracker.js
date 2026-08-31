"use client"
import ExpenseCard from "@/components/ExpenseCard";
import { useState } from "react";
import Logout from "@/components/Logout";

export default function ExpenseTracker(props) {
    const [category, setCategory] = useState("")
    const [amount, setAmount] = useState(0)

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
            <Logout />
        </div>
    );
}

