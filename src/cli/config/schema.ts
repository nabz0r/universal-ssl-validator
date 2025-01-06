import * as Joi from 'joi';

export const configSchema = Joi.object({
  validator: Joi.object({
    ocsp: Joi.object({
      enabled: Joi.boolean().default(true),
      timeout: Joi.number().min(1000).max(30000).default(5000)
    }),
    ct: Joi.object({
      enabled: Joi.boolean().default(true),
      minLogs: Joi.number().min(1).max(5).default(2)
    }),
    dane: Joi.object({
      enabled: Joi.boolean().default(false)
    })
  }),
  iot: Joi.object({
    protocols: Joi.object({
      mqtt: Joi.object({
        port: Joi.number().port().default(8883),
        tls: Joi.boolean().default(true)
      }),
      coap: Joi.object({
        port: Joi.number().port().default(5684),
        dtls: Joi.boolean().default(true)
      })
    }),
    fleet: Joi.object({
      maxDevices: Joi.number().min(1).max(10000).default(1000),
      certRotation: Joi.object({
        enabled: Joi.boolean().default(true),
        daysBeforeExpiry: Joi.number().min(1).max(90).default(30)
      })
    })
  }),
  output: Joi.object({
    format: Joi.string().valid('json', 'table').default('table'),
    colors: Joi.boolean().default(true)
  }),
  logging: Joi.object({
    level: Joi.string().valid('debug', 'info', 'warn', 'error').default('info'),
    file: Joi.string().optional()
  })
});

export function validateConfig(config: unknown): void {
  const { error } = configSchema.validate(config, {
    abortEarly: false,
    allowUnknown: false
  });

  if (error) {
    throw new Error(`Invalid configuration:\n${error.details.map(d => `- ${d.message}`).join('\n')}`);
  }
}