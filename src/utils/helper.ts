import moment, { MomentInput } from "moment";
import { AdminRoles } from "../interfaces";

export function formatDate(date?: MomentInput) {
	return moment(date).format("YYYY-MM-DD h:mm:ss a");
}

type AnyObject = { [key: string]: any };

export function omitProps<T extends AnyObject, K extends keyof T>(
	obj: T,
	...propsToOmit: K[]
): Omit<T, K> {
	const newObj = { ...obj };

	propsToOmit.forEach((prop) => delete newObj[prop]);

	return newObj;
}

export function isAdmin(userRole: string) {
	return Object.values({ ...AdminRoles }).some(
		(role) => role.toString() == userRole
	);
}
