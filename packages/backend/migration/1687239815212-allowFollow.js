export class allowFollow1687239815212 {
    constructor() {
        this.name = 'allowFollow1687239815212';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "user_profile" ADD "allowFollow" boolean NOT NULL DEFAULT true`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "user_profile" DROP COLUMN "allowFollow"`);
    }
}
