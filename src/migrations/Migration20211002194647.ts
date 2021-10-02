import { Migration } from '@mikro-orm/migrations';

export class Migration20211002194647 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "post" ("_id" serial primary key, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "title" varchar(255) not null);');
  }

}
