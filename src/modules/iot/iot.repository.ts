import { IotDevice } from "./types/http/iot.create.device.dto";
import { Device } from "./entitys/iot.device.entity";
import { AllowedDevice } from "./entitys/iot.allowed.device.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { Repository } from "typeorm";
import { EventService } from "./iot.event.service";

@Injectable()
export class DeviceRepository{

    constructor(
        @InjectRepository(AllowedDevice)
        public allowedDeviceRepository: Repository<AllowedDevice>,
        @InjectRepository(Device)
        public deviceRepository: Repository<Device>,
        private readonly eventService: EventService
    ) { }

    async createDevice(device: IotDevice): Promise<Device> {
        const allowedDevice = await this.allowedDeviceRepository.findOne({where: {macAddress: device.macAddress}});

        if (!allowedDevice) {
            throw new NotFoundException(`Device with MAC address ${device.macAddress} is not allowed.`);
        }

        const existingDevice = await this.deviceRepository.findOne({
            where: { macAddress: device.macAddress },
        });

        if (existingDevice) {
            throw new ConflictException(`Device with MAC address ${device.macAddress} already exists.`);
        }

        const newDevice = this.deviceRepository.create(device);
        const savedDevice = await this.deviceRepository.save(newDevice);

        console.log("Device saved:", savedDevice);
        this.eventService.emitDeviceRegistered(device.macAddress);
        return savedDevice;
    }

    async updateStatus(macAddress: string, status: boolean): Promise<Device> {
        // Caută dispozitivul după MAC Address
        const device = await this.deviceRepository.findOne({where: { macAddress }});
    
        if (!device) {
            throw new Error(`Device with MAC address ${macAddress} not found.`);
        }
    
        // Actualizează statusul dispozitivului
        device.status = status;
    
        // Salvează schimbările în baza de date
        const updatedDevice = await this.deviceRepository.save(device);
    
        return updatedDevice;
    }
    
    async getAllDevicesFromDB() {
        const devices = await this.deviceRepository.find();
        return devices;
    }

    async getDeviceFromDB(macAddress: string) {
        const device = await this.deviceRepository.findOne({where: {macAddress}});
        return device
    }

    async updateDeviceInDB(macAddress: string, updates: Partial<Device>) {
        const device = await this.deviceRepository.findOne({ where: { macAddress } });

        Object.assign(device, updates);

        const updateDevice = await this.deviceRepository.save(device);
        return updateDevice;
    }

    async deleteDeviceFromDB(macAddress: string) {
        const deviceToDelete = await this.deviceRepository.findOne({ where: { macAddress } });
        if (!deviceToDelete) {
            throw new Error('Device not found');
        }
        this.eventService.emitDeviceDeleted(deviceToDelete.macAddress);
        const deletedeDevice = await this.deviceRepository.delete({ macAddress });
        return deletedeDevice;
    }
}