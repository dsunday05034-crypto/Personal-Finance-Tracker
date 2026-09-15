"use client"
import ExpenseCard from "@/components/ExpenseCard";
import EditTransactionModal from "@/components/EditTransactionModal";
import { useState, useEffect } from "react";
import Logout from "@/components/Logout";
import { supabase } from "@/lib/supabase";

const CURRENCIES = ["NGN", "USD", "EUR", "GBP", "CAD", "AUD", "JPY"];

export default function ExpenseTracker(props) {
    const [category, setCategory] = useState("");
    const [amount, setAmount] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [transactions, setTransactions] = useState([]);
    const [currency, setCurrency] = useState("NGN");
    const [exchangeRates, setExchangeRates] = useState({});
    const [isLoadingRates, setIsLoadingRates] = useState(true);
    const [editingTransaction, setEditingTransaction] = useState(null);
    const [submitMessage, setSubmitMessage] = useState("");

    useEffect(() => {
        async function fetchRates() {
            try {
                const res = await fetch(`/api/exchange-rate?base=${currency}`);
                const data = await res.json();
                if (data.rates) {
                    setExchangeRates(data.rates);
                }
            } catch (error) {
                console.error("Failed to fetch exchange rates:", error);
            } finally {
                setIsLoadingRates(false);
            }
        }
        fetchRates();
    }, [currency]);

    const rate = exchangeRates[currency] || 1;

    useEffect(() => {
        fetchTransaction();
    }, []);

    async function fetchTransaction() {
        const { data, error } = await supabase.from("transactions").select("*").is("deleted_at", null).order("created_at", { ascending: false });
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

    async function handleSaveTransaction(e) {
        e.preventDefault();
        
        if (!category.trim()) {
            setSubmitMessage("Please enter a category");
            return;
        }

        if (!amount || parseFloat(amount) <= 0) {
            setSubmitMessage("Please enter a valid amount");
            return;
        }

        setIsSubmitting(true);
        setSubmitMessage("");

        try {
            const { data: existing } = await supabase.from("categories").select("*").eq("user_id", props.session.user.id).eq("name", category.trim());
            if (existing.length === 0) {
                await supabase.from("categories").insert({
                    user_id: props.session.user.id,
                    name: category.trim(),
                });
            }

            const converted = parseFloat(amount) / rate;
            const { error } = await supabase.from("transactions").insert({
                category: category.trim(),
                amount: parseFloat(amount),
                user_id: props.session.user.id,
                currency: currency,
                exchange_rate: rate,
                converted_amount: converted,
                base_currency: "USD",
            });

            if (error) throw error;

            setCategory("");
            setAmount("");
            fetchTransaction();
            setSubmitMessage("Transaction saved successfully!");
            setTimeout(() => setSubmitMessage(""), 3000);
        } catch (error) {
            setSubmitMessage(error.message || "Failed to save transaction");
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleUpdateTransaction(updatedData) {
        const { id, category, amount, currency } = updatedData;
        const rate = exchangeRates[currency] || 1;
        const converted = amount / rate;

        const { error } = await supabase.from("transactions").update({
            category: category,
            amount: amount,
            currency: currency,
            exchange_rate: rate,
            converted_amount: converted,
            updated_at: new Date(),
        }).eq("id", id);

        if (error) throw error;
        
        fetchTransaction();
    }

    function formatCurrency(amount, currency) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
        }).format(amount);
    }

    return (
        <div className="p-6" style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Personal Finance Tracker</h1>
                <Logout />
            </div>

            {/* Add Transaction Form */}
            <div className="card mb-6">
                <h2 className="text-md font-semibold mb-4">Add New Transaction</h2>
                <form onSubmit={handleSaveTransaction} className="space-y-4">
                    <div className="flex gap-4" style={{ flexWrap: "wrap" }}>
                        <div style={{ flex: "2", minWidth: "200px" }}>
                            <label className="text-sm font-medium text-secondary mb-2 block">
                                Category
                            </label>
                            <input
                                type="text"
                                className="input-field"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                placeholder="e.g., Food, Transport, Rent"
                                disabled={isSubmitting}
                            />
                        </div>

                        <div style={{ flex: "1", minWidth: "150px" }}>
                            <label className="text-sm font-medium text-secondary mb-2 block">
                                Amount
                            </label>
                            <input
                                type="number"
                                className="input-field"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                step="0.01"
                                min="0"
                                disabled={isSubmitting}
                            />
                        </div>

                        <div style={{ flex: "1", minWidth: "120px" }}>
                            <label className="text-sm font-medium text-secondary mb-2 block">
                                Currency
                            </label>
                            <select 
                                className="input-field"
                                value={currency} 
                                onChange={(e) => setCurrency(e.target.value)}
                                disabled={isSubmitting}
                            >
                                {CURRENCIES.map((curr) => (
                                    <option key={curr} value={curr}>{curr}</option>
                                ))}
                            </select>
                        </div>

                        <div style={{ flex: "0 0 auto", alignSelf: "flex-end" }}>
                            <button 
                                type="submit" 
                                className="button-primary"
                                disabled={isSubmitting || isLoadingRates}
                                style={{ height: "100%" }}
                            >
                                {isSubmitting ? "Saving..." : isLoadingRates ? "Loading..." : "Add"}
                            </button>
                        </div>
                    </div>

                    {submitMessage && (
                        <div className={`status-badge ${submitMessage.includes("successfully") ? "status-success" : "status-danger"}`}>
                            {submitMessage}
                        </div>
                    )}
                </form>
            </div>

            {/* Transactions List */}
            <div className="card">
                <h2 className="text-md font-semibold mb-4">Recent Transactions</h2>
                {transactions.length === 0 ? (
                    <p className="text-muted text-sm">No transactions yet. Add your first one above!</p>
                ) : (
                    <div className="space-y-3">
                        {transactions.map((t) => (
                            <div 
                                key={t.id} 
                                className="flex justify-between items-center p-4" 
                                style={{ 
                                    background: "var(--surface-soft)", 
                                    borderRadius: "var(--radius-md)",
                                    border: "1px solid var(--border)"
                                }}
                            >
                                <div>
                                    <div className="text-base font-semibold">{t.category}</div>
                                    <div className="text-xs text-muted mt-1">
                                        {new Date(t.created_at).toLocaleDateString()} • {t.currency}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="text-right">
                                        <div className="text-md font-bold">{formatCurrency(t.amount, t.currency)}</div>
                                        {t.converted_amount > 0 && (
                                            <div className="text-xs text-muted">
                                                ≈ {formatCurrency(t.converted_amount, t.base_currency)}
                                            </div>
                                        )}
                                    </div>
                                    <button 
                                        className="button-secondary"
                                        onClick={() => setEditingTransaction(t)}
                                        style={{ padding: "6px 10px", fontSize: "var(--text-sm)" }}
                                    >
                                        Edit
                                    </button>
                                    <button 
                                        className="button-secondary"
                                        onClick={() => deleteTransaction(t.id)}
                                        style={{ 
                                            padding: "6px 10px", 
                                            fontSize: "var(--text-sm)",
                                            background: "var(--danger)",
                                            color: "white",
                                            border: "none"
                                        }}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {editingTransaction && (
                <EditTransactionModal
                    transaction={editingTransaction}
                    onClose={() => setEditingTransaction(null)}
                    onSave={handleUpdateTransaction}
                    currencies={CURRENCIES}
                />
            )}
        </div>
    );
}

