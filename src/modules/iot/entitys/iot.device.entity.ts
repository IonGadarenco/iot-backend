import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('devices')
export class Device {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    macAddress: string;

    @Column()
    name: string;

    @Column({ default: false })
    status: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}