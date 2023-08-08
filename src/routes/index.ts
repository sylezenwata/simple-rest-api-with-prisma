import express from "express";
import v1 from "./v1";

const routes = express.Router();

routes.get("/", (req, res) => {
	res.json({
		message:
			"Welcome to Simple Rest API with Prisma, active API can be accessed on path /v1.",
	});
});

routes.use("/v1", v1);

export default routes;
