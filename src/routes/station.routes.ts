import {Router} from "express";
import { createStation } from "../controllers/station.controller";
import { authorize, protect } from "../middleware/auth.middleware";
const stationRouter=Router();

stationRouter.post("/create",protect,authorize("admin"),createStation);

export default stationRouter;
