import {db} from "../config/db";
import {users} from "../db/schema";
import bcrypt from "bcrypt";
import { Response,Request } from "express";
import {eq,or} from "drizzle-orm";
import {generateToken} from "../utils/token";

export const SignUp=async(req:Request,res:Response)=>{
try {
    console.log("signup hit");
    console.log(req.body);
    const {email,password,username}=req.body;
    if(!email || !password || !username){
        return res.status(400).json({message:"All fields are required"});
    }
    const hashedPassword=await bcrypt.hash(password,10);
    const user=await db.insert(users).values({
        email,
        password:hashedPassword,
        username,
    }).returning();
    const {password:_,...userWithoutPassword}=user[0];

    res.status(201).json({message:"User created successfully",user:userWithoutPassword});



} catch (error) {
    console.error("Error in SignUp:", error);
    res.status(500).json({message:"Internal Server Error"});

    
}

}

export const SignIn=async(req:Request,res:Response)=>{
    const {identifier,password}=req.body;
    if(!identifier || !password){
        return res.status(400).json({message:"All fields are required"});
    }
    try {
        // finc user by email or username
        const user=await db.select().from(users).where
        (
            or(eq(users.email, identifier), 
            eq(users.username, identifier))
        );
        if (user.length===0){
            return res.status(400).json({message:"Invalid credentials"});
        }

        // validity of the password
        const isPasswordValid=await bcrypt.compare(password,user[0].password);
        if(!isPasswordValid){
            return res.status(400).json({message:"password is incorrect"});
        }
        // is account active
        if(!user[0].isActive){
            return res.status(403).json({message:"Account is deactivated, please contact support"});
        }
        // generate token
        const token=generateToken(user[0]);
        // while sending response do not send password, send first token and then not token in the response
        const {password:_,...userWithoutPassword}=user[0];
        res.status(200).json({message:"Login successful",token,user:userWithoutPassword});

        
    } catch (error:any) {
        console.error("Error in SignIn:", error);
       res.status(500).json({message:"Internal Server Error"});

    }

}