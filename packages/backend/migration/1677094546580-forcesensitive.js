export class forcesensitive1677094546580 {
    constructor() {
        this.name = 'forcesensitive1677094546580';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "user" ADD "isForceSensitive" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`COMMENT ON COLUMN "user"."isForceSensitive" IS 'Whether the User is force sensitive.'`);
    }
    async down(queryRunner) {
        await queryRunner.query(`COMMENT ON COLUMN "user"."isForceSensitive" IS 'Whether the User is force sensitive.'`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "isForceSensitive"`);
    }
}
