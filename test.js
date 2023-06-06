import * as z from "zod";
import { rase } from "./dist/database.js";

rase.connect(
    "https://kv.replit.com/v0/eyJhbGciOiJIUzUxMiIsImlzcyI6ImNvbm1hbiIsImtpZCI6InByb2Q6MSIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJjb25tYW4iLCJleHAiOjE2ODYxMzg5MDcsImlhdCI6MTY4NjAyNzMwNywiZGF0YWJhc2VfaWQiOiIwZTc0NmRhMy01ZDgwLTQ0ZWEtYmQxMi0wMjgxYmZmOTMzZDEiLCJ1c2VyIjoicmVwbGl0LWNvbW11bml0eS1kZXYiLCJzbHVnIjoicmFzZSJ9.4gNIth1wf7yMNrEJ7tOnu0XHu9IQlGLYdfzAyjlmBqXVbQQay_mMwOvEGAES_HnN23No-K0AWXwgcKgLSM-ORg"
);

const User = rase.model(
    "User",
    z.object({
        username: z.string(),
        password: z.string(),
    })
);

async function main() {
    (await User.find({})).forEach((u) => u.remove());
}

main();
