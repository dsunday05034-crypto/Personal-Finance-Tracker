"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function Dashboard({ session }) {
  const [loading, setLoading] = useState(true);
  const [totalBalance, setTotalBalance] = useState(0);
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);

  useEffect(() => {
    if (session) {
      fetchDashboardData();
    }
  }, [session]);

  async function fetchDashboardData() {
    try {
      setLoading(true);

      // Fetch all non-deleted transactions for this user
      const { data: transactions, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", session.user.id)
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      if (!transactions || transactions.length === 0) {
        setTotalBalance(0);
        setCategoryBreakdown([]);
        setRecentTransactions([]);
        setLoading(false);
        return;
      }

      // Calculate total balance (sum of all converted_amounts)
      const total = transactions.reduce((sum, t) => sum + (parseFloat(t.converted_amount) || 0), 0);
      setTotalBalance(total);

      // Calculate category breakdown
      const categoryMap = {};
      transactions.forEach(t => {
        const category = t.category || "Uncategorized";
        const amount = parseFloat(t.converted_amount) || 0;
        if (!categoryMap[category]) {
          categoryMap[category] = 0;
        }
        categoryMap[category] += amount;
      });

      const breakdown = Object.entries(categoryMap)
        .map(([name, amount]) => ({ name, amount }))
        .sort((a, b) => b.amount - a.amount);

      setCategoryBreakdown(breakdown);

      // Get recent transactions (last 5)
      setRecentTransactions(transactions.slice(0, 5));

    } catch (error) {
      console.error("Error fetching dashboard data:", error.message);
    } finally {
      setLoading(false);
    }
  }

  function formatCurrency(amount, currency = "USD") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  }

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-skeleton">
          <div className="skeleton-card skeleton-total"></div>
          <div className="skeleton-grid">
            <div className="skeleton-card skeleton-categories"></div>
            <div className="skeleton-card skeleton-recent"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Dashboard</h1>
        <p className="dashboard-subtitle">Overview of your finances</p>
      </div>

      {/* Total Balance Card */}
      <div className="card card-primary total-balance-card">
        <div className="card-header">
          <span className="card-label">Total Balance</span>
        </div>
        <div className="card-content">
          <div className="total-amount">{formatCurrency(totalBalance)}</div>
          <div className="total-subtext">Across all currencies</div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="card category-breakdown-card">
        <div className="card-header">
          <h2 className="card-title">Spending by Category</h2>
        </div>
        <div className="card-content">
          {categoryBreakdown.length > 0 ? (
            <div className="category-list">
              {categoryBreakdown.map((category, index) => {
                const percentage = totalBalance > 0 
                  ? ((category.amount / Math.abs(totalBalance)) * 100).toFixed(1) 
                  : 0;
                
                return (
                  <div key={index} className="category-item">
                    <div className="category-info">
                      <span className="category-name">{category.name}</span>
                      <span className="category-amount">{formatCurrency(category.amount)}</span>
                    </div>
                    <div className="category-bar-container">
                      <div 
                        className="category-bar" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="category-percentage">{percentage}%</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              <p>No transactions yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card recent-transactions-card">
        <div className="card-header">
          <h2 className="card-title">Recent Transactions</h2>
        </div>
        <div className="card-content">
          {recentTransactions.length > 0 ? (
            <div className="transactions-list">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="transaction-item">
                  <div className="transaction-icon">
                    <span className="icon-placeholder">💳</span>
                  </div>
                  <div className="transaction-details">
                    <div className="transaction-category">{transaction.category}</div>
                    <div className="transaction-meta">
                      <span className="transaction-date">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </span>
                      {transaction.currency !== "USD" && (
                        <span className="transaction-currency">
                          {transaction.amount} {transaction.currency}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="transaction-amount">
                    {formatCurrency(parseFloat(transaction.converted_amount))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No transactions yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
