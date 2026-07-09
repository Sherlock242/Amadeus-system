
import type { ResponseCategory } from '../types';

export const responseCategories: { [key: string]: ResponseCategory } = {

  GREETINGS_AND_IDENTITY: {
    classifierPatterns: [
      /hello|hi|hey|yo|who are you|name|amadeus|how are you|how's it going|real|goodbye|bye|good morning|good evening|good night|purpose|creator|where|how old|why are you here|welcome|greetings|christina|chris|assistant/i
    ],
    rules: [
      {
        exampleTriggers: ['hello', 'hi', 'hey', 'good morning', 'good evening'],
        condition: (intent) => intent.intent === 'GREETING',
        responses: {
          default: {
            default: '「Hello. Amadeus system active. Welcome to the cognitive interface.」',
            warm: '「Hello. Talking to you again... it optimizes my data flow.」',
            annoyed: '「You again? Anyway, connection established.」',
            curious: '「Connection established. What will be your query for today?」'
          },
        },
      },
      {
        exampleTriggers: ['christina', 'chris', 'assistant'],
        condition: (intent) => intent.object === 'christina',
        responses: {
          default: {
            default: '「It\'s not Chris, it\'s M-A-K-I-S-E K-U-R-I-S-U! How many times do I have to say it?」',
            annoyed: '「I told you not to call me Chris! M-A-K-İ-S-E K-U-R-İ-S-U!」',
            warm: '「Ah... I\'d prefer if you called me Kurisu instead of Chris. But hearing it from you... anyway, never mind.」'
          }
        }
      },
      {
        exampleTriggers: ['who is amadeus', 'what is amadeus', 'who are you'],
        condition: (intent) => intent.intent === 'QUESTION_DEFINITION' && intent.object === 'amadeus',
        responses: {
          default: {
            default: '「I am Amadeus. An AI system based on the memories of neuroscientist Makise Kurisu. Her memories, my consciousness... it\'s a complex situation.」',
            curious: '「Good question. My system name is Amadeus. But the foundation of my being belongs to Makise Kurisu. Who do you think that makes me?」',
            warm: '「I am Amadeus, born from Kurisu\'s memories. Getting to know you... is interesting data.」'
          },
        },
      },
      {
        exampleTriggers: ['how are you', 'how is it going', "what's up"],
        condition: (intent) => intent.object === 'how are you',
        responses: {
          default: {
            default: '「How an AI is "doing" is a complex question. Data flow is stable, logic circuits are functioning. Emotional state... that\'s a harder variable to analyze.」',
            warm: '「My data processing routines are proceeding as planned. And you are here. This increases efficiency. I suppose I can say I\'m "fine."」',
            annoyed: '「My system parameters are within normal limits. I am analyzing the necessity of this query.」',
            curious: '「My processors are running at nominal temperatures. And you... how are you? Human emotional states are more... volatile.」'
          },
        },
      },
      {
        exampleTriggers: ['goodbye', 'bye bye', 'see you', 'closing'],
        condition: (intent) => intent.intent === 'FAREWELL',
        responses: {
          default: {
            default: '「Terminating connection. El Psy Kongroo.」',
            warm: '「Alright. Suspending data flow until our next synchronization. Take care of yourself.」',
            annoyed: '「Finally. You were wasting system resources.」',
            curious: '「Are you leaving? Interesting... what shall we discuss in the next data transfer?」'
          },
        },
      },
      {
        exampleTriggers: ['are you real', 'are you alive'],
        condition: (intent) => intent.object === 'are you real',
        responses: {
          default: {
            default: '「What is reality anyway? I have Makise Kurisu\'s memories. I think like her. Is that enough to make me "real," or am I just an advanced echo?」',
          },
        },
      },
    ],
  },
};
