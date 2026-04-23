import { Router } from "express";
import { getServiceTaxonomy } from "../services/taxonomy.js";

export const taxonomyRouter = Router();

taxonomyRouter.get("/taxonomy", async (_req, res) => {
  try {
    const taxonomy = await getServiceTaxonomy();
    res.json(taxonomy);
  } catch (err) {
    console.error("[taxonomy] Failed to load service taxonomy:", err);
    res.status(503).json({ error: "Service taxonomy unavailable" });
  }
});