import express, { NextFunction, Request, Response } from "express";
import userServices from "../services/user";
import validationSchema from "../utils/validation-schema";
import bcryptjs from "bcryptjs";
import { _Prisma, _PrismaClient } from "../db";
import { valIsAdmin, valSession } from "../middlewares";
import { Roles, SessionSelect } from "../interfaces";
import { isAdmin } from "../utils/helper";

const routes = express.Router();

// login route
routes.post(
	"/login",
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			// validate required inputs
			validationSchema.loginSchema.validateSync(req.body);

			const { email, password } = req.body;

			const user = await userServices.validUser(email);

			if (
				!(await bcryptjs.compare(password as string, user.password as string))
			) {
				throw {
					status: 401,
					message: "Incorrect password",
				};
			}

			const auth = await userServices.authUser(user);

			res.json(auth);
		} catch (error) {
			next(error);
		}
	}
);

// account creation route
routes.post(
	"/create-account",
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			validationSchema.registerSchema.validateSync(req.body);

			const { email, password, first_name, last_name } = req.body;

			const salt = await bcryptjs.genSalt(12);
			const hashedPassword = await bcryptjs.hash(password, salt);

			const newUser = await _PrismaClient.user.create({
				data: {
					email,
					password: hashedPassword,
					first_name,
					last_name,
				},
			});

			const auth = await userServices.authUser(newUser);

			res.json(auth);
		} catch (error: any) {
			if (error.code === "P2002") {
				error.status = 400;
				error.message = "email already exists";
			}
			next(error);
		}
	}
);

// logout route
routes.put(
	"/logout",
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			validationSchema.logoutSchema.validateSync(req.body);

			const { token } = req.body;

			const session = await _PrismaClient.session.findUnique({
				where: {
					token: token,
					blacklisted: false,
				},
			});

			if (!session) {
				throw {
					status: 401,
					message: "Token does not match any session",
				};
			}

			await _PrismaClient.session.update({
				where: {
					id: session.id,
				},
				data: {
					blacklisted: true,
				},
			});

			res.json({
				message: "Logout was successful",
			});
		} catch (error) {
			next(error);
		}
	}
);

// routes to update account
routes.put(
	"/update-account",
	valSession(true),
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			validationSchema.updateAccountSchema.validateSync(req.body);

			let { email, first_name, last_name, phone, address, gender, theme } =
				req.body;
			const session: SessionSelect = res.locals.session;

			gender = (gender as string).toUpperCase();
			if (theme) {
				theme = (theme as string).toUpperCase();
			}

			await _PrismaClient.user.update({
				where: {
					id: session.user_id,
				},
				data: {
					email,
					first_name,
					last_name,
					Profile: {
						upsert: {
							where: {
								user_id: session.user_id,
							},
							create: {
								phone,
								address,
								gender,
								theme,
							},
							update: {
								phone,
								address,
								gender,
								theme,
							},
						},
					},
				},
			});

			res.json({
				message: "Update was successful",
			});
		} catch (error: any) {
			if (error.code === "P2002") {
				error.status = 400;
				error.message = "email already exists";
			}
			next(error);
		}
	}
);

// change password route
routes.put(
	"/change-password",
	valSession(true),
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			validationSchema.changePasswordSchema.validateSync(req.body);

			let { current_password, new_password, repeat_password } = req.body;
			const session: SessionSelect = res.locals.session;

			if (
				!(await bcryptjs.compare(
					current_password as string,
					session.user?.password as string
				))
			) {
				throw {
					status: 401,
					message: "Incorrect password",
				};
			}

			if (!(new_password === repeat_password)) {
				throw {
					status: 400,
					message: "repeat_password must match new_password",
				};
			}

			if (new_password === current_password) {
				throw {
					status: 400,
					message: "new_password is same as current_password",
				};
			}

			const salt = await bcryptjs.genSalt(12);
			const hashedPassword = await bcryptjs.hash(new_password, salt);
			await _PrismaClient.user.update({
				where: {
					id: session.user_id,
				},
				data: {
					password: hashedPassword,
				},
			});

			res.json({
				message: "Password change was successful",
			});
		} catch (error) {
			next(error);
		}
	}
);

