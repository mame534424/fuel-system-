import {db} from "../config/db";
import { bookings, stations } from "../db/schema";
import {Request,Response} from "express";
import { users } from "../db/schema";
import bcrypt from "bcrypt";
import {eq, sql} from "drizzle-orm";

export const createSubAdmin=async(req:Request,res:Response)=>{
    try {
        const {email,password,username}=req.body;
        if(!email || !password || !username){
            return res.status(400).json({message:"All fields are required"});
        }
        // check if admin already exists
        const existingAdmin=await db.select().from(users).where(eq(users.email,email));
        if(existingAdmin.length>0){
            return res.status(400).json({message:"subAdmin with this email already exists"});
        }
        const hashedPassword=await bcrypt.hash(password,10);
        const admin=await db.insert(users).values({
            email,
            password:hashedPassword,
            username,
            role:"subAdmin",
        }).returning();
        const {password:_,...adminWithoutPassword}=admin[0];
        res.status(201).json({message:"Admin created successfully",admin:adminWithoutPassword});
    } catch (error) {
        console.error("Error in createAdmin:", error);
        res.status(500).json({message:"Internal Server Error"});
    }   
}

export const AssignStationManager=async(req:Request,res:Response)=>{
    try {
        const {adminId,stationId}=req.body;
        if(!adminId || !stationId){
            return res.status(400).json({message:"All fields are required"});
        }
        // check if the subadmin is an owmer at some place already
        const existingStation=await db.select().from(stations).where(eq(stations.ownerId,adminId));
        if(existingStation.length>0){
            return res.status(400).json({message:"This admin is already managing a station"});
        } 
        // check whether the user id coming is actually a sub admin

        const result=await db.update(stations).set({ownerId:adminId}).where(eq(stations.id,stationId)).returning();
        if(result.length===0){
            return res.status(404).json({message:"Station not found"});
        }
        res.status(200).json({message:"Station manager assigned successfully",station:result[0]});
    } catch (error) {
        console.error("Error in AssignStationManager:", error);
        res.status(500).json({message:"Internal Server Error"});
    }
}

export const getAdminStats=async(req:Request,res:Response)=>{
    try {
        // get total number of stations
        const totalStations=await db.select({
        count: sql<number>`count(*)`
        }).from(stations);
        // get total number of sub admins
        const totalSubAdmins=await db.select({
            count: sql<number>`count(*)`
        }).from(users).where(eq(users.role,"subAdmin"));
        
        // get total number of bookings
        const totalBookings=await db.select({
            count: sql<number>`count(*)`
        }).from(bookings);

        // get total number of active bookings
        const activeBookings=await db.select({
            count: sql<number>`count(*)`
        }).from(bookings).where(eq(bookings.status,"PENDING"));

        res.status(200).json({
            totalStations: totalStations[0].count,
            totalSubAdmins: totalSubAdmins[0].count,
            totalBookings: totalBookings[0].count,
            activeBookings: activeBookings[0].count,
        });


    }
        catch (error:any) {
        console.error("Error in getAdminStats:", error);
        res.status(500).json({message:"Internal Server Error"});
        }
    }
export const GetAllStations=async(req:Request,res:Response)=>{
    try {
        const allStations=await db.select().from(stations);
        res.status(200).json({stations:allStations});

        
    } catch (error:any) {
        console.error("Error in GetAllStations:", error);
        res.status(500).json({message:"Internal Server Error"});
    }
}

export const GetAllSubAdmins=async(req:Request,res:Response)=>{
    try {
        const allSubAdmins=await db.select().from(users).where(eq(users.role,"subAdmin"));
        const subAdminsWithoutPassword=allSubAdmins.map(({password,...subAdmin})=>subAdmin);
        res.status(200).json({subAdmins:subAdminsWithoutPassword});
    } catch (error:any) {
        console.error("Error in GetAllSubAdmins:", error);
        res.status(500).json({message:"Internal Server Error"});
    }
}

// controller that make the station active or inactive
export const ToggleStationStatus=async(req:Request,res:Response)=>{
    try {
        const {stationId}=req.params;
        const {isActive}=req.body;
        if(!stationId){
            return res.status(400).json({message:"Station ID is required"});
        }
        const result=await db.update(stations).set({isActive}).where(eq(stations.id,stationId)).returning();
        if(result.length===0){
            return res.status(404).json({message:"Station not found"});
        }
        res.status(200).json({message:"Station status updated successfully",station:result[0]});
    } catch (error) {
        console.error("Error in ToggleStationStatus:", error);
        res.status(500).json({message:"Internal Server Error"});
    }
}

