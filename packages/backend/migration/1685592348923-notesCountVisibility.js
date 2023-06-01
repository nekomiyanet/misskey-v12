export class notesCountVisibility1685592348923 {
    constructor() {
        this.name = 'notesCountVisibility1685592348923';
    }
    async up(queryRunner) {
        await queryRunner.query(`CREATE TYPE "public"."user_profile_notesCountvisibility_enum" AS ENUM('public', 'followers', 'private')`);
        await queryRunner.query(`ALTER TABLE "user_profile" ADD "notesCountVisibility" "public"."user_profile_notesCountvisibility_enum" NOT NULL DEFAULT 'public'`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "user_profile" DROP COLUMN "notesCountVisibility"`);
        await queryRunner.query(`DROP TYPE "public"."user_profile_notesCountvisibility_enum"`);
    }
}
