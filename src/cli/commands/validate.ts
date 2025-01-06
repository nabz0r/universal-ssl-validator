import { Command } from 'commander';
import { SSLValidator } from '../../core/validator';
import { TableFormatter } from '../utils/formatter';

interface ValidateOptions {
  ocsp?: boolean;
  ct?: boolean;
  dane?: boolean;
  format?: 'json' | 'table';
}

export function createValidateCommand(): Command {
  const command = new Command('validate');
  
  command
    .description('Validate SSL certificate for a domain')
    .argument('<domain>', 'Domain to validate')
    .option('-o, --ocsp', 'Enable OCSP checking', true)
    .option('-c, --ct', 'Enable Certificate Transparency check', true)
    .option('-d, --dane', 'Enable DANE/TLSA validation', false)
    .option('-f, --format <format>', 'Output format (json|table)', 'table')
    .action(async (domain: string, options: ValidateOptions) => {
      try {
        const validator = new SSLValidator({
          checkOCSP: options.ocsp,
          checkCT: options.ct,
          timeout: 5000,
          maxRetries: 3,
          cache: true,
          cacheExpiry: 3600
        });

        const result = await validator.validateCertificate(domain);

        if (options.format === 'json') {
          console.log(JSON.stringify(result, null, 2));
        } else {
          const table = TableFormatter.formatValidation(result);
          console.log(table.toString());
        }
      } catch (error) {
        console.error('Validation failed:', error.message);
        process.exit(1);
      }
    });

  return command;
}