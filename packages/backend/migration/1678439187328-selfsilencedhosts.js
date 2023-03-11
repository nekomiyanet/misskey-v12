export class selfsilencedhosts1678439187328 {
    constructor() {
        this.name = 'selfsilencedhosts1678439187328';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "meta" ADD "selfSilencedHosts" character varying(256) array NOT NULL DEFAULT '{}'::varchar[]`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "selfSilencedHosts"`);
    }
}
