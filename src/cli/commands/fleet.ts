import { Command } from 'commander';
import { FleetManager } from '../../iot/fleet/fleet-manager';
import { DeviceRegistry } from '../../iot/registry/device-registry';
import { TableFormatter } from '../utils/formatter';

export function createFleetCommand(): Command {
  const command = new Command('fleet');
  const registry = new DeviceRegistry();
  const fleetManager = new FleetManager(registry);

  command
    .description('Fleet management')
    .addCommand(
      new Command('create')
        .description('Create new fleet')
        .requiredOption('-n, --name <name>', 'Fleet name')
        .requiredOption('-t, --tags <tags...>', 'Fleet tags')
        .action(async (options) => {
          try {
            await fleetManager.createFleet({
              id: Math.random().toString(36).substring(7),
              name: options.name,
              tags: options.tags,
              devices: [],
              config: {
                updatePolicy: {
                  automatic: true,
                  timeWindow: { start: '02:00', end: '04:00' },
                  batchSize: 10,
                  failureThreshold: 0.1
                },
                certRotation: {
                  enabled: true,
                  daysBeforeExpiry: 30,
                  staggered: true
                },
                monitoring: {
                  healthCheckInterval: 300000,
                  metricsInterval: 60000,
                  alertThresholds: {
                    errorRate: 0.05,
                    latency: 1000
                  }
                }
              }
            });
            console.log('Fleet created successfully');
          } catch (error) {
            console.error('Fleet creation failed:', error.message);
            process.exit(1);
          }
        })
    )
    .addCommand(
      new Command('add-device')
        .description('Add device to fleet')
        .requiredOption('-f, --fleet <id>', 'Fleet ID')
        .requiredOption('-d, --device <id>', 'Device ID')
        .action(async (options) => {
          try {
            await fleetManager.addDeviceToFleet(options.fleet, options.device);
            console.log('Device added to fleet successfully');
          } catch (error) {
            console.error('Failed to add device:', error.message);
            process.exit(1);
          }
        })
    );

  return command;
}