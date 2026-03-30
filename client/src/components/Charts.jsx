import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie,
} from "recharts";
import { getCategoryStyle } from "../App";
import Dropdown from "./Dropdown";

function formatMonth(str) {
  if (!str) return str;
  const [y, m] = str.split("-");
  const names = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${names[parseInt(m, 10) - 1]} ${y}`;
}

// Custom tooltip for bar chart
function BarTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#193551", color: "#fcfcfc",
      padding: "8px 14px", borderRadius: 10,
      fontSize: 13, boxShadow: "0 4px 16px rgba(25,53,81,0.2)",
    }}>
      <p style={{ fontWeight: 600, marginBottom: 2 }}>{formatMonth(label)}</p>
      <p>${parseFloat(payload[0].value).toFixed(2)}</p>
    </div>
  );
}

// Custom tooltip for pie chart
function PieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const total = payload[0].payload.total;
  const allTotal = payload[0].payload.allTotal;
  const percentage = allTotal ? ((total / allTotal) * 100).toFixed(1) : 0;
  return (
    <div style={{
      background: "#193551", color: "#fcfcfc",
      padding: "8px 14px", borderRadius: 10,
      fontSize: 13, boxShadow: "0 4px 16px rgba(25,53,81,0.2)",
    }}>
      <p style={{ fontWeight: 600, marginBottom: 2 }}>{payload[0].name}</p>
      <p>${parseFloat(total).toFixed(2)} <span style={{ fontSize: 11, opacity: 0.65 }}>({percentage}%)</span></p>
      <p style={{ opacity: 0.5, fontSize: 11 }}>Click to filter table</p>
    </div>
  );
}

// Custom legend that uses consistent category colours from CATEGORY_CONFIG
function PieLegend({ categoryData }) {
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "1fr 1fr",
      gap: "8px 16px", marginTop: 16,
    }}>
      {categoryData.map((entry) => (
        <div key={entry.category} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 10, height: 10, borderRadius: 3, background: getCategoryStyle(entry.category).bg, flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: "#193551", fontWeight: 500 }}>{entry.category}</span>
          <span style={{ fontSize: 12, color: "#7a8fa6", marginLeft: "auto" }}>
            ${parseFloat(entry.total).toFixed(2)}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function Charts({ categoryData, monthlyData, highlightCat, onCategoryClick, chartMonth, setChartMonth, uniqueMonths }) {
  const [activeIndex, setActiveIndex] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const cardStyle = {
    background: "#ffffff",
    borderRadius: "var(--radius)",
    boxShadow: "var(--shadow)",
    padding: "24px",
  };

  const titleStyle = {
    fontFamily: "Sora, sans-serif",
    fontSize: 15, fontWeight: 600,
    color: "#193551", marginBottom: 20,
  };

  if (!categoryData.length && !monthlyData.length) {
    return (
      <div style={{ ...cardStyle, textAlign: "center", color: "#7a8fa6", fontSize: 14, padding: 40 }}>
        Add some expenses to see your charts!
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 20 }}>

      {/* ── Bar Chart: Monthly Trends ── */}
      <div style={cardStyle}>
        <p style={titleStyle}>Monthly Expenditure Trends</p>
        {monthlyData.length === 0 ? (
          <p style={{ color: "#7a8fa6", fontSize: 13, textAlign: "center", padding: "40px 0" }}>No data yet</p>
        ) : (
          <ResponsiveContainer width="100%" height={260} style={{ outline: "none" }}>
            <BarChart data={monthlyData} barSize={36}>
              <XAxis
                dataKey="month"
                tickFormatter={formatMonth}
                tick={{ fontSize: 12, fill: "#7a8fa6" }}
                axisLine={false} tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#7a8fa6" }}
                axisLine={false} tickLine={false}
                tickFormatter={v => `$${v}`}
              />
              <Tooltip content={<BarTooltip />} cursor={{ fill: "rgba(25,53,81,0.04)", radius: 6 }} />
              <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                {monthlyData.map((_, i) => (
                  <Cell key={i} fill="#5c8180" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ── Pie Chart: Spending by Category ── */}
      <div style={{ ...cardStyle, position: "relative", overflow: "visible", minWidth: 0, width: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, gap: 8, width: "100%" }}>
          <p style={{ ...titleStyle, marginBottom: 0, fontSize: isMobile ? 13 : 15, flex: 1 }}>Spending by Category</p>
          <div style={{ flexShrink: 0, width: isMobile ? 120 : 140 }}>
            <Dropdown
              value={chartMonth}
              onChange={setChartMonth}
              placeholder="All Time"
              options={[
                { value: "", label: "All Time" },
                ...uniqueMonths.map(m => {
                  const [y, mo] = m.split("-");
                  const names = ["January","February","March","April","May","June","July","August","September","October","November","December"];
                  return { value: m, label: `${names[parseInt(mo,10)-1]} ${y}` };
                })
              ]}
            />
          </div>
        </div>
        {categoryData.length === 0 ? (
          <p style={{ color: "#7a8fa6", fontSize: 13, textAlign: "center", padding: "40px 0" }}>No data yet</p>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={200} style={{ outline: "none" }}>
              <PieChart>
                <Pie
                  data={categoryData.map(d => ({
                    ...d,
                    total: parseFloat(d.total),
                    allTotal: categoryData.reduce((s, c) => s + parseFloat(c.total), 0)
                  }))}
                  dataKey="total"
                  nameKey="category"
                  cx="50%" cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                  onClick={(data) => onCategoryClick(data.category)}
                  onMouseEnter={(_, i) => setActiveIndex(i)}
                  onMouseLeave={() => setActiveIndex(null)}
                  style={{ cursor: "pointer" }}
                >
                  {categoryData.map((entry, i) => (
                    <Cell
                      key={entry.category}
                      fill={getCategoryStyle(entry.category).bg}
                      opacity={
                        highlightCat
                          ? entry.category === highlightCat ? 1 : 0.35
                          : activeIndex === null || activeIndex === i ? 1 : 0.7
                      }
                      stroke={entry.category === highlightCat ? "#193551" : "none"}
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <PieLegend categoryData={categoryData} />
            {highlightCat && (
              <p style={{ fontSize: 12, color: "#5c8180", textAlign: "center", marginTop: 10 }}>
                Showing: <strong>{highlightCat}</strong> — click again or use table filter to reset
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}