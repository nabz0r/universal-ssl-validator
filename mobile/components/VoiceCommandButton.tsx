import React, { useState, useEffect } from 'react';
import { TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import VoiceService from '../src/services/voice';

interface VoiceCommandButtonProps {
  onCommand?: (command: string, args?: string) => void;
  size?: number;
  color?: string;
}

const VoiceCommandButton: React.FC<VoiceCommandButtonProps> = ({
  onCommand,
  size = 24,
  color = '#007AFF',
}) => {
  const [isListening, setIsListening] = useState(false);
  const voiceService = VoiceService.getInstance();

  useEffect(() => {
    // Enregistrement des commandes de base
    if (onCommand) {
      voiceService.registerCommand('vérifier', (args) => onCommand('verify', args));
      voiceService.registerCommand('valider', (args) => onCommand('validate', args));
      voiceService.registerCommand('scanner', () => onCommand('scan'));
      voiceService.registerCommand('statut', () => onCommand('status'));
      voiceService.registerCommand('notifications', (args) => {
        const action = args?.toLowerCase().includes('activer') ? 'enable' : 'disable';
        onCommand('notifications', action);
      });
    }
  }, [onCommand]);

  const toggleListening = async () => {
    try {
      if (isListening) {
        await voiceService.stopListening();
      } else {
        await voiceService.startListening();
      }
      setIsListening(!isListening);
    } catch (error) {
      console.error('Error toggling voice recognition:', error);
      setIsListening(false);
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.button, isListening && styles.buttonActive]}
      onPress={toggleListening}
    >
      {isListening ? (
        <ActivityIndicator color={color} size="small" />
      ) : (
        <Ionicons name="mic" size={size} color={color} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 12,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonActive: {
    backgroundColor: '#e0e0e0',
  },
});

export default VoiceCommandButton;