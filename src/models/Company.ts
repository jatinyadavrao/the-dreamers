import mongoose, { Schema, type InferSchemaType } from "mongoose";

const CompanySchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    logoUrl: { type: String, default: "" },
    questionCount: { type: Number, default: 0 },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export type CompanyDoc = InferSchemaType<typeof CompanySchema>;

export const Company =
  mongoose.models.Company || mongoose.model("Company", CompanySchema);
