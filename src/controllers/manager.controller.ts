import { Request,Response } from "express";
import { db } from "../config/db";
import { bookings, fuelTypes, stations,stationFuel} from "../db/schema";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { and, asc, eq, sql } from "drizzle-orm";

export async function createFuelType(req:AuthenticatedRequest,res:Response){
    try{
        const {name}=req.body;
        if(!name){
            return res.status(400).json({message:"Name is required"});
        }
        const existingFuelType=await db.select().from(fuelTypes).where(eq(fuelTypes.name, name));
        if(existingFuelType.length>0){
            return res.status(400).json({message:"Fuel type already exists"});
        }
        const fuelType=await db.insert(fuelTypes).values({name}).returning();
        res.status(201).json({message:"Fuel type created successfully",fuelType:fuelType[0]});
    } catch (error) {
        console.error("Error creating fuel type:", error);
        res.status(500).json({message:"Internal server error"});

    }
    }

export async function createStationFuel(req:AuthenticatedRequest,res:Response){
    try {
        const {stationId,fuelTypeId,quantity}=req.body;
        if(!stationId || !fuelTypeId || quantity===undefined){
            return res.status(400).json({message:"All fields are required"});
        }
        // check if the station exists or not
        const station=await db.select().from(stations).where(eq(stations.id, stationId));
        if(station.length===0){
            return res.status(404).json({message:"Station not found"});
        }
        // check if the fuel type exists or not
        const fuelType=await db.select().from(fuelTypes).where(eq(fuelTypes.id, fuelTypeId));
        if(fuelType.length===0){
            return res.status(404).json({message:"Fuel type not found"});
        }
        // check if the station already has that fuel type or not
        const existingStationFuel=await db.select().from(stationFuel).where(
            and(
                eq(stationFuel.stationId, stationId),
                eq(stationFuel.fuelTypeId, fuelTypeId)
            )
        );
        if(existingStationFuel.length>0){
            return res.status(400).json({message:"This station already has this fuel type"});
        }
        const stationFuels=await db.insert(stationFuel).values({
            stationId,
            fuelTypeId,
            quantity
        }).returning();
        res.status(201).json({message:"Station fuel created successfully",stationFuel:stationFuels[0]});
    } catch (error) {
        console.error("Error creating station fuel:", error);
        res.status(500).json({message:"Internal server error"});
    }
}

export async function updateStationFuel(req:AuthenticatedRequest,res:Response){
    try {
        const {stationId,fuelTypeId,quantity}=req.body;
        if(!stationId || !fuelTypeId || quantity===undefined){
            return res.status(400).json({message:"All fields are required"});
        }
        // check if the station fuel exists or not
        const stationFuelRecord=await db.select().from(stationFuel).where(
            and(
                eq(stationFuel.stationId, stationId),
                eq(stationFuel.fuelTypeId, fuelTypeId)
            )
        );
        if(stationFuelRecord.length===0){
            return res.status(404).json({message:"Station fuel not found"});
        }
        // check the quantity and if it is below the threshold then make it unavailable
        if(quantity<100){
            await db.update(stationFuel).set({
                quantity,
                isAvailable:false
            }).where(
                and(
                    eq(stationFuel.stationId, stationId),
                    eq(stationFuel.fuelTypeId, fuelTypeId)
                )
            );
            return res.status(200).json({message:"Station fuel updated successfully, fuel is now unavailable due to low quantity"});
        }

        await db.update(stationFuel).set({
            quantity
        }).where(
            and(
                eq(stationFuel.stationId, stationId),
                eq(stationFuel.fuelTypeId, fuelTypeId)
            )
        );
        res.status(200).json({message:"Station fuel updated successfully"});

    } catch (error) {
        console.error("Error updating station fuel:", error);
        res.status(500).json({message:"Internal server error"});
    }}
export async function getStationStatus(req:AuthenticatedRequest,res:Response){
    try {
        const id=req.user?.id;
        // get the station managed by this sub admin
        const station=await db.select().from(stations).where(eq(stations.ownerId, id));
        if(station.length===0){
            return res.status(404).json({message:"Station not found for this manager"});
        }
        const stationId=station[0].id;
        
        // const stationFuels=await db.select().from(stationFuel).where(eq(stationFuel.stationId, stationId)).innerJoin(fuelTypes, eq(stationFuel.fuelTypeId, fuelTypes.id)).select({
        //     fuelTypeName:fuelTypes.name,
        //     quantity:stationFuel.quantity,
        //     isAvailable:stationFuel.isAvailable,
        //     updatedAt:stationFuel.updatedAt
        // });
        const stationFuels=await db.select({
            fuelTypeName:fuelTypes.name,
            quantity:stationFuel.quantity,
            isAvailable:stationFuel.isAvailable,
            updatedAt:stationFuel.updatedAt
        }).from(stationFuel).innerJoin(fuelTypes, eq(stationFuel.fuelTypeId, fuelTypes.id)).where(eq(stationFuel.stationId, stationId));
        const bookingsCountStatus=await db.select({
            status:bookings.status,
            count:sql`count(*)`
        }).from(bookings).where(eq(bookings.stationId, stationId)).groupBy(bookings.status);

        res.status(200).json({stationId,fuels:stationFuels, bookings:bookingsCountStatus});
    }
    catch (error) {
        console.error("Error in getStationStatus:", error);
        res.status(500).json({message:"Internal Server Error"});
    }
}





    