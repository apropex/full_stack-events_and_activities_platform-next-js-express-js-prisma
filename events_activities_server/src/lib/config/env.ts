import dotenv from "dotenv";
import path from "path";
import { envChecker } from "../../utils/envChecker";

dotenv.config({ path: path.join(process.cwd(), ".env") });

export const ENV = process.env;

interface iENV {
  port: number;
  client_url: string;
  database_url: string;
  bcrypt_salt: number;
  jwt: {
    access_token_secret: string;
    access_token_expire_time: string;
    refresh_token_secret: string;
    refresh_token_expire_time: string;
    temp_token_secret: string;
    temp_token_expire_time: string;
  };
  cloudinary: {
    cloud_name: string;
    api_key: string;
    api_secret: string;
  };

  redis: {
    username: string;
    pass: string;
    host: string;
    port: number;
    otp_expiration: number;
  };
}

const env = {
  port: Number(ENV.PORT),
  client_url: ENV.CLIENT_URL,
  database_url: ENV.DATABASE_URL,
  bcrypt_salt: Number(ENV.BCRYPT_SALT),
  jwt: {
    access_token_secret: ENV.ACCESS_TOKEN_SECRET,
    access_token_expire_time: ENV.ACCESS_TOKEN_EXPIRE_TIME,
    refresh_token_secret: ENV.REFRESH_TOKEN_SECRET,
    refresh_token_expire_time: ENV.REFRESH_TOKEN_EXPIRE_TIME,
    temp_token_secret: ENV.TEMP_TOKEN_SECRET,
    temp_token_expire_time: ENV.TEMP_TOKEN_EXPIRE_TIME,
  },
  cloudinary: {
    cloud_name: ENV.CLOUDINARY_CLOUD_NAME,
    api_key: ENV.CLOUDINARY_API_KEY,
    api_secret: ENV.CLOUDINARY_API_SECRET,
  },
  redis: {
    username: ENV.REDIS_USERNAME,
    pass: ENV.REDIS_PASS,
    host: ENV.REDIS_HOST,
    port: Number(ENV.REDIS_PORT),
    otp_expiration: Number(ENV.REDIS_OTP_EXPIRATION),
  },
} as iENV;

envChecker(env);

//

export const isProd = ENV.NODE_ENV === "production";
export default env;
