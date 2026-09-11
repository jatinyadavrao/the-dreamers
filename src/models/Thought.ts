import mongoose, { Schema, type InferSchemaType } from "mongoose";

const ThoughtSchema = new Schema(
  {
    text: { type: String, required: true },
    author: { type: String, default: "The Dreamer" },
    category: { type: String, default: "Motivation" },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export type ThoughtDoc = InferSchemaType<typeof ThoughtSchema>;

export const Thought =
  mongoose.models.Thought || mongoose.model("Thought", ThoughtSchema);
