export class blockedwords1679580826744 {
    constructor() {
        this.name = 'blockedwords1679580826744';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "meta" ADD "blockedWords" character varying(256) array NOT NULL DEFAULT '{}'::varchar[]`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "blockedWords"`);
    }
}
