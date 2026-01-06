import mqtt from 'mqtt';

// Konfiguracja
const BROKER_URL = 'mqtt://localhost:1883';
const SCALE_MAC = 'SCALE_001'; // Musi pasować do tego w bazie!
const TARGET_WEIGHT = 2.25; // Średnia waga dzisiaj

const client = mqtt.connect(BROKER_URL);

client.on('connect', () => {
  console.log(`✅ Symulator podłączony do ${BROKER_URL}`);
  console.log(`🐔 Rozpoczynam symulację ważenia dla ${SCALE_MAC}...`);

  // Wyślij pomiar co 3 sekundy
  setInterval(() => {
    // Generujemy losową wagę (Gauss: średnia +/- odchylenie)
    const variance = (Math.random() - 0.5) * 0.4; // +/- 0.2kg
    const currentWeight = (TARGET_WEIGHT + variance).toFixed(3);

    const payload = JSON.stringify({
      weight: currentWeight,
      unit: 'kg',
      timestamp: Date.now(),
    });

    const topic = `scales/${SCALE_MAC}/weight`;
    client.publish(topic, payload);

    console.log(`📤 Wysłano: ${currentWeight} kg -> ${topic}`);
  }, 3000);
});

client.on('error', (err) => console.error('Błąd MQTT:', err));
