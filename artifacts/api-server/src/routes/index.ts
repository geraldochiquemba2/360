import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import adminRouter from "./admin";
import opportunitiesRouter from "./opportunities";
import tracksRouter from "./tracks";
import mentorshipRouter from "./mentorship";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/admin", adminRouter);
router.use("/opportunities", opportunitiesRouter);
router.use("/tracks", tracksRouter);
router.use("/mentorship", mentorshipRouter);

export default router;
