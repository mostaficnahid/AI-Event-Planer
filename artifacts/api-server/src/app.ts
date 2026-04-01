import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import rateLimit from "express-rate-limit";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return { id: req.id, method: req.method, url: req.url?.split("?")[0] };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
  }),
);

app.set("trust proxy", 1);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use(
  "/api/auth",
  rateLimit({ windowMs: 15 * 60 * 1000, max: 30, message: { error: "Too many requests" } })
);
app.use(
  "/api/ai",
  rateLimit({ windowMs: 60 * 1000, max: 20, message: { error: "AI rate limit exceeded" } })
);

app.use("/api", router);

export default app;
