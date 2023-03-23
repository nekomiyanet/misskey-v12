export class accounthidden1679576097354 {
    constructor() {
        this.name = 'accounthidden1679576097354';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "user" ADD "isHidden" boolean NOT NULL DEFAULT false`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "isHidden"`);
    }
}
