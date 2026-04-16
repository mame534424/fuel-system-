import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export interface AuthenticatedRequest extends Request {
    user?:any,}

export function protect(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    // check if there is a token in the header
    try {
         const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });}
    // if there is a token verify it 
    const token = authHeader.split(" ")[1];

    const decoded=jwt.verify(token, process.env.JWT_SECRET as string);
    // attach the user to the request
    req.user=decoded;
    next();


    // attach to the request 
    //next
    } catch (error) {
        console.error("Error in auth middleware:", error);
        res.status(401).json({ message: "INVALID TOKEN" });
        
    }
   
}

export function authorize(...roles:string[]){
    return (req:AuthenticatedRequest,res:Response,next:NextFunction)=>{
        if(!req.user||!roles.includes(req.user.role)){
            return res.status(401).json({message:"Unauthorized"});
        }
        
        next();
    }

}