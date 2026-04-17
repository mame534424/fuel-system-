import { NextFunction, Request, Response } from "express";
import { db } from "../config/db";
import { AuthenticatedRequest } from "./auth.middleware";
import { eq } from "drizzle-orm";
import { stations } from "../db/schema";


// middle ware to check if the subadmin can access that station or not 
//NB only the ownerId matches with the subadmin id then he can access that station , can update the fuel, and other things easily

export async function stationScope(req:AuthenticatedRequest,res:Response,next:NextFunction){
    try {
        const user=req.user;
        const stationId=req.params.stationId||req.body.stationId;
        if(!stationId){
            return res.status(400).json({message:"Station ID is required"});
        }
        if(user.role==="admin"){
            next();
        }
        if(user.role==="subAdmin"){
            const station=await db.select().from(stations).where(eq(stations.id, stationId));
            if(station.length===0){
                return res.status(404).json({message:"Station not found"});
            }
            if(station[0].ownerId!==user.id){
                return res.status(403).json({message:"Forbidden: You don't have access to this station"});
            }
            return next();
        }
        return res.status(403).json({message:"Forbidden: You don't have access to this station"});
    } catch (error) {
        console.error("Error in stationScope middleware:", error);
        res.status(500).json({message:"Internal Server Error"});
    }
}
