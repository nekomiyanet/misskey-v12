export class unverifiedEmail1731556850699 {
    name = 'unverifiedEmail1731556850699'

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "user_profile" ADD "unverifiedEmail" character varying(128)`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "user_profile" DROP COLUMN "unverifiedEmail"`);
    }
}
