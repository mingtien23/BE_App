// src/routers/auth.router.js
import express from "express";
import authController from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";


const authRouter = express.Router();

// F02 – Login JWT
authRouter.post("/login", authController.login);

// F02 – /auth/me
authRouter.get("/me", authMiddleware.verifyToken, authController.me);

// F03 – Đổi mật khẩu
authRouter.post(
  "/change-password",
  authMiddleware.verifyToken,
  authController.changePassword
);

export default authRouter;
