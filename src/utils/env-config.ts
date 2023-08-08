import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, "../../.env") });

const envConfig = {
	environment: process.env.NODE_ENV || "development",
	port: process.env.PORT || "3000",
	sessionExpiryHours: process.env.SESSION_EXPIRY_HOURS || "24",
	allowedOrigins: process.env.ALLOWED_ORIGINS || "",
};

export default envConfig;
