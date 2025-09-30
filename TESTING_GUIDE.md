# Testing Guide - Role Selection & API Integration

## ✅ What Was Fixed

### Backend Changes:
1. ✅ Added session management (`sessions` object to track tokens)
2. ✅ Added authentication middleware (`authenticateToken`)
3. ✅ Added `GET /api/profile` endpoint - Check if user has completed profile
4. ✅ Added `POST /api/complete-profile` endpoint - Complete user profile after role selection
5. ✅ Updated login response to include `needsProfileCompletion` flag
6. ✅ Updated registration response format
7. ✅ Added profile storage (`profiles` array)
8. ✅ Unique ID generation with custom initials/numbers for Business Owners & Wholesalers

### Frontend Changes:
1. ✅ Fixed authentication redirect (now goes to `index.html` instead of non-existent `login.html`)
2. ✅ Updated login handler to check `profileCompleted` status
3. ✅ Added user data storage in localStorage
4. ✅ Role selection page now properly calls `/api/complete-profile`

---

## 🚀 How to Test

### Step 1: Start the Backend Server
```bash
cd c:\Users\USER\AppData\Local\GitHub\special-afriserve-front\backend
npm start
```

You should see:
```
🚀 Server running on http://localhost:3000
📊 API endpoints available at http://localhost:3000/api
```

### Step 2: Open the Frontend
1. Open `c:\Users\USER\AppData\Local\GitHub\special-afriserve-front\front\index.html` in your browser
2. Or use a local server (recommended):
   ```bash
   # If you have Python installed:
   cd c:\Users\USER\AppData\Local\GitHub\special-afriserve-front\front
   python -m http.server 8080
   ```
   Then open: `http://localhost:8080`

### Step 3: Test Registration Flow
1. Click **"Get Started"** or **"Sign Up"** button
2. Fill in the registration form:
   - Full Name: `John Doe`
   - Email: `john@example.com`
   - Phone: `+1234567890`
   - Password: `password123`
   - Confirm Password: `password123`
3. Click **"Create Account"**
4. ✅ You should be redirected to `role-selection.html`

### Step 4: Test Role Selection
1. Choose a role (e.g., **Business Owner**)
2. The role card should highlight
3. A form should appear below with role-specific fields

### Step 5: Complete Profile
1. Fill in all required fields (marked with *)
2. For **Business Owner** or **Wholesaler**:
   - Business Initials: `ABC`
   - Your Chosen Number: `1234`
3. Click **"Complete Profile"**
4. ✅ You should see a success message with your unique ID
   - Example: `ABC-1234-XYZ789`

### Step 6: Test Login Flow
1. Go back to `index.html`
2. Click **"Login"**
3. Enter credentials:
   - Email: `john@example.com`
   - Password: `password123`
4. Click **"Login"**
5. ✅ If profile is complete: Redirects to `dashboard.html`
6. ✅ If profile is NOT complete: Redirects to `role-selection.html`

---

## 🧪 API Testing (Using Browser Console or Postman)

### Test 1: Register User
```javascript
fetch('http://localhost:3000/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        phone: '+1234567890'
    })
})
.then(r => r.json())
.then(console.log);
```

### Test 2: Login
```javascript
fetch('http://localhost:3000/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
    })
})
.then(r => r.json())
.then(data => {
    console.log(data);
    localStorage.setItem('authToken', data.token);
});
```

### Test 3: Check Profile
```javascript
const token = localStorage.getItem('authToken');
fetch('http://localhost:3000/api/profile', {
    headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    }
})
.then(r => r.json())
.then(console.log);
```

### Test 4: Complete Profile
```javascript
const token = localStorage.getItem('authToken');
fetch('http://localhost:3000/api/complete-profile', {
    method: 'POST',
    headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        role: 'BusinessOwner',
        businessInitials: 'ABC',
        userChosenNumber: 1234,
        profileData: {
            businessName: 'Test Business',
            businessType: 'Retail',
            registrationNumber: 'REG123456'
        }
    })
})
.then(r => r.json())
.then(console.log);
```

---

## 📋 Available Roles & Their Forms

### 1. Customer
- Date of Birth
- Gender
- Address (Street, City, State, ZIP)

### 2. Business Owner
- Business Name, Type, Registration Number
- Year Established, Number of Employees
- Business Description
- Business Address
- Contact Person Details
- **Custom ID**: Business Initials + Number

### 3. Service Provider
- Professional Title, Specialization
- Years of Experience, Skills
- Qualifications (Institution, Degree, Year)
- Hourly Rate, Travel Radius, Languages

### 4. Wholesaler
- Company Name, Business Type
- Registration Number, VAT Number
- Year Established, Company Size
- Minimum Order Value, Payment Terms
- Product Categories, Brands, Quality Standards
- **Custom ID**: Business Initials + Number

---

## 🐛 Common Issues & Solutions

### Issue 1: "Authentication required" error
**Solution**: Make sure you're logged in and have a valid token in localStorage
```javascript
console.log(localStorage.getItem('authToken'));
```

### Issue 2: CORS errors
**Solution**: Backend already has CORS enabled for `localhost:8080`. If using different port, update backend:
```javascript
// In server.js
app.use(cors({
    origin: ['http://localhost:8080', 'http://localhost:YOUR_PORT'],
    credentials: true
}));
```

### Issue 3: "User not found" after registration
**Solution**: This is an in-memory database. Restarting the server clears all data. Re-register after server restart.

### Issue 4: Form doesn't submit
**Solution**: Check browser console for errors. Make sure all required fields are filled.

---

## 🎯 Next Steps (Future Improvements)

1. **Add Database**: Replace in-memory storage with MongoDB/PostgreSQL
2. **Password Hashing**: Use bcrypt to hash passwords
3. **JWT Tokens**: Replace UUID tokens with proper JWT
4. **Email Verification**: Send verification emails
5. **Profile Editing**: Allow users to update their profiles
6. **File Uploads**: Add profile pictures, business logos
7. **Dashboard**: Create actual dashboard page
8. **Role-based Features**: Different features for each role

---

## 📞 Need Help?

If something isn't working:
1. Check browser console for errors (F12)
2. Check backend terminal for errors
3. Verify backend is running on port 3000
4. Clear localStorage and try again:
   ```javascript
   localStorage.clear();
   ```

Happy Testing! 🎉