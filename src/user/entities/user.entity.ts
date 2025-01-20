import { Exclude } from "class-transformer";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

export enum Role {
    admin,
    paidUser,
    user
}

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    email: string;

    @Column()
    @Exclude(
        {
            toClassOnly: false, // 요청을 받을때
            toPlainOnly: true, // 응답을 보낼때
        }
    )
    password: string;

    @Column({
        enum: Role,
        default: Role.user
    })
    role: Role;
}
