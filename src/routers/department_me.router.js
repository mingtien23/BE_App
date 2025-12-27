// src/routers/me.router.js
import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import departmentController from "../controllers/department.controller.js";

const meRouter = express.Router();

// GET /api/v1/me/department
meRouter.get(
  "/department",
  authMiddleware.verifyToken,
  departmentController.myDepartment
);

export default meRouter;
