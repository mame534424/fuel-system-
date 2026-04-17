import { db } from "../config/db";
import { fuelTypes } from "./schema";

async function seedFuel() {
  await db.insert(fuelTypes).values([
    { name: "Diesel" },
    { name: "Benzene" },
    { name: "Premium" }
  ]);

  console.log("Fuel types inserted");
}

seedFuel();