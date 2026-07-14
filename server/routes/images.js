import { Router } from "express";
import { searchPhoto } from "../lib/imageSearch.js";

export const imagesRouter = Router();

imagesRouter.get("/search", async (req, res) => {
  const query = req.query.query;
  if (!query) return res.status(400).json({ error: "query is required" });

  try {
    const photo = await searchPhoto(String(query));
    if (!photo) return res.json({ url: null });
    res.json(photo);
  } catch (err) {
    console.error("[images/search]", err.message);
    res.json({ url: null });
  }
});
