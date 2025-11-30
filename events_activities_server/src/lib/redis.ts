import { createClient } from "redis";
import env from "./config/env";

const redis = env.redis;

export const redisClient = createClient({
  username: redis.username,
  password: redis.pass,
  socket: {
    host: redis.host,
    port: redis.port,
  },
});

redisClient.on("error", (err) => console.error("🚨 Redis Client Error", err));

export const connectRedis = async () => {
  if (!redisClient.isOpen) await redisClient.connect();
};
