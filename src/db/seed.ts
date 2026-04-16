import {db} from "../config/db";
import {users} from "./schema";
import bcrypt from "bcrypt";

async function seedAdmin(){
    const hashedPassword = await bcrypt.hash("admin123", 10);

    await db.insert(users).values({
        email: "mame.534424@gmail.com",
        password: hashedPassword,
        username: "admin",
        role: "admin",
    });

    console.log("✅ Admin created");
}

seedAdmin()
