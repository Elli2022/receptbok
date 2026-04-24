import mongoose from "mongoose";

const databaseUrl = process.env.DATABASE_URL || process.env.MONGODB_URI;

type CachedConnection = {
  promise?: Promise<typeof mongoose>;
  connection?: typeof mongoose;
};

const globalWithMongoose = global as typeof globalThis & {
  mongooseConnection?: CachedConnection;
};

const cached = globalWithMongoose.mongooseConnection || {};
globalWithMongoose.mongooseConnection = cached;

export const hasDatabaseUrl = () => Boolean(databaseUrl);

export const connectToDatabase = async () => {
  if (!databaseUrl) {
    throw new Error("DATABASE_URL saknas.");
  }

  if (cached.connection) {
    return cached.connection;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(databaseUrl, {
      bufferCommands: false,
    });
  }

  cached.connection = await cached.promise;
  return cached.connection;
};
