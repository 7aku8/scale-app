import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { ScalesService } from '../../scales/scales.service';
import { MeasurementsService } from '../../measurements/measurements.service';
import { IsNotEmpty, IsString } from 'class-validator';
import { plainToInstance } from 'class-transformer';

interface MqttMessage {
  topic: string;
  payload: string;
}

class WeightPayload {
  @IsString()
  @IsNotEmpty()
  weight: number;
}

@Injectable()
export class WeightMessageProcessor {
  private readonly logger = new Logger(WeightMessageProcessor.name);

  constructor(
    private readonly scalesService: ScalesService,
    private readonly measurementsService: MeasurementsService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @OnEvent('mqtt.message')
  async handleMessage(message: MqttMessage): Promise<void> {
    const { topic, payload } = message;

    this.logger.debug(`Processing MQTT message on topic: ${topic}`);

    // Only process weight measurements
    if (!topic.includes('/weight')) {
      return;
    }

    try {
      // Extract MAC address from topic: scales/{macAddress}/weight
      const macAddress = this.extractMacAddress(topic);
      if (!macAddress) {
        this.logger.warn(`Invalid topic format: ${topic}`);
        return;
      }

      // Lookup scale by MAC address
      const scale = await this.scalesService.findByMacAddress(macAddress);
      if (!scale) {
        this.logger.warn(`Scale with MAC address ${macAddress} not found`);
        return;
      }

      // Parse payload
      const weightData = this.parsePayload(payload);
      if (!weightData) {
        this.logger.warn(`Invalid payload format: ${payload}`);
        return;
      }

      // Store measurement
      const measurement = await this.measurementsService.create({
        scaleId: scale.id,
        organizationId: scale.organizationId,
        weight: weightData.weight,
        time: new Date(),
        isValid: true,
      });

      this.logger.log(
        `Stored measurement for scale ${scale.id} (${macAddress}): ${weightData.weight}kg`,
      );

      // Emit event for WebSocket broadcasting
      this.eventEmitter.emit('measurement.created', {
        scaleId: scale.id,
        organizationId: scale.organizationId,
        measurement,
      });
    } catch (error) {
      this.logger.error(
        `Failed to process message: ${error.message}`,
        error.stack,
      );
    }
  }

  private extractMacAddress(topic: string): string | null {
    // Topic format: scales/{macAddress}/weight
    const parts = topic.split('/');
    if (parts.length >= 3 && parts[0] === 'scales' && parts[2] === 'weight') {
      return parts[1];
    }
    return null;
  }

  private parsePayload(payload: string): WeightPayload | null {
    try {
      return plainToInstance(WeightPayload, JSON.parse(payload));
    } catch (error) {
      this.logger.error(`Failed to parse payload: ${error.message}`);
      return null;
    }
  }
}
