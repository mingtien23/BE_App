# Hướng dẫn Test API Tạo Tài Khoản (Account Creation)

API này dành riêng cho **ADMIN SYSTEM** để tạo user mới.

---

## 1. Bước 1: Login quyền Admin để lấy Token
Trước tiên bạn cần có Token của Admin.

- **Endpoint**: `POST http://localhost:3069/api/v1/auth/login`
- **Body**:
  ```json
  {
    "username": "adminThi",
    "password": "dinhthi1"
  }
  ```
  *(Hoặc tài khoản admin khác như `adminPMO` / `adminSep`)*

- **Response**: Copy chuỗi `accessToken` trong kết quả trả về.

---

## 2. Bước 2: Gọi API Tạo Tài Khoản
- **Endpoint**: `POST http://localhost:3069/api/v1/accounts`
- **Method**: `POST`
- **Header**:
  - `Content-Type`: `application/json`
  - `Authorization`: `Bearer <PASTE_ACCESS_TOKEN_HERE>`

### Case A: Tạo thành công (Dùng Token Admin)
**Body**:
```json
{
  "username": "user_moi_01",
  "password": "Password123",
  "email": "user01@example.com",
  "fullName": "Nhân viên Mới",
  "departmentId": "D_001",
  "roleId": "R_003"
}
```
*Note:*
- `roleId`: `R_003` thường là Staff/User (tuỳ DB của bạn).
- `departmentId`: `D_001` (tuỳ DB của bạn).

**Kết quả mong đợi (201 Created):**
```json
{
  "status": 201,
  "message": "Account created successfully"
}
```

---

### Case B: Test Lỗi Phân Quyền (Dùng Token User thường)
Thử login bằng tài khoản nhân viên (ví dụ `gv_han_1`), lấy token đó để gọi API này.

**Kết quả mong đợi (403 Forbidden):**
```json
{
  "message": "Không có quyền"
}
```

---

### Case C: Test Validate Input
Gửi thiếu trường (ví dụ thiếu `password`):
```json
{
  "username": "test_fail"
}
```

**Kết quả mong đợi (400 Bad Request):**
```json
{
  "status": 400,
  "message": "Thiếu trường bắt buộc"
}
```
