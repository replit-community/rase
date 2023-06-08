import "dotenv/config";

import { beforeAll, describe, expect, it } from "vitest";
import * as z from "zod";

import { rase } from "../main";

const username = "phamn23";
const password = "Hello World";

describe("Rase Client Tests", () => {
    rase.connect(`${process.env.REPLIT_DB_URL}`);

    const User = rase.model(
        "User",
        z.object({
            username: z.string(),
            password: z.string(),
        })
    );

    beforeAll(async () => {
        await rase.deleteAll();
    });

    describe("Positive test cases", () => {
        describe("Basic database methods", () => {
            const key = "hello world";
            const value = { world: "data" };

            it("Sets & gets a key", async () => {
                await rase.set(key, JSON.stringify(value));

                expect(await rase.get(key)).toEqual(value);

                it("Lists keys under prefix", async () => {
                    expect(await rase.getPrefix("hello")).toEqual([key]);
                });

                it("Lists data under prefix", async () => {
                    expect(await rase.getPrefixData("hello")).toEqual([
                        { _id: key, ...value },
                    ]);
                });

                it("Deletes the key", async () => {
                    await rase.delete(key);

                    expect(await rase.get(key)).toBeNull();
                });
            });
        });

        it("Creates a new model", async () => {
            const user = new User({ username, password });
            await user.save();

            const fetchedUser = await User.findById(user._id);

            expect(fetchedUser?._id).toBe(user._id);
            expect(fetchedUser?.get("username")).toBe(username);
            expect(fetchedUser?.get("password")).toBe(password);

            it("Deletes the model", async () => {
                await user.delete();

                expect(await User.findById(user._id)).toBeNull();
            });
        });
    });
});
