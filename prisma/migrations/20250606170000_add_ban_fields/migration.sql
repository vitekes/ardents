-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" DATETIME,
    "image" TEXT,
    "nickname" TEXT,
    "bio" TEXT,
    "twitter" TEXT,
    "telegram" TEXT,
    "website" TEXT,
    "donationAddress" TEXT,
    "banned" BOOLEAN NOT NULL DEFAULT false,
    "banExpiresAt" DATETIME
);
INSERT INTO "new_User" ("id","name","email","emailVerified","image","nickname","bio","twitter","telegram","website","donationAddress")
SELECT "id","name","email","emailVerified","image","nickname","bio","twitter","telegram","website","donationAddress" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";

CREATE TABLE "new_Post" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "description" TEXT,
    "tags" TEXT,
    "views" INTEGER NOT NULL DEFAULT 0,
    "banned" BOOLEAN NOT NULL DEFAULT false,
    "banExpiresAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Post_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Post" ("id","userId","description","tags","views","createdAt","updatedAt")
SELECT "id","userId","description","tags","views","createdAt","updatedAt" FROM "Post";
DROP TABLE "Post";
ALTER TABLE "new_Post" RENAME TO "Post";
PRAGMA foreign_keys=ON;

-- CreateView
DROP VIEW IF EXISTS "PostStats";
CREATE VIEW "PostStats" AS
SELECT p.id, p.userId, p.description, p.tags, p.views, p.createdAt, p.updatedAt,
       p.banned, p.banExpiresAt,
       (SELECT COUNT(*) FROM "Like" l WHERE l.postId = p.id) AS likeCount,
       (SELECT COUNT(*) FROM "Comment" c WHERE c.postId = p.id) AS commentCount
FROM "Post" p;
