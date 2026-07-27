import { Router, type IRouter } from "express";
import healthRouter from "./health";
import partnerRouter from "./partner";
import bookingRouter from "./booking";
import trackRouter from "./track";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(partnerRouter);
router.use(bookingRouter);
router.use(trackRouter);
router.use(adminRouter);

export default router;
