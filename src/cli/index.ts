#!/usr/bin/env node
import { Command } from 'commander';
import { createValidateCommand } from './commands/validate';
import { createDeviceCommand } from './commands/device';
import { createFleetCommand } from './commands/fleet';

const program = new Command();

program
  .name('ssl-validator')
  .description('Universal SSL Validator CLI')
  .version('1.0.0');

program
  .addCommand(createValidateCommand())
  .addCommand(createDeviceCommand())
  .addCommand(createFleetCommand());

program.parse(process.argv);
