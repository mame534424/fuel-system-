import e, { Request,Response } from "express";
import { db } from "../config/db";
import { bookings, fuelTypes, stationQueueCounter, stations } from "../db/schema";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { and, asc, eq, sql } from "drizzle-orm";
import { stat } from "node:fs";
import { date } from "drizzle-orm/mysql-core";

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
            return res.status(400).json({message:"This plate number is already in queue on another station"});
        }
        // get the day 
        const today=new Date().toISOString().slice(0,10);
        // get latest queue number 
        const createdBooking=await db.transaction(async(trx)=>{
            const station=await trx.select().from(stations).where(eq(stations.id, stationId)).limit(1);
            if(!station.length){
                return res.status(404).json({message:"Station not found"});
            }
            const code=station[0].code;
            let counter = await trx
                    .select({
                        lastQueue:stationQueueCounter.lastQueue
        })
                    .from(stationQueueCounter)
                    .where(
                        eq(stationQueueCounter.stationId, stationId))
                    .limit(1);
            if(counter.length===0){
                counter=await trx.insert(stationQueueCounter).values({
                    stationId,
                    date:today,
                    lastQueue:0
                })
                counter = [{lastQueue: 0}];

            }

            

           const update= await trx.update(stationQueueCounter).set({lastQueue: sql`${stationQueueCounter.lastQueue} + 1`, date:today}).where(eq(stationQueueCounter.stationId, stationId)).returning
           ({lastQueue: stationQueueCounter.lastQueue});
           const nextQueue = update[0].lastQueue;

            const formattedDate = today.replace(/-/g, "");
            const bookingNumber =`BK-${code}-${formattedDate}-${String(nextQueue).padStart(4, "0")}`;
            
            const booking=await trx.insert(bookings).values({
                stationId,
                fuelTypesId:fuelTypeId,
                plateNumber,
                queueNumber: nextQueue,
                bookingNumber,
                userId,
                guestEmail,
                status: "PENDING"
            }).returning();
            return booking;
        });
        
        
        res.status(201).json({message:"Booking created successfully",booking:createdBooking});

        
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
// export async function resetBookingQueue(req:AuthenticatedRequest,res:Response){
//     try {
//         const stationParam = req.params.stationId;
//         const stationId = Array.isArray(stationParam) ? stationParam[0] : stationParam;
//         if(!stationId){
//             return res.status(400).json({message:"Station ID is required"});
//         }
//         // inorder to reset the station booking to 0 , first we have to make the sure that the pending on the station should be null , and then we can reset the last queue to 0 
//         const pendingBooking=await db.select().from(bookings).where(
//             and(
//                 eq(bookings.stationId, stationId),
//                 eq(bookings.status, "PENDING")
//             )
//         );
//         if(pendingBooking.length>0){
//             return res.status(400).json({message:"Cannot reset queue, there are pending bookings"});
//         }
//         const today=new Date().toISOString().slice(0,10);
//         await db.update(stationQueueCounter).set({lastQueue:0, date:today}).where(eq(stationQueueCounter.stationId, stationId));
//         res.status(200).json({message:"Booking queue reset successfully"});
//     }
//     catch(error:any){
//         console.error("Error in resetBookingQueue:", error);
//         res.status(500).json({message:"Internal Server Error"});
//     }
// }
export async function pendingBooking(req:AuthenticatedRequest,res:Response){
    try {
        const bookingParam = req.params.bookingId;
        const bookingId = Array.isArray(bookingParam) ? bookingParam[0] : bookingParam;
        if(!bookingId){
            return res.status(400).json({message:"Booking ID is required"});
        }
        const booking=await db.update(bookings).set({status:"PENDING"}).where(eq(bookings.id, bookingId)).returning();
        if(booking.length===0){
            return res.status(404).json({message:"Booking not found"});
        }
        res.status(200).json({message:"Booking status set to pending successfully",booking:booking[0]});
    }
    catch(error:any){
        console.error("Error in pendingBooking:", error);
        res.status(500).json({message:"Internal Server Error"});
    }
}



