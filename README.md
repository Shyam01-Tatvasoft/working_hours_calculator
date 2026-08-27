# ⏱️ Working Hours Calculator

A modern, fully responsive **React + Vite** web application for tracking your daily office working hours. Built around a **state-machine model** — click once to start, once to break, once to resume, once to finish. All data is automatically saved and archived per day.

---

## ✨ Features

### ▶ State-Machine Tracker
The app transitions through four well-defined states, driven by a single hero action button:

| Status | Primary Action | Secondary Action |
|--------|----------------|-----------------|
| `idle` | **Start Work** | — |
| `working` | **Start Break** | End Work |
| `on-break` | **Resume Work** | End Work |
| `completed` | **Start New Day** | — |

Each button records an ISO timestamp and advances the session to the next state automatically.

### 📊 Live Stats Panel
While working, the **Today's Tracker** card shows:
- **Working Time** — large live counter, updated every second
- **Remaining Time** — countdown to your required shift hours
- **Expected End** — calculated target finish time; shows a `+1d` badge when it crosses midnight
- **Total Break** — sum of all completed + active break time
- **Status badge** — `Not Started`, `Working`, `On Break`, `Completed`
- **Hours-completed banner** — appears when you've hit your required hours but haven't ended the shift yet

### ☕ Break Timeline
A visual timeline card shows every break for the day:
- Break number, start → end times, and duration
- Active break shows `Running...` with a live duration counter
- Cross-midnight breaks display a `+1d` badge
- Hidden when there are no breaks

### ⚙️ Required Shift Setting
- Inline **Required Shift** number input (0.5h – 24h, step 0.5)
- Quick-select presets: `6h`, `7h`, `7.5h`, `8h`, `8.5h`, `9h`
- Active preset is highlighted; all changes persist immediately

### ✏️ Edit Today's Records
A collapsible **Edit Today's Records** panel (available once work has started) lets you retroactively fix timestamps:
- Edit **Work Start Time** and **Work End Time**
- Edit any break's start or end time via the custom `HH:MM` input
- **Add Break Manually** — inserts an empty break row to fill in
- **Delete** any break instantly
- Real-time validation with inline error messages (overlaps, duplicates)
- Cross-midnight badge shown on affected breaks

### 📋 Work History
A modal **Work History** panel (accessible from the header) shows all archived past sessions, newest first:
- Each entry shows date, total worked time, break time, and `Completed` / `Partial` status
- Expand any day to view and **edit** its full record inline:
  - Edit start/end times and required hours
  - Add, edit, or delete breaks (with cross-midnight `+1d` badges)
  - **Delete Day Record** to permanently remove an entry
- Sessions are auto-archived when you open the app on a new calendar day

### 🔁 Auto-Archive
When you click **Start New Day**, today's completed session is moved to history and a fresh session begins — carrying forward your required hours preference.

If the app is reopened on a different calendar day while a previous session is in storage, it is automatically archived before presenting a fresh session.

### 🌗 Dark / Light Theme
- Automatically detects your OS preference on first load
- Smooth toggle button in the header (moon / sun icon)
- Theme preference is saved to `localStorage`

### 🔴 Reset Day
- **Reset Day** button (shown once work has started) wipes today's session without archiving
- Confirmation dialog shown before any data is deleted

### 🌙 Cross-Midnight Support
All time calculations are fully cross-midnight aware:
- Work sessions that start before midnight and finish after (e.g. `22:30 → 07:00`) are handled correctly
- Breaks that span midnight (e.g. `23:55 → 00:15`) are automatically detected and labelled `+1d`
- Expected end time shows `+1d` when your required hours push the finish into the next day

---

## 🕐 Time Input

All time inputs use a **custom 24-hour text field** (`HH:MM`) rather than the browser's native `<input type="time">`.

This eliminates the AM/PM picker problem that appears on iOS Safari, Android Chrome, and Windows devices configured to a 12-hour locale — giving a consistent 24h interface on every device worldwide.

**Smart input behaviour:**
- Auto-inserts colon (`14` → `14:`)
- Auto-pads on blur (`9:5` → `09:05`, `14` → `14:00`)
- Accepts 4-digit entry without colon (`1430` → `14:30`)
- Validates range `00:00` – `23:59`

---

## 🛠️ Tech Stack

| Layer        | Technology |
|--------------|-----------|
| UI Framework | React 19 |
| Build Tool   | Vite 8 |
| Styling      | Vanilla CSS (design system with CSS variables) |
| State        | React Hooks (`useState`, `useEffect`, `useCallback`) |
| Persistence  | `localStorage` (`whc-tracker-v1`) |
| Linter       | oxlint |
| Deploy       | GitHub Pages (via GitHub Actions) |

**No external UI library or Redux** — pure React hooks and vanilla CSS throughout.

---

## 📁 Project Structure

```
src/
├── components/
│   ├── ActionButton.jsx     # Hero state-machine button (Start/Break/Resume/End/New Day)
│   ├── BreakTimeline.jsx    # Visual timeline of today's breaks with live durations
│   ├── EditPanel.jsx        # Collapsible panel to retroactively edit today's times & breaks
│   ├── HistoryView.jsx      # Full-screen modal: list + inline-edit all archived sessions
│   ├── LiveStats.jsx        # Today's Tracker card (working time, remaining, expected end)
│   ├── SettingsRow.jsx      # Required shift hours input with preset buttons
│   ├── TimeInput.jsx        # Custom 24h HH:MM text input (no AM/PM)
│   └── icons/
├── hooks/
│   ├── useTheme.js          # Dark/light theme with OS detection + localStorage
│   ├── useTimer.js          # Single 1 s setInterval (returns Date.now() in ms)
│   └── useTrackerSession.js # Full session state machine + localStorage persistence
├── utils/
│   └── timeCalculations.js  # Pure calculation engine (cross-midnight aware)
├── App.jsx                  # Root layout — wires state, timer, and components
├── index.css                # Full design system (CSS custom properties, responsive)
└── main.jsx                 # Vite entry point
```

---

## 📐 Data Model

```
session {
  date:          "YYYY-MM-DD"    // local calendar date
  workStart:     ISO string | null
  workEnd:       ISO string | null
  breaks:        [{ id, start: ISO | null, end: ISO | null }]
  requiredHours: number          // 0.5 – 24
}

history: session[]               // archived sessions, newest-first
```

All timestamps are stored as **ISO 8601 strings** (e.g. `"2026-08-25T09:30:00.000Z"`). Calculations convert to milliseconds for precision; cross-midnight wraps are handled by comparing calendar dates.

```
Working Time  = Elapsed − Completed Breaks − Active Break
Elapsed       = now − workStart                   (or workEnd − workStart when done)
Remaining     = max(0, Required − Working Time)
Expected End  = workStart + Required + Completed Breaks
```

localStorage key: **`whc-tracker-v1`**

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
npm run build      # Outputs to ./dist
npm run preview    # Preview the production build locally
```

### Lint

```bash
npm run lint       # oxlint
```

---

## 🌐 Deployment

This project auto-deploys to **GitHub Pages** on every push to `main` via a GitHub Actions workflow.

```
.github/workflows/deploy.yml  →  npm ci → npm run build → deploy ./dist
```

---

## 📄 License

MIT — free to use, modify and distribute.
