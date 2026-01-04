/*
  Warnings:

  - You are about to drop the `sale` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `sale`;

-- CreateTable
CREATE TABLE `Stock` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `product` VARCHAR(191) NOT NULL,
    `amount` DOUBLE NOT NULL,
    `price` DOUBLE NULL,
    `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
