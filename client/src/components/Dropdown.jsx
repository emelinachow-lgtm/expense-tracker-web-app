import { useState, useRef, useEffect } from "react";

export default function Dropdown({ value, onChange, options, placeholder }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [open, setOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Reset focused index when dropdown opens
  useEffect(() => {
    if (open) {
      const selectedIndex = options.findIndex(o => o.value === value);
      setFocusedIndex(selectedIndex >= 0 ? selectedIndex : 0);
    }
  }, [open]);

  const handleKeyDown = (e) => {
    if (!open) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setFocusedIndex(prev => Math.min(prev + 1, options.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusedIndex(prev => Math.max(prev - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (focusedIndex >= 0) {
          onChange(options[focusedIndex].value);
          setOpen(false);
        }
        break;
      case "Escape":
        setOpen(false);
        break;
    }
  };

  const selected = options.find(o => o.value === value);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        style={{
          padding: isMobile ? "6px 10px" : "10px 14px",
          border: `1.5px solid rgba(25,53,81,0.15)`,
          borderRadius: 10, fontSize: isMobile ? 12 : 14,
          background: "#f8f9fb", color: "#193551",
          cursor: "pointer", outline: "none",
          fontFamily: "DM Sans, sans-serif", fontWeight: 400,
          display: "flex", alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          minWidth: isMobile ? 80 : 120,
        }}
      >
        {selected ? selected.label : placeholder}
        <svg width="10" height="10" viewBox="0 0 12 12" fill="#193551">
          <path d="M6 8L1 3h10z"/>
        </svg>
      </button>

      {open && (
        <div
          role="listbox"
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            left: isMobile ? 0 : "auto",
            right: isMobile ? "auto" : 0,
            maxWidth: isMobile ? "80vw" : "none",
            maxHeight: "160px",
            overflowY: "auto",
            background: "#ffffff", borderRadius: 16,
            boxShadow: "0 8px 32px rgba(25,53,81,0.15)",
            border: "1px solid rgba(25,53,81,0.08)",
            minWidth: 160, zIndex: 100,
            padding: "6px",
          }}
        >
          {options.map((opt, i) => (
            <div
              key={opt.value}
              role="option"
              tabIndex={0}
              aria-selected={value === opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              style={{
                padding: "10px 16px", fontSize: 13,
                cursor: "pointer", borderRadius: 10,
                fontFamily: "DM Sans, sans-serif",
                fontWeight: value === opt.value ? 600 : 400,
                color: value === opt.value ? "#193551" : "#7a8fa6",
                background: focusedIndex === i
                  ? "rgba(25,53,81,0.08)"
                  : value === opt.value
                  ? "rgba(25,53,81,0.06)"
                  : "transparent",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                transition: "background .15s",
              }}
              onMouseOver={() => setFocusedIndex(i)}
              onMouseOut={() => setFocusedIndex(-1)}
            >
              {opt.label}
              {value === opt.value && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#193551" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}