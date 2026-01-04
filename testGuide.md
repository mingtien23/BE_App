Hướng dẫn Test API Login & Dashboard Summary
Endpoint: POST http://localhost:3069/api/v1/auth/login Content-Type: application/json

Dưới đây là 3 trường hợp test tương ứng với 3 Role để kiểm tra logic Dashboard đã build.

1. Test Case: ADMIN / PMO (Global Scope)
Input JSON:

{
    "username": "admin_user", 
    "password": "your_password"
}
(Thay username/password bằng tài khoản Admin thực tế trong DB của bạn)

Mong đợi (Expected Output):

role: Phải chứa chữ "ADMIN" hoặc "PMO".
scope: "global".
projects:
total: Tổng số dự án trong toàn bộ bảng Project.
members:
total: Tổng số member trong toàn bộ hệ thống.
tasks: total là toàn bộ task.
2. Test Case: LEADER / MANAGER (Department Scope)
Input JSON:

{
    "username": "manager_user", 
    "password": "your_password"
}
Mong đợi (Expected Output):

role: Phải chứa chữ "MANAGER" hoặc "LEADER".
scope: "department".
projects:
total: Chỉ đếm project thuộc Department của user này (D_ID).
members:
total: Chỉ đếm member thuộc Department của user này.
tasks: Chỉ đếm task thuộc các project của Department đó.
3. Test Case: STAFF (Personal Scope)
Input JSON:

{
    "username": "staff_user", 
    "password": "your_password"
}
Mong đợi (Expected Output):

role: User thường / Staff.
scope: "personal".
projects:
total: 0 (Staff không quan tâm tổng project).
members:
total: 0.
tasks:
total: Chỉ đếm task được assign trực tiếp cho Member này (Assigned_ID_M_ID).
me:
assignedTasks: Số task cá nhân.
pendingTasks: Số task đang pending của cá nhân.
Note
Dashboard Summary sẽ nằm trực tiếp trong data của response login, cùng cấp với tokens.

{
  "status": 200,
  "data": {
    "role": "...",
    "scope": "...",
    "projects": { ... },
    "tokens": { "accessToken": "...", "refreshToken": "..." }
  }
}