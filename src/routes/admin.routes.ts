import { Router } from "express";
import { authorize, protect } from "../middleware/auth.middleware";
import { AssignStationManager, createSubAdmin, getAdminStats, GetAllStations, GetAllSubAdmins, ToggleStationStatus } from "../controllers/admin.controller";

const adminRouter = Router();
// create sub admin // manager 
adminRouter.post("/subadmin",protect,authorize("admin"),createSubAdmin);    
// assign station mananager
adminRouter.patch("/assign-station",protect,authorize("admin"),AssignStationManager);
// get stats for admin
adminRouter.get("/stats",protect,authorize("admin"),getAdminStats);
// get all stations
adminRouter.get("/stations",protect,authorize("admin"),GetAllStations);
// get all subAdmins 
adminRouter.get("/subadmins",protect,authorize("admin"),GetAllSubAdmins);
// make the station active or inactive
adminRouter.patch("/:id/toggle-status",protect,authorize("admin"),ToggleStationStatus);



export default adminRouter;
