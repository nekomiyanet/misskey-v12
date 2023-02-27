export class privatesilence1677493442358 {
    constructor() {
        this.name = 'private1677493442358';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "user" ADD "isPrivateSilenced" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`COMMENT ON COLUMN "user"."isPrivateSilenced" IS 'Whether the User is privatesilenced.'`);
    }
    async down(queryRunner) {
        await queryRunner.query(`COMMENT ON COLUMN "user"."isPrivateSilenced" IS 'Whether the User is privatesilenced.'`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "isPrivateSilenced"`);
    }
}
