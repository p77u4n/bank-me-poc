import { MigrationInterface, QueryRunner } from "typeorm";

export class allowResourceAccountNull1716466939517 implements MigrationInterface {
    name = 'allowResourceAccountNull1716466939517'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transaction_store" DROP CONSTRAINT "FK_9e04edb71f103dfaaecff893b0a"`);
        await queryRunner.query(`ALTER TABLE "transaction_store" ALTER COLUMN "source_account_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "transaction_store" ADD CONSTRAINT "FK_9e04edb71f103dfaaecff893b0a" FOREIGN KEY ("source_account_id") REFERENCES "account"("id") ON DELETE SET NULL ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transaction_store" DROP CONSTRAINT "FK_9e04edb71f103dfaaecff893b0a"`);
        await queryRunner.query(`ALTER TABLE "transaction_store" ALTER COLUMN "source_account_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "transaction_store" ADD CONSTRAINT "FK_9e04edb71f103dfaaecff893b0a" FOREIGN KEY ("source_account_id") REFERENCES "account"("id") ON DELETE SET NULL ON UPDATE CASCADE`);
    }

}
