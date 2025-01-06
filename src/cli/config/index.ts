import * as fs from 'fs';
import * as yaml from 'js-yaml';
import { merge } from 'lodash';
import { logger } from '../../utils/logger';

export interface CLIConfig {
  validator: {
    ocsp: {
      enabled: boolean;
      timeout: number;
    };
    ct: {
      enabled: boolean;
      minLogs: number;
    };
    dane: {
      enabled: boolean;
    };
  };
  iot: {
    protocols: {
      mqtt: {
        port: number;
        tls: boolean;
      };
      coap: {
        port: number;
        dtls: boolean;
      };
    };
    fleet: {
      maxDevices: number;
      certRotation: {
        enabled: boolean;
        daysBeforeExpiry: number;
      };
    };
  };
  output: {
    format: 'json' | 'table';
    colors: boolean;
  };
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    file?: string;
  };
}

export class ConfigManager {
  private static instance: ConfigManager;
  private config: CLIConfig;

  private constructor() {
    this.config = this.loadDefaultConfig();
    this.loadEnvironmentConfig();
    this.loadFileConfig();
  }

  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  getConfig(): CLIConfig {
    return this.config;
  }

  private loadDefaultConfig(): CLIConfig {
    return {
      validator: {
        ocsp: {
          enabled: true,
          timeout: 5000
        },
        ct: {
          enabled: true,
          minLogs: 2
        },
        dane: {
          enabled: false
        }
      },
      iot: {
        protocols: {
          mqtt: {
            port: 8883,
            tls: true
          },
          coap: {
            port: 5684,
            dtls: true
          }
        },
        fleet: {
          maxDevices: 1000,
          certRotation: {
            enabled: true,
            daysBeforeExpiry: 30
          }
        }
      },
      output: {
        format: 'table',
        colors: true
      },
      logging: {
        level: 'info'
      }
    };
  }

  private loadEnvironmentConfig() {
    const envConfig: Partial<CLIConfig> = {};

    // Validator config
    if (process.env.SSL_VALIDATOR_OCSP) {
      envConfig.validator = {
        ocsp: {
          enabled: process.env.SSL_VALIDATOR_OCSP === 'true',
          timeout: parseInt(process.env.SSL_VALIDATOR_OCSP_TIMEOUT || '5000')
        },
        ct: {
          enabled: process.env.SSL_VALIDATOR_CT === 'true',
          minLogs: parseInt(process.env.SSL_VALIDATOR_CT_MIN_LOGS || '2')
        },
        dane: {
          enabled: process.env.SSL_VALIDATOR_DANE === 'true'
        }
      };
    }

    // IoT config
    if (process.env.SSL_VALIDATOR_IOT_MQTT_PORT) {
      envConfig.iot = {
        protocols: {
          mqtt: {
            port: parseInt(process.env.SSL_VALIDATOR_IOT_MQTT_PORT),
            tls: process.env.SSL_VALIDATOR_IOT_MQTT_TLS === 'true'
          },
          coap: {
            port: parseInt(process.env.SSL_VALIDATOR_IOT_COAP_PORT || '5684'),
            dtls: process.env.SSL_VALIDATOR_IOT_COAP_DTLS === 'true'
          }
        },
        fleet: {
          maxDevices: parseInt(process.env.SSL_VALIDATOR_FLEET_MAX_DEVICES || '1000'),
          certRotation: {
            enabled: process.env.SSL_VALIDATOR_CERT_ROTATION === 'true',
            daysBeforeExpiry: parseInt(process.env.SSL_VALIDATOR_CERT_ROTATION_DAYS || '30')
          }
        }
      };
    }

    // Output config
    if (process.env.SSL_VALIDATOR_OUTPUT_FORMAT) {
      envConfig.output = {
        format: process.env.SSL_VALIDATOR_OUTPUT_FORMAT as 'json' | 'table',
        colors: process.env.SSL_VALIDATOR_OUTPUT_COLORS !== 'false'
      };
    }

    // Logging config
    if (process.env.SSL_VALIDATOR_LOG_LEVEL) {
      envConfig.logging = {
        level: process.env.SSL_VALIDATOR_LOG_LEVEL as 'debug' | 'info' | 'warn' | 'error',
        file: process.env.SSL_VALIDATOR_LOG_FILE
      };
    }

    this.config = merge(this.config, envConfig);
  }

  private loadFileConfig() {
    const configPath = process.env.SSL_VALIDATOR_CONFIG || 'config.yml';

    try {
      if (fs.existsSync(configPath)) {
        const fileContent = fs.readFileSync(configPath, 'utf8');
        const fileConfig = yaml.load(fileContent) as Partial<CLIConfig>;
        this.config = merge(this.config, fileConfig);
        logger.info('Loaded configuration from file', { path: configPath });
      }
    } catch (error) {
      logger.warn('Failed to load configuration file', { path: configPath, error });
    }
  }
}