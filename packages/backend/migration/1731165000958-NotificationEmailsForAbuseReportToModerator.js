export class NotificationEmailsForAbuseReportToModerator1731165000958 {
    name = 'NotificationEmailsForAbuseReportToModerator1731165000958'

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "meta" ADD "doNotSendNotificationEmailsForAbuseReportToModerator" boolean NOT NULL DEFAULT false`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "doNotSendNotificationEmailsForAbuseReportToModerator"`);
    }
}
