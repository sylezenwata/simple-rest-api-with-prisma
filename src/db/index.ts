import { PrismaClient, Prisma as _Prisma } from "@prisma/client";
import envConfig from "../utils/env-config";

const _PrismaClient = new PrismaClient({
	log: envConfig.environment === "development" ? ["error"] : [],
});

export { _PrismaClient, _Prisma };
