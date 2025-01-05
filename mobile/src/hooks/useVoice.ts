import { useState, useEffect, useCallback } from 'react';
import VoiceService from '../services/voice';

export interface VoiceCommand {
  command: string;
  args?: string;
}

const useVoice = (onCommand?: (command: VoiceCommand) => void) => {
  const [isListening, setIsListening] = useState(false);
  const voiceService = VoiceService.getInstance();

  const handleVoiceCommand = useCallback((command: string, args?: string) => {
    if (onCommand) {
      onCommand({ command, args });
    }
  }, [onCommand]);

  useEffect(() => {
    // Enregistrement des commandes
    voiceService.registerCommand('vérifier', (args) => handleVoiceCommand('verify', args));
    voiceService.registerCommand('valider', (args) => handleVoiceCommand('validate', args));
    voiceService.registerCommand('scanner', () => handleVoiceCommand('scan'));
    voiceService.registerCommand('statut', () => handleVoiceCommand('status'));
    voiceService.registerCommand('notifications', (args) => {
      const action = args?.toLowerCase().includes('activer') ? 'enable' : 'disable';
      handleVoiceCommand('notifications', action);
    });
  }, [handleVoiceCommand]);

  const startListening = async () => {
    try {
      await voiceService.startListening();
      setIsListening(true);
    } catch (error) {
      console.error('Error starting voice recognition:', error);
      setIsListening(false);
    }
  };

  const stopListening = async () => {
    try {
      await voiceService.stopListening();
      setIsListening(false);
    } catch (error) {
      console.error('Error stopping voice recognition:', error);
    }
  };

  return {
    isListening,
    startListening,
    stopListening
  };
};

export default useVoice;