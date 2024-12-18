import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Device } from './entitys/iot.device.entity';
import { IotDevice } from './types/http/iot.create.device.dto';
import { DeviceRepository } from './iot.repository';
import { IotControlLed } from './types/http/iot.control.led.dto';
import { IotGateway } from './iot.gateway';

@Injectable()
export class IotService {
    constructor(
        private readonly deviceRepository: DeviceRepository,
        private readonly iotGateway: IotGateway
    ) { }

    async registerDevice(data: IotDevice) {
        return this.deviceRepository.createDevice(data);
    }

    async ledControl(data: IotControlLed) {
        return this.iotGateway.sendToDevice(data);
    }

    async getAllDevices() {
        return this.deviceRepository.getAllDevicesFromDB();
    }

    async getDevice(macAddress: string) {
        return this.deviceRepository.getDeviceFromDB(macAddress);
    }

    async updateDevice(macAddress: string, updates: Partial<Device>) {
        return this.deviceRepository.updateDeviceInDB(macAddress, updates);
    }

    async deleteDevice(macAddress: string) {
        return this.deviceRepository.deleteDeviceFromDB(macAddress);
    }
}
