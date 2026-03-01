-- CreateEnum (MySQL: ENUM type via column)
-- MatchSeekerStatus: WAITING, MATCHED
-- Gender: MALE, FEMALE, OTHER (used in match_seekers)

CREATE TABLE `match_seekers` (
    `id` VARCHAR(191) NOT NULL,
    `socket_id` VARCHAR(100) NOT NULL,
    `display_name` VARCHAR(100) NOT NULL,
    `gender` ENUM('MALE', 'FEMALE', 'OTHER') NOT NULL,
    `seeking_gender` ENUM('MALE', 'FEMALE', 'OTHER') NULL,
    `status` ENUM('WAITING', 'MATCHED') NOT NULL DEFAULT 'WAITING',
    `room_code` VARCHAR(50) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `match_seekers_socket_id_key`(`socket_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
