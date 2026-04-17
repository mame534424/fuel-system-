import { Request,Response } from "express";
import { db } from "../config/db";
import { bookings, fuelTypes, stations } from "../db/schema";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { and, eq, sql } from "drizzle-orm";

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