import { Expose } from "class-transformer";
import { IsBoolean, IsMACAddress, IsNotEmpty } from "class-validator";

export class IotDevice {
    @IsNotEmpty()
    @IsMACAddress()
    @Expose()
    macAddress: string;

    @IsNotEmpty()
    @Expose()
    name: string;

    @IsNotEmpty()
    @IsBoolean()
    @Expose()
    status: boolean;
}