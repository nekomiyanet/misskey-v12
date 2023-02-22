export class localsilenced1677084778624 {
    constructor() {
        this.name = 'localsilenced1677084778624';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "user" ADD "isLocalSilenced" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`COMMENT ON COLUMN "user"."isLocalSilenced" IS 'Whether the User is localSilenced.'`);
    }
    async down(queryRunner) {
        await queryRunner.query(`COMMENT ON COLUMN "user"."isLocalSilenced" IS 'Whether the User is localSilenced.'`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "isLocalSilenced"`);
    }
}
