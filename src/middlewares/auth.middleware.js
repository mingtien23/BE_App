// src/middlewares/auth.middleware.js
import jwt from "jsonwebtoken";
import { ACCESS_TOKEN_SECRET } from "../common/constant/app.constant.js";
import prisma from "../common/prisma/init.prisma.js";

export const authMiddleware = {
  // verifyToken giữ như cũ, chỉ nhắc lại cho đầy đủ
  verifyToken: async (req, res, next) => {
    try {
      const authHeader =
        req.headers.authorization || req.headers.Authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Thiếu token" });
      }

      const token = authHeader.split(" ")[1];
      if (!token) {
        return res.status(401).json({ message: "Token không hợp lệ" });
      }

      console.log("VERIFY TOKEN RAW:", token);

      const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
      console.log("DECODED JWT:", decoded);

      const { A_ID } = decoded;

      const acc = await prisma.account.findUnique({
        where: { A_ID: A_ID },
        include: {
          Role: true,
          Member: true,
        },
      });

      if (!acc || acc.IsDeleted === true) {
        return res.status(404).json({ message: "Tài khoản không tồn tại" });
      }

      req.user = {
        A_ID: acc.A_ID,
        R_ID: acc.R_ID,
        R_Name: acc.Role?.R_Name,
        M_ID: acc.M_ID,
        D_ID: acc.Member?.D_ID || null,
      };

      return next();
    } catch (e) {
      console.error("JWT VERIFY ERROR:", e);
      if (e.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Token hết hạn" });
      }
      return res.status(401).json({ message: "Token không hợp lệ" });
    }
  },

  // cho tiện, vẫn giữ isAdmin
  isAdmin: (req, res, next) => {
    if (req.user?.R_Name?.toLowerCase() === "admin" || req.user?.R_ID === "R_001") {
      return next();
    }
    return res.status(403).json({ message: "Không có quyền" });
  },

  // Authorize theo permissionKey
  authorize:
    (required) =>
    (req, res, next) => {
      const roleName = (req.user?.R_Name || "").toLowerCase();
      const roleId = req.user?.R_ID;

      if (!roleId) {
        return res.status(403).json({ message: "Không có quyền" });
      }

      // admin (R_001) full quyền
      if (roleId === "R_001" || roleName === "admin") {
        return next();
      }

      // Map role -> list permission
      const rolePermissions = {
        admin: [
    "DEPARTMENT_LIST",
    "DEPARTMENT_CREATE",
    "DEPARTMENT_UPDATE",
    "DEPARTMENT_DELETE",
    "ACCOUNT_CREATE",
    "ACCOUNT_LIST",
    "ACCOUNT_STATUS",
    "ACCOUNT_DELETE",
  ],
        // system: kỹ thuật
        system: [
          "DEPARTMENT_LIST",
          "DEPARTMENT_CREATE",
          "DEPARTMENT_UPDATE",
          "DEPARTMENT_DELETE",
          "ACCOUNT_CREATE",
          "ACCOUNT_LIST",
          "ACCOUNT_STATUS",
          "ACCOUNT_DELETE",
        ],
        // PMO
        pmo: ["DEPARTMENT_LIST"],
        // manager / leader / sếp
        manager: ["DEPARTMENT_LIST"],
        // SEP nếu cậu muốn cho xem danh sách
        sep: ["DEPARTMENT_LIST"],
        // staff (user) – không được list toàn bộ
        user: [],
      };

      const perms = rolePermissions[roleName] || [];

      // nếu role có quyền tương ứng
      if (perms.includes(required)) {
        return next();
      }

      return res.status(403).json({ message: "Không có quyền" });
    },
};

export default authMiddleware;
