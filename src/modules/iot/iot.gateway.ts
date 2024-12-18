import { OnModuleInit } from "@nestjs/common";
import { WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { WebSocket, Server } from "ws";
import { DeviceRepository } from "./iot.repository";
import { OnEvent } from "@nestjs/event-emitter";

@WebSocketGateway()
export class IotGateway implements OnModuleInit {
    @WebSocketServer()
    server: Server;

    constructor(private readonly deviceRepository: DeviceRepository) {}

    private registeredDevices = new Map<string, WebSocket>();
    private deletedDevices = new Map<string, WebSocket>();
    private lastPingTimes = new Map<string, number>();

    async onModuleInit() {
        this.server.on("connection", (socket: WebSocket) => {
            console.log("Client connected");

            socket.on("message", async (data) => {
                try {
                    const message = JSON.parse(data.toString());
                    console.log("Received: ", message);

                    switch (message.event) {
                        case "connect":
                            await this.handleConnect(socket, message.mac);
                            break;
                        case "ping":
                            await this.handlePing(message.mac);
                            break;
                        case "broadcast":
                            this.broadcastMessage(message);
                            break;
                        default:
                            console.log("Unknown event:", message.event);
                    }
                } catch (error) {
                    console.error("Error processing message:", error.message);
                }
            });

            socket.on("close", () => {
                console.log("Client disconnected.");
            });
        });

        // Start periodic check for inactive devices
        this.startInactiveCheck();
    }

    private async handleConnect(socket: WebSocket, macAddress: string) {
        const allowedDevice = await this.deviceRepository.allowedDeviceRepository.findOne({
            where: { macAddress },
        });
        const device = await this.deviceRepository.deviceRepository.findOne({
            where: { macAddress },
        });
    
        if (!allowedDevice || !device) {
            console.log(`Device with MAC address ${macAddress} is not allowed or not found.`);
            socket.send(JSON.stringify({ event: "error", message: "Device not allowed" }));
            socket.close();
            return;
        }
    
        // Verifică dacă dispozitivul este deja conectat
        if (this.registeredDevices.has(macAddress)) {
            console.log(`Device with MAC address ${macAddress} is already connected. Closing previous connection.`);
            const oldSocket = this.registeredDevices.get(macAddress);
    
            // Închide conexiunea veche
            if (oldSocket) {
                oldSocket.close();
                this.registeredDevices.delete(macAddress);
                this.lastPingTimes.delete(macAddress);
            }
        }
    
        // Înregistrează noua conexiune
        this.registeredDevices.set(macAddress, socket);
        this.lastPingTimes.set(macAddress, Date.now()); // Initializează timpul de ping
        console.log(`Device with MAC address ${macAddress} connected.`);
        socket.send(JSON.stringify({ event: "connect", message: "Welcome!" }));
    }
    

    private async handlePing(macAddress: string) {
        const currentTime = Date.now();
        this.lastPingTimes.set(macAddress, currentTime);
        await this.deviceRepository.updateStatus(macAddress, true);

        // Send a "pong" message back to the device
        const socket = this.registeredDevices.get(macAddress);
        if (socket) {
            socket.send(JSON.stringify({ event: "pong", message: "pong from server" }));
        }
    }

    private startInactiveCheck(interval: number = 100, timeout: number = 7000) {
        setInterval(async () => {
            const currentTime = Date.now();
            for (const [macAddress, lastPingTime] of this.lastPingTimes.entries()) {
                if (currentTime - lastPingTime > timeout) {
                    console.log(`Device with MAC: ${macAddress} is inactive. Marking as disconnected.`);
                    this.lastPingTimes.delete(macAddress);
                    this.registeredDevices.delete(macAddress);
                    await this.deviceRepository.updateStatus(macAddress, false);
                }
            }
        }, interval);
    }

    @OnEvent('device.deleted')
    private handleDelete(macAddress: string) {
        const socket = this.registeredDevices.get(macAddress);
        if (socket) {
            this.registeredDevices.delete(macAddress);
            this.deletedDevices.set(macAddress, socket);
            this.lastPingTimes.delete(macAddress);
            console.log(`Device with MAC address ${macAddress} disconnected.`);
        }
    }

    @OnEvent('device.registered')
    private handleRegistered(macAddress: string) {
        const socket = this.deletedDevices.get(macAddress);
        if (socket) {
            this.deletedDevices.delete(macAddress);
            this.registeredDevices.set(macAddress, socket);
            this.lastPingTimes.delete(macAddress);
            console.log(`Device with MAC address ${macAddress} disconnected.`);
        }
    }

    private broadcastMessage(message: any) {
        this.registeredDevices.forEach((socket) => {
            socket.send(JSON.stringify({ event: "broadcast", message: message.data }));
        });
        console.log("Broadcast message sent to all connected devices.");
    }

    sendToDevice(message: any) {
        const device = this.registeredDevices.get(message.macAddress);
        console.log(this.registeredDevices.size);
        if (device) {
            device.send(JSON.stringify(message));
            console.log(`Message sent to device with MAC address ${message.macAddress}.`);
        } else {
            console.log(`Device with MAC address ${message.macAddress} not found.`);
        }
    }
}
