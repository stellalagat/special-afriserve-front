# Understanding and Fixing Connection Errors

## 🔴 The Errors You're Seeing

### Error 1: `net::ERR_CONNECTION_REFUSED`
```
Failed to load resource: net::ERR_CONNECTION_REFUSED
```
**Meaning:** The backend server is not running or not accessible.

### Error 2: `CORS Policy Error`
```
Access to fetch at 'http://localhost:3000/api/login' from origin 'null' has been blocked by CORS policy
```
**Meaning:** You're opening the HTML file directly from the file system instead of through a web server.

### Error 3: `Failed to fetch`
```
TypeError: Failed to fetch
```
**Meaning:** The frontend cannot connect to the backend API.

---

## 🎯 Root Causes

### Problem 1: Opening HTML File Directly ❌
When you double-click `index.html` or open it directly in a browser:
- URL looks like: `file:///C:/Users/USER/.../index.html`
- Origin is `null`
- CORS blocks all API requests
- **This will NEVER work with APIs**

### Problem 2: Backend Not Running ❌
If the backend server isn't running:
- No server listening on `http://localhost:3000`
- All API requests fail with `ERR_CONNECTION_REFUSED`

---

## ✅ THE CORRECT WAY TO RUN THE APPLICATION

You need **TWO servers running simultaneously**:

### Server 1: Backend API Server (Port 3000)
Handles all API requests (login, register, profile, etc.)

### Server 2: Frontend Web Server (Port 8080)
Serves the HTML/CSS/JS files

---

## 🚀 Step-by-Step Setup

### Step 1: Start the Backend Server

Open **Terminal/PowerShell #1**:

```powershell
cd c:\Users\USER\AppData\Local\GitHub\special-afriserve-front\backend
node server.js
```

**You should see:**
```
✅ Server running on http://localhost:3000
✅ CORS enabled for http://localhost:8080
```

**Keep this terminal open!** Don't close it.

---

### Step 2: Start the Frontend Server

Open **Terminal/PowerShell #2** (new window):

```powershell
cd c:\Users\USER\AppData\Local\GitHub\special-afriserve-front\front
python -m http.server 8080
```

**You should see:**
```
Serving HTTP on :: port 8080 (http://[::]:8080/) ...
```

**Keep this terminal open too!**

---

### Step 3: Open the Application in Browser

**DO NOT** double-click `index.html`!

Instead, open your browser and go to:
```
http://localhost:8080/index.html
```

Or simply:
```
http://localhost:8080
```

---

## 🎯 How to Verify It's Working

### Check 1: Backend is Running
Open browser and go to:
```
http://localhost:3000/api/health
```

**Expected response:**
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

### Check 2: Frontend is Accessible
Open browser and go to:
```
http://localhost:8080
```

**Expected:** You should see the Africonnect homepage

### Check 3: API Connection Works
1. Open the page at `http://localhost:8080`
2. Open browser DevTools (F12)
3. Go to Console tab
4. You should see **NO CORS errors**
5. Try to register or login - it should work!

---

## 🔧 Troubleshooting

### Issue: "Port 3000 is already in use"
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution:** The backend is already running! Just use it.

To find and kill the process:
```powershell
# Find the process
netstat -ano | findstr :3000

# Kill it (replace PID with the actual process ID)
taskkill /PID <PID> /F
```

### Issue: "Port 8080 is already in use"

**Solution:** Use a different port:
```powershell
python -m http.server 8081
```

Then update the backend CORS to allow port 8081:
```javascript
// In backend/server.js
app.use(cors({
    origin: ['http://localhost:8080', 'http://localhost:8081', 'http://127.0.0.1:8080'],
    credentials: true
}));
```

### Issue: "Python is not recognized"

**Solution:** Use Node.js instead:
```powershell
# Install http-server globally (one time only)
npm install -g http-server

# Run the server
cd c:\Users\USER\AppData\Local\GitHub\special-afriserve-front\front
http-server -p 8080
```

### Issue: Still seeing CORS errors

**Check these:**
1. ✅ Are you accessing via `http://localhost:8080` (not `file:///`)?
2. ✅ Is the backend running on port 3000?
3. ✅ Does the backend CORS config include `http://localhost:8080`?
4. ✅ Are you using the correct port number?

