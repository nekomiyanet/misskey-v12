export class referenceFollowCount1690453994920 {
    constructor() {
        this.name = 'referenceFollowCount1690453994920';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "user" ADD "referenceFollowingCount" integer NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "user" ADD "referenceFollowersCount" integer NOT NULL DEFAULT 0`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "referenceFollowingCount"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "referenceFollowersCount"`);
    }
}
