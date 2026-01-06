import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as mqtt from 'mqtt';

export const MQTT_CLIENT = 'MQTT_CLIENT';

export const MqttClientProvider: Provider = {
  provide: MQTT_CLIENT,
  useFactory: (configService: ConfigService) => {
    const brokerUrl = configService.get<string>('mqtt.brokerUrl') || 'mqtt://localhost:1883';
    const clientId = configService.get<string>('mqtt.clientId') || 'nestjs-poultry-server';
    const username = configService.get<string>('mqtt.username');
    const password = configService.get<string>('mqtt.password');

    const client = mqtt.connect(brokerUrl, {
      clientId,
      username,
      password,
      keepalive: 60,
      reconnectPeriod: 1000,
      connectTimeout: 30000,
      clean: true,
    });

    return client;
  },
  inject: [ConfigService],
};
