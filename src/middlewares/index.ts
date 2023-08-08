import { NextFunction, Request, Response } from "express";
import { _PrismaClient } from "../db";
import moment from "moment";
import { AdminRoles, Roles, UserSelect } from "../interfaces";
import { isAdmin } from "../utils/helper";

// middleware to validate auth session
const valSession =
	(persist: boolean) =>
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const errorRes = {
				status: 401,
				message: "Session expired",
			};

			const token = req.headers["x-access-token"];

			if (!token && persist) {
				throw errorRes;
			}

			let session;

			if (token) {
				session = await _PrismaClient.session.findUnique({
					where: {
						token: token as string,
					},
					include: {
						user: true,
					},
				});
			}

			if (
				persist &&
				(!session ||
					session.blacklisted !== false ||
					moment().isAfter(session.expires_at, "hours") ||
					session.user.blacklisted !== false)
			) {
				if (session) {
					_PrismaClient.session.update({
						where: {
							id: session.id,
						},
						data: {
							blacklisted: true,
						},
					});
				}
				throw errorRes;
			}

			res.locals.session = session;
			next();
		} catch (error) {
			next(error);
		}
	};

const valIsAdmin =
	(targetRole?: Roles) =>
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const resMessage = {
				status: 403,
				message: "Access denied",
			};

			const user: UserSelect = res.locals.session.user;
      console.log(targetRole);
      

			if (targetRole && !(targetRole.toString() == user.role)) {
				throw resMessage;
			}

			if (!isAdmin(user.role)) {
				throw resMessage;
			}

			next();
		} catch (error) {
			next(error);
		}
	};

export { valSession, valIsAdmin };
