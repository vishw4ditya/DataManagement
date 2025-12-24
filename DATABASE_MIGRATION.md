# SQLite Database Migration

This project has been migrated from MongoDB to SQLite for easier setup and deployment.

## Database Structure

The SQLite database (`data.db`) contains the following tables:

### 1. super_admins

- `id` (INTEGER PRIMARY KEY)
- `username` (TEXT UNIQUE)
- `password` (TEXT - hashed)
- `created_at` (DATETIME)
- `updated_at` (DATETIME)

### 2. admins

- `id` (INTEGER PRIMARY KEY)
- `phone_number` (TEXT UNIQUE)
- `name` (TEXT)
- `password` (TEXT - hashed)
- `is_verified` (INTEGER - 0 or 1)
- `created_at` (DATETIME)
- `updated_at` (DATETIME)

### 3. customers

- `id` (INTEGER PRIMARY KEY)
- `name` (TEXT)
- `phone_number` (TEXT)
- `latitude` (REAL)
- `longitude` (REAL)
- `address` (TEXT)
- `admin_id` (INTEGER - Foreign Key to admins.id)
- `visit_count` (INTEGER)
- `last_visited` (DATETIME)
- `created_at` (DATETIME)
- `updated_at` (DATETIME)
- UNIQUE constraint on (phone_number, admin_id)

## Database Location

By default, the database file is created at `./data.db` in the project root.

You can customize the location by setting the `DB_PATH` environment variable:

```env
DB_PATH=./data/database.db
```

## Automatic Initialization

The database and all tables are automatically created when the server starts for the first time. No manual setup is required!

## Key Features

1. **Foreign Key Constraints**: Enabled for referential integrity
2. **Indexes**: Created on frequently queried columns
3. **Unique Constraints**: Phone numbers are unique per admin
4. **Auto-increment IDs**: All tables use INTEGER PRIMARY KEY AUTOINCREMENT

## Backup

To backup your database, simply copy the `data.db` file:

```bash
cp data.db data.db.backup
```

## Migration from MongoDB

If you had a MongoDB database, you would need to export the data and import it into SQLite. However, since this is a fresh implementation, the database starts empty and you'll need to:

1. Create the super admin: `node server/scripts/createSuperAdmin.js`
2. Register new admins through the web interface
3. Add customers through the admin dashboard

## Advantages of SQLite

- ✅ No separate database server required
- ✅ Easy to backup (just copy the file)
- ✅ Perfect for small to medium applications
- ✅ Zero configuration
- ✅ Fast and reliable
- ✅ ACID compliant

## Production Considerations

For high-traffic applications, consider migrating to:

- PostgreSQL
- MySQL
- MariaDB

The model structure is designed to be easily portable to other SQL databases.