---

## 📊 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         BROWSER                              │
│                                                              │
│  http://localhost:8080/index.html                           │
│  ┌────────────────────────────────────────────────┐        │
│  │  Frontend (HTML/CSS/JavaScript)                │        │
│  │  - User Interface                               │        │
│  │  - Forms (Login, Register, Contact)            │        │
│  │  - API Calls using fetch()                     │        │
│  └────────────────────────────────────────────────┘        │
│                          │                                   │
│                          │ HTTP Requests                     │
│                          ▼                                   │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ fetch('http://localhost:3000/api/...')
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND SERVER                            │
│                                                              │
│  http://localhost:3000                                      │
│  ┌────────────────────────────────────────────────┐        │
│  │  Express.js API Server                         │        │
│  │  - /api/register                                │        │
│  │  - /api/login                                   │        │
│  │  - /api/profile                                 │        │
│  │  - /api/complete-profile                        │        │
│  │  - /api/roles                                   │        │
│  │  - /api/health                                  │        │
│  └────────────────────────────────────────────────┘        │
│                          │                                   │
│                          ▼                                   │
│  ┌────────────────────────────────────────────────┐        │
│  │  In-Memory Storage                             │        │
│  │  - users[]                                      │        │
│  │  - profiles[]                                   │        │
│  │  - sessions{}                                   │        │
│  └────────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎓 Why This Happens

### CORS (Cross-Origin Resource Sharing)
Browsers have a security feature that blocks requests from one origin to another:

**Same Origin (✅ Allowed):**
- `http://localhost:8080` → `http://localhost:8080/api/data`

**Different Origin (❌ Blocked by default):**
- `http://localhost:8080` → `http://localhost:3000/api/data`
- `file:///C:/Users/...` → `http://localhost:3000/api/data`

**Solution:** The backend must explicitly allow the frontend origin using CORS headers.

### File Protocol Limitations
When you open HTML directly:
- Protocol: `file://`
- Origin: `null`
- **Cannot make HTTP requests** to external servers
- **Cannot use modern web APIs** properly
- **Not suitable for development or production**

---

## 📝 Quick Reference

### Start Both Servers (PowerShell)

**Terminal 1 - Backend:**
```powershell
cd c:\Users\USER\AppData\Local\GitHub\special-afriserve-front\backend
node server.js
```

**Terminal 2 - Frontend:**
```powershell
cd c:\Users\USER\AppData\Local\GitHub\special-afriserve-front\front
python -m http.server 8080
```

**Browser:**
```
http://localhost:8080
```

### Stop Servers
Press `Ctrl + C` in each terminal window

---

## ✅ Current Status

I've already started both servers for you:

- ✅ **Backend:** Running on `http://localhost:3000`
- ✅ **Frontend:** Running on `http://localhost:8080`

**Now open your browser and go to:**
```
http://localhost:8080
```

**Everything should work perfectly!** 🎉

---

## 🔮 Next Steps

Once you verify everything works:

1. **Test Registration:**
   - Go to `http://localhost:8080`
   - Click "Get Started"
   - Fill out the registration form
   - Select a role
   - Submit

2. **Test Login:**
   - Click "Login"
   - Enter your credentials
   - Should redirect to role selection or dashboard

3. **Test Contact Form:**
   - Scroll to contact section
   - Fill out the form
   - Submit
   - Should see success message (no URL pollution!)

---

## 💡 Pro Tips

1. **Always use `http://localhost:8080`** - Never open HTML files directly
2. **Keep both terminals open** - Both servers must run simultaneously
3. **Check DevTools Console** - Press F12 to see any errors
4. **Clear browser cache** - If you see old behavior, clear cache (Ctrl+Shift+Delete)
5. **Use incognito mode** - For testing without cache issues

---

## 🆘 Still Having Issues?

If you still see errors after following these steps:

1. **Take a screenshot** of the browser console (F12 → Console tab)
2. **Check both terminal windows** - Are both servers running?
3. **Verify the URL** - Are you using `http://localhost:8080`?
4. **Restart both servers** - Stop (Ctrl+C) and start again
5. **Try a different browser** - Chrome, Firefox, or Edge

---

**Remember:** The key is to access the application via `http://localhost:8080`, NOT by opening the HTML file directly!