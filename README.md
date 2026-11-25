# 🍚 Mess Hisab

> A modern, professional meal & expense management system for messes/hostels. Track daily meals, grocery (bazar) purchases, member deposits (joma), and auto-calculate monthly settlements — all in one clean interface.

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?style=flat&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat&logo=node.js&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-4EA94B?style=flat&logo=mongodb&logoColor=white)](https://www.mongodb.com/)

---

## 🌐 Live Demo

[https://mess-hisab-xi.vercel.app](https://mess-hisab-xi.vercel.app)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🍛 **Meal Tracker** | Record lunch/dinner per member per day (0–3 meals). Auto-calculates monthly totals. |
| 🛒 **Bazar Manager** | Log grocery purchases with amount, buyer, date & notes. Per-member share calculated automatically. |
| 💰 **Joma (Deposits)** | Track member payments/deposits with running totals per person. |
| 📊 **Hisab (Settlement)** | Auto-calculates meal rate, per-member cost, paid amount, and balance (who pays / who receives). |
| 👥 **Members** | Manage mess members, edit names, and export/import full data backups (JSON). |
| 📄 **Print / PDF** | One-click print-friendly view of the settlement report for record-keeping. |
| 💾 **Backup & Restore** | Download your entire month's data as JSON and restore it anytime. |
| ⚡ **Offline-first** | Works with localStorage fallback; syncs to MongoDB when the server is online. |

---

## 🖼️ Screenshots

> Add screenshots here:
> - Dashboard overview
> - Meal entry grid
> - Settlement report

---

## 🛠️ Tech Stack

**Frontend**
- [React 19](https://react.dev/) — UI library
- [Vite 8](https://vitejs.dev/) — Build tool & dev server
- [Tailwind CSS 3](https://tailwindcss.com/) — Styling
- [React StrictMode](https://react.dev/reference/react/StrictMode)

**Backend**
- [Node.js](https://nodejs.org/) + [Express 5](https://expressjs.com/) — API server
- [MongoDB](https://www.mongodb.com/) + [Mongoose 9](https://mongoosejs.com/) — Database & ODM
- [CORS](https://github.com/expressjs/cors), [dotenv](https://github.com/motdotla/dotenv)

**Dev Tools**
- [Oxlint](https://oxc-project.github.io/books/oxc/en/linter.html) — Fast linting
- [PostCSS](https://postcss.org/) + [Autoprefixer](https://github.com/postcss/autoprefixer) — CSS processing

## 📁 Project Structure

```
mess-hisab/
├── client/                 # Frontend (React + Vite)
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── src/
│   │   ├── main.jsx        # Entry point + ToastProvider
│   │   ├── App.jsx         # Router & layout (tabs, header, month picker)
│   │   ├── index.css       # Tailwind + custom design tokens
│   │   ├── api.js          # API client (fetch wrapper)
│   │   ├── hooks/
│   │   │   └── useLocalStorage.js
│   │   ├── context/
│   │   │   └── ToastContext.jsx
│   │   ├── utils/
│   │   │   └── format.js   # Currency & date formatters
│   │   └── components/
│   │       ├── Meal.jsx
│   │       ├── Bazar.jsx
│   │       ├── Joma.jsx
│   │       ├── Hisab.jsx
│   │       └── Members.jsx
│   └── package.json
├── server/                 # Backend (Express + MongoDB)
│   ├── index.js            # Entry point & route mounting
│   ├── .env                # MONGO_URI, PORT
│   ├── package.json
│   ├── routes/
│   │   ├── bazar.js
│   │   ├── joma.js
│   │   ├── meal.js
│   │   └── summary.js
│   └── models/
│       ├── Bazar.js
│       ├── Joma.js
│       └── Meal.js
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [MongoDB](https://www.mongodb.com/) (local or Atlas)
- npm or yarn

### 1. Clone the repository

```bash
git clone https://github.com/Pronayislam/mess-hisab.git
cd mess-hisab
```

### 2. Start the Backend (Server)

```bash
cd server
npm install
# Create a .env file (see server/.env example)
npm run dev   # http://localhost:5000
```

**`server/.env` example:**
```env
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/mess-hisab
PORT=5000
```

### 3. Start the Frontend (Client)

```bash
cd client
npm install
npm run dev   # http://localhost:5173
```

### 4. Open the App

Visit **http://localhost:5173** in your browser. The API runs on **http://localhost:5000**.

## 📖 Usage Guide

### Meals
1. Select a month from the top bar.
2. Go to **Meal 🍛**, pick a date, and set lunch/dinner (0–3) for each member.
3. Click **Save Meals**. Changes reflect instantly in the daily count table.

### Bazar (Groceries)
1. Go to **Bazar 🛒**.
2. Fill in date, buyer, amount, and optional note.
3. Click **Add Bazar**. The per-member share updates automatically.

### Joma (Deposits)
1. Go to **Joma 💰**.
2. Select the member, amount, date, and optional note.
3. Click **Record Joma**.

### Hisab (Settlement)
1. Go to **Hisab 📊**.
2. View total bazar, total meals, meal rate, and each member's balance.
3. Green = member receives money · Red = member pays money.
4. Click **Print / PDF** to export a clean report.

### Members & Backup
1. Go to **Members 👥** to rename members.
2. Use **Backup & Restore** to copy your JSON data to Notes/WhatsApp or restore from a previous backup.

## 🔌 API Reference

Base URL: `http://localhost:5000/api`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Server health check |
| `/bazar?month=YYYY-MM` | GET | List bazar entries for a month |
| `/bazar` | POST | Add a bazar entry |
| `/bazar/:id` | DELETE | Delete a bazar entry |
| `/joma?month=YYYY-MM` | GET | List joma entries for a month |
| `/joma` | POST | Add a joma entry |
| `/joma/:id` | DELETE | Delete a joma entry |
| `/meals?month=YYYY-MM` | GET | List meal records for a month |
| `/meals` | PUT | Save meal records (upsert) |
| `/summary?month=YYYY-MM` | GET | Settlement summary for a month |
| `/summary/daily?month=YYYY-MM` | GET | Daily meal counts |

## 🧪 Available Scripts

### Client (`client/`)
```bash
npm run dev     # Start dev server (http://localhost:5173)
npm run build   # Production build (outputs to dist/)
npm run preview # Preview production build locally
npm run lint    # Run oxlint
```

### Server (`server/`)
```bash
npm run dev  # Start with nodemon (auto-restart)
npm start    # Start production server
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and submission process.

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with ❤️ by [Pronay Islam](https://github.com/Pronayislam)
- Inspired by daily mess management needs in hostels and shared housing.

---

<div align="center">
  <b>Made with ❤️ for better mess management</b>
</div>