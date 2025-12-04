# User Registration API

## Endpoint
```
POST /api/auth/register
```

## Request Body

### Minimal Registration (Student)
```json
{
  "username": "2312999",
  "password": "password123",
  "name": "Nguyễn Văn A"
}
```

### Full Registration (Student)
```json
{
  "username": "2312999",
  "password": "password123",
  "name": "Nguyễn Văn A",
  "email": "nguyenvana@hcmut.edu.vn",
  "mssv": "2312999",
  "role": "member"
}
```

### Register as Tutor
```json
{
  "username": "tutor_new",
  "password": "password123",
  "name": "TS. Nguyễn Văn B",
  "email": "tutorb@hcmut.edu.vn",
  "mssv": "T9999",
  "role": "tutor"
}
```

## Required Fields
- ✅ `username` (string, min 1 char) - Must be unique
- ✅ `password` (string, min 6 chars)
- ✅ `name` (string, min 1 char)

## Optional Fields
- `email` (string) - Must be unique if provided, defaults to `{username}@hcmut.edu.vn`
- `mssv` (string) - Defaults to username
- `role` (string) - 'member' or 'tutor' (defaults to 'member', cannot register as 'admin')

## Default Values (Auto-assigned)
- `khoa`: "Khoa Khoa học và Kĩ thuật Máy tính"
- `chuyenNganh`: "Công nghệ phần mềm"
- `avatar`: "/avatars/default.png"
- `skills`: []
- `status`: "active"
- `settings`: `{emailNotif: true, appNotif: true, publicProfile: false, allowContact: true}`

## Success Response (201 Created)
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid-here",
      "username": "2312999",
      "role": "member",
      "name": "Nguyễn Văn A",
      "email": "2312999@hcmut.edu.vn",
      "mssv": "2312999",
      "khoa": "Khoa Khoa học và Kĩ thuật Máy tính",
      "chuyenNganh": "Công nghệ phần mềm",
      "avatar": "/avatars/default.png",
      "skills": [],
      "settings": {...},
      "devices": [],
      "status": "active",
      "created_at": "2025-12-02T..."
    },
    "message": "Đăng ký thành công"
  }
}
```

Note: User is automatically logged in after successful registration (receives JWT token).

## Error Responses

### 400 Bad Request - Missing Fields
```json
{
  "success": false,
  "error": {
    "code": "INVALID_INPUT",
    "message": "Username và mật khẩu là bắt buộc"
  }
}
```

### 400 Bad Request - Password Too Short
```json
{
  "success": false,
  "error": {
    "code": "INVALID_PASSWORD",
    "message": "Mật khẩu phải có ít nhất 6 ký tự"
  }
}
```

### 409 Conflict - Username Exists
```json
{
  "success": false,
  "error": {
    "code": "DUPLICATE_USERNAME",
    "message": "Username đã tồn tại"
  }
}
```

### 409 Conflict - Email Exists
```json
{
  "success": false,
  "error": {
    "code": "DUPLICATE_EMAIL",
    "message": "Email đã được sử dụng"
  }
}
```

### 500 Server Error
```json
{
  "success": false,
  "error": {
    "code": "SERVER_ERROR",
    "message": "Đăng ký thất bại"
  }
}
```

## cURL Examples

### Register Student
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"2313001\",\"password\":\"demo123\",\"name\":\"Trần Thị B\"}"
```

### Register Tutor
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"tutor_new\",\"password\":\"tutor123\",\"name\":\"TS. Lê Văn C\",\"role\":\"tutor\",\"email\":\"levanc@hcmut.edu.vn\"}"
```

### Register with Full Info
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"2313002\",\"password\":\"secure123\",\"name\":\"Phạm Văn D\",\"email\":\"phamvand@hcmut.edu.vn\",\"mssv\":\"2313002\",\"role\":\"member\"}"
```

## JavaScript/Fetch Example

```javascript
// Frontend registration function
async function registerUser(userData) {
  try {
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const result = await response.json();

    if (result.success) {
      // Save token to localStorage
      localStorage.setItem('token', result.data.token);
      localStorage.setItem('user', JSON.stringify(result.data.user));
      
      console.log('Registration successful:', result.data.message);
      return result.data;
    } else {
      console.error('Registration failed:', result.error.message);
      throw new Error(result.error.message);
    }
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
}

// Usage
registerUser({
  username: '2313003',
  password: 'mypassword',
  name: 'Nguyễn Văn E',
  email: 'nguyenvane@hcmut.edu.vn',
  role: 'member'
});
```

## Security Notes

⚠️ **Important for Production:**
1. Password is currently stored as plain text - implement hashing (bcrypt, argon2)
2. Add email verification
3. Add CAPTCHA to prevent automated registrations
4. Implement rate limiting
5. Add stronger password requirements
6. Consider username format validation (e.g., MSSV pattern)
7. Sanitize all inputs to prevent SQL injection

## Validation Rules

- ✅ Username uniqueness checked
- ✅ Email uniqueness checked (if provided)
- ✅ Password minimum 6 characters
- ✅ Name is required and non-empty
- ✅ Role restricted to 'member' or 'tutor' (no admin registration)
- ✅ Automatic sanitization (trim whitespace)

## Features

✨ **Automatic Login**: User receives JWT token immediately after registration
✨ **Default Values**: Sensible defaults for optional fields
✨ **Role-based**: Can register as student (member) or tutor
✨ **Database**: User data persisted to PostgreSQL
✨ **Validation**: Comprehensive input validation
✨ **Error Handling**: Clear error messages in Vietnamese
