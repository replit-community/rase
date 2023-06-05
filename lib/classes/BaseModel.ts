import { v4 } from "uuid";
import * as z from "zod";
import { Client } from "./Client";

export type BaseModelSchema = z.ZodObject<any>;

export class BaseModel<ModelSchema extends BaseModelSchema = BaseModelSchema> {
    _id = v4();

    constructor(
        public modelName: string,
        protected modelSchema: ModelSchema,
        protected client: Client,
        protected props: z.infer<ModelSchema>
    ) {
        if (!this.modelSchema.parse(this.props)) {
            throw new Error("Invalid data");
            // TODO: more descriptive error messages
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
