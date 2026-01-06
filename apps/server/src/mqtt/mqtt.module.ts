import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import mqttConfig from '../config/mqtt.config';
import { MqttClientProvider } from './mqtt-client.provider';
import { MqttService } from './mqtt.service';
import { WeightMessageProcessor } from './processors/weight-message.processor';
import { ScalesModule } from '../scales/scales.module';
import { MeasurementsModule } from '../measurements/measurements.module';

@Global()
@Module({
  imports: [ConfigModule.forFeature(mqttConfig), ScalesModule, MeasurementsModule],
  providers: [MqttClientProvider, MqttService, WeightMessageProcessor],
  exports: [MqttService],
})
export class MqttModule {}
