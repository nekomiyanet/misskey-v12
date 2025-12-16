/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export class AntennaLocalOnly1697436246389 {
    name = 'AntennaLocalOnly1697436246389'

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "antenna" RENAME COLUMN "local" TO "localOnly"`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "antenna" RENAME COLUMN "localOnly" TO "local"`);
    }
}
