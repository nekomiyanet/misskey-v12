export class isFox1672573409125 {
    constructor() {
        this.name = 'isFox1672573409125';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "user" ADD "isFox" boolean NOT NULL DEFAULT false`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "isFox"`);
    }
}
