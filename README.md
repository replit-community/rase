# Rase

[![Try with Replit Badge](https://replit.com/badge?caption=Try%20with%20Replit)](https://replit.com/@replit-community-dev/rase)

Replit database client

-   Built with Typescript
-   Mongoose-like models & utility methods
-   No bundled dependencies (but at the moment requires Zod to be installed)

## Installation

```bash
npm install @replit-community/rase
```

## Usage

First connect to the Replit database.

```ts
import { rase } from "@replit-community/rase";

rase.connect(process.env.REPLIT_DB_URL);
```

## Basic Methods

Then, you can directly interact with the database with some basic methods.

```ts
// set a key called "hello"
await rase.set("hello", { data: "world" });

// get a key called "hello"
await rase.get("hello");

// get a list of keys that start with "hello"
await rase.getPrefix("hello");

// get the actual values of keys that start with "hello"
await rase.getPrefixData("hello");

// delete the key called "hello"
await rase.delete("hello");

// delete all keys in the database
await rase.deleteAll();
```

### Models

That's all well and good, but most Replit Database clients can already do that. What makes Rase stand apart is the ability to create Mongoose-like models that adhere to a specific schema.

For example, let's create a simple User model.

```ts
import * as z from "zod"

const User = rase.model("User", z.object(
    username: z.string(),
    password: z.string()
))
```

Now, whenever we instantiate a new user model, we get nice type-hints and an error if we don't correctly satisfy the schema requirements.

```ts
// const user = new User({ username: "Hello World" });
// error - we're missing a password!

const user = new User({ username: "Hello World", password: "Hi" });
// we're good!
```

Once you have a user "document" or model instance, you can interact with it in a number of ways:

```ts
// get a property
console.log(user.get("username")); // "Hello World"

// save the user after updating a property
await user.set("username", "Hello").save();

// delete the user
await user.delete();
```

The only static methods in a Model class are related to finding a document, since updating and deleting a model after finding it are trivial (and there aren't any optimizations built-in to Replit Database for supporting those operations anyways).

```ts
// find a single model that has a username "Hello World"
User.findOne({ username: "Hello World" });

// find all models that have the username "Hello World"
User.find({ username: "Hello World" });

// find
User.findById("whatever idk");
```

For more control, I recommend leaving the filters empty and searching the results of `find` yourself.

```ts
// here we get all ADMIN users
User.find().filter((user) => user.get("roles").includes("ADMIN"));

// this effectively gets the first user in the database
User.findOne();
```
