import {
  Entity,
  PrimaryColumn,
  JoinColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';

@Entity('users')
export class DMUser {
  @PrimaryColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 16,
    nullable: false,
  })
  name: string;
  @OneToMany(() => DMAccount, (acc) => acc.user)
  accounts: DMAccount[];
}

@Entity('account')
export class DMAccount {
  @PrimaryColumn('uuid')
  id: string;

  @ManyToOne(() => DMUser, {
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({
    name: 'user_id',
  })
  user: DMUser;

  @Column({
    nullable: false,
    type: 'uuid',
  })
  user_id: string;

  @Column({ type: 'float', nullable: true })
  balance: number; // only for snapshot

  @Column({ type: 'boolean', nullable: true })
  is_ready: boolean;
}

@Entity('transaction_store')
export class DMTransaction {
  @PrimaryColumn('uuid')
  id: string;

  @ManyToOne(() => DMAccount, {
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({
    name: 'source_account_id',
  })
  sourceAccount: DMAccount;

  @ManyToOne(() => DMAccount, {
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({
    name: 'target_account_id',
  })
  targetAccount: DMAccount;

  @Column({
    nullable: false,
    type: 'uuid',
  })
  source_account_id: string;

  @Column({
    nullable: false,
    type: 'uuid',
  })
  target_account_id: string;

  @Column({ type: 'float', nullable: true })
  amount: number;

  @Column({
    type: 'varchar',
    length: 16,
    nullable: false,
  })
  status: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  reason: string;

  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  date: Date;
}
