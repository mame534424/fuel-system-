import { SignIn,SignUp } from "../controllers/auth.controller";
import { Router } from "express";

const router=Router();

router.post("/signup",SignUp);
router.post("/signin",SignIn);

export default router;
