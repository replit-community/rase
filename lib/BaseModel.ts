import * as z from "zod";
import { Client } from "./Client";

export type BaseModelSchema = z.ZodObject<any>;

export class BaseModel<ModelSchema extends BaseModelSchema = BaseModelSchema> {
    _id = createId();

    constructor(
        public modelName: string,
        public modelSchema: ModelSchema,
        public client: Client,
        public props: z.infer<ModelSchema>
    ) {
        if (!this.modelSchema.parse(this.props)) {
            throw new Error("Properties do not conform with the model schema");
        }
    }

    get(key: keyof typeof this.props) {
        return this.props[key];
    }

    set(key: keyof typeof this.props, value: (typeof this.props)[typeof key]) {
        this.props[key] = value;

        return this;
    }

    get selector() {
        return `${this.modelName}.${this._id}`;
    }

    async save() {
        await this.client.setKey(this.selector, JSON.stringify(this.props));

        return this;
    }

    async remove() {
        await this.client.removeKey(this.selector);

        return this;
    }
}

function createId() {
    return (
        Date.now().toString(36) + Math.random().toString(36).substring(2)
    ).substring(0, 16);
}
