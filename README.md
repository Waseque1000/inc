# Incubator System - Frontend

A professional, minimalist administrative dashboard and student submission portal for the Incubator Management System.

## 🚀 Technologies
* **React & Vite**: Modern, ultra-fast frontend tooling.
* **Tailwind CSS**: Utility-first styling for a clean, minimalist aesthetic.
* **Lucide React**: Beautiful, consistent iconography.
* **Firebase SDK**: Handles client-side Google Authentication.
* **Axios**: Promised-based HTTP client for API communication.
* **React Router**: Declarative routing for a seamless SPA experience.

## 🛠 Features
* **Minimalist Admin Dashboard**: High-level overview of all active campaigns with key performance indicators.
* **Dynamic Submissions Grid**: A powerful, horizontally-scrolling table that automatically generates columns for every day of a campaign.
* **Hybrid Authentication**: Secure login via Google or standard administrative credentials.
* **Inline Editing**: Quick assignment of next modules and field updates directly within the tracking table.
* **Analytics View**: Visual representation of student progress and participation trends.

## 📂 Environment Variables
Create a `.env` file in the `frontend/` directory:
```env
VITE_API_URL=http://localhost:5000/api
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_id
VITE_FIREBASE_APP_ID=your_app_id
```

## 🏃 Getting Started
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:5173` in your browser.

## 🏗 Project Structure
* `/src/pages`: Main application views (Dashboard, Forms, Submissions).
* `/src/components`: Reusable UI elements and layout wrappers.
* `/src/api`: Axios configuration and interceptors.
* `/src/firebase.js`: Firebase client initialization and Auth setup.
