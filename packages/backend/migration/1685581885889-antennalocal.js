export class antennalocal1685581885889 {
    constructor() {
        this.name = 'antennalocal1685581885889';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "antenna" ADD "local" boolean NOT NULL DEFAULT false`, undefined);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "antenna" DROP COLUMN "local"`, undefined);
    }
}
