import { MigrationInterface, QueryRunner } from "typeorm";

export class init1716461776098 implements MigrationInterface {
    name = 'init1716461776098'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL, "name" character varying(16) NOT NULL, CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "account" ("id" uuid NOT NULL, "user_id" uuid NOT NULL, "balance" double precision, "is_ready" boolean, CONSTRAINT "PK_54115ee388cdb6d86bb4bf5b2ea" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "transaction_store" ("id" uuid NOT NULL, "source_account_id" uuid NOT NULL, "target_account_id" uuid NOT NULL, "amount" double precision, "status" character varying(16) NOT NULL, "reason" text, "date" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_70ba1b413fbea6458c05d8895ea" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "account" ADD CONSTRAINT "FK_efef1e5fdbe318a379c06678c51" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "transaction_store" ADD CONSTRAINT "FK_9e04edb71f103dfaaecff893b0a" FOREIGN KEY ("source_account_id") REFERENCES "account"("id") ON DELETE SET NULL ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "transaction_store" ADD CONSTRAINT "FK_795b6dfac8e36926897a02a75ef" FOREIGN KEY ("target_account_id") REFERENCES "account"("id") ON DELETE SET NULL ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transaction_store" DROP CONSTRAINT "FK_795b6dfac8e36926897a02a75ef"`);
        await queryRunner.query(`ALTER TABLE "transaction_store" DROP CONSTRAINT "FK_9e04edb71f103dfaaecff893b0a"`);
        await queryRunner.query(`ALTER TABLE "account" DROP CONSTRAINT "FK_efef1e5fdbe318a379c06678c51"`);
        await queryRunner.query(`DROP TABLE "transaction_store"`);
        await queryRunner.query(`DROP TABLE "account"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }

}
