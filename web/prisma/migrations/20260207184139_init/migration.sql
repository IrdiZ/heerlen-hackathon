-- CreateTable
CREATE TABLE "Capture" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "url" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "fields" TEXT NOT NULL,
    "headings" TEXT,
    "mainContent" TEXT,
    "pageDescription" TEXT,
    "buttons" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "UserData" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "piiData" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
