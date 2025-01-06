import chalk from 'chalk';
import { ValidationResult, DeviceInfo, FleetInfo } from '../../core/types';

export class OutputFormatter {
  static success(msg: string): void {
    console.log(chalk.green('✓'), msg);
  }

  static error(msg: string): void {
    console.error(chalk.red('✗'), msg);
  }

  static warning(msg: string): void {
    console.warn(chalk.yellow('⚠'), msg);
  }

  static formatValidation(result: ValidationResult, json = false): void {
    if (json) {
      console.log(JSON.stringify(result, null, 2));
      return;
    }

    const status = result.valid ? chalk.green('✓ Valid') : chalk.red('✗ Invalid');
    console.log(`\nSSL Certificate Status: ${status}\n`);
    console.log('Details:');
    console.log('-'.repeat(50));
    console.log(`Chain Valid:    ${this.formatBoolean(result.chainValid)}`);
    console.log(`OCSP Status:    ${this.formatOCSP(result.ocspStatus)}`);
    console.log(`CT Logs Valid:  ${this.formatBoolean(result.ctValid)}`);
    console.log(`DANE Valid:     ${this.formatBoolean(result.daneValid)}`);
    console.log('-'.repeat(50));
  }

  static formatDeviceInfo(device: DeviceInfo, json = false): void {
    if (json) {
      console.log(JSON.stringify(device, null, 2));
      return;
    }

    const status = this.formatStatus(device.status);
    console.log(`\nDevice: ${chalk.blue(device.id)}\n`);
    console.log('Details:');
    console.log('-'.repeat(50));
    console.log(`Type:          ${device.type}`);
    console.log(`Status:        ${status}`);
    console.log(`Last Seen:     ${device.lastSeen}`);
    console.log(`Cert Valid:    ${this.formatBoolean(device.certValid)}`);
    console.log(`Cert Expires:  ${this.formatDays(device.certDaysRemaining)}`);
    console.log('-'.repeat(50));
  }

  static formatFleetInfo(fleet: FleetInfo, json = false): void {
    if (json) {
      console.log(JSON.stringify(fleet, null, 2));
      return;
    }

    console.log(`\nFleet: ${chalk.blue(fleet.name)} (${fleet.id})\n`);
    console.log('Stats:');
    console.log('-'.repeat(50));
    console.log(`Total Devices:    ${fleet.deviceCount}`);
    console.log(`Connected:        ${fleet.connectedCount}`);
    console.log(`Error Rate:       ${this.formatPercentage(fleet.errorRate)}`);
    console.log(`Cert Rotation:    ${this.formatBoolean(fleet.certRotationEnabled)}`);
    console.log('-'.repeat(50));
    
    if (fleet.devices.length > 0) {
      console.log('\nDevices:');
      fleet.devices.forEach(device => {
        const status = this.formatStatus(device.status);
        console.log(`  ${status} ${device.id} (${device.type})`);
      });
    }
  }

  private static formatBoolean(value: boolean): string {
    return value ? chalk.green('✓ Yes') : chalk.red('✗ No');
  }

  private static formatOCSP(status: string | null): string {
    if (!status) return chalk.gray('Not checked');
    switch (status) {
      case 'good': return chalk.green('✓ Good');
      case 'revoked': return chalk.red('✗ Revoked');
      default: return chalk.yellow('? Unknown');
    }
  }

  private static formatStatus(status: string): string {
    switch (status) {
      case 'connected': return chalk.green('•');
      case 'disconnected': return chalk.gray('•');
      case 'error': return chalk.red('•');
      default: return chalk.yellow('•');
    }
  }

  private static formatDays(days: number): string {
    if (days > 30) return chalk.green(`${days} days`);
    if (days > 7) return chalk.yellow(`${days} days`);
    return chalk.red(`${days} days`);
  }

  private static formatPercentage(value: number): string {
    const percent = (value * 100).toFixed(1) + '%';
    if (value < 0.05) return chalk.green(percent);
    if (value < 0.10) return chalk.yellow(percent);
    return chalk.red(percent);
  }
}