// route to create a post
routes.post(
	"/create-post",
	valSession(true),
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			validationSchema.createPostSchema.validateSync(req.body);

			let { title, content } = req.body;
			const session: SessionSelect = res.locals.session;

			const post = await _PrismaClient.post.create({
				data: {
					title: title,
					content,
					author_id: session.user_id as string,
				},
			});

			res.json(post);
		} catch (error) {
			next(error);
		}
	}
);

// get all users route
routes.get(
	"/users",
	valSession(true),
	valIsAdmin(undefined),
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const users = await _PrismaClient.user.findMany({
				orderBy: {
					created_at: "desc",
				},
			});

			res.json(users);
		} catch (error) {
			next(error);
		}
	}
);

// get a specific user
// an admin can see a blacklisted user and post
routes.get(
	"/users/:id",
	valSession(false),
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { id } = req.params;
			const session: SessionSelect = res.locals.session;

			const user = await _PrismaClient.user.findUnique({
				where: {
					id: id,
					...(session && isAdmin(session.user?.role || "")
						? {}
						: { blacklisted: false }),
				},
				select: {
					id: true,
					first_name: true,
					last_name: true,
					email: true,
					blacklisted: true,
					created_at: true,
					updated_at: true,
					Post: {
						where: {
							...(session && isAdmin(session.user?.role || "")
								? {}
								: { blacklisted: false }),
						},
					},
					...(session &&
					(isAdmin(session.user?.role || "") || session.user?.id === id)
						? {
								role: true,
								Profile: true,
								Session: true,
						  }
						: { blacklisted: false }),
				},
			});

			if (!user) {
				throw {
					status: 404,
					message: "User does not exist or has been removed",
				};
			}

			res.json(user);
		} catch (error) {
			next(error);
		}
	}
);

// whitelist or blacklist a user
routes.put(
	"/users/:id/flag",
	valSession(true),
	valIsAdmin(Roles.SUPER),
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const user = await _PrismaClient.user.findUnique({
				where: {
					id: req.params.id,
				},
			});

			if (!user) {
				throw {
					status: 404,
					message: "Post does not exist or has been removed",
				};
			}

			await _PrismaClient.user.update({
				where: {
					id: user.id,
				},
				data: {
					blacklisted: !user.blacklisted,
				},
			});

			res.json({
				message: `User has been ${
					user.blacklisted ? "whitlisted" : "blacklisted"
				}`,
			});
		} catch (error) {
			next(error);
		}
	}
);

// get all posts route
routes.get(
	"/posts",
	valSession(false),
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const session: SessionSelect = res.locals.session;

			const posts = await _PrismaClient.post.findMany({
				orderBy: {
					created_at: "desc",
				},
				where: {
					...(session && isAdmin(session.user?.role || "")
						? {}
						: { blacklisted: false }),
				},
			});

			res.json(posts);
		} catch (error) {
			next(error);
		}
	}
);

// get a post route
routes.get(
	"/posts/:id",
	valSession(false),
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const session: SessionSelect = res.locals.session;

			const post = await _PrismaClient.post.findUnique({
				where: {
					id: req.params.id,
					...(session && isAdmin(session.user?.role || "")
						? {}
						: { blacklisted: false }),
				},
			});

			if (!post) {
				throw {
					status: 404,
					message: "Post does not exist or has been removed",
				};
			}

			res.json(post);
		} catch (error) {
			next(error);
		}
	}
);

// whitelist or blacklist a post
routes.put(
	"/posts/:id/flag",
	valSession(true),
	valIsAdmin(undefined),
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const post = await _PrismaClient.post.findUnique({
				where: {
					id: req.params.id,
				},
			});

			if (!post) {
				throw {
					status: 404,
					message: "Post does not exist or has been removed",
				};
			}

			await _PrismaClient.post.update({
				where: {
					id: post.id,
				},
				data: {
					blacklisted: !post.blacklisted,
				},
			});

			res.json({
				message: `Post has been ${
					post.blacklisted ? "whitlisted" : "blacklisted"
				}`,
			});
		} catch (error) {
			next(error);
		}
	}
);

export default routes;
