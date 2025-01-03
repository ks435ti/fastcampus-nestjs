import { IsEnum, IsNotEmpty } from "class-validator";
import { Role } from "../entities/user.entity";

export class CreateUserDto {
    @IsNotEmpty()
    email: string;
    @IsNotEmpty()
    password: string;
    @IsNotEmpty()
    @IsEnum(Role)
    role: Role;
}
