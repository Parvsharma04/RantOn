-- CreateTable
CREATE TABLE "User" (
    "u_id" TEXT NOT NULL,
    "firebaseId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT,
    "displayName" TEXT,
    "photoURL" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("u_id")
);

-- CreateTable
CREATE TABLE "Rant" (
    "r_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,

    CONSTRAINT "Rant_pkey" PRIMARY KEY ("r_id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "c_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "rantId" TEXT NOT NULL,
    "commentedById" TEXT NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("c_id")
);

-- CreateTable
CREATE TABLE "Like" (
    "l_id" TEXT NOT NULL,
    "likedRantId" TEXT NOT NULL,
    "likedById" TEXT NOT NULL,

    CONSTRAINT "Like_pkey" PRIMARY KEY ("l_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_firebaseId_key" ON "User"("firebaseId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Rant_authorId_title_key" ON "Rant"("authorId", "title");

-- CreateIndex
CREATE UNIQUE INDEX "Like_likedRantId_likedById_key" ON "Like"("likedRantId", "likedById");

-- AddForeignKey
ALTER TABLE "Rant" ADD CONSTRAINT "Rant_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("u_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_rantId_fkey" FOREIGN KEY ("rantId") REFERENCES "Rant"("r_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_commentedById_fkey" FOREIGN KEY ("commentedById") REFERENCES "User"("u_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_likedRantId_fkey" FOREIGN KEY ("likedRantId") REFERENCES "Rant"("r_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_likedById_fkey" FOREIGN KEY ("likedById") REFERENCES "User"("u_id") ON DELETE RESTRICT ON UPDATE CASCADE;
