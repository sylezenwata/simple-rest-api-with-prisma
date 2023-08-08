import uuid4 from "uuid4";
import moment from "moment";
import { _PrismaClient, _Prisma } from "../db";
import { AuthProps, DynamicTypes, UserSelect } from "../interfaces";
import { formatDate, omitProps } from "../utils/helper";
import envConfig from "../utils/env-config";

const validUser = async (emailOrId: string) => {
	try {
		const user = await _PrismaClient.user.findFirst({
			where: {
				OR: [
					{
						id: emailOrId,
					},
					{
						email: emailOrId,
					},
				],
			},
		});
		if (!user) {
			throw {
				status: 401,
				message: "Invalid user",
			};
		}
		if (user.blacklisted !== false) {
			throw {
				status: 401,
				message: "This account has been suspended",
			};
		}
		return user;
	} catch (error) {
		throw error;
	}
};

const authUser = async <T extends Record<string, any>>(
	user: DynamicTypes<T>
) => {
	try {
		const token = uuid4();
		const expiresAt = new Date(
			formatDate(moment().add(envConfig.sessionExpiryHours, "hours"))
		);

		await _PrismaClient.session.create({
			data: {
				token,
				expires_at: expiresAt,
				user_id: user.id,
			},
		});

		return {
			session: {
				token,
				expires_at: expiresAt,
			},
			user: omitProps(user, "password"),
		};
	} catch (error) {
		throw error;
	}
};

export default {
	validUser,
	authUser,
};
