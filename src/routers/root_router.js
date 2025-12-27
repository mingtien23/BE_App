import express from "express";
import authRouter from "./auth.router.js";
import accountRouter from "./account.router.js";
import departmentRouter from "./department.router.js";
import meRouter from "./department_me.router.js";

const rootRouter = express.Router();

rootRouter.use("/auth", authRouter);
rootRouter.use("/accounts", accountRouter);
rootRouter.use("/departments", departmentRouter);
rootRouter.use("/departments_me", meRouter);

export default rootRouter;
