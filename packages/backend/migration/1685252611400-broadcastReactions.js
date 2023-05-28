export class broadcastReactions1685252611400 {
	name = 'broadcastReactions1685252611400';

	async up(queryRunner) {
		await queryRunner.query(`ALTER TABLE "user" ADD "broadcastReactions" boolean NOT NULL DEFAULT true`);
	}

	async down(queryRunner) {
		await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "broadcastReactions"`);
	}

}
