
import { Conversation, PersonalitySettings, TtsSettings, MusicSettings, SynthesizedMemory, LimbicAnalysis } from '@/types';

export interface UserBrain {
    username: string;
    conversations: Conversation[];
    personality: PersonalitySettings;
    tts: TtsSettings;
    music: MusicSettings;
    memories: SynthesizedMemory[];
    lastLimbicState?: LimbicAnalysis | null;
    apiKey: string;
    openRouterKey?: string;
    lastSeen: number;
}

class DatabaseService {
    async initDB(): Promise<void> {
        return Promise.resolve();
    }

    async saveBrain(brain: UserBrain): Promise<void> {
        if (typeof window !== 'undefined') {
            localStorage.setItem('amadeus_brain_backup_' + brain.username, JSON.stringify(brain));
        }
    }

    async loadBrain(username: string): Promise<UserBrain | null> {
        if (typeof window !== 'undefined') {
            const data = localStorage.getItem('amadeus_brain_backup_' + username);
            return data ? JSON.parse(data) : null;
        }
        return null;
    }

    openLocalDataFolder(): void {
        console.log("Local folder access not available in browser mode.");
    }
}

export const dbService = new DatabaseService();
