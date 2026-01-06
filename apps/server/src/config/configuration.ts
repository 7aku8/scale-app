export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  database: {
    url: process.env.DATABASE_URL || '',
  },

  mqtt: {
    brokerUrl: process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883',
    clientId: process.env.MQTT_CLIENT_ID || 'nestjs-poultry-server',
    username: process.env.MQTT_USERNAME,
    password: process.env.MQTT_PASSWORD,
  },

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  },

  auth: {
    secret: process.env.BETTER_AUTH_SECRET,
    baseUrl: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
  },
});
