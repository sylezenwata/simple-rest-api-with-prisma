import bcryptjs from "bcryptjs";
import { _PrismaClient } from "./db";
import { Roles } from "./interfaces";

(async () => {
	try {
		const firstName = "Jane";
		const lastName = "Doe";
		const email = "janedoe@email.com";
		const password = "123456";
		const role = Roles.SUPER

		const salt = await bcryptjs.genSalt(12);
		const hashedPassword = await bcryptjs.hash(password, salt);

		const user = await _PrismaClient.user.upsert({
			where: {
				email,
			},
			update: {
				first_name: firstName,
				last_name: lastName,
				password: hashedPassword,
				role,
			},
			create: {
				email,
				first_name: firstName,
				last_name: lastName,
				password: hashedPassword,
				role,
			},
		});

		console.log(`Login details are email: ${email} and password: ${password}`);
	} catch (err) {
		console.log(err);
	} finally {
		_PrismaClient.$disconnect();
	}
})();
