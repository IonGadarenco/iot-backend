import { Module } from '@nestjs/common';
import { IotController } from './iot.controller';
import { IotService } from './iot.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Device } from './entitys/iot.device.entity';
import { IotGateway } from './iot.gateway';
import { AllowedDevice } from './entitys/iot.allowed.device.entity';
import { DeviceRepository } from './iot.repository';
import { EventService } from './iot.event.service';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    TypeOrmModule.forFeature([Device, AllowedDevice]),
    EventEmitterModule.forRoot()
  ],
  controllers: [IotController],
  providers: [IotService, IotGateway, DeviceRepository, EventService],
  exports: [TypeOrmModule]
})
export class IotModule {}
