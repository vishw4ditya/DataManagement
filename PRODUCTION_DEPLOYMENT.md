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

## 7. Nginx Configuration Example

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
