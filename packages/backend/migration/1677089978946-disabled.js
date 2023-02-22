export class disabled1677089978946 {
    constructor() {
        this.name = 'disabled1677089978946';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "user" ADD "isDisabled" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`COMMENT ON COLUMN "user"."isDisabled" IS 'Whether the User is disabled.'`);
    }
    async down(queryRunner) {
        await queryRunner.query(`COMMENT ON COLUMN "user"."isDisabled" IS 'Whether the User is disabled.'`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "isDisabled"`);
    }
}
