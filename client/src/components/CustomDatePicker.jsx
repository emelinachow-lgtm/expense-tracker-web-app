import { useState, useRef, useEffect } from "react";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const FULL_MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

export default function CustomDatePicker({ value, onChange, inputStyle, hasError }) {
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(value ? new Date(value) : new Date());
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        setShowMonthPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const year  = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const daysInMonth  = getDaysInMonth(year, month);
  const firstDay     = getFirstDayOfMonth(year, month);
  const daysInPrev   = getDaysInMonth(year, month - 1);

  const cells = [];
  for (let i = firstDay - 1; i >= 0; i--)
    cells.push({ day: daysInPrev - i, curr: false });
  for (let i = 1; i <= daysInMonth; i++)
    cells.push({ day: i, curr: true });
  while (cells.length % 7 !== 0)
    cells.push({ day: cells.length - daysInMonth - firstDay + 1, curr: false });

  const selectedDate = value ? new Date(value) : null;
  const isSelected = (day) =>
    selectedDate &&
    selectedDate.getFullYear() === year &&
    selectedDate.getMonth() === month &&
    selectedDate.getDate() === day;
  const isToday = (day) => {
    const t = new Date();
    return t.getFullYear() === year && t.getMonth() === month && t.getDate() === day;
  };

  const selectDay = (day) => {
    // Pad month and day to avoid timezone conversion issues
    const mm = String(month + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    onChange(`${year}-${mm}-${dd}`);
    setOpen(false);
    setShowMonthPicker(false);
  };

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const displayValue = value
    ? new Date(value).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" })
    : "";

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <input
        readOnly
        aria-label="Select a date"
        value={displayValue}
        placeholder="Select a date"
        onClick={() => setOpen(!open)}
        style={{ ...inputStyle, borderColor: hasError ? "#edacb1" : "rgba(25,53,81,0.15)", cursor: "pointer" }}
      />

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 8px)", left: 0, zIndex: 200,
          background: "#ffffff", borderRadius: 16,
          boxShadow: "0 8px 32px rgba(25,53,81,0.15)",
          border: "1px solid rgba(25,53,81,0.08)",
          display: "flex", overflow: "hidden",
          minWidth: 260,
          maxWidth: "90vw",
          flexWrap: "nowrap",
        }}>

          {/* ── Calendar ── */}
          <div style={{ padding: 16, width: 260 }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <button type="button" onClick={prevMonth} style={{ background: "none", border: "none", cursor: "pointer", color: "#7a8fa6", fontSize: 16, padding: "2px 6px" }}>‹</button>
              <button
                type="button"
                onClick={() => setShowMonthPicker(!showMonthPicker)}
                style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "Sora, sans-serif", fontSize: 14, fontWeight: 600, color: "#193551", display: "flex", alignItems: "center", gap: 4 }}
              >
                {FULL_MONTHS[month]} {year}
                <svg width="10" height="10" viewBox="0 0 12 12" fill="#193551"><path d="M6 8L1 3h10z"/></svg>
              </button>
              <button type="button" onClick={nextMonth} style={{ background: "none", border: "none", cursor: "pointer", color: "#7a8fa6", fontSize: 16, padding: "2px 6px" }}>›</button>
            </div>

            {/* Day labels */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 4 }}>
              {DAYS.map(d => (
                <div key={d} style={{ textAlign: "center", fontSize: 11, fontWeight: 500, color: "#7a8fa6", padding: "4px 0" }}>{d}</div>
              ))}
            </div>

            {/* Days grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
              {cells.map((cell, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => cell.curr && selectDay(cell.day)}
                  style={{
                    padding: "6px 0", border: "none", cursor: cell.curr ? "pointer" : "default",
                    borderRadius: 8, fontSize: 12, textAlign: "center",
                    background: cell.curr && isSelected(cell.day) ? "#193551" : cell.curr && isToday(cell.day) ? "#5c8180" : "transparent",
                    color: !cell.curr ? "rgba(25,53,81,0.25)"
                         : isSelected(cell.day) ? "#fcfcfc"
                         : isToday(cell.day) ? "#ffffff"
                         : "#193551",
                    fontWeight: isSelected(cell.day) || isToday(cell.day) ? 600 : 400,
                    transition: "background .15s",
                  }}
                  onMouseOver={e => { if (cell.curr && !isSelected(cell.day)) e.currentTarget.style.background = "rgba(25,53,81,0.07)"; }}
                  onMouseOut={e  => { if (!isSelected(cell.day)) e.currentTarget.style.background = "transparent"; }}
                >
                  {cell.day}
                </button>
              ))}
            </div>
          </div>

          {/* ── Month Picker Panel ── */}
          {showMonthPicker && (
            <div style={{
              width: 150, borderLeft: "1px solid rgba(25,53,81,0.08)",
              padding: 12, display: "flex", flexDirection: "column", gap: 8,
              overflowX: "hidden",
            }}>
              {/* Year navigation */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <button type="button" onClick={() => setViewDate(new Date(year - 1, month, 1))} style={{ background: "none", border: "none", cursor: "pointer", color: "#7a8fa6", fontSize: 16 }}>‹</button>
                <span style={{ fontFamily: "Sora, sans-serif", fontSize: 14, fontWeight: 600, color: "#193551" }}>{year}</span>
                <button type="button" onClick={() => setViewDate(new Date(year + 1, month, 1))} style={{ background: "none", border: "none", cursor: "pointer", color: "#7a8fa6", fontSize: 16 }}>›</button>
              </div>

              {/* Month grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 4 }}>
                {MONTHS.map((m, i) => (
                  <button
                    type="button"
                    key={m}
                    onClick={() => { setViewDate(new Date(year, i, 1)); setShowMonthPicker(false); }}
                    style={{
                      padding: "8px 4px", border: "none", cursor: "pointer",
                      borderRadius: 8, fontSize: 12, textAlign: "center",
                      background: i === month ? "#193551" : "transparent",
                      color: i === month ? "#fcfcfc" : "#193551",
                      fontWeight: i === month ? 600 : 400,
                      transition: "background .15s",
                    }}
                    onMouseOver={e => { if (i !== month) e.currentTarget.style.background = "rgba(25,53,81,0.07)"; }}
                    onMouseOut={e  => { if (i !== month) e.currentTarget.style.background = "transparent"; }}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}