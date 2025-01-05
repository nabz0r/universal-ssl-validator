#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <SPIFFS.h>
#include <Wire.h>
#include <X509Certificate.h>

// Configuration WiFi & MQTT
const char* ssid = "WIFI_SSID";
const char* password = "WIFI_PASSWORD";
const char* mqtt_server = "mqtt.server.com";
const int mqtt_port = 1883;
const char* mqtt_user = "device";
const char* mqtt_password = "device_password";

// ID unique de l'appareil
String deviceId = "";

// Clients
WiFiClient espClient;
PubSubClient client(espClient);

// Buffer JSON
StaticJsonDocument<512> doc;

// Topics MQTT
String statusTopic;
String commandTopic;
String certTopic;

// Gestion des certificats
X509Certificate currentCert;
long lastCertCheck = 0;
const long certCheckInterval = 3600000; // 1 heure

void setup() {
  Serial.begin(115200);
  
  // Initialisation du système de fichiers
  if(!SPIFFS.begin(true)) {
    Serial.println("Erreur SPIFFS");
    return;
  }

  // Génération de l'ID unique
  deviceId = String((uint32_t)ESP.getEfuseMac(), HEX);

  // Configuration des topics
  statusTopic = "devices/" + deviceId + "/status";
  commandTopic = "devices/" + deviceId + "/command";
  certTopic = "devices/" + deviceId + "/cert";

  // Connexion WiFi
  setupWiFi();

  // Configuration MQTT
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);

  // Chargement du certificat initial
  loadCertificate();
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  // Vérification périodique du certificat
  if (millis() - lastCertCheck > certCheckInterval) {
    checkCertificate();
    lastCertCheck = millis();
  }
}

void setupWiFi() {
  Serial.println("Connexion WiFi à " + String(ssid));
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nWiFi connecté");
  Serial.println("IP: " + WiFi.localIP().toString());
}

void callback(char* topic, byte* payload, unsigned int length) {
  String message = String((char*)payload).substring(0, length);
  
  if (String(topic) == commandTopic) {
    handleCommand(message);
  } else if (String(topic) == certTopic) {
    updateCertificate(message);
  }
}

void reconnect() {
  while (!client.connected()) {
    Serial.println("Connexion MQTT...");
    
    if (client.connect(deviceId.c_str(), mqtt_user, mqtt_password)) {
      Serial.println("connecté");
      
      // Souscription aux topics
      client.subscribe(commandTopic.c_str());
      client.subscribe(certTopic.c_str());
      
      // Envoi du statut initial
      sendStatus();
    } else {
      Serial.print("échec, rc=");
      Serial.print(client.state());
      Serial.println(" nouvelle tentative dans 5 secondes");
      delay(5000);
    }
  }
}

void handleCommand(String message) {
  DeserializationError error = deserializeJson(doc, message);
  
  if (error) {
    Serial.println("Erreur parsing JSON");
    return;
  }

  String command = doc["command"];
  
  if (command == "check_cert") {
    checkCertificate();
  } else if (command == "update_cert") {
    String newCert = doc["certificate"];
    updateCertificate(newCert);
  } else if (command == "restart") {
    ESP.restart();
  }
}

void loadCertificate() {
  if (SPIFFS.exists("/cert.pem")) {
    File certFile = SPIFFS.open("/cert.pem", "r");
    if (certFile) {
      String certContent = certFile.readString();
      currentCert.parse(certContent);
      certFile.close();
    }
  }
}

void updateCertificate(String newCert) {
  File certFile = SPIFFS.open("/cert.pem", "w");
  if (certFile) {
    certFile.print(newCert);
    certFile.close();
    loadCertificate();
    sendStatus();
  }
}

void checkCertificate() {
  if (!currentCert.isValid()) {
    return;
  }

  doc.clear();
  doc["type"] = "certificate";
  doc["valid"] = currentCert.verify();
  doc["expires"] = currentCert.getExpirationTime();
  doc["issuer"] = currentCert.getIssuerName();

  String message;
  serializeJson(doc, message);
  client.publish(statusTopic.c_str(), message.c_str());
}

void sendStatus() {
  doc.clear();
  doc["deviceId"] = deviceId;
  doc["status"] = "online";
  doc["version"] = "1.0.0";
  doc["uptime"] = millis() / 1000;
  doc["hasCertificate"] = currentCert.isValid();

  String message;
  serializeJson(doc, message);
  client.publish(statusTopic.c_str(), message.c_str(), true);
}
