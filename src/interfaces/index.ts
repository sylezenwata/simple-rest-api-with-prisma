export enum Roles {
	USER = "USER",
	ADMIN = "ADMIN",
	SUPER = "SUPER",
}

export enum AdminRoles {
	ADMIN = "ADMIN",
	SUPER = "SUPER",
}

export enum Themes {
	LIGHT = "LIGHT",
	DARK = "DARK",
}

export type DynamicTypes<T extends Record<string, any>> = T & {
	[key: string]: any;
};

export interface UserSelect {
	id: string;
	first_name: string;
	last_name: string;
	email: string;
	password: string;
	role: string;
	blacklisted: boolean;
	created_at: Date;
	updated_at: Date;
}

export interface SessionSelect {
	token: string;
	expires_at: Date;
	user_id?: string;
	user?: UserSelect;
}

export interface AuthProps {
	session: SessionSelect;
	user: UserSelect;
}
