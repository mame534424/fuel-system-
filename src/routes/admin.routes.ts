import { Router } from "express";
import { authorize, protect } from "../middleware/auth.middleware";
import { AssignStationManager, createSubAdmin } from "../controllers/admin.controller";

const adminRouter = Router();
adminRouter.post("/subadmin",protect,authorize("admin"),createSubAdmin);
adminRouter.patch("/assign-station",protect,authorize("admin"),AssignStationManager);

export default adminRouter;
