import {
  sqliteTable,
  text as sqliteText,
  integer as sqliteInteger,
  primaryKey as sqlitePrimaryKey,
} from "drizzle-orm/sqlite-core";
import {
  mysqlTable,
  varchar as mysqlVarchar,
  int as mysqlInt,
  datetime as mysqlDatetime,
  boolean as mysqlBoolean,
  primaryKey as mysqlPrimaryKey,
} from "drizzle-orm/mysql-core";
import type { AdapterAccountType } from "@auth/core/adapters";

const isMySQL = process.env.DATABASE_URL?.startsWith('mysql://');

export const tableFactory = isMySQL ? mysqlTable : sqliteTable;

// Helper to handle differences between SQLite and MySQL types
const text = (name: string) => isMySQL ? mysqlVarchar(name, { length: 255 }) : sqliteText(name);
const idText = (name: string) => isMySQL ? mysqlVarchar(name, { length: 255 }) : sqliteText(name);
const timestamp = (name: string) => isMySQL ? mysqlDatetime(name, { mode: 'date' }) : sqliteInteger(name, { mode: "timestamp_ms" });
const boolean = (name: string) => isMySQL ? mysqlBoolean(name) : sqliteInteger(name, { mode: "boolean" });
const integer = (name: string) => isMySQL ? mysqlInt(name) : sqliteInteger(name);
// @ts-ignore
const primaryKey = (config: { columns: any[] }) => isMySQL ? mysqlPrimaryKey(config) : sqlitePrimaryKey(config);

// @ts-ignore
export const users = tableFactory("user", {
  id: idText("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified"),
  image: text("image"),
  password: text("password"),
  twoFactorSecret: text("twoFactorSecret"),
  twoFactorEnabled: boolean("twoFactorEnabled").default(false),
});

// @ts-ignore
export const accounts = tableFactory(
  "account",
  {
    userId: idText("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
// @ts-ignore
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
);

// @ts-ignore
export const sessions = tableFactory("session", {
  sessionToken: idText("sessionToken").primaryKey(),
  userId: idText("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires").notNull(),
});

// @ts-ignore
export const verificationTokens = tableFactory(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires").notNull(),
  },
// @ts-ignore
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
);
