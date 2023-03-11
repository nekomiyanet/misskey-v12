export class silencedhosts1678555385421 {
    constructor() {
        this.name = 'silencedhosts1678555385421';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "meta" ADD "silencedHosts" character varying(256) array NOT NULL DEFAULT '{}'::varchar[]`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "silencedHosts"`);
    }
}
