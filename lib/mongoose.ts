import mongoose from "mongoose";

// Keep a cached connection across hot reloads in development.
// This prevents connections growing exponentially during API route usage.
declare global {
  // eslint-disable-next-line no-var
  var mongooseConn: Promise<typeof mongoose> | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI || "";

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI env var is required");
}

export function connectToDatabase() {
  if (!global.mongooseConn) {
    global.mongooseConn = mongoose.connect(MONGODB_URI, {
      // connection options can be added here if needed
    });
  }
  return global.mongooseConn;
}


