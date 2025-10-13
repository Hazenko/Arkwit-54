import { db } from "./db";
import { users, posts, comments } from "@shared/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

async function seed() {
  console.log("🌱 Starting database seeding...");

  // Create admin user
  const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123456";
  const adminFullName = process.env.ADMIN_FULLNAME || "المشرف الرئيسي";
  const adminPhone = process.env.ADMIN_PHONE || "+966500000000";

  const existingAdmin = await db
    .select()
    .from(users)
    .where(eq(users.role, "admin"))
    .limit(1);

  let adminUser;
  if (existingAdmin.length > 0) {
    console.log("✅ Admin user already exists. Skipping admin creation.");
    console.log(`   Email: ${existingAdmin[0].email}`);
    adminUser = existingAdmin[0];
  } else {
    const existingUserByEmail = await db
      .select()
      .from(users)
      .where(eq(users.email, adminEmail))
      .limit(1);

    if (existingUserByEmail.length > 0) {
      console.log("⚠️  User with admin email already exists. Promoting to admin...");
      const [user] = await db
        .update(users)
        .set({ role: "admin" })
        .where(eq(users.email, adminEmail))
        .returning();
      adminUser = user;
      console.log("✅ User promoted to admin successfully!");
      console.log(`   Email: ${adminEmail}`);
    } else {
      const passwordHash = await bcrypt.hash(adminPassword, 10);
      [adminUser] = await db
        .insert(users)
        .values({
          fullName: adminFullName,
          email: adminEmail,
          phone: adminPhone,
          passwordHash,
          role: "admin",
        })
        .returning();
      console.log("✅ Admin user created successfully!");
      console.log(`   Email: ${adminEmail}`);
      console.log(`   Password: ${adminPassword}`);
    }
  }

  // Create demo users
  console.log("\n📝 Creating demo users...");
  
  const demoUsers = [
    {
      fullName: "سارة أحمد",
      email: "sara@example.com",
      phone: "+966500000001",
      role: "social_moderator",
      bio: "مشرفة القسم الاجتماعي"
    },
    {
      fullName: "محمد علي",
      email: "mohammed@example.com",
      phone: "+966500000002",
      role: "cultural_moderator",
      bio: "مشرف القسم الثقافي"
    },
    {
      fullName: "فاطمة حسن",
      email: "fatima@example.com",
      phone: "+966500000003",
      role: "user",
      bio: "عضو نشط في المنصة"
    },
    {
      fullName: "أحمد خالد",
      email: "ahmed@example.com",
      phone: "+966500000004",
      role: "user",
      bio: "عضو جديد"
    },
  ];

  const createdUsers = [];
  const defaultPassword = await bcrypt.hash("123456", 10);
  
  for (const userData of demoUsers) {
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, userData.email))
      .limit(1);

    if (existing.length === 0) {
      const [user] = await db
        .insert(users)
        .values({
          ...userData,
          passwordHash: defaultPassword,
        })
        .returning();
      createdUsers.push(user);
      console.log(`   ✅ Created user: ${userData.fullName} (${userData.email})`);
    } else {
      createdUsers.push(existing[0]);
      console.log(`   ⏭️  User already exists: ${userData.fullName}`);
    }
  }

  // Create demo posts
  console.log("\n📰 Creating demo posts...");
  
  const demoPosts = [
    {
      title: "مبادرة تنظيف الحي",
      content: "ندعوكم للمشاركة في مبادرة تنظيف الحي يوم السبت القادم. نلتقي عند الساعة 8 صباحاً في الساحة الرئيسية. دعونا نعمل معاً لجعل حينا أجمل!",
      section: "social",
      userId: createdUsers[0]?.id || adminUser.id,
    },
    {
      title: "ندوة ثقافية: التراث السعودي",
      content: "ندعوكم لحضور ندوة ثقافية عن التراث السعودي يوم الأربعاء المقبل في مركز الحي الثقافي. سيتحدث الدكتور عبدالله السعيد عن العادات والتقاليد.",
      section: "cultural",
      userId: createdUsers[1]?.id || adminUser.id,
    },
    {
      title: "افتتاح الملعب الجديد",
      content: "يسرنا دعوتكم لحضور حفل افتتاح الملعب الجديد يوم الجمعة القادم. الحفل يبدأ الساعة 5 مساءً مع فعاليات رياضية وترفيهية للجميع!",
      section: "general",
      userId: adminUser.id,
    },
  ];

  const createdPosts = [];
  for (const postData of demoPosts) {
    const existing = await db
      .select()
      .from(posts)
      .where(eq(posts.title, postData.title))
      .limit(1);

    if (existing.length === 0) {
      const [post] = await db
        .insert(posts)
        .values(postData)
        .returning();
      createdPosts.push(post);
      console.log(`   ✅ Created post: ${postData.title}`);
    } else {
      createdPosts.push(existing[0]);
      console.log(`   ⏭️  Post already exists: ${postData.title}`);
    }
  }

  // Create demo comments with nested replies
  console.log("\n💬 Creating demo comments...");
  
  if (createdPosts.length > 0) {
    const firstPost = createdPosts[0];
    
    // Top-level comment 1
    const existingComment1 = await db
      .select()
      .from(comments)
      .where(eq(comments.commentText, "فكرة رائعة! متى نبدأ بالضبط؟"))
      .limit(1);

    let comment1;
    if (existingComment1.length === 0) {
      [comment1] = await db
        .insert(comments)
        .values({
          postId: firstPost.id,
          userId: createdUsers[2]?.id || adminUser.id,
          commentText: "فكرة رائعة! متى نبدأ بالضبط؟",
        })
        .returning();
      console.log("   ✅ Created comment 1");
    } else {
      comment1 = existingComment1[0];
      console.log("   ⏭️  Comment 1 already exists");
    }

    // Reply to comment 1
    const existingReply1 = await db
      .select()
      .from(comments)
      .where(eq(comments.commentText, "الساعة 8 صباحاً كما ذكر في المنشور 😊"))
      .limit(1);

    if (existingReply1.length === 0) {
      await db
        .insert(comments)
        .values({
          postId: firstPost.id,
          userId: createdUsers[0]?.id || adminUser.id,
          parentCommentId: comment1.id,
          commentText: "الساعة 8 صباحاً كما ذكر في المنشور 😊",
        });
      console.log("   ✅ Created reply 1-1");
    } else {
      console.log("   ⏭️  Reply 1-1 already exists");
    }

    // Nested reply
    const existingReply2 = await db
      .select()
      .from(comments)
      .where(eq(comments.commentText, "شكراً على التوضيح! سأكون هناك بإذن الله"))
      .limit(1);

    if (existingReply2.length === 0) {
      await db
        .insert(comments)
        .values({
          postId: firstPost.id,
          userId: createdUsers[2]?.id || adminUser.id,
          parentCommentId: comment1.id,
          commentText: "شكراً على التوضيح! سأكون هناك بإذن الله",
        });
      console.log("   ✅ Created reply 1-2");
    } else {
      console.log("   ⏭️  Reply 1-2 already exists");
    }

    // Top-level comment 2
    const existingComment2 = await db
      .select()
      .from(comments)
      .where(eq(comments.commentText, "هل نحتاج إحضار أدوات خاصة؟"))
      .limit(1);

    let comment2;
    if (existingComment2.length === 0) {
      [comment2] = await db
        .insert(comments)
        .values({
          postId: firstPost.id,
          userId: createdUsers[3]?.id || adminUser.id,
          commentText: "هل نحتاج إحضار أدوات خاصة؟",
        })
        .returning();
      console.log("   ✅ Created comment 2");
    } else {
      comment2 = existingComment2[0];
      console.log("   ⏭️  Comment 2 already exists");
    }

    // Reply to comment 2
    const existingReply3 = await db
      .select()
      .from(comments)
      .where(eq(comments.commentText, "سنوفر جميع الأدوات، فقط أحضروا الحماس! 💪"))
      .limit(1);

    if (existingReply3.length === 0) {
      await db
        .insert(comments)
        .values({
          postId: firstPost.id,
          userId: adminUser.id,
          parentCommentId: comment2.id,
          commentText: "سنوفر جميع الأدوات، فقط أحضروا الحماس! 💪",
        });
      console.log("   ✅ Created reply 2-1");
    } else {
      console.log("   ⏭️  Reply 2-1 already exists");
    }

    // Additional comments on other posts
    if (createdPosts[1]) {
      const existingComment3 = await db
        .select()
        .from(comments)
        .where(eq(comments.commentText, "موضوع مهم جداً، شكراً على التنظيم"))
        .limit(1);

      if (existingComment3.length === 0) {
        await db
          .insert(comments)
          .values({
            postId: createdPosts[1].id,
            userId: createdUsers[2]?.id || adminUser.id,
            commentText: "موضوع مهم جداً، شكراً على التنظيم",
          });
        console.log("   ✅ Created comment on post 2");
      } else {
        console.log("   ⏭️  Comment on post 2 already exists");
      }
    }
  }

  console.log("\n✅ Seeding completed successfully!");
  console.log("\n📊 Demo Data Summary:");
  console.log(`   - Admin: ${adminEmail} / ${adminPassword}`);
  console.log(`   - Demo users: All use password "123456"`);
  console.log(`   - Created ${createdPosts.length} posts with nested comments`);
  console.log("\n⚠️  IMPORTANT: Please change the admin password after first login!");
  
  process.exit(0);
}

seed().catch((error) => {
  console.error("❌ Seeding failed:", error);
  process.exit(1);
});
