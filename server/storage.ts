import { users, posts, comments, likes, type User, type InsertUser, type Post, type InsertPost, type Comment, type InsertComment, type Like, type InsertLike, type PostWithDetails, type CommentWithUser } from "@shared/schema";
import { db } from "./db";
import { eq, and, sql, desc } from "drizzle-orm";

export interface IStorage {
  getUserById(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByPhone(phone: string): Promise<User | undefined>;
  createUser(user: InsertUser & { passwordHash: string }): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUserRole(userId: number, role: string): Promise<User>;
  deleteUser(userId: number): Promise<void>;

  getPostsBySection(section: string, userId?: number): Promise<PostWithDetails[]>;
  getAllPosts(userId?: number): Promise<PostWithDetails[]>;
  getPostById(postId: number, userId?: number): Promise<PostWithDetails | undefined>;
  createPost(post: InsertPost & { userId: number }): Promise<Post>;
  updatePost(postId: number, post: InsertPost): Promise<Post>;
  deletePost(postId: number): Promise<void>;

  getCommentsByPostId(postId: number): Promise<CommentWithUser[]>;
  createComment(comment: InsertComment & { userId: number }): Promise<Comment>;

  getLikeByUserAndPost(userId: number, postId: number): Promise<Like | undefined>;
  createLike(like: InsertLike & { userId: number }): Promise<Like>;
  deleteLike(userId: number, postId: number): Promise<void>;
  updateReaction(userId: number, postId: number, reactionType: string): Promise<Like>;
}

export class DatabaseStorage implements IStorage {
  async getUserById(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUserByPhone(phone: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.phone, phone));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser & { passwordHash: string }): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users).orderBy(desc(users.createdAt));
  }

  async updateUserRole(userId: number, role: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ role })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async deleteUser(userId: number): Promise<void> {
    await db.delete(users).where(eq(users.id, userId));
  }

  async getPostsBySection(section: string, userId?: number): Promise<PostWithDetails[]> {
    const result = await db
      .select({
        id: posts.id,
        title: posts.title,
        content: posts.content,
        section: posts.section,
        userId: posts.userId,
        createdAt: posts.createdAt,
        userName: users.fullName,
        userRole: users.role,
        commentsCount: sql<number>`cast(count(distinct ${comments.id}) as int)`,
        likesCount: sql<number>`cast(count(distinct ${likes.id}) as int)`,
        isLiked: userId 
          ? sql<boolean>`bool_or(${likes.userId} = ${userId})`
          : sql<boolean>`false`,
        userReaction: userId 
          ? sql<string>`max(case when ${likes.userId} = ${userId} then ${likes.reactionType} else null end)`
          : sql<string>`null`,
      })
      .from(posts)
      .leftJoin(users, eq(posts.userId, users.id))
      .leftJoin(comments, eq(posts.id, comments.postId))
      .leftJoin(likes, eq(posts.id, likes.postId))
      .where(eq(posts.section, section))
      .groupBy(posts.id, users.id)
      .orderBy(desc(posts.createdAt));

    return result.map(row => ({
      id: row.id,
      title: row.title,
      content: row.content,
      section: row.section,
      userId: row.userId,
      createdAt: row.createdAt,
      user: {
        id: row.userId,
        fullName: row.userName || '',
        role: row.userRole || 'user',
      },
      commentsCount: row.commentsCount,
      likesCount: row.likesCount,
      isLiked: row.isLiked,
      userReaction: row.userReaction || undefined,
    }));
  }

  async getAllPosts(userId?: number): Promise<PostWithDetails[]> {
    const result = await db
      .select({
        id: posts.id,
        title: posts.title,
        content: posts.content,
        section: posts.section,
        userId: posts.userId,
        createdAt: posts.createdAt,
        userName: users.fullName,
        userRole: users.role,
        commentsCount: sql<number>`cast(count(distinct ${comments.id}) as int)`,
        likesCount: sql<number>`cast(count(distinct ${likes.id}) as int)`,
        isLiked: userId 
          ? sql<boolean>`bool_or(${likes.userId} = ${userId})`
          : sql<boolean>`false`,
        userReaction: userId 
          ? sql<string>`max(case when ${likes.userId} = ${userId} then ${likes.reactionType} else null end)`
          : sql<string>`null`,
      })
      .from(posts)
      .leftJoin(users, eq(posts.userId, users.id))
      .leftJoin(comments, eq(posts.id, comments.postId))
      .leftJoin(likes, eq(posts.id, likes.postId))
      .groupBy(posts.id, users.id)
      .orderBy(desc(posts.createdAt));

    return result.map(row => ({
      id: row.id,
      title: row.title,
      content: row.content,
      section: row.section,
      userId: row.userId,
      createdAt: row.createdAt,
      user: {
        id: row.userId,
        fullName: row.userName || '',
        role: row.userRole || 'user',
      },
      commentsCount: row.commentsCount,
      likesCount: row.likesCount,
      isLiked: row.isLiked,
      userReaction: row.userReaction || undefined,
    }));
  }

  async getPostById(postId: number, userId?: number): Promise<PostWithDetails | undefined> {
    const result = await db
      .select({
        id: posts.id,
        title: posts.title,
        content: posts.content,
        section: posts.section,
        userId: posts.userId,
        createdAt: posts.createdAt,
        userName: users.fullName,
        userRole: users.role,
        commentsCount: sql<number>`cast(count(distinct ${comments.id}) as int)`,
        likesCount: sql<number>`cast(count(distinct ${likes.id}) as int)`,
        isLiked: userId 
          ? sql<boolean>`bool_or(${likes.userId} = ${userId})`
          : sql<boolean>`false`,
        userReaction: userId 
          ? sql<string>`max(case when ${likes.userId} = ${userId} then ${likes.reactionType} else null end)`
          : sql<string>`null`,
      })
      .from(posts)
      .leftJoin(users, eq(posts.userId, users.id))
      .leftJoin(comments, eq(posts.id, comments.postId))
      .leftJoin(likes, eq(posts.id, likes.postId))
      .where(eq(posts.id, postId))
      .groupBy(posts.id, users.id);

    if (result.length === 0) return undefined;

    const row = result[0];
    return {
      id: row.id,
      title: row.title,
      content: row.content,
      section: row.section,
      userId: row.userId,
      createdAt: row.createdAt,
      user: {
        id: row.userId,
        fullName: row.userName || '',
        role: row.userRole || 'user',
      },
      commentsCount: row.commentsCount,
      likesCount: row.likesCount,
      isLiked: row.isLiked,
      userReaction: row.userReaction || undefined,
    };
  }

  async createPost(insertPost: InsertPost & { userId: number }): Promise<Post> {
    const [post] = await db
      .insert(posts)
      .values(insertPost)
      .returning();
    return post;
  }

  async updatePost(postId: number, insertPost: InsertPost): Promise<Post> {
    const [post] = await db
      .update(posts)
      .set(insertPost)
      .where(eq(posts.id, postId))
      .returning();
    return post;
  }

  async deletePost(postId: number): Promise<void> {
    await db.delete(posts).where(eq(posts.id, postId));
  }

  async getCommentsByPostId(postId: number): Promise<CommentWithUser[]> {
    const result = await db
      .select({
        id: comments.id,
        postId: comments.postId,
        userId: comments.userId,
        commentText: comments.commentText,
        createdAt: comments.createdAt,
        userName: users.fullName,
        userRole: users.role,
      })
      .from(comments)
      .leftJoin(users, eq(comments.userId, users.id))
      .where(eq(comments.postId, postId))
      .orderBy(comments.createdAt);

    return result.map(row => ({
      id: row.id,
      postId: row.postId,
      userId: row.userId,
      commentText: row.commentText,
      createdAt: row.createdAt,
      user: {
        id: row.userId,
        fullName: row.userName || '',
        role: row.userRole || 'user',
      },
    }));
  }

  async createComment(insertComment: InsertComment & { userId: number }): Promise<Comment> {
    const [comment] = await db
      .insert(comments)
      .values(insertComment)
      .returning();
    return comment;
  }

  async getLikeByUserAndPost(userId: number, postId: number): Promise<Like | undefined> {
    const [like] = await db
      .select()
      .from(likes)
      .where(and(eq(likes.userId, userId), eq(likes.postId, postId)));
    return like || undefined;
  }

  async createLike(insertLike: InsertLike & { userId: number }): Promise<Like> {
    const [like] = await db
      .insert(likes)
      .values(insertLike)
      .returning();
    return like;
  }

  async deleteLike(userId: number, postId: number): Promise<void> {
    await db
      .delete(likes)
      .where(and(eq(likes.userId, userId), eq(likes.postId, postId)));
  }

  async updateReaction(userId: number, postId: number, reactionType: string): Promise<Like> {
    const [like] = await db
      .update(likes)
      .set({ reactionType })
      .where(and(eq(likes.userId, userId), eq(likes.postId, postId)))
      .returning();
    return like;
  }
}

export const storage = new DatabaseStorage();
