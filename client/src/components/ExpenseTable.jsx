import { useState } from "react";
import { getCategoryStyle } from "../App";
import Dropdown from "./Dropdown";

function CategoryBadge({ category }) {
  const { bg, text } = getCategoryStyle(category);
  return (
    <span style={{
      display: "inline-block",
      background: bg, color: text,
      padding: "4px 12px", borderRadius: 99,
      fontSize: 12, fontWeight: 500,
      whiteSpace: "nowrap",
    }}>
      {category}
    </span>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export default function ExpenseTable({
  expenses, onEdit, onDelete,
  filterMonth, setFilterMonth,
  filterCategory, setFilterCategory,
  uniqueMonths, uniqueCategories,
  highlightCat, onClearHighlight,
}) {
  const [sortCol, setSortCol] = useState("date");
  const [sortDir, setSortDir] = useState("desc");

  // Sort expenses by selected column and direction
  const sortedExpenses = [...expenses].sort((a, b) => {
    let valA = a[sortCol];
    let valB = b[sortCol];
    if (sortCol === "amount") { valA = parseFloat(valA); valB = parseFloat(valB); }
    if (valA < valB) return sortDir === "asc" ? -1 : 1;
    if (valA > valB) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  return (
    <div style={{
      background: "#ffffff", borderRadius: "var(--radius)",
      boxShadow: "var(--shadow)", overflow: "hidden",
    }}>
      {/* Table Header Row */}
      <div style={{
        padding: "20px 24px",
        display: "flex", justifyContent: "space-between",
        alignItems: "center", borderBottom: "1.5px solid rgba(25,53,81,0.07)",
        flexWrap: "wrap", gap: 12,
      }}>
        <div>
          <h2 style={{ fontFamily: "Sora, sans-serif", fontSize: 16, color: "#193551" }}>
            All Expense Tracker
          </h2>
          {highlightCat && (
            <button
              onClick={onClearHighlight}
              style={{
                marginTop: 4, fontSize: 12, color: "#5c8180",
                background: "none", border: "none", padding: 0,
                cursor: "pointer", textDecoration: "underline",
              }}
            >
              ← Show all (filtered by chart: {highlightCat})
            </button>
          )}
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <Dropdown
            value={filterMonth}
            onChange={(val) => { setFilterMonth(val); onClearHighlight(); }}
            placeholder="All Months"
            options={[
              { value: "", label: "All Months" },
              ...uniqueMonths.map(m => {
                const [y, mo] = m.split("-");
                const names = ["January","February","March","April","May","June","July","August","September","October","November","December"];
                return { value: m, label: `${names[parseInt(mo,10)-1]} ${y}` };
              })
            ]}
          />
          <Dropdown
            value={filterCategory}
            onChange={(val) => { setFilterCategory(val); onClearHighlight(); }}
            placeholder="All Categories"
            options={[
              { value: "", label: "All Categories" },
              ...uniqueCategories.map(c => ({ value: c, label: c }))
            ]}
          />
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "rgba(25,53,81,0.03)" }}>
              {["Date", "Title", "Category", "Amount", "Description", "Actions"].map(h => {
                const colKey = h.toLowerCase();
                const isSortable = ["date", "title", "category", "amount"].includes(colKey);
                return (
                  <th
                    key={h}
                    onClick={() => {
                      if (!isSortable) return;
                      if (sortCol === colKey) setSortDir(d => d === "asc" ? "desc" : "asc");
                      else { setSortCol(colKey); setSortDir("asc"); }
                    }}
                    style={{
                      padding: "12px 20px", textAlign: "left",
                      fontSize: 13, fontWeight: 500, color: "#7a8fa6",
                      borderBottom: "1.5px solid rgba(25,53,81,0.07)",
                      whiteSpace: "nowrap",
                      cursor: isSortable ? "pointer" : "default",
                      userSelect: "none",
                    }}
                  >
                    {h} {isSortable && sortCol === colKey ? (sortDir === "asc" ? "↑" : "↓") : ""}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {sortedExpenses.length === 0 ? (
              <tr>
                <td colSpan={6} style={{
                  padding: "48px", textAlign: "center",
                  color: "#7a8fa6", fontSize: 14,
                }}>
                  No expenses found. Add one to get started!
                </td>
              </tr>
            ) : (
              sortedExpenses.map((expense, i) => (
                <tr
                  key={expense.id}
                  style={{
                    borderBottom: i < sortedExpenses.length - 1 ? "1px solid rgba(25,53,81,0.06)" : "none",
                    transition: "background .15s",
                  }}
                  onMouseOver={e => e.currentTarget.style.background = "rgba(25,53,81,0.02)"}
                  onMouseOut={e  => e.currentTarget.style.background = "transparent"}
                >
                  <td style={{ padding: "14px 20px", fontSize: 14, color: "#7a8fa6", whiteSpace: "nowrap" }}>
                    {formatDate(expense.date)}
                  </td>
                  <td style={{ padding: "14px 20px", fontSize: 14, fontWeight: 500, color: "#193551" }}>
                    {expense.title}
                  </td>
                  <td style={{ padding: "14px 20px" }}>
                    <CategoryBadge category={expense.category} />
                  </td>
                  <td style={{ padding: "14px 20px", fontSize: 14, fontWeight: 600, color: "#193551", whiteSpace: "nowrap" }}>
                    ${parseFloat(expense.amount).toFixed(2)}
                  </td>
                  <td style={{ padding: "14px 20px", fontSize: 13, color: "#7a8fa6", maxWidth: 200 }}>
                    <span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {expense.description || "—"}
                    </span>
                  </td>
                  <td style={{ padding: "14px 20px", whiteSpace: "nowrap" }}>
                    <button
                      onClick={() => onEdit(expense)}
                      aria-label="Edit expense"
                      title="Edit"
                      style={{
                        background: "none", border: "none",
                        padding: "6px", borderRadius: 8,
                        cursor: "pointer", transition: "background .15s",
                      }}
                      onMouseOver={e => e.currentTarget.style.background = "rgba(92,129,128,0.1)"}
                      onMouseOut={e  => e.currentTarget.style.background = "none"}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5c8180" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                    <button
                      onClick={() => onDelete(expense.id)}
                      aria-label="Delete expense"
                      title="Delete"
                      style={{
                        background: "none", border: "none",
                        padding: "6px", borderRadius: 8,
                        cursor: "pointer", transition: "background .15s",
                      }}
                      onMouseOver={e => e.currentTarget.style.background = "rgba(237,172,177,0.15)"}
                      onMouseOut={e  => e.currentTarget.style.background = "none"}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#edacb1" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                        <path d="M10 11v6M14 11v6"/>
                        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                      </svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer count */}
      {sortedExpenses.length > 0 && (
        <div style={{
          padding: "12px 24px", fontSize: 12,
          color: "#7a8fa6", borderTop: "1px solid rgba(25,53,81,0.06)",
          background: "rgba(25,53,81,0.01)",
        }}>
          Showing {sortedExpenses.length} expense{sortedExpenses.length !== 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
}