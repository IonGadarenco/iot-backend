import { Body, Controller, Delete, Get, Param, Patch, Post, ValidationPipe } from '@nestjs/common';
import { IotService } from './iot.service';
import { IotDevice } from './types/http/iot.create.device.dto';
import { IotControlLed } from './types/http/iot.control.led.dto';

@Controller('iot')
export class IotController {
    constructor(private readonly iotService: IotService) { }

    @Post('register')
    public async registerDevice(@Body(new ValidationPipe()) data: IotDevice): Promise<IotDevice> {
        return this.iotService.registerDevice(data);
    }

    @Post('led-control')
    public async ledControl(@Body(new ValidationPipe()) data: IotControlLed){
        return this.iotService.ledControl(data);
    }

    @Get('get-all-devices')
    public async getAllDevices(): Promise<IotDevice[]> {
        return await this.iotService.getAllDevices();
    }

    @Get('get-device/:macAddress')
    public async getDevice(@Param('macAddress') macAddress: string) {
        return await this.iotService.getDevice(macAddress);
    }

    @Patch('update-device/:macAddress')
    public async updateDevice(
        @Param('macAddress') macAddress: string,
        @Body(new ValidationPipe()) updates: Partial<IotDevice>
    ) { 
        return await this.iotService.updateDevice(macAddress, updates);
    }

    @Delete('delete-device/:macAddress')
    public async deleteDevice(@Param('macAddress') macAddress: string) { 
        return this.iotService.deleteDevice(macAddress);
    }
}
