// src/routers/account.router.js
import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import accountController from "../controllers/account.controller.js";

const accountRouter = express.Router();

// F01 – Tạo tài khoản
accountRouter.post(
  "/",
  authMiddleware.verifyToken,
  authMiddleware.authorize("ACCOUNT_CREATE"),
  accountController.createAccount
);

// (optional) list account
accountRouter.get(
  "/",
  authMiddleware.verifyToken,
  authMiddleware.authorize("ACCOUNT_LIST"),
  accountController.listAccounts
);

// F05 – Khoá/Mở khoá tài khoản
accountRouter.put(
  "/:A_ID/status",
  authMiddleware.verifyToken,
  authMiddleware.authorize("ACCOUNT_STATUS"),
  accountController.changeStatus
);

// F06 – Xoá tài khoản (soft delete)
accountRouter.delete(
  "/:A_ID",
  authMiddleware.verifyToken,
  authMiddleware.authorize("ACCOUNT_DELETE"),
  accountController.softDelete
);

export default accountRouter;
