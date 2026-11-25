import mongoose, { Schema } from "mongoose";

/**
 * One fixed-window counter per rule, subject and window. _id = "<rule>:<keyed hash of subject>:<window start>".
 * MongoDB deletes each document on its own shortly after its window closes (TTL index on expiresAt).
 */
const RateLimitSchema = new Schema(
  {
    _id: { type: String, required: true },
    count: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true },
  },
  { versionKey: false }
);

RateLimitSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RateLimit = mongoose.models.RateLimit || mongoose.model("RateLimit", RateLimitSchema);
