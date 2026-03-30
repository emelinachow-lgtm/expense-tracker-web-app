import { useState, useEffect } from "react";
import CustomDatePicker from "./CustomDatePicker";
import Dropdown from "./Dropdown";

const CATEGORIES = ["Groceries", "Food/Drinks", "Transportation", "Car", "Entertainment", "Bills", "Health", "Other"];

const inputStyle = {
  width: "100%", padding: "10px 14px",
  border: "1.5px solid rgba(25,53,81,0.15)",
  borderRadius: 10, fontSize: 14,
  background: "#f8f9fb", color: "#193551",
  transition: "border-color .2s, box-shadow .2s",
};

const labelStyle = {
  display: "block", fontSize: 13, fontWeight: 500,
  color: "#193551", marginBottom: 6,
};

const ErrorMsg = ({ msg }) => (
  <p style={{ fontSize: 12, color: "#c0404a", marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#c0404a" strokeWidth="2.5" strokeLinecap="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
    {msg}
  </p>
);

export default function ExpenseForm({ onSubmit, editingExpense, onCancel }) {
  const [form, setForm] = useState({
    title: "", category: "", amount: "", date: "", description: "",
  });
  const [errors,    setErrors]    = useState({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setSubmitted(false);
    setErrors({});
    if (editingExpense) {
      setForm({ ...editingExpense, date: editingExpense.date?.slice(0, 10) || "" });
    } else {
      setForm({ title: "", category: "", amount: "", date: "", description: "" });
    }
  }, [editingExpense]);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors(prev => ({ ...prev, [e.target.name]: "" }));
  };

  // Validate all required fields before submitting. If there are errors, set error messages in state to display them
  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    const newErrors = {};
    if (!form.title.trim()) newErrors.title    = "Title is required";
    if (!form.category)     newErrors.category = "Please select a category";
    if (!form.amount)       newErrors.amount   = "Amount is required";
    if (!form.date)         newErrors.date     = "Please select a date";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setSubmitted(false);
    onSubmit(form);
  };

  return (
    <div style={{
      background: "#ffffff", borderRadius: 20,
      padding: "36px 32px", width: "100%", maxWidth: 480,
      boxShadow: "0 20px 60px rgba(25,53,81,0.2)",
      animation: "fadeUp .2s ease",
    }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <div>
          <h2 style={{ fontFamily: "Sora, sans-serif", fontSize: 20, color: "#193551" }}>
            {editingExpense ? "Edit Expense" : "Add Expense"}
          </h2>
          <p style={{ fontSize: 13, color: "#7a8fa6", marginTop: 2 }}>
            {editingExpense ? "Update the details below" : "Fill in your transaction details"}
          </p>
        </div>
        <button
          onClick={onCancel}
          style={{
            background: "rgba(25,53,81,0.07)", border: "none",
            borderRadius: 8, width: 32, height: 32,
            fontSize: 16, color: "#193551", display: "flex",
            alignItems: "center", justifyContent: "center",
            cursor: "pointer",
          }}
        >×</button>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: "grid", gap: 16 }}>

          {/* Title */}
          <div>
            <label style={labelStyle}>Title</label>
            <input
              name="title" value={form.title} onChange={handleChange}
              placeholder="e.g. Coffee at Starbucks"
              style={{ ...inputStyle, borderColor: submitted && errors.title ? "#edacb1" : "rgba(25,53,81,0.15)" }}
            />
            {submitted && errors.title && <ErrorMsg msg={errors.title} />}
          </div>

          {/* Category + Amount row */}
          <div style={{ display: "grid", gridTemplateColumns: window.innerWidth <= 768 ? "1fr" : "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>Category</label>
              <Dropdown
                value={form.category}
                onChange={(val) => {
                  setForm(prev => ({ ...prev, category: val }));
                  setErrors(prev => ({ ...prev, category: "" }));
                }}
                placeholder="Select..."
                options={CATEGORIES.map(c => ({ value: c, label: c }))}
              />
              {submitted && errors.category && <ErrorMsg msg={errors.category} />}
            </div>
            <div>
              <label style={labelStyle}>Amount ($)</label>
              <input
                name="amount" type="number" step="0.01" min="0"
                value={form.amount} onChange={handleChange}
                placeholder="0.00"
                style={{ ...inputStyle, borderColor: submitted && errors.amount ? "#edacb1" : "rgba(25,53,81,0.15)" }}
              />
              {submitted && errors.amount && <ErrorMsg msg={errors.amount} />}
            </div>
          </div>

          {/* Date */}
          <div>
            <label style={labelStyle}>Date</label>
            <CustomDatePicker
              value={form.date}
              onChange={(date) => {
                setForm(prev => ({ ...prev, date }));
                setErrors(prev => ({ ...prev, date: "" }));
              }}
              inputStyle={inputStyle}
              hasError={submitted && !!errors.date}
            />
            {submitted && errors.date && <ErrorMsg msg={errors.date} />}
          </div>

          {/* Description */}
          <div>
            <label style={labelStyle}>
              Description <span style={{ color: "#7a8fa6", fontWeight: 400 }}>(optional)</span>
            </label>
            <textarea
              name="description" value={form.description} onChange={handleChange}
              placeholder="Any additional notes..."
              rows={3}
              style={{ ...inputStyle, resize: "vertical" }}
            />
          </div>

        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
          <button
            type="button" onClick={onCancel}
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
            type="submit"
            style={{
              flex: 2, padding: "12px",
              background: "#193551", border: "none",
              borderRadius: 10, fontFamily: "Sora, sans-serif",
              fontWeight: 600, fontSize: 14, color: "#fcfcfc",
              transition: "opacity .15s", cursor: "pointer",
            }}
            onMouseOver={e => e.currentTarget.style.opacity = ".85"}
            onMouseOut={e  => e.currentTarget.style.opacity = "1"}
          >
            {editingExpense ? "Update Expense" : "Add Expense"}
          </button>
        </div>
      </form>
    </div>
  );
}