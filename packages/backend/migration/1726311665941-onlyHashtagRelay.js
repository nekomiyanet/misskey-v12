export class onlyHashtagRelay1726311665941 {
    constructor() {
        this.name = 'onlyHashtagRelay1726311665941';
    }

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "relay" ADD "onlyHashtag" boolean NOT NULL DEFAULT false`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "relay" DROP COLUMN "onlyHashtag"`);
    }
}
