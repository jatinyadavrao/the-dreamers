import mongoose, { Schema, type InferSchemaType } from "mongoose";

const ProfileSchema = new Schema(
  {
    key: { type: String, default: "singleton", unique: true }, // ensures one doc
    name: { type: String, default: "Jatin" },
    role: { type: String, default: "Engineer • Creator • Dreamer" },
    bio: {
      type: String,
      default:
        "Hi, I'm building The Dreamers to help everyone crack their dream companies. Follow along!",
    },
    avatarUrl: { type: String, default: "" },
    socials: {
      instagram: { type: String, default: "" },
      youtube: { type: String, default: "" },
      twitter: { type: String, default: "" },
      github: { type: String, default: "" },
      linkedin: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

export type ProfileDoc = InferSchemaType<typeof ProfileSchema>;

export const Profile =
  mongoose.models.Profile || mongoose.model("Profile", ProfileSchema);
