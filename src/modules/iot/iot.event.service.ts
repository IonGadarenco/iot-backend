import { Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";

@Injectable()
export class EventService{
    constructor(private readonly eventEmitter: EventEmitter2) { }
    
    emitDeviceDeleted(macAddress: string) {
        this.eventEmitter.emit('device.deleted', macAddress);
    }
    
    emitDeviceRegistered(macAddress: string) {
        this.eventEmitter.emit('device.registered', macAddress);
    }

}