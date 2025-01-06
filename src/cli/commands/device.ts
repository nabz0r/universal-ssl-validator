import { Command } from 'commander';
import { DeviceRegistry } from '../../iot/registry/device-registry';
import { TableFormatter } from '../utils/formatter';

export function createDeviceCommand(): Command {
  const command = new Command('device');
  const registry = new DeviceRegistry();

  command
    .description('IoT device management')
    .addCommand(
      new Command('list')
        .description('List registered devices')
        .option('-t, --type <type>', 'Filter by device type')
        .option('-s, --status <status>', 'Filter by status')
        .option('-f, --format <format>', 'Output format (json|table)', 'table')
        .action(async (options) => {
          const devices = registry.listDevices({
            type: options.type,
            status: options.status
          });

          if (options.format === 'json') {
            console.log(JSON.stringify(devices, null, 2));
          } else {
            const table = TableFormatter.formatDevices(devices);
            console.log(table.toString());
          }
        })
    )
    .addCommand(
      new Command('register')
        .description('Register new device')
        .requiredOption('-i, --id <id>', 'Device ID')
        .requiredOption('-t, --type <type>', 'Device type')
        .requiredOption('-c, --cert <path>', 'Device certificate path')
        .option('--ca <path>', 'CA certificate path')
        .action(async (options) => {
          try {
            await registry.register({
              id: options.id,
              type: options.type,
              protocols: ['mqtt'],
              certificates: {
                device: options.cert,
                ca: options.ca
              }
            });
            console.log('Device registered successfully');
          } catch (error) {
            console.error('Registration failed:', error.message);
            process.exit(1);
          }
        })
    );

  return command;
}