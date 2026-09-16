import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveSquadsMigration20260914000000
  implements MigrationInterface
{
  name = 'RemoveSquadsMigration20260914000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('chats')) {
      await queryRunner.query(
        `DELETE FROM "chats" WHERE "type" = 'squad'`,
      );

      const enumExists = await queryRunner.query(`
        SELECT 1
        FROM pg_type
        WHERE typname = 'chats_type_enum'
      `);

      if (enumExists.length > 0) {
        await queryRunner.query(
          `ALTER TYPE "chats_type_enum" RENAME TO "chats_type_enum_old"`,
        );
        await queryRunner.query(
          `CREATE TYPE "chats_type_enum" AS ENUM ('event', 'admin')`,
        );
        await queryRunner.query(`
          ALTER TABLE "chats"
          ALTER COLUMN "type" TYPE "chats_type_enum"
          USING "type"::text::"chats_type_enum"
        `);
        await queryRunner.query(
          `DROP TYPE "chats_type_enum_old"`,
        );
      }
    }

    if (await queryRunner.hasTable('squad_members')) {
      await queryRunner.query(`DROP TABLE "squad_members"`);
    }

    if (await queryRunner.hasTable('squads')) {
      await queryRunner.query(`DROP TABLE "squads"`);
    }
  }

  async down(): Promise<void> {
    throw new Error('Removing squads cannot be reverted automatically');
  }
}