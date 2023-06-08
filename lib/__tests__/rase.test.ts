import "dotenv/config";

import { afterAll, assert, beforeAll, describe, expect, it } from "vitest";
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

    afterAll(async () => {
        await rase.deleteAll();
    });

    describe("Positive test cases", () => {
        it("Should be empty", async () => {
            expect(await rase.getPrefix("hello")).toEqual([]);
        });

        describe("Basic database methods", () => {
            const key = "hello world";
            const value = { world: "data" };

            it("Sets & gets a key", async () => {
                await rase.set(key, JSON.stringify(value));
                expect(await rase.get(key)).toEqual(value);
            });

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

        describe("Creates a new user", () => {
            it("Finds the user by id", async () => {
                const user = new User({ username, password });
                await user.save();

                const fetchedUser = await User.findById(user._id);
                assert(fetchedUser, "User should exist");
                expect(fetchedUser._id).toBe(user._id);
                expect(fetchedUser.get("username")).toBe(username);
                expect(fetchedUser.get("password")).toBe(password);

                await user.delete();
                expect(await User.findById(user._id)).toBeNull();
            });

            it("Finds the user by filter", async () => {
                const user = new User({ username, password });
                await user.save();

                const fetchedUser = await User.findOne({ username });
                assert(fetchedUser, "User should exist");
                expect(fetchedUser._id).toBe(user._id);
                expect(fetchedUser.get("username")).toBe(username);
                expect(fetchedUser.get("password")).toBe(password);

                await user.delete();
                expect(await User.findById(user._id)).toBeNull();
            });
        });
    });
});
