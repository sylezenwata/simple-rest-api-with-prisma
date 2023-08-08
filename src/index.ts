import express, { NextFunction, Request, Response } from "express";
import path from "path";
import cors from "cors";
import routes from "./routes";
import envConfig from "./utils/env-config";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const isProduction = envConfig.environment === "production";
const publicPath = path.join(__dirname, "../public");

const corsOption = {
	origin: isProduction ? envConfig.allowedOrigins.split(",") : "*",
	methods: "GET, POST, PUT, DELETE",
	preflightContinue: false,
	optionsSuccessStatus: 204,
	maxAge: 3600,
	headers: ["Content-Type", "Authorization", "X-Access-Token"],
	// credentials: true
};
app.use(cors(corsOption));
app.options("*", cors(corsOption));

// static files
const cacheDuration = 3600 * 24 * 30 * 1000; // 30 days
app.use(express.static(publicPath, { maxAge: cacheDuration }));

app.use(routes);

app.use(() => {
	throw {
		status: 404,
		message: "API link does not exists or is no longer available",
	};
});

app.use((error: any, req: Request, res: Response, next: NextFunction) => {
	console.log(JSON.stringify(error));
	const status =
		error.status || (error.name === "ValidationError" && 400) || 500;
	const message = error.message || "Internal server error";
	res.status(status).send(message);
});

app.listen(envConfig.port, () =>
	console.log(`Api running on port ${envConfig.port}`)
);
