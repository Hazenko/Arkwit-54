import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("user"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const posts = pgTable("posts", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  section: text("section").notNull(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const comments = pgTable("comments", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  postId: integer("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  commentText: text("comment_text").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const likes = pgTable("likes", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  postId: integer("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  reactionType: text("reaction_type").notNull().default("like"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
  comments: many(comments),
  likes: many(likes),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  user: one(users, {
    fields: [posts.userId],
    references: [users.id],
  }),
  comments: many(comments),
  likes: many(likes),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  post: one(posts, {
    fields: [comments.postId],
    references: [posts.id],
  }),
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
}));

export const likesRelations = relations(likes, ({ one }) => ({
  post: one(posts, {
    fields: [likes.postId],
    references: [posts.id],
  }),
  user: one(users, {
    fields: [likes.userId],
    references: [users.id],
  }),
}));

export const insertUserSchema = z.object({
  fullName: z.string().min(1, "الاسم الكامل مطلوب"),
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  phone: z.string().min(1, "رقم الهاتف مطلوب"),
  password: z.string().min(6, "كلمة المرور يجب أن تحتوي على 6 أحرف على الأقل"),
  role: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  password: z.string().min(1, "كلمة المرور مطلوبة"),
});

export const insertPostSchema = z.object({
  title: z.string().min(1, "العنوان مطلوب"),
  content: z.string().min(1, "المحتوى مطلوب"),
  section: z.string().min(1, "القسم مطلوب"),
});

export const insertCommentSchema = z.object({
  postId: z.number(),
  commentText: z.string().min(1, "نص التعليق مطلوب"),
});

export const insertLikeSchema = z.object({
  postId: z.number(),
  reactionType: z.string(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginUser = z.infer<typeof loginSchema>;
export type Post = typeof posts.$inferSelect;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Like = typeof likes.$inferSelect;
export type InsertLike = z.infer<typeof insertLikeSchema>;

export type PostWithDetails = Post & {
  user: Pick<User, "id" | "fullName" | "role">;
  commentsCount: number;
  likesCount: number;
  isLiked?: boolean;
  userReaction?: string;
  reactions?: { type: string; count: number }[];
};

export type CommentWithUser = Comment & {
  user: Pick<User, "id" | "fullName" | "role">;
};
