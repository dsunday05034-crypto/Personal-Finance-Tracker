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
    const [currency, setCurrency] = useState("NGN");

    const [rates, setRates] = useState({});
    const rate = rates[currency];

    useEffect(() => {
        fetch("/api/exchange-rate")
        .then((res) => res.json())
        .then((data) => setRates(data));
    }, []);

    useEffect(() => {
        fetchTransaction();
    }, []);

    async function fetchTransaction() {
        const { data, error } = await supabase.from("transactions").select("*").is("deleted_at", null);
        if (error) {
            console.log(error);
        } else {
            setTransactions(data)
        }
    }

    async function deleteTransaction(id) {
        const { error } = await supabase.from("transactions").update({ deleted_at: new Date() }).eq("id", id);
        if (!error) fetchTransaction();
    }

    async function updateTransaction(id, newAmount, newCurrency) {
        const rate = rates[newCurrency];
        const converted = newAmount / rate;

        const { error } = await supabase.from("transactions").update({
            amount: newAmount,
            currency: newCurrency,
            exchange_rate: rate,
            converted_amount: converted,
            updated_at: new Date(),
        }).eq("id", id);

        if (!error) fetchTransaction();
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

            <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                <option value="NGN">NGN</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
            </select>

            <button disabled={isSubmitting} onClick={async () => {
                setIsSubmitting(true)
                const { data: existing } = await supabase.from("categories").select("*").eq("user_id", props.session.user.id).eq("name", category);
                if (existing.length === 0) {
                    await supabase.from("categories").insert({
                        user_id: props.session.user.id,
                        name: category,
                    });
                }

                const converted = amount / rate;
                const { data, error } = await supabase.from("transactions").insert({
                    category: category,
                    amount: amount,
                    user_id: props.session.user.id,
                    currency: currency,
                    exchange_rate: rate,
                    converted_amount: converted,
                    base_currency: "USD",
                });
                setIsSubmitting(false)
                fetchTransaction();
            }}>
                Save
            </button>

            {transactions.map((t) => (
                <div key={t.id}>
                    <ExpenseCard
                        category={t.category}
                        amount={t.amount}
                    />
                    <button onClick={() => deleteTransaction(t.id)}>
                        Delete
                    </button>
                    <button onClick={() => updateTransaction(t.id, 999, "USD")}>
                        Test update
                    </button>
                </div>
            ))}
            <Logout />
        </div>
    );
}

