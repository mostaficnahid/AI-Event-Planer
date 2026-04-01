import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import usersRouter from "./users";
import eventsRouter from "./events";
import categoriesRouter from "./categories";
import guestsRouter from "./guests";
import aiRouter from "./ai";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(usersRouter);
router.use(eventsRouter);
router.use(categoriesRouter);
router.use(guestsRouter);
router.use(aiRouter);

export default router;
