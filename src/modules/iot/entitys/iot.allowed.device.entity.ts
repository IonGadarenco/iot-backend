import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('allowed_devices')
export class AllowedDevice {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    macAddress: string;

    @Column({ nullable: true })
    description: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}