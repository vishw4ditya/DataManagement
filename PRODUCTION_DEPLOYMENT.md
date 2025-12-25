# Production Deployment Guide 🚀

This document outlines the steps to deploy the Data Management System in a production environment.

## 1. Environment Configuration

Create a `.env` file in the project root with the following variables:

```env
# Server
PORT=5000
NODE_ENV=production

# Security
JWT_SECRET=your_very_secure_random_secret_key_here
ALLOWED_ORIGINS=https://your-domain.com

# Twilio (SMS Alerts)
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=your_twilio_number
```

## 2. Frontend Build

Build the React frontend for production:

```bash
cd client
npm install
npm run build
```

This will create a `client/build` folder that the backend will serve automatically when `NODE_ENV=production`.

## 3. Server Setup

Install backend dependencies:

```bash
npm install --production
```

## 4. Initial Super Admin

Before starting, create at least one super admin:

```bash
node server/scripts/createSuperAdmin.js
```

## 5. Running the App

It is recommended to use a process manager like **PM2**:

```bash
# Install PM2
npm install -g pm2

# Start the application
pm2 start server/index.js --name "data-management-api"

# Save PM2 list for auto-restart
pm2 save
pm2 startup
```

## 6. Security Checklist

- [ ] Ensure `JWT_SECRET` is complex and unique.
- [ ] Set `ALLOWED_ORIGINS` to your actual domain.
- [ ] Use a reverse proxy (like Nginx) for HTTPS.
- [ ] Configure a firewall to only allow ports 80, 443, and SSH.
- [ ] Regularly backup the `data.db` file.

## 8. Render Deployment (Special Instructions)

### Persistent Data (SQLite)

Render's filesystem is ephemeral on the **Free plan**, meaning your database will be reset every time the server restarts.

To keep your data permanently:

1.  Upgrade to a **Starter** plan on Render.
2.  Go to your service settings -> **Disks**.
3.  Add a Disk with:
    - **Name**: `data-storage`
    - **Mount Path**: `/opt/render/project/src/data`
4.  The application is already configured to use `/opt/render/project/src/data/database.sqlite`.

### Deployment Settings

- **Build Command**: `npm run build`
- **Start Command**: `node server/index.js`
- **Environment Variables**: Add all variables from `.env.example`.
