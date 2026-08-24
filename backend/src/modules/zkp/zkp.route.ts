import { Router } from "express";
import { getPlatformParams } from "./params.service.js";

export const zkpRouter = Router();

zkpRouter.get("/params", async (_req, res) => {
  const params = await getPlatformParams();
  res.json(params);
});