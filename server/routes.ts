import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { authenticateToken, requireRole } from "./middleware/auth";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { insertUserSchema, loginSchema, insertPostSchema, insertCommentSchema, insertLikeSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET must be set");
  }

  app.post('/api/auth/register', async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      const existingUserByEmail = await storage.getUserByEmail(validatedData.email);
      if (existingUserByEmail) {
        return res.status(400).json({ message: 'البريد الإلكتروني مستخدم بالفعل' });
      }

      const existingUserByPhone = await storage.getUserByPhone(validatedData.phone);
      if (existingUserByPhone) {
        return res.status(400).json({ message: 'رقم الهاتف مستخدم بالفعل' });
      }

      const passwordHash = await bcrypt.hash(validatedData.password, 10);
      const user = await storage.createUser({
        ...validatedData,
        passwordHash,
      });

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
      const { passwordHash: _, ...safeUser } = user;
      res.json({ token, user: safeUser });
    } catch (error: any) {
      res.status(400).json({ message: error.message || 'فشل التسجيل' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(validatedData.email);
      if (!user) {
        return res.status(401).json({ message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
      }

      const isPasswordValid = await bcrypt.compare(validatedData.password, user.passwordHash);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
      }

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
      const { passwordHash: _, ...safeUser } = user;
      res.json({ token, user: safeUser });
    } catch (error: any) {
      res.status(400).json({ message: error.message || 'فشل تسجيل الدخول' });
    }
  });

  app.get('/api/auth/me', authenticateToken, async (req, res) => {
    try {
      const user = await storage.getUserById(req.userId!);
      if (!user) {
        return res.status(404).json({ message: 'المستخدم غير موجود' });
      }
      const { passwordHash: _, ...safeUser } = user;
      res.json(safeUser);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/api/users', authenticateToken, async (req, res) => {
    const user = await storage.getUserById(req.userId!);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'ليس لديك صلاحية للقيام بهذا الإجراء' });
    }
    
    try {
      const users = await storage.getAllUsers();
      const safeUsers = users.map(({ passwordHash, ...user }) => user);
      res.json(safeUsers);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch('/api/users/:id/role', authenticateToken, async (req, res) => {
    const user = await storage.getUserById(req.userId!);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'ليس لديك صلاحية للقيام بهذا الإجراء' });
    }
    
    try {
      const userId = parseInt(req.params.id);
      const { role } = req.body;

      if (!['user', 'social_moderator', 'cultural_moderator', 'admin'].includes(role)) {
        return res.status(400).json({ message: 'دور غير صالح' });
      }

      const user = await storage.updateUserRole(userId, role);
      const { passwordHash: _, ...safeUser } = user;
      res.json(safeUser);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete('/api/users/:id', authenticateToken, async (req, res) => {
    const user = await storage.getUserById(req.userId!);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'ليس لديك صلاحية للقيام بهذا الإجراء' });
    }
    
    try {
      const userId = parseInt(req.params.id);
      
      if (userId === req.userId) {
        return res.status(400).json({ message: 'لا يمكنك حذف حسابك الخاص' });
      }

      await storage.deleteUser(userId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/api/posts/:section', authenticateToken, async (req, res) => {
    try {
      const section = req.params.section;
      let posts;

      if (section === 'all') {
        posts = await storage.getAllPosts(req.userId);
      } else {
        if (!['social', 'cultural', 'general'].includes(section)) {
          return res.status(400).json({ message: 'قسم غير صالح' });
        }
        posts = await storage.getPostsBySection(section, req.userId);
      }

      res.json(posts);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/api/posts/detail/:id', authenticateToken, async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const post = await storage.getPostById(postId, req.userId);
      
      if (!post) {
        return res.status(404).json({ message: 'المنشور غير موجود' });
      }

      res.json(post);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post('/api/posts', authenticateToken, async (req, res) => {
    try {
      const user = await storage.getUserById(req.userId!);
      
      if (!user || !['admin', 'social_moderator', 'cultural_moderator'].includes(user.role)) {
        return res.status(403).json({ message: 'ليس لديك صلاحية لإنشاء منشور' });
      }

      const validatedData = insertPostSchema.parse(req.body);

      if (user.role === 'social_moderator' && validatedData.section !== 'social') {
        return res.status(403).json({ message: 'يمكنك النشر في القسم الاجتماعي فقط' });
      }

      if (user.role === 'cultural_moderator' && validatedData.section !== 'cultural') {
        return res.status(403).json({ message: 'يمكنك النشر في القسم الثقافي فقط' });
      }

      const post = await storage.createPost({
        ...validatedData,
        userId: req.userId!,
      });

      res.json(post);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch('/api/posts/:id', authenticateToken, async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const post = await storage.getPostById(postId);

      if (!post) {
        return res.status(404).json({ message: 'المنشور غير موجود' });
      }

      const user = await storage.getUserById(req.userId!);
      const canEdit = user && (
        user.id === post.userId ||
        user.role === 'admin' ||
        (user.role === 'social_moderator' && post.section === 'social') ||
        (user.role === 'cultural_moderator' && post.section === 'cultural')
      );

      if (!canEdit) {
        return res.status(403).json({ message: 'ليس لديك صلاحية لتعديل هذا المنشور' });
      }

      const validatedData = insertPostSchema.parse(req.body);
      const updatedPost = await storage.updatePost(postId, validatedData);
      res.json(updatedPost);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete('/api/posts/:id', authenticateToken, async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const post = await storage.getPostById(postId);

      if (!post) {
        return res.status(404).json({ message: 'المنشور غير موجود' });
      }

      const user = await storage.getUserById(req.userId!);
      const canDelete = user && (
        user.id === post.userId ||
        user.role === 'admin' ||
        (user.role === 'social_moderator' && post.section === 'social') ||
        (user.role === 'cultural_moderator' && post.section === 'cultural')
      );

      if (!canDelete) {
        return res.status(403).json({ message: 'ليس لديك صلاحية لحذف هذا المنشور' });
      }

      await storage.deletePost(postId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/api/comments/:postId', authenticateToken, async (req, res) => {
    try {
      const postId = parseInt(req.params.postId);
      const comments = await storage.getCommentsByPostId(postId);
      res.json(comments);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post('/api/comments', authenticateToken, async (req, res) => {
    try {
      const validatedData = insertCommentSchema.parse(req.body);
      const comment = await storage.createComment({
        ...validatedData,
        userId: req.userId!,
      });
      res.json(comment);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post('/api/likes', authenticateToken, async (req, res) => {
    try {
      const { postId, reactionType } = req.body;
      const existingLike = await storage.getLikeByUserAndPost(req.userId!, postId);

      if (!reactionType || reactionType === '') {
        if (existingLike) {
          await storage.deleteLike(req.userId!, postId);
        }
        res.json({ success: true, reaction: null });
      } else if (existingLike) {
        if (existingLike.reactionType === reactionType) {
          await storage.deleteLike(req.userId!, postId);
          res.json({ success: true, reaction: null });
        } else {
          const updated = await storage.updateReaction(req.userId!, postId, reactionType);
          res.json({ success: true, reaction: updated.reactionType });
        }
      } else {
        await storage.createLike({
          postId,
          reactionType,
          userId: req.userId!,
        });
        res.json({ success: true, reaction: reactionType });
      }
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
