import coap from 'coap';
import { EventEmitter } from 'events';
import { Device, DeviceCommand, DeviceStatus } from '../types';

export class CoAPAdapter extends EventEmitter {
  private server: coap.Server;
  private clients: Map<string, coap.IncomingMessage> = new Map();

  constructor(port: number = 5683) {
    super();
    this.server = coap.createServer();
    this.setupServer(port);
  }

  private setupServer(port: number) {
    this.server.on('request', (req, res) => {
      const deviceId = req.url.split('/')[1];
      this.handleRequest(deviceId, req, res);
    });

    this.server.listen(port, () => {
      console.log(`CoAP server listening on port ${port}`);
    });
  }

  private handleRequest(deviceId: string, req: coap.IncomingMessage, res: coap.OutgoingMessage) {
    const urlParts = req.url.split('/');
    const action = urlParts[2];

    switch (action) {
      case 'register':
        this.handleRegistration(deviceId, req, res);
        break;
      case 'status':
        this.handleStatus(deviceId, req, res);
        break;
      case 'command':
        this.handleCommand(deviceId, req, res);
        break;
      default:
        res.code = '4.04';
        res.end();
    }
  }

  private handleRegistration(deviceId: string, req: coap.IncomingMessage, res: coap.OutgoingMessage) {
    try {
      const device = JSON.parse(req.payload.toString()) as Device;
      this.clients.set(deviceId, req);
      this.emit('deviceRegistered', device);
      res.code = '2.01';
      res.end();
    } catch (error) {
      res.code = '4.00';
      res.end();
    }
  }

  private handleStatus(deviceId: string, req: coap.IncomingMessage, res: coap.OutgoingMessage) {
    try {
      const status = JSON.parse(req.payload.toString()) as DeviceStatus;
      this.emit('status', { deviceId, ...status });
      res.code = '2.01';
      res.end();
    } catch (error) {
      res.code = '4.00';
      res.end();
    }
  }

  private handleCommand(deviceId: string, req: coap.IncomingMessage, res: coap.OutgoingMessage) {
    try {
      const command = JSON.parse(req.payload.toString()) as DeviceCommand;
      this.emit('command', { deviceId, ...command });
      res.code = '2.01';
      res.end();
    } catch (error) {
      res.code = '4.00';
      res.end();
    }
  }

  async sendCommand(deviceId: string, command: DeviceCommand): Promise<void> {
    const req = coap.request({
      hostname: this.clients.get(deviceId)?.address,
      pathname: `/device/${deviceId}/command`,
      method: 'POST'
    });

    req.write(JSON.stringify(command));
    req.end();
  }

  async sendStatus(deviceId: string, status: DeviceStatus): Promise<void> {
    const req = coap.request({
      hostname: this.clients.get(deviceId)?.address,
      pathname: `/device/${deviceId}/status`,
      method: 'POST'
    });

    req.write(JSON.stringify(status));
    req.end();
  }

  stop(): void {
    this.server.close();
    this.clients.clear();
  }
}
