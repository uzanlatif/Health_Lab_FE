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
├── public/           # Static assets
├── src/
│   ├── assets/       # Images, icons, etc.
│   ├── components/   # Reusable React components
│   ├── pages/        # Main page components
│   ├── services/     # API or sensor communication logic
│   ├── App.jsx
│   └── main.jsx
├── .gitignore
├── index.html
├── package.json
└── vite.config.js
