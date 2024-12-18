import { Expose } from "class-transformer";
import { IsBoolean, IsIn, IsMACAddress, IsNotEmpty } from "class-validator";

export class IotControlLed{
    @IsNotEmpty()
    @IsMACAddress()
    @Expose()
    macAddress: string;

    @IsNotEmpty()
    @Expose()
    event: string;

    @IsIn(['led-on', 'led-off'])
    @Expose()
    message: string;
}