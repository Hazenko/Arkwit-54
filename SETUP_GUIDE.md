# دليل إعداد وتشغيل المشروع / Project Setup Guide

## نظرة عامة على المشروع / Project Overview

هذا تطبيق ويب كامل مبني باستخدام:
- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Express.js + Node.js
- **Database**: PostgreSQL (Neon)
- **Authentication**: JWT (JSON Web Tokens)
- **ORM**: Drizzle ORM

This is a full-stack web application built with React, Express, PostgreSQL, and JWT authentication.

---

## البنية المعمارية / Architecture

### قاعدة البيانات / Database Schema

يحتوي التطبيق على 4 جداول رئيسية:

1. **users** - المستخدمون
   - id (معرف تلقائي)
   - fullName (الاسم الكامل)
   - email (البريد الإلكتروني - فريد)
   - phone (رقم الهاتف - فريد)
   - passwordHash (كلمة المرور المشفرة)
   - role (الدور: user, social_moderator, cultural_moderator, admin)
   - createdAt (تاريخ الإنشاء)

2. **posts** - المنشورات
   - id, title, content, section, userId, createdAt

3. **comments** - التعليقات
   - id, postId, userId, commentText, createdAt

4. **likes** - الإعجابات
   - id, postId, userId, createdAt

### نظام الصلاحيات / Roles & Permissions

- **user** (مستخدم عادي): يمكنه القراءة والتعليق والإعجاب
- **social_moderator** (مشرف اجتماعي): يمكنه إنشاء وتعديل المنشورات في القسم الاجتماعي
- **cultural_moderator** (مشرف ثقافي): يمكنه إنشاء وتعديل المنشورات في القسم الثقافي
- **admin** (مدير): صلاحيات كاملة لإدارة المستخدمين والمنشورات

---

## متطلبات التشغيل / Requirements

### المتغيرات البيئية المطلوبة / Required Environment Variables

يجب توفر المتغيرات التالية في البيئة:

```bash
DATABASE_URL=postgresql://...    # رابط قاعدة البيانات
JWT_SECRET=your-secret-key      # مفتاح تشفير JWT (32 حرف على الأقل)
```

---

## خطوات الإعداد / Setup Steps

### 1. إعداد قاعدة البيانات / Database Setup

#### أ. إنشاء قاعدة البيانات
تم إنشاء قاعدة بيانات PostgreSQL تلقائياً وإضافة DATABASE_URL إلى المتغيرات البيئية.

#### ب. تطبيق هيكل قاعدة البيانات
```bash
npm run db:push
```

هذا الأمر ينشئ جميع الجداول في قاعدة البيانات.

### 2. إنشاء حساب المدير الأول / Create First Admin

لحل مشكلة "الدجاجة والبيضة" (لا يمكن ترقية مستخدم بدون مدير موجود)، قم بتشغيل:

```bash
tsx server/seed.ts
```

#### البيانات الافتراضية للمدير / Default Admin Credentials

بعد تشغيل الأمر أعلاه، سيتم إنشاء حساب مدير بالبيانات التالية:

- **البريد الإلكتروني / Email**: `admin@example.com`
- **كلمة المرور / Password**: `admin123456`
- **الاسم / Full Name**: `المشرف الرئيسي`
- **الهاتف / Phone**: `+966500000000`

⚠️ **مهم جداً**: يجب تغيير كلمة المرور بعد أول تسجيل دخول!

#### تخصيص بيانات المدير / Customize Admin Data

يمكنك تخصيص بيانات المدير باستخدام متغيرات بيئية:

```bash
ADMIN_EMAIL="your@email.com" \
ADMIN_PASSWORD="YourSecurePassword" \
ADMIN_FULLNAME="اسمك الكامل" \
ADMIN_PHONE="+966XXXXXXXXX" \
tsx server/seed.ts
```

### 3. تشغيل التطبيق / Run the Application

```bash
npm run dev
```

التطبيق سيعمل على: `http://localhost:5000`

---

## طرق التسجيل / Registration Methods

### 1. تسجيل المستخدمين العاديين / Regular User Registration

#### من واجهة المستخدم / Via UI:
1. افتح التطبيق
2. اضغط على "تسجيل" أو "Register"
3. املأ النموذج:
   - الاسم الكامل
   - البريد الإلكتروني
   - رقم الهاتف
   - كلمة المرور (6 أحرف على الأقل)
4. اضغط "تسجيل"

#### عبر API:
```bash
POST /api/auth/register
Content-Type: application/json

{
  "fullName": "اسم المستخدم",
  "email": "user@example.com",
  "phone": "+966500000001",
  "password": "password123"
}
```

**الرد / Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "fullName": "اسم المستخدم",
    "email": "user@example.com",
    "phone": "+966500000001",
    "role": "user",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 2. تسجيل دخول المدير / Admin Login

#### من واجهة المستخدم / Via UI:
1. افتح التطبيق
2. اضغط على "تسجيل الدخول" أو "Login"
3. أدخل:
   - البريد الإلكتروني: `admin@example.com`
   - كلمة المرور: `admin123456`
