import * as z from "zod";
import { BaseModel, BaseModelSchema } from "./BaseModel";

export class Client {
    private connectionUrl?: string;

    /**
     * Set the cnnection url of the client
     * @param connectionUrl Connection url
     */
    connect(connectionUrl: string) {
        this.connectionUrl = connectionUrl;
    }

    /**
     * Delete a key from Replit Database
     * @param key Key name
     */
    async removeKey(key: string) {
        await fetch(`${this.connectionUrl}/${encodeURIComponent(key)}`, {
            method: "DELETE",
        });

        return this;
    }

    /**
     * Set a key in Replit Database
     * @param key Key name
     * @param value Key value
     */
    async setKey(key: string, value: string) {
        await fetch(`${this.connectionUrl}`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: encodeURIComponent(key) + "=" + encodeURIComponent(value),
        });

        return this;
    }

    /**
     * Get a key from Replit Database
     * @param key Key name
     * @returns Parsed key value or null (if key not found)
     */
    async getKey(key: string) {
        const value = await fetch(
            `${this.connectionUrl}/${encodeURIComponent(key)}`
        ).then((res) => res.text());

        if (!value) {
            return null;
        }

        try {
            const json = JSON.parse(value);
            return json ?? null;
        } catch {
            return null;
        }
    }

    /**
     * Get a list of keys that start with a given prefix
     * @param prefix Prefix to use
     * @returns List of full keys
     */
    async getPrefix(prefix: string): Promise<string[]> {
        return fetch(
            `${this.connectionUrl}?encode=true&prefix=${encodeURIComponent(
                prefix
            )}`
        )
            .then((res) => res.text())
            .then((keys) =>
                keys
                    .trim()
                    .split("\n")
                    .map(decodeURIComponent)
                    .filter((key) => key.length > 0)
            );
    }

    /**
     * Get a list of values with keys that start with a given prefix
     * @param prefix Prefix to use
     * @returns List of values
     */
    async getPrefixData(prefix: string) {
        const prefixes = await this.getPrefix(prefix);
        const data = await Promise.all(prefixes.map((key) => this.getKey(key)));

        return data;
    }

    /**
     * Create a new model
     * @param modelName Model name
     * @param modelSchema Model schema, defined by zod
     * @returns Model class
     */
    model<ModelSchema extends BaseModelSchema = BaseModelSchema>(
        modelName: string,
        modelSchema: ModelSchema
    ) {
        const client = this;

        type ModelProps = z.infer<typeof modelSchema>;
        type Filter = Partial<ModelSchema>;

        class Model extends BaseModel {
            constructor(props: ModelProps) {
                super(modelName, modelSchema, client, props);
            }

            /**
             * Get a list of models that match the filter
             * @param filter Keys & values that the target models should have
             * @returns A list of models that match the filter
             */
            static async find(filter: Filter) {
                return getMatches(filter);
            }

            /**
             * Find a model by id
             * @param id Id to search for
             * @returns Model (or null, if not found)
             */
            static async findById(id: string) {
                const props = await client.getKey(`${modelName}.${id}`);
                return props ? toModel(props) : null;
            }

            /**
             * Get a model that matches the filter
             * @param filter Keys & values that the target model should have
             * @returns Single model that matches the filter
             */
            static findOne(filter: Partial<ModelSchema>) {
                return getMatch(filter);
            }
        }

        /**
         * Convert JSON data into the corresponding Model
         * @param props JSON data
         * @returns Model
         */
        function toModel(props: ModelSchema) {
            return new Model(props);
        }

        /**
         * Get a model that matches the filter
         * @param filter Keys & values that the target model should have
         * @returns Single model that matches the filter
         */
        async function getMatch(filter: Filter): Promise<Model | null> {
            const matches = (await client.getPrefixData(
                `${modelName}.`
            )) as Array<ModelSchema>;

            const match = matches.find((match) => {
                for (const key in filter) {
                    if (filter[key] !== match[key]) {
                        return false;
                    }
                }

                return true;
            });

            return match ? toModel(match) : null;
        }

        /**
         * Get a list of models that match the filter
         * @param filter Keys & values that the target models should have
         * @returns A list of models that match the filter
         */
        async function getMatches(filter: Filter): Promise<Array<Model>> {
            const matches = (await client.getPrefixData(
                `${modelName}.`
            )) as Array<ModelSchema>;

            return matches
                .filter((match) => {
                    for (const key in filter) {
                        if (filter[key] !== match[key]) {
                            return false;
                        }
                    }

                    return true;
                })
                .map(toModel);
        }

        return Model;
    }
}
