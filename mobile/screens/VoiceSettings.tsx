import React from 'react';
import { View, Text, StyleSheet, ScrollView, Switch } from 'react-native';
import { Card } from '../components';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface VoiceCommand {
  name: string;
  description: string;
  enabled: boolean;
}

const VoiceSettings = () => {
  const [commands, setCommands] = React.useState<VoiceCommand[]>([
    { name: 'vérifier', description: 'Vérifier un domaine : "vérifier example.com"', enabled: true },
    { name: 'valider', description: 'Valider un certificat : "valider cert.pem"', enabled: true },
    { name: 'scanner', description: 'Activer le scanner : "scanner"', enabled: true },
    { name: 'statut', description: 'Afficher le statut : "statut"', enabled: true },
    { name: 'notifications', description: 'Gérer les notifications : "activer/désactiver notifications"', enabled: true },
  ]);

  React.useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('voiceCommandSettings');
      if (savedSettings) {
        setCommands(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Error loading voice command settings:', error);
    }
  };

  const saveSettings = async (newCommands: VoiceCommand[]) => {
    try {
      await AsyncStorage.setItem('voiceCommandSettings', JSON.stringify(newCommands));
    } catch (error) {
      console.error('Error saving voice command settings:', error);
    }
  };

  const toggleCommand = (index: number) => {
    const newCommands = [...commands];
    newCommands[index].enabled = !newCommands[index].enabled;
    setCommands(newCommands);
    saveSettings(newCommands);
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.infoCard}>
        <Text style={styles.infoText}>
          Activez ou désactivez les commandes vocales ci-dessous. 
          Appuyez sur le bouton microphone dans l'application pour utiliser les commandes.
        </Text>
      </Card>

      {commands.map((command, index) => (
        <Card key={command.name} style={styles.commandCard}>
          <View style={styles.commandHeader}>
            <Text style={styles.commandName}>{command.name}</Text>
            <Switch
              value={command.enabled}
              onValueChange={() => toggleCommand(index)}
            />
          </View>
          <Text style={styles.commandDescription}>{command.description}</Text>
        </Card>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  infoCard: {
    marginBottom: 16,
    padding: 16,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  commandCard: {
    marginBottom: 12,
    padding: 16,
  },
  commandHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  commandName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  commandDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default VoiceSettings;