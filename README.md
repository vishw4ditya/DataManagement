# Data Management System

A comprehensive admin and customer management system with OTP verification, map integration, and visit tracking.

## Features

### Admin Features

- **Registration**: Register by phone number with OTP verification
- **Login**: Login using phone number and password
- **Password Reset**: Forgot password flow with OTP verification
- **Customer Management**: Add customers with map location, phone number, and name
- **Visit Tracking**: Automatically tracks visit count when same customer is added multiple times

### Super Admin Features

- **Login**: Login using username and password
- **Admin Management**: View all admins and their statistics
- **Customer Overview**: View all customers from all admins
- **Detailed View**: View individual admin details with their customers

## Tech Stack

### Backend

- Node.js
- Express.js
- SQLite Database (better-sqlite3)
- JWT Authentication
- bcryptjs for password hashing
- OTP Service (mock implementation, ready for Twilio integration)

### Frontend

- React
- React Router
- Axios
- Google Maps API (for map integration)
- Modern CSS with gradient design

## Installation

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- SQLite (included with better-sqlite3, no separate installation needed)

### Setup Steps

1. **Install Backend Dependencies**

   ```bash
   npm install
   ```

2. **Install Frontend Dependencies**

   ```bash
   cd client
   npm install
   cd ..
   ```

3. **Environment Variables**
   Create a `.env` file in the root directory:

   ```env
   PORT=5000
   DB_PATH=./data.db
   JWT_SECRET=your-secret-key-change-in-production
   SUPER_ADMIN_USERNAME=superadmin
   SUPER_ADMIN_PASSWORD=superadmin123
   ```

   For the frontend, create a `.env` file in the `client` directory:

   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   ```

4. **Create Super Admin**

   ```bash
   node server/scripts/createSuperAdmin.js
   ```

5. **Start the Application**

   **Option 1: Run both server and client together**

   ```bash
   npm run dev
   ```

   **Option 2: Run separately**

   ```bash
   # Terminal 1 - Backend
   npm run server

   # Terminal 2 - Frontend
   npm run client
   ```

## Usage

### Admin Registration

1. Navigate to `/admin/register`
2. Enter phone number and click "Send OTP"
3. Enter the OTP (check console for development OTP)
4. Fill in name and password
5. Complete registration

### Admin Login

1. Navigate to `/admin/login`
2. Enter phone number and password
3. Access dashboard to manage customers

### Forgot Password

1. Click "Forgot Password" on login page
2. Enter registered phone number
3. Verify OTP
4. Set new password

### Super Admin Login

1. Navigate to `/super-admin/login`
2. Use default credentials:
   - Username: `superadmin`
   - Password: `superadmin123`
3. View all admins and customers

### Adding Customers

1. Login as admin
2. Click "Add Customer"
3. Fill in customer details
4. Click on map to select location (or enter coordinates manually)
5. Submit form

**Note**: If the same customer (same phone number) is added again, the visit count will automatically increment.

## API Endpoints

### Authentication

- `POST /api/auth/send-otp` - Send OTP for registration
- `POST /api/auth/register` - Register admin with OTP
- `POST /api/auth/login` - Admin login
- `POST /api/auth/forgot-password/send-otp` - Send OTP for password reset
- `POST /api/auth/forgot-password/reset` - Reset password with OTP

### Super Admin

- `POST /api/super-admin/login` - Super admin login
- `GET /api/super-admin/admins` - Get all admins
- `GET /api/super-admin/customers` - Get all customers
- `GET /api/super-admin/admins/:adminId` - Get admin details

### Customer Management

- `POST /api/customer/add` - Add customer (Admin only)
- `GET /api/customer/list` - Get all customers (Admin only)
- `GET /api/customer/:id` - Get customer details
- `PUT /api/customer/:id` - Update customer
- `DELETE /api/customer/:id` - Delete customer

## Production Considerations

1. **OTP Service**: Replace mock OTP service with Twilio or similar SMS service
2. **Environment Variables**: Never commit `.env` files
3. **JWT Secret**: Use a strong, random secret in production
4. **Database**: SQLite database file will be created automatically. For production, consider:
   - Regular backups of the database file
   - Using a more robust database (PostgreSQL, MySQL) for high-traffic applications
5. **HTTPS**: Always use HTTPS in production
6. **Rate Limiting**: Implement rate limiting for OTP requests
7. **Error Handling**: Add comprehensive error handling and logging
8. **Database Path**: Ensure the database directory has proper write permissions

## Development Notes

- OTP is logged to console in development mode
- Google Maps API key is optional for basic functionality
- Visit count increments automatically when duplicate customer is added

## License

ISC
