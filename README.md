# ✨ WishMaster

**WishMaster** is a magical web application that lets you craft personalized, interactive wishing pages for your loved ones. Whether it's a Birthday, Anniversary, or Valentine's Day, send a unique link that blooms with animations, music, and "Liquid Glass" design.

![Project Status](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## 🌟 Features

* **🎨 4 Unique Themes:** Birthday 🎂, Anniversary 💑, Congrats 🎉, and Valentine's Day 🌺.
* **🌹 Interactive Animations:** Tap anywhere on the screen to grow realistic, animated roses that bloom and sway.
* **🎵 Background Music:** Theme-specific audio that auto-plays (with interaction fallback).
* **💎 Liquid Glass UI:** Modern, responsive "Glassmorphism" design with vibrant gradients.
* **🔒 Privacy Protection:** Optional 4-digit PIN to lock wishes.
* **📱 Fully Responsive:** Optimized for both mobile (tall flowers, compact card) and desktop.
* **⚡ Real-time Preview:** Hear the music theme before generating the link.

## 🛠️ Tech Stack

* **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
* **Language:** [TypeScript](https://www.typescriptlang.org/)
* **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
* **Animations:** [Framer Motion](https://www.framer.com/motion/)
* **Effects:** [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti)
* **Database:** [MongoDB](https://www.mongodb.com/)
* **Icons:** [Lucide React](https://lucide.dev/)
* **Notifications:** [Sonner](https://sonner.emilkowal.ski/)

## 🚀 Getting Started

Follow these steps to set up the project locally on your machine.

### Prerequisites

* Node.js (v18 or higher)
* npm or yarn
* A MongoDB Atlas account (for the database)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/rumman2004/Wish-maker-app.git](https://github.com/rumman2004/Wish-maker-app.git)
    cd wishmaster
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up Environment Variables:**
    Create a file named `.env.local` in the root directory and add the following:

    ```env
    # Database Connection
    MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/wishmaster

    # Admin Dashboard Password (Optional, default is admin123)
    NEXT_PUBLIC_ADMIN_PASSWORD=yourSecretPassword

    # App Base URL (For production)
    NEXT_PUBLIC_APP_URL=http://localhost:3000
    ```

4.  **Add Music Files:**
    Create a folder named `music` inside the `public` directory and add your MP3 files:
    * `public/music/birthday.mp3`
    * `public/music/romantic.mp3`
    * `public/music/celebration.mp3`
    * `public/music/valentine.mp3`

5.  **Run the development server:**
    ```bash
    npm run dev
    ```

6.  Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📂 Project Structure

```text
/app
 ├── /admin            # Admin dashboard to view/delete wishes
 ├── /api              # API Routes (Serverless functions)
 ├── /wish/[id]        # Dynamic Receiver Page (The magic happens here!)
 ├── layout.tsx        # Root layout
 ├── page.tsx          # Sender Page (Create a wish)
 └── globals.css       # Global styles & Tailwind directives
/public
 ├── /music            # Audio files (Must be added manually)
 └── ...               # Static assets
/lib                   # Database connection helpers

```

## 🌍 Deployment
1. The easiest way to deploy your Next.js app is to use the Vercel Platform.
2. Push your code to a GitHub repository.
3. Import the project into Vercel.
4. Add your MONGODB_URI and NEXT_PUBLIC_ADMIN_PASSWORD in the Vercel Project Settings > Environment Variables.
5. Click Deploy.

## 🤝 Contributing
Contributions, issues, and feature requests are welcome!

## 📝 License
This project is MIT licensed.