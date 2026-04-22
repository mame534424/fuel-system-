import { Request,Response } from "express";
import { db } from "../config/db";
import { bookings, fuelTypes, stations } from "../db/schema";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { and, asc, eq, sql } from "drizzle-orm";

export async function createBooking(req:AuthenticatedRequest,res:Response){
    try {
        const {stationId,fuelTypeId,guestEmail,plateNumber,userId}=req.body;
        if(!stationId || !fuelTypeId || !plateNumber){
            return res.status(400).json({message:"All fields are required"});
        }
        // check whether the plate number is active in another booking or not
        const activeBooking=await db.select().from(bookings).where(
           and ( eq(bookings.plateNumber, plateNumber),
            eq(bookings.status, "PENDING")
        ));
        if(activeBooking.length>0){
            return res.status(400).json({message:"This plate number is already in queue"});
        }
        // get latest queue number 
        const result = await db.execute(sql`
        SELECT COALESCE(MAX(queue_number), 0) AS max
        FROM bookings
        WHERE station_id = ${stationId}
        `);

        const maxQueue=Number(result[0].max)||0;
        const nextQueueNumber=maxQueue+1;

        const bookingNumber=`BK-${nextQueueNumber}`;
        const booking=await db.insert(bookings).values({
            bookingNumber,
            stationId,
            fuelTypesId:fuelTypeId,
            userId,
            guestEmail,
            plateNumber,
            queueNumber:nextQueueNumber,
        }).returning();
        res.status(201).json({message:"Booking created successfully",booking:booking[0]});

        
    } catch (error) {
        console.error("Error in createBooking:", error);
        res.status(500).json({message:"Internal Server Error"});
    }
        
    }

export async function getStationBookings(req:Request,res:Response){
    try{
        const stationParam = req.params.stationId;
        const stationId = Array.isArray(stationParam) ? stationParam[0] : stationParam;
        if(!stationId){
            return res.status(400).json({message:"Station ID is required"});
        }
        // we will edit it later only to return pending people on the booking 
        const bookingsList=await db.select().from(bookings).where(eq(bookings.stationId, stationId)).orderBy(asc(bookings.queueNumber));
        res.status(200).json({message:"Bookings retrieved successfully",bookings:bookingsList});


    }
    catch(error:any){
        console.error("Error in getStationBookings:", error);
        res.status(500).json({message:"Internal Server Error"});
    }
}
export async function callNextBooking(req:AuthenticatedRequest,res:Response){
    try {
        const stationParam = req.params.stationId;
        const stationId = Array.isArray(stationParam) ? stationParam[0] : stationParam;
        if(!stationId){
            return res.status(400).json({message:"Station ID is required"});
        }
        const next=await db.select().from(bookings).where(
            and(
                eq(bookings.stationId, stationId),
                eq(bookings.status, "PENDING")
            )
        ).orderBy(asc(bookings.queueNumber)).limit(1);
        if(next.length===0){
            return res.status(404).json({message:"No pending bookings found"});
        }
        const bookingId=next[0].id;
        const updatedBooking=await db.update(bookings).set({status:"CALLED"}).where(eq(bookings.id, bookingId)).returning();
        res.status(200).json({message:"Next booking called successfully",booking:updatedBooking[0]});
    }
    catch(error:any){
        console.error("Error in callNextBooking:", error);
        res.status(500).json({message:"Internal Server Error"});
    }
    }
export async function completeBooking(req:AuthenticatedRequest,res:Response){
    try {
        const bookingParam = req.params.bookingId;
        const bookingId = Array.isArray(bookingParam) ? bookingParam[0] : bookingParam;
        if(!bookingId){
            return res.status(400).json({message:"Booking ID is required"});
        }
        const booking=await db.update(bookings).set({status:"COMPLETED"}).where(eq(bookings.id, bookingId)).returning();
        if(booking.length===0){
            return res.status(404).json({message:"Booking not found"});
        }
        res.status(200).json({message:"Booking completed successfully",booking:booking[0]});
    }
    catch(error:any){
        console.error("Error in completeBooking:", error);
        res.status(500).json({message:"Internal Server Error"});
    }
}

export async function rejectBooking(req:AuthenticatedRequest,res:Response){
    try {
        const bookingParam = req.params.bookingId;
        const bookingId = Array.isArray(bookingParam) ? bookingParam[0] : bookingParam;
        if(!bookingId){
            return res.status(400).json({message:"Booking ID is required"});
        }
        const booking=await db.update(bookings).set({status:"REJECTED"}).where(eq(bookings.id, bookingId)).returning();
        if(booking.length===0){
            return res.status(404).json({message:"Booking not found"});
        }
        res.status(200).json({message:"Booking rejected successfully",booking:booking[0]});
    }
    catch(error:any){
        console.error("Error in rejectBooking:", error);
        res.status(500).json({message:"Internal Server Error"});
    }
}

// we will edit it inorder to include cancellation
export async function cancelBooking(req:Request,res:Response){
    try {
        const bookingParam = req.params.bookingId;
        const bookingId = Array.isArray(bookingParam) ? bookingParam[0] : bookingParam;
        if(!bookingId){
            return res.status(400).json({message:"Booking ID is required"});
        }
        const booking=await db.update(bookings).set({status:"CANCELLED"}).where(eq(bookings.id, bookingId)).returning();
        if(booking.length===0){
            return res.status(404).json({message:"Booking not found"});
        }
        res.status(200).json({message:"Booking cancelled successfully",booking:booking[0]});
    }
    catch(error:any){
        console.error("Error in cancelBooking:", error);
        res.status(500).json({message:"Internal Server Error"});
    }
}

export async function expireBooking(req:AuthenticatedRequest,res:Response){
    try {
        const bookingParam = req.params.bookingId;
        const bookingId = Array.isArray(bookingParam) ? bookingParam[0] : bookingParam;
        if(!bookingId){
            return res.status(400).json({message:"Booking ID is required"});
        }
        const booking=await db.update(bookings).set({status:"EXPIRED"}).where(eq(bookings.id, bookingId)).returning();
        if(booking.length===0){
            return res.status(404).json({message:"Booking not found"});
        }
        res.status(200).json({message:"Booking expired successfully",booking:booking[0]});
    }
    catch(error:any){
        console.error("Error in expireBooking:", error);
        res.status(500).json({message:"Internal Server Error"});
    }
}


