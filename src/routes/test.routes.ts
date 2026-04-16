import express from "express";
import { protect, authorize } from "../middleware/auth.middleware";

const router = express.Router();

// 👤 Any logged-in user
router.get("/me", protect, (req: any, res) => {
  res.json({
    message: "User data",
    user: req.user,
  });
});

// 👑 ADMIN only
router.get("/admin", protect, authorize("admin"), (req, res) => {
  res.json({ message: "Welcome Admin" });
});

// 🏢 ADMIN + SUB_ADMIN
router.get(
  "/staff",
  protect,
  authorize("admin", "subAdmin"),
  (req, res) => {
    res.json({ message: "Welcome Staff" });
  }
);

export default router;