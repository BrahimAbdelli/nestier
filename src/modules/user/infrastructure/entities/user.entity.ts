import { AutoMap } from '@automapper/classes';
import { Expose } from 'class-transformer';
import * as crypto from 'crypto';
import { AfterLoad, BeforeInsert, BeforeUpdate, Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../base/domain/entities/base.entity';

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
      this.password = crypto.createHmac('sha256', this.password).digest('hex');
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
