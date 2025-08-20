import { config } from "dotenv";
config();

export const PORT = process.env.PORT || 5000;

// Base de datos principal (existente)
export const DB_USER = process.env.DB_USER || "master";
export const DB_PASSWORD = process.env.DB_PASSWORD || "yourStrong#Password";
export const DB_SERVER = process.env.DB_SERVER || "localhost";
export const DB_DATABASE = process.env.DB_DATABASE || "webstore";

// Segunda base de datos
export const DB_USER_2 = process.env.DB_USER_2 || "master";
export const DB_PASSWORD_2 = process.env.DB_PASSWORD_2 || "yourStrong#Password";
export const DB_SERVER_2 = process.env.DB_SERVER_2 || "localhost";
export const DB_DATABASE_2 = process.env.DB_DATABASE_2 || "webstore";
