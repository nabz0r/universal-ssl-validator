import mqtt from 'mqtt';
import { EventEmitter } from 'events';
import { Device, DeviceCommand, DeviceStatus } from '../types';

export class MQTTAdapter extends EventEmitter {
  private client: mqtt.Client;
  private connected: boolean = false;

  constructor(brokerUrl: string, options?: mqtt.IClientOptions) {
    super();
    this.client = mqtt.connect(brokerUrl, {
      ...options,
      keepalive: 60,
      clean: true,
      reconnectPeriod: 1000
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.client.on('connect', () => {
      this.connected = true;
      this.emit('connected');
    });

    this.client.on('disconnect', () => {
      this.connected = false;
      this.emit('disconnected');
    });

    this.client.on('error', (error) => {
      this.emit('error', error);
    });

    this.client.on('message', (topic, message) => {
      this.handleMessage(topic, message);
    });
  }

  private handleMessage(topic: string, message: Buffer) {
    try {
      const [type, deviceId, action] = topic.split('/');
      const payload = JSON.parse(message.toString());

      switch (type) {
        case 'device':
          this.handleDeviceMessage(deviceId, action, payload);
          break;
        case 'command':
          this.handleCommandMessage(deviceId, payload);
          break;
        case 'status':
          this.handleStatusMessage(deviceId, payload);
          break;
      }
    } catch (error) {
      this.emit('error', error);
    }
  }

  private handleDeviceMessage(deviceId: string, action: string, payload: any) {
    switch (action) {
      case 'register':
        this.emit('deviceRegistered', payload as Device);
        break;
      case 'update':
        this.emit('deviceUpdated', payload as Device);
        break;
      case 'remove':
        this.emit('deviceRemoved', deviceId);
        break;
    }
  }

  private handleCommandMessage(deviceId: string, payload: any) {
    this.emit('command', {
      deviceId,
      ...payload
    } as DeviceCommand);
  }

  private handleStatusMessage(deviceId: string, payload: any) {
    this.emit('status', {
      deviceId,
      ...payload
    } as DeviceStatus);
  }

  async publish(topic: string, message: any): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.connected) {
        reject(new Error('Not connected to MQTT broker'));
        return;
      }

      this.client.publish(
        topic,
        typeof message === 'string' ? message : JSON.stringify(message),
        (error) => {
          if (error) reject(error);
          else resolve();
        }
      );
    });
  }

  async subscribe(topic: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.subscribe(topic, (error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }

  async unsubscribe(topic: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.unsubscribe(topic, (error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }

  async disconnect(): Promise<void> {
    return new Promise((resolve) => {
      this.client.end(false, {}, () => {
        this.connected = false;
        resolve();
      });
    });
  }
}
