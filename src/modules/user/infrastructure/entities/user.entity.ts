import { AutoMap } from '@automapper/classes';
import { Expose } from 'class-transformer';
import * as bcrypt from 'bcrypt';
import { AfterLoad, BeforeInsert, BeforeUpdate, Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../base/infrastructure/persistence/typeorm/base.entity';

const SALT_ROUNDS = 10;

@Entity('users')
export class UserEntity extends BaseEntity {
  @Column()
  @AutoMap()
  public email: string;

  @Column()
  @AutoMap()
  public password: string;

  @Column()
  @AutoMap()
  @Index({ unique: true })
  public username: string;

  @Expose({ groups: ['user'] })
  @Column()
  @AutoMap()
  public resetPasswordToken?: string;

  @AutoMap()
  @Column()
  public lastname: string;

  @AutoMap()
  @Column()
  public address: string;

  @AutoMap()
  @Column()
  public phone: string;

  @AutoMap()
  @Column()
  public roles: string[];

  @AutoMap()
  @Column()
  public image: string;

  @AutoMap()
  @Column()
  public status: boolean;

  @AutoMap()
  @Column()
  public about: string;

  @Column()
  @AutoMap()
  public lastUpdateAt: Date;

  private tempPassword?: string;

  /**************** ACTIONS ****************/
  @AfterLoad()
  private loadTempPassword(): void {
    this.tempPassword = this.password;
  }

  @BeforeInsert()
  @BeforeUpdate()
  private beforeActionsPassword() {
    if (this.tempPassword !== this.password) {
      this.password = bcrypt.hashSync(this.password, SALT_ROUNDS);
    }
    delete this.tempPassword;

    this.lastUpdateAt = new Date();
  }

  @BeforeInsert()
  private beforeInsertActionsUser() {
    this.status = true;
    this.createdAt = new Date();
  }

  public constructor(o: Object) {
    super();
    Object.assign(this, o);
  }
}
