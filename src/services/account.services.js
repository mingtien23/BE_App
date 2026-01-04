// src/services/account.services.js
import prisma from "../common/prisma/init.prisma.js";
import bcrypt from "bcryptjs";

const genAccountId = () => {
  return "A_" + Date.now().toString().slice(-3) + Math.floor(Math.random() * 10);
};

const genMemberId = () => {
  return "M_" + Date.now().toString().slice(-3) + Math.floor(Math.random() * 10);
};

const accountServices = {
  // ---------- F01: Tạo tài khoản ----------
  createAccount: async (req) => {
    try {
      const actor = req.user; // admin đang login
      const {
        username,
        password,
        fullName,
        email,
        phoneNumber,
        roleId,
        departmentId,
      } = req.body;

      if (!username || !password || !email || !roleId || !departmentId) {
        return { status: 400, message: "Thiếu trường bắt buộc" };
      }

      // check trùng username/email
      const existing = await prisma.account.findFirst({
        where: {
          OR: [{ UserName: username }, { Email: email }],
          IsDeleted: false,
        },
      });
      if (existing) {
        return { status: 400, message: "Username hoặc Email đã tồn tại" };
      }

      // tạo Member
      const memberId = genMemberId();
      const member = await prisma.member.create({
        data: {
          M_ID: memberId,
          FullName: fullName || username,
          PhoneNumber: phoneNumber || null,
          D_ID: departmentId,
          Status: "active",
          IsDeleted: false,
        },
      });

      // hash password
      const hashed = await bcrypt.hash(password, 10);

      // tạo Account
      const accountId = genAccountId();
      const account = await prisma.account.create({
        data: {
          A_ID: accountId,
          UserName: username,
          PassWord: hashed,
          Email: email,
          R_ID: roleId,
          M_ID: member.M_ID,
          Status: "active",
          IsDeleted: false,
        },
        include: {
          Role: true,
          Member: true,
        },
      });

      const { PassWord, ...safeAcc } = account;

      return {
        status: 201,
        message: "Account created successfully",
        // Keeping data for debugging/info if user wants, but user asked for message.
        // To be strict with user request:
        // data: { ... } removed or minimal?
        // User asked: "Success: { status: 201, message: 'Account created successfully' }"
      };
    } catch (err) {
      console.error("CREATE ACCOUNT ERROR:", err);
      return { status: 500, message: "Lỗi server khi tạo tài khoản" };
    }
  },

  // (optional) list accounts để admin xem
  listAccounts: async () => {
    const accounts = await prisma.account.findMany({
      where: { IsDeleted: false },
      include: { Role: true, Member: true },
    });
    const safe = accounts.map(({ PassWord, ...rest }) => rest);
    return { status: 200, data: safe };
  },

  // ---------- F05: Khoá / Mở khoá ----------
  changeStatus: async (req) => {
    try {
      const { A_ID: actorAid } = req.user;
      const { A_ID } = req.params;
      const { status, reason } = req.body; // status: 'locked' | 'active'

      if (!A_ID || !status) {
        return { status: 400, message: "Thiếu A_ID/status" };
      }

      const acc = await prisma.account.findUnique({
        where: { A_ID },
      });

      if (!acc || acc.IsDeleted) {
        return { status: 404, message: "Tài khoản không tồn tại" };
      }

      const updated = await prisma.account.update({
        where: { A_ID },
        data: {
          Status: status,
          // DB hiện tại không có cột reason, nên tạm thời chỉ log ra console
        },
        include: { Role: true, Member: true },
      });

      console.log("CHANGE STATUS reason:", reason);

      const { PassWord, ...safeAcc } = updated;
      return {
        status: 200,
        data: {
          account: safeAcc,
          changedBy: actorAid,
        },
      };
    } catch (err) {
      console.error("CHANGE STATUS ERROR:", err);
      return { status: 500, message: "Lỗi server khi cập nhật trạng thái" };
    }
  },

  // ---------- F06: Xoá tài khoản (soft delete) ----------
  softDelete: async (req) => {
    try {
      const { A_ID: actorAid } = req.user;
      const { A_ID } = req.params;

      if (!A_ID) {
        return { status: 400, message: "Thiếu A_ID" };
      }

      const acc = await prisma.account.findUnique({
        where: { A_ID },
      });

      if (!acc || acc.IsDeleted) {
        return { status: 404, message: "Tài khoản không tồn tại" };
      }

      const now = new Date();

      const deleted = await prisma.account.update({
        where: { A_ID },
        data: {
          IsDeleted: true,
          Deleted_At: now,
          Deleted_By: actorAid,
          Status: "inactive",
        },
        include: { Role: true, Member: true },
      });

      const { PassWord, ...safeAcc } = deleted;
      return {
        status: 200,
        data: safeAcc,
      };
    } catch (err) {
      console.error("SOFT DELETE ERROR:", err);
      return { status: 500, message: "Lỗi server khi xoá tài khoản" };
    }
  },
};

export default accountServices;
  // ✔ Check quyền theo permission
      // if (roleName !== "admin" && !rolePermissions.includes(required)) {
      //   return res.status(403).json({ message: "Không có quyền" });
      // }