4. اضغط "تسجيل الدخول"

#### عبر API:
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "admin123456"
}
```

**الرد / Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "fullName": "المشرف الرئيسي",
    "email": "admin@example.com",
    "phone": "+966500000000",
    "role": "admin",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 3. ترقية مستخدم إلى مشرف / Promote User to Admin

فقط المدير الحالي يمكنه ترقية المستخدمين:

```bash
PATCH /api/users/:userId/role
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: application/json

{
  "role": "admin"  // أو "social_moderator" أو "cultural_moderator"
}
```

---

## إدارة المستخدمين / User Management

### عرض جميع المستخدمين / List All Users
```bash
GET /api/users
Authorization: Bearer YOUR_ADMIN_TOKEN
```

### تغيير دور المستخدم / Change User Role
```bash
PATCH /api/users/:userId/role
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: application/json

{
  "role": "social_moderator"
}
```

الأدوار المتاحة:
- `user` - مستخدم عادي
- `social_moderator` - مشرف اجتماعي
- `cultural_moderator` - مشرف ثقافي
- `admin` - مدير

### حذف مستخدم / Delete User
```bash
DELETE /api/users/:userId
Authorization: Bearer YOUR_ADMIN_TOKEN
```

---

## الأمان / Security

### حماية كلمات المرور / Password Security
- يتم تشفير كلمات المرور باستخدام bcrypt (10 جولات)
- لا يتم تخزين كلمات المرور الأصلية أبداً
- كلمة المرور يجب أن تكون 6 أحرف على الأقل

### التوثيق / Authentication
- يستخدم التطبيق JWT للتوثيق
- مدة صلاحية الـ Token: 7 أيام
- يجب إرسال Token في header:
  ```
  Authorization: Bearer YOUR_TOKEN
  ```

### متطلبات الصلاحيات / Permission Requirements

| العملية / Operation | الصلاحية المطلوبة / Required Role |
|---------------------|-----------------------------------|
| تسجيل حساب جديد | لا يوجد (عام) |
| تسجيل الدخول | لا يوجد (عام) |
| قراءة المنشورات | مستخدم مسجل |
| التعليق والإعجاب | مستخدم مسجل |
| إنشاء منشور اجتماعي | مشرف اجتماعي أو مدير |
| إنشاء منشور ثقافي | مشرف ثقافي أو مدير |
| تعديل أي منشور | صاحب المنشور أو مشرف القسم أو مدير |
| إدارة المستخدمين | مدير فقط |

---

## استكشاف الأخطاء / Troubleshooting

### خطأ: JWT_SECRET must be set
**الحل**: تأكد من إضافة JWT_SECRET في متغيرات البيئة (Secrets)

### خطأ: DATABASE_URL must be set
**الحل**: قاعدة البيانات غير متصلة. تحقق من DATABASE_URL

### لا يوجد مدير للنظام
**الحل**: قم بتشغيل:
```bash
tsx server/seed.ts
```

### نسيت كلمة مرور المدير
**الحل**: 
1. احذف المدير الحالي من قاعدة البيانات (باستخدام SQL مباشرة):
   ```sql
   DELETE FROM users WHERE email = 'admin@example.com';
   ```
2. شغل السكريبت مرة أخرى:
   ```bash
   tsx server/seed.ts
   ```

---

## ملفات المشروع الرئيسية / Key Project Files

```
project/
├── server/
│   ├── index.ts          # نقطة بدء الخادم
│   ├── routes.ts         # تعريف المسارات والـ API
│   ├── db.ts            # اتصال قاعدة البيانات
│   ├── storage.ts       # طبقة التخزين (CRUD)
│   ├── seed.ts          # سكريبت إنشاء المدير
│   └── middleware/
│       └── auth.ts      # التحقق من التوثيق
├── shared/
│   └── schema.ts        # هيكل قاعدة البيانات
├── client/
│   └── src/            # ملفات React
└── package.json        # التبعيات والأوامر
```

---

## الأوامر المتاحة / Available Commands

```bash
npm run dev          # تشغيل في وضع التطوير
npm run build        # بناء للإنتاج
npm start           # تشغيل الإنتاج
npm run db:push     # تطبيق هيكل قاعدة البيانات
tsx server/seed.ts  # إنشاء حساب المدير
```

---

## ملاحظات مهمة / Important Notes

1. **الأمان أولاً**: غيّر كلمة مرور المدير الافتراضية فوراً
2. **البريد الإلكتروني فريد**: لا يمكن استخدام نفس البريد الإلكتروني مرتين
3. **رقم الهاتف فريد**: لا يمكن استخدام نفس رقم الهاتف مرتين
4. **المدير لا يُحذف**: لا يمكن للمدير حذف حسابه الخاص
5. **التوثيق مطلوب**: جميع عمليات API (عدا التسجيل والدخول) تتطلب Token

---

## الدعم الفني / Technical Support

في حالة وجود مشاكل:
1. تحقق من سجلات الأخطاء (Console)
2. تأكد من تشغيل قاعدة البيانات
3. تحقق من المتغيرات البيئية
4. راجع هذا الدليل
