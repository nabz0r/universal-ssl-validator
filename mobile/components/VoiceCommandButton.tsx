import React from 'react';
import { TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useVoice from '../src/hooks/useVoice';

interface VoiceCommandButtonProps {
  onCommand?: (command: { command: string; args?: string }) => void;
  size?: number;
  color?: string;
}

const VoiceCommandButton: React.FC<VoiceCommandButtonProps> = ({
  onCommand,
  size = 24,
  color = '#007AFF',
}) => {
  const { isListening, startListening, stopListening } = useVoice(onCommand);

  const toggleListening = async () => {
    if (isListening) {
      await stopListening();
    } else {
      await startListening();
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