export interface ProtocolAdapter {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  subscribe(topic: string, handler: MessageHandler): Promise<void>;
  publish(topic: string, message: any): Promise<void>;
  isConnected(): boolean;
}

export type MessageHandler = (topic: string, message: any) => void;

export interface AdapterConfig {
  host: string;
  port: number;
  clientId: string;
  username?: string;
  password?: string;
  tls?: TLSConfig;
}

export interface TLSConfig {
  cert: string;
  key: string;
  ca?: string[];
  rejectUnauthorized?: boolean;
}