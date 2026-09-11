import mongoose from "mongoose";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Reuse the connection across hot reloads / serverless invocations.
const globalForMongoose = globalThis as unknown as { _mongoose?: MongooseCache };
const cache: MongooseCache = globalForMongoose._mongoose ?? { conn: null, promise: null };
globalForMongoose._mongoose = cache;

export async function connectDB(): Promise<typeof mongoose> {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined. Add it to .env.local");
  }
  if (cache.conn) return cache.conn;
  if (!cache.promise) {
    cache.promise = mongoose.connect(MONGODB_URI, { bufferCommands: false });
  }
  cache.conn = await cache.promise;
  return cache.conn;
}
