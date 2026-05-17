import express from "express";
import { requireAuth } from "../middleware/auth.js";
import Aigrade from "../models/Aigrade.js";

const router = express.Router();

const ML_API_URL = process.env.ML_API_URL || "http://localhost:8000";

router.post("/", requireAuth, async (req, res) => {
  try {
    const { image_url } = req.body;
    if (!image_url) {
      return res.status(400).json({ msg: "image_url is required" });
    }

    const imgResp = await fetch(image_url);
    if (!imgResp.ok) {
      return res.status(502).json({ msg: "Failed to fetch image from URL" });
    }
    const blob = await imgResp.blob();

    const formData = new FormData();
    formData.append("image", blob, "grade.jpg");

    const mlResp = await fetch(`${ML_API_URL}/predict`, {
      method: "POST",
      body: formData,
    });

    if (!mlResp.ok) {
      return res.status(502).json({ msg: "ML API grading failed" });
    }

    const mlResult = await mlResp.json();

    const grade = new Aigrade({
      image_url,
      grade: mlResult.grade,
      fruit: mlResult.fruit,
      confidence: mlResult.confidence,
      grade_confidence: mlResult.grade_confidence,
      full_response: mlResult,
    });

    await grade.save();
    res.status(201).json(grade);
  } catch (err) {
    console.error("Grading error:", err);
    res.status(500).json({ msg: "Grading failed", error: err.message });
  }
});

router.get("/", requireAuth, async (req, res) => {
  try {
    const grades = await Aigrade.find().sort({ createdAt: -1 }).limit(20);
    res.json(grades);
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch grades" });
  }
});

export default router;
