import mongoose, { Schema, type InferSchemaType } from "mongoose";

const QuestionSchema = new Schema(
  {
    leetcodeId: { type: Number, required: true, index: true },
    title: { type: String, required: true },
    slug: { type: String, default: "" },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Medium",
      index: true,
    },
    acceptance: { type: Number, default: 0 }, // percentage, e.g. 46.8
    frequency: { type: Number, default: 0 },
    link: { type: String, default: "" },
    company: { type: String, required: true, index: true }, // company slug
    timeframe: {
      type: String,
      enum: ["alltime", "2year", "1year", "6months"],
      default: "alltime",
      index: true,
    },
  },
  { timestamps: true }
);

// One row per problem per company per timeframe.
QuestionSchema.index({ company: 1, timeframe: 1, leetcodeId: 1 }, { unique: true });

export type QuestionDoc = InferSchemaType<typeof QuestionSchema>;

export const Question =
  mongoose.models.Question || mongoose.model("Question", QuestionSchema);
