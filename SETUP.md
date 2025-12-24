# Setup Instructions

## Quick Start Guide

### 1. Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5000
DB_PATH=./data.db
JWT_SECRET=your-secret-key-change-in-production
SUPER_ADMIN_USERNAME=superadmin
SUPER_ADMIN_PASSWORD=superadmin123
```

**Note**: The SQLite database will be created automatically when you first run the server. No separate database installation is required!

Create a `.env` file in the `client` directory:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 3. Create Super Admin

Run the script to create the super admin:

```bash
node server/scripts/createSuperAdmin.js
```

This will create a super admin with:

- Username: `superadmin` (or from env)
- Password: `superadmin123` (or from env)

### 4. Start the Application

**Option 1: Run both together (Recommended)**

```bash
npm run dev
```

**Option 2: Run separately**

Terminal 1 (Backend):

```bash
npm run server
```

Terminal 2 (Frontend):

```bash
cd client
npm start
```

### 5. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Default Credentials

### Super Admin

- Username: `superadmin`
- Password: `superadmin123`

### Admin

- Register a new admin through the registration page
- OTP will be displayed in the console (development mode)

## Testing OTP

In development mode, the OTP is logged to the console. Check your terminal/console for the OTP code when testing registration or password reset.

## Troubleshooting

### MongoDB Connection Error

- Ensure MongoDB is running
- Check the MONGODB_URI in `.env`
- For MongoDB Atlas, ensure your IP is whitelisted

### Port Already in Use

- Change the PORT in `.env` file
- Or stop the process using the port

### Module Not Found

- Run `npm install` in both root and client directories
- Delete `node_modules` and `package-lock.json`, then reinstall

### CORS Errors

- Ensure backend is running on port 5000
- Check REACT_APP_API_URL in client/.env

## Next Steps

1. Register an admin account
2. Login as admin and add customers
3. Login as super admin to view all data
4. Test the forgot password flow

## Production Deployment

Before deploying to production:

1. Change JWT_SECRET to a strong random string
2. Set up proper OTP service (Twilio, etc.)
3. Use environment variables for all secrets
4. Enable HTTPS
5. Set up regular database backups (SQLite database file)
6. Consider migrating to PostgreSQL/MySQL for high-traffic applications
7. Add rate limiting
8. Implement proper error logging
9. Ensure database file has proper permissions and backup strategy
