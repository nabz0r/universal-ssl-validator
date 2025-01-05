#!/usr/bin/env node

import { Command } from 'commander';
import { SSLValidator } from '../core/validator';

const program = new Command();
const validator = new SSLValidator();

program
  .name('ssl-validator')
  .description('Universal SSL Certificate Validator')
  .version('0.1.0');

program
  .command('check')
  .description('Check SSL certificate for a domain')
  .argument('<domain>', 'domain to check')
  .option('-o, --ocsp', 'enable OCSP check', true)
  .action(async (domain, options) => {
    try {
      const result = await validator.validateCertificate(domain);
      console.log(JSON.stringify(result, null, 2));
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

program.parse();