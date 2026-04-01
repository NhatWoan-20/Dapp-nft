# 🚀 Project Setup Guide

## 📖 Introduction

This document provides instructions on how to clone the project, install required dependencies, and run the project locally.

---

## 🛠 System Requirements

Before getting started, make sure you have installed:

* Node.js (recommended version >= 16)
* npm (comes with Node.js)
* Git

Check installed versions:

```bash
node -v
npm -v
git -v
```

---

## 📥 1. Clone the Repository

Open Terminal (or Git Bash) and run:

```bash
git clone <repository-url>
```

Navigate into the project folder:

```bash
cd <project-folder-name>
```

---

## 📦 2. Install Dependencies

Install all required packages:

```bash
npm install
```

Install ethers version 5.7 specifically:

```bash
npm install ethers@5.7
```

---

## ▶️ 3. Run the Project

Start the project:

```bash
npm start
```

Or if the project uses a development script:

```bash
npm run dev
```

---

## 🔧 Troubleshooting

If you encounter issues related to node_modules, try removing and reinstalling dependencies:

```bash
rm -rf node_modules package-lock.json
npm install
```

---

## ✅ Done

After completing the steps above, the project should run successfully in your local environment.

Happy coding! 🎉
