# 🧪 Health Lab UI – React + Vite Project

This is a frontend project built with **React** and **Vite** for the **Health Lab** system, designed to run on a **Raspberry Pi**. The interface displays and manages health-related data collected from various sensors.

## 🚀 Technologies Used

- ⚛️ **React** — Frontend UI library
- ⚡ **Vite** — Fast modern build tool
- 💅 **Tailwind CSS** *(optional)* — For styling
- 🍓 **Raspberry Pi** — Hosts the app and connects to sensors
- 🔗 **REST API / MQTT** — For data communication between sensors and UI

## 📁 Project Structure

```bash
.
├── node_modules/
├── public/                # Aset statis
├── src/
│   ├── components/        # Komponen UI reusable
│   │   ├── Header.tsx
│   │   ├── SensorChart.tsx
│   │   ├── Sidebar.tsx
│   │   └── SummaryCard.tsx
│   ├── context/           # React context untuk tema/global state
│   │   └── ThemeContext.tsx
│   ├── pages/             # Halaman utama aplikasi
│   │   └── Dashboard.tsx
│   ├── utils/             # Utilitas/mocking data
│   │   └── mockData.ts
│   ├── App.tsx            # Root component
│   ├── index.css          # Styling global
│   ├── main.tsx           # Entry point aplikasi
│   └── vite-env.d.ts      # Deklarasi env Vite (TypeScript)
├── .gitignore
├── index.html             # HTML utama
├── package.json           # Konfigurasi npm
├── vite.config.js         # Konfigurasi build Vite
└── eslint.config.js       # Konfigurasi linting
