import * as yup from "yup";
import { Themes } from "../interfaces";

const loginSchema = yup.object().shape({
	email: yup.string().email().required(),
	password: yup.string().required(),
});

const registerSchema = yup.object().shape({
	email: yup.string().email().trim().required(),
	password: yup.string().trim().required(),
	first_name: yup.string().trim().required(),
	last_name: yup.string().trim().required(),
});

const updateAccountSchema = yup.object().shape({
	email: yup.string().email().trim().required(),
	first_name: yup.string().trim().required(),
	last_name: yup.string().trim().required(),
	phone: yup.string().trim().required(),
	address: yup.string().trim().required(),
	gender: yup
		.string()
		.trim()
		.matches(/^(male|female|other)$/i)
		.required("gender can either be male or female or other"),
	theme: yup
		.string()
		.trim()
		.matches(/^(light|dark)$/i, {
			message: "theme can either be light or dark",
		}),
});

const changePasswordSchema = yup.object().shape({
	current_password: yup.string().trim().required(),
	new_password: yup.string().trim().required(),
	repeat_password: yup.string().trim().required(),
});

const createPostSchema = yup.object().shape({
	title: yup.string().trim().required(),
	content: yup.string().trim().required(),
});

const logoutSchema = yup.object().shape({
	title: yup.string().trim().required(),
	content: yup.string().trim().required(),
});

export default {
	loginSchema,
	registerSchema,
	logoutSchema,
	updateAccountSchema,
	changePasswordSchema,
	createPostSchema,
};
