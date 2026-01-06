import { Injectable, Inject, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as mqtt from 'mqtt';
import { MQTT_CLIENT } from './mqtt-client.provider';

@Injectable()
export class MqttService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MqttService.name);
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 10;

  constructor(
    @Inject(MQTT_CLIENT)
    private readonly client: mqtt.MqttClient,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async onModuleInit() {
    this.setupEventHandlers();
    await this.connect();
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  private setupEventHandlers() {
    this.client.on('connect', () => {
      this.logger.log('Connected to MQTT broker');
      this.reconnectAttempts = 0;
      this.subscribe('scales/+/weight');
    });

    this.client.on('error', (error) => {
      this.logger.error(`MQTT error: ${error.message}`);
      this.handleReconnect();
    });

    this.client.on('message', (topic: string, payload: Buffer) => {
      this.logger.debug(`Received message on topic ${topic}`);
      this.eventEmitter.emit('mqtt.message', { topic, payload: payload.toString() });
    });

    this.client.on('reconnect', () => {
      this.logger.warn('Reconnecting to MQTT broker...');
    });

    this.client.on('close', () => {
      this.logger.warn('MQTT connection closed');
    });
  }

  private async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.client.connected) {
        resolve();
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error('MQTT connection timeout'));
      }, 30000);

      this.client.once('connect', () => {
        clearTimeout(timeout);
        resolve();
      });

      this.client.once('error', (error) => {
        clearTimeout(timeout);
        reject(error);
      });
    });
  }

  subscribe(pattern: string): void {
    this.client.subscribe(pattern, (error) => {
      if (error) {
        this.logger.error(`Failed to subscribe to ${pattern}: ${error.message}`);
      } else {
        this.logger.log(`Subscribed to topic pattern: ${pattern}`);
      }
    });
  }

  publish(topic: string, message: string | Buffer): void {
    this.client.publish(topic, message, (error) => {
      if (error) {
        this.logger.error(`Failed to publish to ${topic}: ${error.message}`);
      } else {
        this.logger.debug(`Published message to ${topic}`);
      }
    });
  }

  private async handleReconnect(): Promise<void> {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.logger.error('Max reconnect attempts reached. Giving up.');
      return;
    }

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    this.reconnectAttempts++;

    this.logger.warn(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  async disconnect(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.client.connected) {
        resolve();
        return;
      }

      this.client.end(false, {}, () => {
        this.logger.log('Disconnected from MQTT broker');
        resolve();
      });
    });
  }

  isConnected(): boolean {
    return this.client.connected;
  }
}
