import { Router } from "express";
import { authorize, protect } from "../middleware/auth.middleware";
import { AssignStationManager, createSubAdmin, getAdminStats, GetAllStations } from "../controllers/admin.controller";

const adminRouter = Router();
// create sub admin // manager 
adminRouter.post("/subadmin",protect,authorize("admin"),createSubAdmin);    
// assign station mananager
adminRouter.patch("/assign-station",protect,authorize("admin"),AssignStationManager);
// get stats for admin
adminRouter.get("/stats",protect,authorize("admin"),getAdminStats);
// get all stations
adminRouter.get("/stations",protect,authorize("admin"),GetAllStations);


export default adminRouter;
