import {request, response} from "express";
import { db } from "../config/db";
import { stations } from "../db/schema";
import {AuthenticatedRequest} from "../middleware/auth.middleware";

export async function createStation(req:AuthenticatedRequest,res:any){
    try {
        const {name,latitude,longitude,code}=req.body;
        if(!name || !latitude || !longitude || !code){
            return res.status(400).json({message:"All fields are required"});
        }
        const station=await db.insert(stations).values({
            name,
            latitude,
            longitude,
            code
        }).returning();
        res.status(201).json({message:"Station created successfully",station:station[0]});
    } catch (error) {
        console.error("Error in createStation:", error);
        res.status(500).json({message:"Internal Server Error"});
    }
}