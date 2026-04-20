import { Router } from "express";
import { callNextBooking, cancelBooking, completeBooking, createBooking, getStationBookings, rejectBooking } from "../controllers/booking.controller";
import { authorize, protect } from "../middleware/auth.middleware";
import { stationScope } from "../middleware/stationScope.middleware";

const bookingRouter=Router();
bookingRouter.post("/",createBooking);
// not much needed of authorization for the future causes 
bookingRouter.get("/station/:stationId",protect,authorize("admin","subAdmin"),stationScope,getStationBookings);

bookingRouter.patch("/station/:stationId/callNext",protect,authorize("admin","subAdmin"),stationScope,callNextBooking);

bookingRouter.patch("/:bookingId/complete",protect,authorize("admin","subAdmin"),completeBooking);

bookingRouter.patch("/:bookingId/cancel",protect,authorize("admin","subAdmin","user"),cancelBooking);

bookingRouter.patch("/:bookingId/reject",protect,authorize("admin","subAdmin"),rejectBooking);

export default bookingRouter;