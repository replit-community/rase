import * as z from "zod";
import { BaseModel, BaseModelSchema } from "./BaseModel";
import { assert } from "../utils";

export class Client {
    private connectionUrl?: string;

    connect(connectionUrl: string) {
        this.connectionUrl = connectionUrl;
    }

    async removeKey(key: string) {
        const response = await fetch(
            `${this.connectionUrl}/${encodeURIComponent(key)}`,
            { method: "DELETE" }
        );

        assert(response.status === 200, "Failed to delete key");
    }

    async setKey(key: string, value: string) {
        const formData = new FormData();
        formData.append(key, value);

        const response = await fetch(`${this.connectionUrl}`, {
            method: "POST",
            body: formData,
        });

        assert(response.status === 200, "Failed to set key");
    }

    async getKey(key: string) {
        const response = await fetch(
            `${this.connectionUrl}/${encodeURIComponent(key)}`
        );

        if (response.status === 200) {
            const value = await response.json();
            return value;
        }

        return null;
    }

    async getPrefix(prefix: string) {
        const formData = new FormData();
        formData.append("prefix", prefix);

        const response = await fetch(`${this.connectionUrl}`, {
            method: "POST",
            body: formData,
        });

        if (response.status === 200) {
            const result = await response.json();
            return result;
        }

        return [];
    }

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

            static async find(filter: Filter) {
                return getMatches(filter);
            }

            static async findById(id: string) {
                const props = await client.getKey(`${modelName}.${id}`);
                return props ? toModel(props) : null;
            }

            static findOne(filter: Partial<ModelSchema>) {
                return getMatch(filter);
            }
        }

        function toModel(props: ModelSchema) {
            return new Model(props);
        }

        async function getMatch(filter: Filter): Promise<Model | null> {
            const matches = (await client.getPrefix(
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

        async function getMatches(filter: Filter): Promise<Array<Model>> {
            const matches = (await client.getPrefix(
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

const client = new Client();

const User = client.model(
    "User",
    z.object({
        lmao: z.string(),
    })
);

new User({
    lmao: "lmao",
})
    .set("lmao", "sdf")
    .save();
