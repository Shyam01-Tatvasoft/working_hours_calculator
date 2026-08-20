# ⏱️ Working Hours Calculator

A modern, fully responsive **React + Vite** web application for tracking your daily office working hours. Supports both **live real-time tracking** and **historical day review** — with full cross-midnight session support.

---

## ✨ Features

### 🔴 Live Tracking Mode
- Set your **Arrival Time** and watch working hours accumulate in real time
- Live **Current Working Time** counter — updates every second
- **Remaining Time** countdown to your required daily hours
- **Expected End Time** — automatically calculated based on arrival + required hours + breaks
  - Shows a **+1d** badge when expected completion crosses midnight (e.g. night shift finishing at `06:50 +1d`)
- **Status badge** — `Working`, `On Break`, `Completed`

### 📋 Historical Mode
- Add an optional **End Time** (departure time) to review a past day
- Dashboard switches to **Day Summary** — shows static totals
- Displays **Total Working Time**, **Total Break**, **Total Elapsed**
- Shows ✓ *X over target* or ⚠ *X short of target* vs your required hours
- Perfect for logging yesterday's shift or checking a completed workday

### ☕ Break Management
- Add unlimited breaks with **Start → End** times
- Supports **cross-midnight breaks** (e.g. `23:55 → 00:15`) — shows a `+1d` badge automatically
- Validates breaks: no duplicate times, no overlaps, real-time error messages
- Incomplete breaks (start only) are tracked live but don't affect completed calculations
- Delete any break instantly

### ⚙️ Session Setup
- Configurable **Required Working Hours** (0.5h – 24h)
- Quick-select presets: `6h`, `7h`, `7.5h`, `8h`, `8.5h`, `9h`
- All settings persist automatically via **localStorage** — survives page refresh

### 🌙 Cross-midnight Support
- Arrival at `22:30`, break `23:55 → 00:15`, finish at `07:00` — all handled correctly
- All time calculations are **seconds-precision** and **cross-midnight aware**

### 🌗 Dark / Light Theme
- Automatic detection of your OS preference
- Smooth toggle between dark and light modes
- Theme choice saved to localStorage

### 📋 Copy Summary
- One-click **Copy Summary** button exports a text snapshot to the clipboard:
  ```
  Working Hours Summary
  Arrival:   09:30
  Required:  8h
  Worked:    8h 20m
  Break:     40m
  Remaining: 0m
  Expected End: 18:30
  Status:    Completed ✓
  ```

### 🔁 Clear All
- Confirmation dialog before wiping all data
- Resets arrival, end time, breaks, and required hours

---

## 🕐 Time Input

All time inputs use a **custom 24-hour text field** (`HH:MM`) instead of the browser's native `<input type="time">`.

This eliminates the **AM/PM picker problem** that appears on iOS Safari, Android Chrome, and Windows devices set to a 12-hour locale — giving you a consistent 24h interface on every device worldwide.

**Smart input features:**
- Auto-inserts colon (`14` → `14:`)
- Auto-pads on blur (`9:5` → `09:05`, `14` → `14:00`)
- Accepts 4-digit entry without colon (`1430` → `14:30`)
- Validates `00:00` – `23:59`

---

## 🛠️ Tech Stack

| Layer        | Technology                |
|--------------|---------------------------|
| UI Framework | React 19                  |
| Build Tool   | Vite 8                    |
| Styling      | Vanilla CSS (design system with CSS variables) |
| State        | React Hooks (`useState`, `useEffect`, `useCallback`, `useMemo`) |
| Persistence  | `localStorage`            |
| Deploy       | GitHub Pages (via GitHub Actions) |

**No external UI library or Redux** — pure React hooks throughout.

---

## 📁 Project Structure

```
src/
├── components/
│   ├── ArrivalPanel.jsx    # Arrival time, End time, Required hours setup
│   ├── BreakList.jsx       # Break entries container
│   ├── BreakRow.jsx        # Single break row (start → end + validation)
│   ├── LiveDashboard.jsx   # Hero stats panel (live or historical)
│   ├── SummaryCard.jsx     # Individual metric card
│   ├── TimeInput.jsx       # Custom 24h time input (no AM/PM)
│   └── icons/
│       └── MealBreakIcon.jsx
├── hooks/
│   ├── useTheme.js         # Dark/light theme with OS detection
│   ├── useTimer.js         # Single 1s setInterval for live updates
│   └── useWorkingSession.js# All session state + localStorage persistence
├── utils/
│   └── timeCalculations.js # Core calculation engine (pure functions)
├── App.jsx                 # Root layout, wires everything together
├── index.css               # Full design system (CSS variables, responsive)
└── main.jsx                # Vite entry point
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+ (tested on v22.14.0)
- **npm** v9+

### Install & Run

```bash
# Clone the repository
git clone https://github.com/your-username/working-hours-calculator.git
cd working-hours-calculator

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build       # Outputs to ./dist
npm run preview     # Preview the production build locally
```

---

## 📐 Calculation Logic

```
Elapsed     = Current Time − Arrival Time          (cross-midnight aware)
Completed Breaks = Σ (Break End − Break Start)     (cross-midnight aware)
Active Break    = Elapsed since break start         (if break has no end yet)
Working Time    = Elapsed − Completed Breaks − Active Break
Remaining       = max(0, Required − Working Time)
Expected End    = Arrival + Required + Completed Breaks
```

All times are stored as **seconds from midnight** for precision. Cross-midnight wraps are handled by checking if `end < start` and adding `86,400 sec` (one day).

---

## 🌐 Deployment

This project auto-deploys to **GitHub Pages** on every push to `main` via a GitHub Actions workflow.

```
.github/workflows/deploy.yml  →  npm ci → npm run build → deploy ./dist
```

---

## 📄 License

MIT — free to use, modify and distribute.
