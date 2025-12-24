# Quick Start Guide

## ✅ Setup Complete!

Your Data Management System is now ready to use with SQLite database and merged frontend/backend setup.

## 🚀 Starting the Application

### Option 1: Run Both Frontend and Backend Together (Recommended)

```bash
npm run dev
```

or

```bash
npm start
```

This will start:

- **Backend Server**: http://localhost:5000
- **Frontend App**: http://localhost:3000

### Option 2: Run Separately

**Terminal 1 - Backend:**

```bash
npm run server
```

**Terminal 2 - Frontend:**

```bash
npm run client
```

## 📋 What's Been Done

✅ **SQLite Database** - Converted from MongoDB to SQLite (no separate database server needed)
✅ **Super Admin Created** - Username: `superadmin`, Password: `superadmin123`
✅ **Dependencies Installed** - All backend and frontend packages installed
✅ **Database Initialized** - Tables created automatically
✅ **Merged Setup** - Single command to run both frontend and backend

## 🔑 Default Credentials

### Super Admin

- **Username**: `superadmin`
- **Password**: `superadmin123`

### Admin

- Register a new admin through the web interface at `/admin/register`

## 📍 Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/api/health

## 🎯 Next Steps

1. **Start the application**: `npm run dev`
2. **Open browser**: Navigate to http://localhost:3000
3. **Login as Super Admin** or **Register as Admin**
4. **Start managing customers!**

## 📝 Important Notes

- The SQLite database file (`data.db`) is created automatically in the project root
- OTP codes are displayed in the console during development
- All data persists in the SQLite database file
- To reset the database, delete `data.db` and restart the server

## 🛠️ Troubleshooting

### Port Already in Use

- Change `PORT` in `.env` file
- Or stop the process using the port

### Database Errors

- Delete `data.db` file and restart
- Check file permissions

### Module Not Found

- Run `npm install` in root directory
- Run `npm install` in `client` directory

## 📦 Project Structure

```
Data Management/
├── server/           # Backend (Express + SQLite)
│   ├── database/     # Database setup
│   ├── models/       # Data models
│   ├── routes/       # API routes
│   └── middleware/  # Auth middleware
├── client/           # Frontend (React)
│   └── src/         # React components
└── data.db           # SQLite database (auto-created)
```

Enjoy your Data Management System! 🎉
