import * as z from "zod";
import { Client } from "./Client";

export type BaseModelSchema = z.ZodObject<any>;

export class BaseModel<ModelSchema extends BaseModelSchema = BaseModelSchema> {
    _id = BaseModel.createId();

    static createId() {
        return (
            Date.now().toString(36) + Math.random().toString(36).substring(2)
        ).substring(0, 16);
    }

    static formatId(id?: string) {
        const _id = id?.split(".").pop();

        return _id || BaseModel.createId();
    }

    constructor(
        public modelName: string,
        protected modelSchema: ModelSchema,
        protected client: Client,
        protected props: z.infer<ModelSchema>
    ) {
        this.validate();
    }

    private validate() {
        this.modelSchema.parse(this.props);
    }

    get(key: keyof typeof this.props) {
        return this.props[key];
    }

    set(key: keyof typeof this.props, value: (typeof this.props)[typeof key]) {
        this.props[key] = value;
        this.validate();

        return this;
    }

    get selector() {
        return `${this.modelName}.${this._id}`;
    }

    async save() {
        await this.client.set(this.selector, JSON.stringify(this.props));

        return this;
    }

    async delete() {
        await this.client.delete(this.selector);

        return this;
    }
}
