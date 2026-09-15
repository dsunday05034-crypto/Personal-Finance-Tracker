"use client";

import { useState } from "react";

export default function EditTransactionModal({ transaction, onClose, onSave, currencies }) {
  const [category, setCategory] = useState(transaction.category || "");
  const [amount, setAmount] = useState(transaction.amount || "");
  const [currency, setCurrency] = useState(transaction.currency || "NGN");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!category.trim()) {
      setError("Category is required");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError("Amount must be greater than 0");
      return;
    }

    setIsSubmitting(true);

    try {
      await onSave({
        id: transaction.id,
        category: category.trim(),
        amount: parseFloat(amount),
        currency,
      });
      onClose();
    } catch (err) {
      setError(err.message || "Failed to update transaction");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Edit Transaction</h2>
          <button
            type="button"
            className="button-secondary"
            onClick={onClose}
            style={{ padding: "6px 10px", fontSize: "var(--text-sm)" }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-secondary mb-2 block">
              Category
            </label>
            <input
              type="text"
              className="input-field"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g., Food, Transport"
              disabled={isSubmitting}
            />
          </div>

          <div>
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

          <div>
            <label className="text-sm font-medium text-secondary mb-2 block">
              Currency
            </label>
            <select
              className="input-field"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              disabled={isSubmitting}
            >
              {currencies.map((curr) => (
                <option key={curr} value={curr}>
                  {curr}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="status-badge status-danger">
              {error}
            </div>
          )}

          <div className="flex gap-3 mt-4">
            <button
              type="button"
              className="button-secondary"
              onClick={onClose}
              disabled={isSubmitting}
              style={{ flex: 1 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="button-primary"
              disabled={isSubmitting}
              style={{ flex: 1 }}
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>

        <style jsx>{`
          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(14, 24, 15, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            padding: var(--space-4);
          }

          .modal-content {
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: var(--radius-xl);
            padding: var(--space-6);
            width: 100%;
            max-width: 420px;
            box-shadow: 0 8px 24px rgba(14, 24, 15, 0.15);
          }
        `}</style>
      </div>
    </div>
  );
}
