import { Client } from "./classes/Client";

export const rase = new Client();

/**
 * 
 * https://mongoosejs.com/
import rase from "@replit-community/rase"

rase.connect(process.env.REPLIT_DATABSE_URL || "https://whatever")

const User = rase.model("User", z.object({
    lmao: z.string().required()
}))

const nathan = new User({
    lmao: "Hello World"
})

await nathan.save()
*/

export {};
