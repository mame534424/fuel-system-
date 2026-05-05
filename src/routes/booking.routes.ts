import { Router } from "express";
import { callNextBooking, cancelBooking, completeBooking, createBooking, getStationBookings, pendingBooking, rejectBooking } from "../controllers/booking.controller";
import { authorize, protect } from "../middleware/auth.middleware";
import { stationScope } from "../middleware/stationScope.middleware";

const bookingRouter=Router();
bookingRouter.post("/",createBooking);
// not much needed of authorization for the future causes 
bookingRouter.get("/station/:stationId",protect,authorize("admin","subAdmin"),stationScope,getStationBookings);

bookingRouter.patch("/station/:stationId/callNext",protect,authorize("admin","subAdmin"),stationScope,callNextBooking);

bookingRouter.patch("/:bookingId/complete",protect,authorize("admin","subAdmin"),stationScope,completeBooking);

bookingRouter.patch("/:bookingId/cancel",cancelBooking);

bookingRouter.patch("/:bookingId/reject",protect,authorize("admin","subAdmin"),stationScope,rejectBooking);


bookingRouter.patch("/:bookingId/pending",protect,authorize("admin","subAdmin"),stationScope,pendingBooking);

export default bookingRouter;