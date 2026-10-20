ALTER TABLE "User" ADD COLUMN "usernameSet" BOOLEAN NOT NULL DEFAULT false;

UPDATE "User" SET "usernameSet" = true WHERE "username" IS NOT NULL;

CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
