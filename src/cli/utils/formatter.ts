import { Table } from 'cli-table3';
import { ValidationResult } from '../../core/types';
import { Device } from '../../iot/registry/device';

export class TableFormatter {
  static formatValidation(result: ValidationResult): Table {
    const table = new Table({
      head: ['Property', 'Status']
    });

    table.push(
      ['Valid', result.valid ? '✅' : '❌'],
      ['Chain Valid', result.chainValid ? '✅' : '❌'],
      ['OCSP Status', result.ocspStatus?.status || 'N/A'],
      ['CT Valid', result.ctValid ? '✅' : '❌'],
      ['DANE Valid', result.daneValid ? '✅' : '❌']
    );

    return table;
  }

  static formatDevices(devices: Device[]): Table {
    const table = new Table({
      head: ['ID', 'Type', 'Status', 'Cert Valid Days']
    });

    devices.forEach(device => {
      table.push([
        device.id,
        device.type,
        device.getStatus(),
        device.certValidDays()
      ]);
    });

    return table;
  }
}