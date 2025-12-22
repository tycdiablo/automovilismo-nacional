-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "shortName" TEXT NOT NULL,
    "logoUrl" TEXT,
    "isInternational" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "pilots" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fullName" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "nationality" TEXT NOT NULL DEFAULT 'Argentina',
    "bio" TEXT,
    "height" REAL,
    "dateOfBirth" DATETIME,
    "profileImageUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "socialMediaHandles" TEXT,
    CONSTRAINT "pilots_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "news" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "originalUrl" TEXT NOT NULL,
    "sourceName" TEXT NOT NULL,
    "publishedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "imageUrl" TEXT,
    "pilotId" TEXT,
    "categoryId" TEXT,
    CONSTRAINT "news_pilotId_fkey" FOREIGN KEY ("pilotId") REFERENCES "pilots" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "news_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "results" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pilotId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "eventName" TEXT NOT NULL,
    "sessionType" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "timeGap" TEXT,
    "eventDate" DATETIME NOT NULL,
    CONSTRAINT "results_pilotId_fkey" FOREIGN KEY ("pilotId") REFERENCES "pilots" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "results_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "follows" (
    "userId" TEXT NOT NULL,
    "pilotId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("userId", "pilotId"),
    CONSTRAINT "follows_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "follows_pilotId_fkey" FOREIGN KEY ("pilotId") REFERENCES "pilots" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "pilots_slug_key" ON "pilots"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "news_originalUrl_key" ON "news"("originalUrl");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
