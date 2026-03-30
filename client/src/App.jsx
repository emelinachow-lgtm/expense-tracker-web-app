import { useState, useEffect } from "react";
import ExpenseForm from "./components/ExpenseForm";
import ExpenseTable from "./components/ExpenseTable";
import Charts from "./components/Charts";

export const CATEGORY_CONFIG = {
  Groceries:      { bg: "#ced78d", text: "#3a4a1a" },
  "Food/Drinks":  { bg: "#edacb1", text: "#6b2030" },
  Transportation: { bg: "#5c8180", text: "#ffffff" },
  Car:            { bg: "#193551", text: "#ffffff" },
  Entertainment:  { bg: "#e7cfe8", text: "#5a3d5c" },
  Bills:          { bg: "#b5cfe8", text: "#1a3a5c" },
  Health:         { bg: "#f3d5d8", text: "#6b2030" },
  Other:          { bg: "#d4e8d4", text: "#2a4a2a" },
};

export function getCategoryStyle(category) {
  return CATEGORY_CONFIG[category] || { bg: "#e7cfe8", text: "#5a3d5c" };
}

function StatCard({ title, value, subtitle, icon, accent, inverted }) {
  return (
    <div style={{
      background: inverted ? accent : "#ffffff",
      borderRadius: 20,
      padding: "28px 28px",
      boxShadow: "var(--shadow)",
      display: "flex",
      flexDirection: "column",
      justifyContent: "flex-start",
      gap: 8,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <p style={{ fontSize: 13, fontWeight: 500, color: inverted ? "rgba(25,53,81,0.6)" : "var(--muted)" }}>
          {title}
        </p>
        <div style={{ color: inverted ? "rgba(25,53,81,0.82)" : accent }}>
          {icon}
        </div>
      </div>
      <p style={{ fontFamily: "Sora, sans-serif", fontSize: 28, fontWeight: 700, color: inverted ? "rgba(25,53,81,0.82)" : "var(--navy)", marginBottom: 6 }}>
        {value}
      </p>
      <p style={{ fontSize: 13, color: inverted ? "rgba(25,53,81,0.5)" : "var(--muted)" }}>
        {subtitle}
      </p>
    </div>
  );
}

export default function App() {
  const [expenses,       setExpenses]       = useState([]);
  const [categoryData,   setCategoryData]   = useState([]);
  const [monthlyData,    setMonthlyData]    = useState([]);
  const [editingExpense, setEditingExpense] = useState(null);
  const [showModal,      setShowModal]      = useState(false);
  const [filterMonth,    setFilterMonth]    = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [highlightCat,   setHighlightCat]   = useState(null);
  const [chartMonth,     setChartMonth]     = useState("");
  const [confirmId,      setConfirmId]      = useState(null);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(false); 

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Fetch all expense data from the API and update state 
  const fetchData = () => {
    setLoading(true);
    setApiError(false);
    Promise.all([
      fetch("http://localhost:3001/api/expenses").then(r => r.json()),
      fetch("http://localhost:3001/api/expenses/by-category").then(r => r.json()),
      fetch("http://localhost:3001/api/expenses/by-month").then(r => r.json()),
    ]).then(([expenses, categoryData, monthlyData]) => {
      setExpenses(expenses);
      setCategoryData(categoryData);
      setMonthlyData(monthlyData);
      setLoading(false);
    }).catch(() => {
      setApiError(true);
      setLoading(false);
    });
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = (form) => {
    const method = editingExpense ? "PUT" : "POST";
    const url = editingExpense
      ? `http://localhost:3001/api/expenses/${editingExpense.id}`
      : "http://localhost:3001/api/expenses";
    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    }).then(() => {
      fetchData();
      setEditingExpense(null);
      setShowModal(false);
      showToast(editingExpense ? "Expense updated!" : "Expense added!");
    });
  };

  const handleDelete = (id) => setConfirmId(id);

  const confirmDelete = () => {
    fetch(`http://localhost:3001/api/expenses/${confirmId}`, { method: "DELETE" })
      .then(() => { fetchData(); showToast("Expense deleted!"); });
    setConfirmId(null);
  };

  const handleEdit   = (expense) => { setEditingExpense(expense); setShowModal(true); };
  const handleCancel = () => { setEditingExpense(null); setShowModal(false); };

  const totalAmount = expenses.reduce((s, e) => s + parseFloat(e.amount || 0), 0);

  // Find the category with the highest total amount
  const topCategory = categoryData.length
    ? categoryData.reduce((mx, c) => parseFloat(c.total) > parseFloat(mx.total) ? c : mx)
    : null;

  const uniqueMonths     = [...new Set(expenses.map(e => e.date?.slice(0, 7)))].sort().reverse();
  const uniqueCategories = [...new Set(expenses.map(e => e.category))];

  // Filter expense based on selected months, category or chart highlight
  const filteredExpenses = expenses.filter(e => {
    const okMonth = filterMonth    ? e.date?.startsWith(filterMonth)   : true;
    const okCat   = filterCategory ? e.category === filterCategory
                  : highlightCat   ? e.category === highlightCat       : true;
    return okMonth && okCat;
  });

  // If a month is selected on the pie chart, manually group expenses by category
  // Otherwise use the pre-aggregated category data from the API 
  const filteredCategoryData = chartMonth
    ? Object.values(
        expenses
          .filter(e => e.date?.startsWith(chartMonth))
          .reduce((acc, e) => {
            if (!acc[e.category]) acc[e.category] = { category: e.category, total: 0 };
            acc[e.category].total += parseFloat(e.amount);
            return acc;
          }, {})
      )
    : categoryData;

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#f0f2f5" }}>

      {loading && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 2000,
          background: "#f0f2f5",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: 16,
        }}>
          <div style={{
            width: 44, height: 44, background: "#ced78d",
            borderRadius: "50%", display: "flex",
            alignItems: "center", justifyContent: "center",
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(25,53,81,0.82)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/>
              <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>
            </svg>
          </div>
          <p style={{ fontFamily: "Sora, sans-serif", fontSize: 16, fontWeight: 600, color: "#193551" }}>
            Budget Tracker
          </p>
          <div style={{
            width: 40, height: 4, background: "rgba(25,53,81,0.1)",
            borderRadius: 99, overflow: "hidden",
          }}>
            <div style={{
              height: "100%", background: "#193551",
              borderRadius: 99,
              animation: "loading 1.2s ease-in-out infinite",
            }}/>
          </div>
          <style>{`
            @keyframes loading {
              0% { width: 0%; margin-left: 0%; }
              50% { width: 100%; margin-left: 0%; }
              100% { width: 0%; margin-left: 100%; }
            }
          `}</style>
        </div>
      )}

      {apiError && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 2000,
          background: "#f0f2f5",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: 16,
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: "50%",
            background: "rgba(237,172,177,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#edacb1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <p style={{ fontFamily: "Sora, sans-serif", fontSize: 18, fontWeight: 600, color: "#193551" }}>
            Connection Error
          </p>
          <p style={{ fontSize: 14, color: "#7a8fa6", textAlign: "center", maxWidth: 300 }}>
            Unable to connect to the server. Make sure your backend is running on port 3001.
          </p>
          <button
            onClick={fetchData}
            style={{
              background: "#193551", color: "#fcfcfc",
              border: "none", borderRadius: 10,
              padding: "10px 24px", fontSize: 14,
              fontFamily: "Sora, sans-serif", fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try Again
          </button>
        </div>
      )}

      {/* ── Header ── */}
      <header style={{
        background: "#193551", height: isMobile ? "auto" : 150,
        position: "sticky", top: 0, zIndex: 999,
        padding: isMobile ? "16px 20px" : "0 40px",
        display: "flex", flexWrap: "wrap",
        alignItems: "center", justifyContent: "space-between",
        boxShadow: "0 2px 16px rgba(25,53,81,0.18)",
        gap: 12,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 44, height: 44, background: "#ced78d",
            borderRadius: "50%", display: "flex",
            alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(25,53,81,0.82)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/>
              <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>
            </svg>
          </div>
          <div>
            <div style={{ fontFamily: "Sora, sans-serif", color: "#fcfcfc", fontWeight: 700, fontSize: isMobile ? 22 : 30 }}>
              Budget Tracker
            </div>
            <div style={{ color: "rgba(252,252,252,0.55)", fontSize: isMobile ? 13 : 18 }}>
              Manage your expenses effectively
            </div>
          </div>
        </div>
        <button
          onClick={() => { setEditingExpense(null); setShowModal(true); }}
          style={{
            background: "#ced78d", color: "rgba(25,53,81,0.82)", border: "none",
            borderRadius: 10, padding: isMobile ? "8px 14px" : "10px 20px",
            fontFamily: "Sora, sans-serif", fontWeight: 600, fontSize: isMobile ? 13 : 16,
            display: "flex", alignItems: "center", gap: 6,
            transition: "opacity .15s", cursor: "pointer",
          }}
          onMouseOver={e => e.currentTarget.style.opacity = ".85"}
          onMouseOut={e  => e.currentTarget.style.opacity = "1"}
        >
          + Add Expense
        </button>
      </header>

      {/* ── Body ── */}
      <div style={{ padding: isMobile ? "16px" : "32px 40px", maxWidth: 1400, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>

        {/* Stat Cards */}
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)", gap: 20 }}>
          <StatCard
            title="Total Expenses"
            icon={<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>}
            value={`$${totalAmount.toFixed(2)}`}
            subtitle="All time spending"
            accent="#edacb1" inverted
          />
          <StatCard
            title="Total Transactions"
            icon={<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>}
            value={expenses.length}
            subtitle="Recorded expenses"
            accent="#ced78d" inverted
          />
          <StatCard
            title="Top Category"
            icon={<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>}
            value={topCategory?.category || "—"}
            subtitle={topCategory ? `$${parseFloat(topCategory.total).toFixed(2)}` : "No data yet"}
            accent="#e7cfe8" inverted
          />
        </div>

        {/* Charts */}
        <Charts
          categoryData={filteredCategoryData}
          monthlyData={monthlyData}
          highlightCat={highlightCat}
          onCategoryClick={(cat) => {
            setHighlightCat(cat === highlightCat ? null : cat);
            setFilterCategory("");
          }}
          chartMonth={chartMonth}
          setChartMonth={setChartMonth}
          uniqueMonths={uniqueMonths}
        />

        {/* Table */}
        <ExpenseTable
          expenses={filteredExpenses}
          onEdit={handleEdit}
          onDelete={handleDelete}
          filterMonth={filterMonth}       setFilterMonth={setFilterMonth}
          filterCategory={filterCategory} setFilterCategory={setFilterCategory}
          uniqueMonths={uniqueMonths}
          uniqueCategories={uniqueCategories}
          highlightCat={highlightCat}
          onClearHighlight={() => setHighlightCat(null)}
        />
      </div>

      {/* ── Add/Edit Modal ── */}
      {showModal && (
        <div
          onClick={e => { if (e.target === e.currentTarget) handleCancel(); }}
          style={{
            position: "fixed", inset: 0, zIndex: 1000,
            background: "rgba(25,53,81,0.45)",
            backdropFilter: "blur(4px)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <ExpenseForm
            onSubmit={handleSubmit}
            editingExpense={editingExpense}
            onCancel={handleCancel}
          />
        </div>
      )}

      {/* ── Confirm Delete Modal ── */}
      {confirmId && (
        <div
          onClick={() => setConfirmId(null)}
          style={{
            position: "fixed", inset: 0, zIndex: 1001,
            background: "rgba(25,53,81,0.45)",
            backdropFilter: "blur(4px)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: "#ffffff", borderRadius: 20,
              padding: "36px 32px", width: 400,
              boxShadow: "0 20px 60px rgba(25,53,81,0.2)",
              textAlign: "center",
            }}
          >
            <div style={{
              width: 56, height: 56, borderRadius: "50%",
              background: "rgba(237,172,177,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 20px",
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#edacb1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                <path d="M10 11v6M14 11v6"/>
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
              </svg>
            </div>
            <h3 style={{ fontFamily: "Sora, sans-serif", fontSize: 18, color: "#193551", marginBottom: 8 }}>
              Delete Expense
            </h3>
            <p style={{ fontSize: 14, color: "#7a8fa6", marginBottom: 28 }}>
              Are you sure you want to delete this expense? This action cannot be undone.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setConfirmId(null)}
                style={{
                  flex: 1, padding: "12px",
                  background: "rgba(25,53,81,0.07)",
                  border: "none", borderRadius: 10,
                  fontWeight: 500, fontSize: 14, color: "#193551",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                style={{
                  flex: 1, padding: "12px",
                  background: "#edacb1", border: "none",
                  borderRadius: 10, fontFamily: "Sora, sans-serif",
                  fontWeight: 600, fontSize: 14, color: "#6b2030",
                  cursor: "pointer",
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast Notification ── */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 32, left: "50%",
          transform: "translateX(-50%)", zIndex: 2000,
          background: "#193551", color: "#fcfcfc",
          padding: "12px 24px", borderRadius: 12,
          fontSize: 14, fontWeight: 500,
          boxShadow: "0 8px 24px rgba(25,53,81,0.2)",
          display: "flex", alignItems: "center", gap: 8,
          animation: "fadeUp .2s ease",
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ced78d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          {toast}
        </div>
      )}
    </div>
  );
}