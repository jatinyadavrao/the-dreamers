import mongoose, { Schema, type InferSchemaType } from "mongoose";

const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, default: "" }, // empty for Google-only accounts
    name: { type: String, default: "" },
    image: { type: String, default: "" },
    provider: { type: String, default: "password" }, // "password" | "google"
    emailVerified: { type: Boolean, default: false },

    // OTP email verification
    otpHash: { type: String, default: "" },
    otpExpires: { type: Date, default: null },
    otpSentAt: { type: Date, default: null }, // last send (for 60s cooldown)
    otpSendCount: { type: Number, default: 0 }, // sends in current window
    otpWindowStart: { type: Date, default: null },
  },
  { timestamps: true }
);

export type UserDoc = InferSchemaType<typeof UserSchema>;

export const User = mongoose.models.User || mongoose.model("User", UserSchema);
