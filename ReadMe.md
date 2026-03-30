# Budget Tracker

A single-page web application that helps users monitor and categorise their personal spending. Users can log expenses, view spending breakdowns by category, and track monthly expenditure trends — all from one seamless dashboard.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (via Vite) |
| Styling | Inline styles with CSS variables |
| Charts | Recharts |
| Backend | Node.js + Express |
| Database | MySQL |
| API | RESTful API (JSON) |
| Routing | React state-based (no React Router needed — SPA) |
| Deployment | Not deployed — runs locally via Vite dev server |

---

## Features

- Add, edit, and delete expense entries with title, category, amount, date, and description
- Single-page application — page never reloads, all updates happen dynamically
- Interactive pie chart showing spending breakdown by category with hover tooltips and percentage
- Bar chart showing monthly expenditure trends
- Click on a pie chart slice to filter the expense table by that category
- Filter expense table by month and category using custom dropdowns
- Custom date picker with month/year navigation panel
- Styled confirmation modal before deleting an expense
- Toast notification feedback after adding, editing, or deleting
- Loading screen while data is being fetched
- Error screen with retry button if the server is unreachable
- Form validation with inline error messages
- Stat cards showing total expenses, total transactions, and top spending category
- Colour-coded category badges consistent across table and charts

---

## Folder Structure
```
expense-tracker/
├── client/                   # React frontend (Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Charts.jsx        # Bar and pie charts with Recharts
│   │   │   ├── CustomDatePicker.jsx  # Custom calendar component
│   │   │   ├── Dropdown.jsx      # Reusable custom dropdown
│   │   │   ├── ExpenseForm.jsx   # Add/edit expense modal form
│   │   │   └── ExpenseTable.jsx  # Expense list with filters
│   │   ├── App.jsx           # Main app, state management, API calls
│   │   └── index.css         # Global styles and CSS variables
│   └── index.html            # Single HTML file
│
└── server/                   # Node.js + Express backend
    ├── db.js                 # MySQL connection setup
    ├── routes.js             # API endpoints (CRUD)
    ├── index.js              # Server entry point
    └── .env                  # Environment variables (DB credentials)
```

---

## Challenges Overcome

Setting up CORS between the React frontend and Express backend was an initial hurdle, particularly on macOS where port 5000 is reserved by AirPlay Receiver — this was resolved by switching to port 3001. Building fully custom UI components for the dropdown and date picker without external libraries required careful handling of outside-click detection and form submission prevention using `type="button"`. Managing shared state across multiple components, such as syncing the pie chart category filter with the expense table, required careful lifting of state to the parent `App.jsx` component. Ensuring the app behaved as a true SPA meant handling all CRUD operations through React state updates rather than page reloads, with every change instantly reflected across the dashboard.