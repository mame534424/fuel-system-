// what is token and how does it work 
import jwt from "jsonwebtoken";

export function generateToken(user:any){
    return jwt.sign(
        {id:user.id,
        role:user.role},
        process.env.JWT_SECRET!,
        {expiresIn:"1d"}
    );
}
