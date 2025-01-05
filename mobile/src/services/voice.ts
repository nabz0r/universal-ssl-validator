import Voice, { SpeechResultsEvent, SpeechErrorEvent } from '@react-native-voice/voice';

class VoiceService {
  private static instance: VoiceService;
  private isListening: boolean = false;
  private commandHandlers: Map<string, (args?: string) => void> = new Map();

  private constructor() {
    Voice.onSpeechResults = this.handleSpeechResults.bind(this);
    Voice.onSpeechError = this.handleSpeechError.bind(this);
  }

  public static getInstance(): VoiceService {
    if (!VoiceService.instance) {
      VoiceService.instance = new VoiceService();
    }
    return VoiceService.instance;
  }

  public registerCommand(command: string, handler: (args?: string) => void) {
    this.commandHandlers.set(command.toLowerCase(), handler);
  }

  public async startListening(): Promise<void> {
    if (this.isListening) return;
    
    try {
      await Voice.start('fr-FR');
      this.isListening = true;
    } catch (error) {
      console.error('Error starting voice recognition:', error);
      throw error;
    }
  }

  public async stopListening(): Promise<void> {
    if (!this.isListening) return;
    
    try {
      await Voice.stop();
      this.isListening = false;
    } catch (error) {
      console.error('Error stopping voice recognition:', error);
      throw error;
    }
  }

  private async handleSpeechResults(event: SpeechResultsEvent) {
    if (!event.value || event.value.length === 0) return;
    
    const command = event.value[0].toLowerCase();
    
    // Liste des commandes supportées
    const supportedCommands = {
      'vérifier': /^vérifier\s+(.+)$/i,
      'valider': /^valider\s+(.+)$/i,
      'scanner': /^scanner\s*$/i,
      'statut': /^statut\s*$/i,
      'notifications': /^(activer|désactiver)\s+notifications\s*$/i
    };

    for (const [cmdKey, cmdRegex] of Object.entries(supportedCommands)) {
      const match = command.match(cmdRegex);
      if (match) {
        const handler = this.commandHandlers.get(cmdKey);
        if (handler) {
          handler(match[1]); // Passe les arguments capturés au handler
        }
        break;
      }
    }
  }

  private handleSpeechError(error: SpeechErrorEvent) {
    console.error('Voice recognition error:', error);
    this.isListening = false;
  }
}

export default VoiceService;