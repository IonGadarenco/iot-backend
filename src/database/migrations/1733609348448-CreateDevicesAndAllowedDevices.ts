import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateDevicesAndAllowedDevices1733609348448 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Crearea tabelului 'allowed_devices'
        await queryRunner.query(`
            CREATE TABLE allowed_devices (
                id INT AUTO_INCREMENT PRIMARY KEY,
                macAddress VARCHAR(255) UNIQUE NOT NULL,
                description VARCHAR(255) NULL,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            );
        `);

        // Crearea tabelului 'devices'
        await queryRunner.query(`
            CREATE TABLE devices (
                id INT AUTO_INCREMENT PRIMARY KEY,
                macAddress VARCHAR(255) UNIQUE NOT NULL,
                name VARCHAR(255) NOT NULL,
                status BOOLEAN DEFAULT FALSE,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            );
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Ștergerea tabelelor în cazul în care migrarea trebuie revertită
        await queryRunner.query(`DROP TABLE IF EXISTS devices;`);
        await queryRunner.query(`DROP TABLE IF EXISTS allowed_devices;`);
    }

}
