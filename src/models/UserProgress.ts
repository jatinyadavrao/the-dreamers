import mongoose, { Schema, type InferSchemaType } from "mongoose";

const UserProgressSchema = new Schema(
  {
    userId: { type: String, required: true, index: true }, // app user id (Mongo _id)
    leetcodeId: { type: Number, required: true },
    title: { type: String, default: "" },
    link: { type: String, default: "" },
    difficulty: { type: String, default: "" },
    solved: { type: Boolean, default: false },
    bookmarked: { type: Boolean, default: false },
    note: { type: String, default: "" },
  },
  { timestamps: true }
);

UserProgressSchema.index({ userId: 1, leetcodeId: 1 }, { unique: true });

export type UserProgressDoc = InferSchemaType<typeof UserProgressSchema>;

export const UserProgress =
  mongoose.models.UserProgress ||
  mongoose.model("UserProgress", UserProgressSchema);
