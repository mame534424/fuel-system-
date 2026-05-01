import { stationScope } from "../middleware/stationScope.middleware";
import { authorize, protect } from "../middleware/auth.middleware";
import { Router } from "express";
import { createFuelType, createStationFuel, getStationStatus, updateStationFuel } from "../controllers/manager.controller";
const managerRouter=Router();

managerRouter.post("/fuel-type",protect,authorize("admin","subAdmin"),createFuelType);
managerRouter.post("/station-fuel",protect,authorize("admin","subAdmin"),stationScope,createStationFuel);
managerRouter.patch("/update-station-fuel",protect,authorize("admin","subAdmin"),stationScope,updateStationFuel);
managerRouter.get("/station-status",protect,authorize("admin","subAdmin"),getStationStatus)

export default managerRouter;