# MongoDB Setup Guide for Help Desk Portal

## Overview
This project now uses MongoDB with Mongoose as the database layer instead of plain text files. This provides better scalability, data integrity, and query performance.

## Files Modified/Created

### New Files:
- `.env` - Environment configuration (MongoDB URI placeholder)
- `models/User.js` - Mongoose schema for users
- `models/Ticket.js` - Mongoose schema for tickets
- `models/Session.js` - Mongoose schema for sessions

### Updated Files:
- `lib/db.js` - Replaced with MongoDB/Mongoose implementation
- `lib/auth.js` - Updated for async session operations with in-memory caching
- `routes/auth.js` - Updated to use async database operations
- `routes/tickets.js` - Updated to use async database operations
- `routes/export.js` - Updated to use async database operations
- `index.js` - Updated server startup for async MongoDB initialization
- `package.json` - Added `mongoose` and `dotenv` dependencies

## Prerequisites

### 1. Install MongoDB
You have several options:

**Option A: Local MongoDB Installation**
- **Windows**: Download from [mongodb.com](https://www.mongodb.com/try/download/community)
- **Mac**: `brew install mongodb-community`
- **Linux**: Follow [MongoDB installation guide](https://docs.mongodb.com/manual/installation/)

**Option B: MongoDB Atlas (Cloud)**
- Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
- Create a free account
- Create a cluster
- Get the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/helpdesk-db`)

## Configuration

### 1. Update .env File
Open `helpdesk-server/.env` and add your MongoDB connection string:

**For Local MongoDB:**
```env
MONGODB_URI=mongodb://localhost:27017/helpdesk-db
PORT=4000
NODE_ENV=development
```

**For MongoDB Atlas (Cloud):**
```env
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/helpdesk-db?retryWrites=true&w=majority
PORT=4000
NODE_ENV=development
```

### 2. Install Dependencies
```bash
cd helpdesk-server
npm install
```

This will install:
- `mongoose@^8.0.0` - MongoDB ODM (Object Data Modeling)
- `dotenv@^16.0.0` - Environment variable loader

## Running the Application

### First Time Setup:
```bash
cd helpdesk-server
npm install
npm start
```

### Subsequent Runs:
**Option 1: Run both servers manually**
```bash
# Terminal 1 - Backend
cd helpdesk-server
npm start

# Terminal 2 - Frontend
cd helpdesk-app
npm run dev
```

**Option 2: Use the start script (Windows)**
```bash
# Run from project root
start.bat
```

**Option 3: Use the start script (Mac/Linux)**
```bash
./start.sh
```

## MongoDB Collections

The following collections are automatically created:

### 1. **users** - User accounts and staff directory
```json
{
  "id": 1,
  "employeeId": "19221160",
  "name": "Mughees Khalid",
  "email": "mughees@transsion.com",
  "passwordHash": "salt:hash",
  "role": "admin",
  "department": "IT",
  "createdAt": "2026-01-01T00:00:00.000Z"
}
```

### 2. **tickets** - Help desk tickets
```json
{
  "id": 1,
  "title": "Cannot login to system",
  "description": "...",
  "category": "Technical Support",
  "requester": "John Doe",
  "requesterEmail": "john@transsion.com",
  "assignee": "Mughees Khalid",
  "priority": "Urgent",
  "status": "In Progress",
  "resolutionNotes": null,
  "adminRemarks": "Working on it",
  "adminRemarksBy": "Mughees Khalid",
  "adminRemarksAt": "2026-01-01T12:00:00.000Z",
  "createdAt": "2026-01-01T10:00:00.000Z",
  "updatedAt": "2026-01-01T12:00:00.000Z"
}
```

### 3. **sessions** - Active login sessions (auto-expires after 7 days)
```json
{
  "token": "abcd1234...",
  "userId": 1,
  "createdAt": "2026-01-01T00:00:00.000Z"
}
```

## Default Admin Account

A default admin account is automatically created on first startup:
- **Employee ID**: 19222951
- **Name**: Muhammad Abubakar
- **Email**: m.abubakar@transsion.com
- **Password**: Abubakar1921@
- **Role**: admin

## Session Management

Sessions are now handled with:
1. **Persistent Storage**: All sessions stored in MongoDB
2. **In-Memory Cache**: Active sessions cached for faster lookups
3. **Auto-Expiration**: Sessions automatically deleted after 7 days
4. **Backward Compatibility**: Same API, transparent upgrade from file-based storage

## Troubleshooting

### Connection Failed: "MongoDB URI not configured"
**Solution**: Add `MONGODB_URI` to `.env` file

### "Failed to connect to MongoDB"
**Possible causes**:
1. MongoDB server not running (local installation)
2. Wrong connection string
3. Network connectivity issue
4. MongoDB server credentials incorrect (Atlas)
5. IP whitelist not configured (Atlas)

**Solution**:
- Test connection: `mongodb://localhost:27017/test`
- For Atlas, ensure your IP is whitelisted in Security > Network Access
- Verify username and password are URL-encoded if they contain special characters

### "Cannot read property 'userId' of undefined"
**Solution**: Make sure `initSessionCache()` is called in `index.js`

### Performance Issues
**Solutions**:
- Ensure MongoDB indexes are created (checked automatically on startup)
- Check MongoDB connection pooling settings
- Monitor database size and archive old tickets if needed

## Database Backup and Restore

### MongoDB Atlas (Cloud):
- Automatic daily backups included
- Manual backups available in Atlas console
- Snapshot and restore features available

### Local MongoDB:
```bash
# Backup
mongodump --db helpdesk-db --out ./backup

# Restore
mongorestore --db helpdesk-db ./backup/helpdesk-db
```

## Migrating from Text Files to MongoDB

To migrate existing data from the old `.txt` files:

1. **Place old data files** in `helpdesk-server/data/`:
   - `users.txt`
   - `tickets.txt`
   - `sessions.txt`

2. **Run migration** (manually call the import logic)
   - The database layer will read old text files if they exist
   - Gradually migrate by running imports during off-hours

3. **Verify data** in MongoDB:
   ```bash
   mongosh helpdesk-db
   > db.users.find()
   > db.tickets.find()
   > db.sessions.find()
   ```

## Performance Optimization Tips

1. **Add Indexes** (auto-created on startup):
   - User by `employeeId`, `email`
   - Ticket by `status`, `requester`, `assignee`
   - Session by `token` and `createdAt`

2. **Connection Pooling**:
   - Configured to max 10 connections by default
   - Adjust in `lib/db.js` if needed

3. **Query Optimization**:
   - Sessions use `.lean()` for read-only queries
   - Compound indexes for common filter combinations

## Getting Help

### MongoDB Documentation:
- [Mongoose Docs](https://mongoosejs.com)
- [MongoDB Manual](https://docs.mongodb.com/manual/)
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com/)

### Common Commands:
```bash
# Check MongoDB version
mongod --version

# Start MongoDB (local)
mongod

# Connect to MongoDB shell
mongosh

# View help desk database
mongosh helpdesk-db
```

## Next Steps

1. ✅ Install MongoDB or create Atlas account
2. ✅ Add `MONGODB_URI` to `.env`
3. ✅ Run `npm install` in `helpdesk-server`
4. ✅ Start the application
5. ✅ Test login with default admin credentials
6. ✅ Monitor logs for any connection issues

---

**Version**: 1.0  
**Last Updated**: 2026-09-07  
**MongoDB Driver**: Mongoose 8.0.0
