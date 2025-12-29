import {entity} from "./entity.js";


export const quest_component = (() => {

  // Define multiple quests with objectives and rewards
  const QUESTS = {
    welcome_quest: {
      id: 'welcome_quest',
      title: 'Welcome to Honeywood',
      text: 'Welcome adventurer! I need your help. Strange creatures have been terrorizing our village. Please defeat 5 monsters to prove your strength.',
      objectives: [
        { type: 'kill', target: 'any', required: 5, current: 0, description: 'Defeat 5 monsters' }
      ],
      rewards: {
        experience: 500,
        items: []
      },
      completed: false,
      active: false
    },
    
    monster_hunter: {
      id: 'monster_hunter',
      title: 'The Monster Hunter',
      text: 'You have proven yourself capable! Now I need you to hunt down 10 more creatures. The village will be safer with you protecting it.',
      objectives: [
        { type: 'kill', target: 'any', required: 10, current: 0, description: 'Defeat 10 monsters' }
      ],
      rewards: {
        experience: 1000,
        items: []
      },
      completed: false,
      active: false,
      prerequisite: 'welcome_quest' // Must complete welcome_quest first
    },
    
    elite_slayer: {
      id: 'elite_slayer',
      title: 'Elite Slayer',
      text: 'Your skills are impressive! For your final test, defeat 20 creatures and reach level 3. Only then will you be a true hero of Honeywood.',
      objectives: [
        { type: 'kill', target: 'any', required: 20, current: 0, description: 'Defeat 20 monsters' },
        { type: 'level', required: 3, current: 1, description: 'Reach level 3' }
      ],
      rewards: {
        experience: 2000,
        items: []
      },
      completed: false,
      active: false,
      prerequisite: 'monster_hunter'
    }
  };

  class QuestComponent extends entity.Component {
    constructor(params) {
      super();
      this._params = params || {};
      this._questId = this._params.questId || 'welcome_quest';
      
      const e = document.getElementById('quest-ui');
      e.style.visibility = 'hidden';
    }

    InitComponent() {
      this._RegisterHandler('input.picked', (m) => this._OnPicked(m));
    }

    _OnPicked(msg) {
      const questManager = this.FindEntity('quest-manager');
      if (questManager) {
        const manager = questManager.GetComponent('QuestManager');
        manager.OfferQuest(this._questId);
      }
    }
  };

  class QuestManager extends entity.Component {
    constructor() {
      super();
      this._quests = JSON.parse(JSON.stringify(QUESTS)); // Deep copy
      this._activeQuests = [];
    }

    InitComponent() {
      // Listen for kills and level ups
      this._RegisterHandler('quest.enemy-killed', (m) => this._OnEnemyKilled(m));
      this._RegisterHandler('quest.level-gained', (m) => this._OnLevelGained(m));
    }

    OfferQuest(questId) {
      const quest = this._quests[questId];
      
      if (!quest) {
        console.log('Quest not found:', questId);
        return;
      }

      if (quest.completed) {
        this._ShowMessage('Quest Already Completed', 'You have already completed this quest!');
        return;
      }

      if (quest.active) {
        this._ShowMessage(quest.title, 'Quest is already active. Check your quest journal for objectives.');
        return;
      }

      // Check prerequisites
      if (quest.prerequisite) {
        const prereq = this._quests[quest.prerequisite];
        if (!prereq.completed) {
          this._ShowMessage('Quest Unavailable', 'You must complete other quests first before taking this one.');
          return;
        }
      }

      // Activate quest
      quest.active = true;
      this._activeQuests.push(questId);
      
      // Add to journal
      this._AddQuestToJournal(quest);
      
      console.log('Quest activated:', quest.title);
    }

    _OnEnemyKilled(msg) {
      let questsUpdated = false;

      for (let questId of this._activeQuests) {
        const quest = this._quests[questId];
        
        if (quest.completed) continue;

        for (let objective of quest.objectives) {
          if (objective.type === 'kill' && objective.current < objective.required) {
            if (objective.target === 'any' || objective.target === msg.enemyType) {
              objective.current++;
              questsUpdated = true;
              
              console.log(`Quest progress: ${quest.title} - ${objective.current}/${objective.required}`);
            }
          }
        }

        // Check if quest is complete
        this._CheckQuestCompletion(quest);
      }

      if (questsUpdated) {
        this._UpdateQuestUI();
      }
    }

    _OnLevelGained(msg) {
      const level = msg.value;

      for (let questId of this._activeQuests) {
        const quest = this._quests[questId];
        
        if (quest.completed) continue;

        for (let objective of quest.objectives) {
          if (objective.type === 'level') {
            objective.current = level;
          }
        }

        this._CheckQuestCompletion(quest);
      }

      this._UpdateQuestUI();
    }

    _CheckQuestCompletion(quest) {
      if (quest.completed) return;

      const allComplete = quest.objectives.every(obj => {
        if (obj.type === 'kill') {
          return obj.current >= obj.required;
        } else if (obj.type === 'level') {
          return obj.current >= obj.required;
        }
        return false;
      });

      if (allComplete) {
        this._CompleteQuest(quest);
      }
    }

    _CompleteQuest(quest) {
      quest.completed = true;
      
      console.log('Quest completed:', quest.title);
      
      // Show completion message
      this._ShowMessage('Quest Complete!', `You completed: ${quest.title}`);
      
      // Grant rewards
      const player = this.FindEntity('player');
      if (player) {
        // Give experience
        if (quest.rewards.experience > 0) {
          player.Broadcast({
            topic: 'health.add-experience',
            value: quest.rewards.experience
          });
          console.log('Awarded XP:', quest.rewards.experience);
        }

        // Give items (if any)
        for (let itemName of quest.rewards.items) {
          player.Broadcast({
            topic: 'inventory.add',
            value: itemName,
            added: false
          });
        }
      }

      this._UpdateQuestUI();
      
      // Check if all quests are complete
      this._CheckAllQuestsComplete();
    }

    _CheckAllQuestsComplete() {
      const allComplete = Object.values(this._quests).every(q => q.completed);
      
      if (allComplete) {
        console.log('All quests completed!');
        this._ShowCompletionScreen();
      }
    }

    _ShowCompletionScreen() {
      const screen = document.getElementById('completion-screen');
      if (screen) {
        screen.style.display = 'flex';
        
        // Allow closing with ESC key
        const escHandler = (e) => {
          if (e.keyCode === 27) { // ESC key
            screen.style.display = 'none';
            document.removeEventListener('keydown', escHandler);
          }
        };
        document.addEventListener('keydown', escHandler);
      }
    }

    _ShowMessage(title, text) {
      const questUI = document.getElementById('quest-ui');
      questUI.style.visibility = '';

      const titleElement = document.getElementById('quest-text-title');
      titleElement.innerText = title;

      const textElement = document.getElementById('quest-text');
      textElement.innerText = text;

      // Auto-hide after 5 seconds
      setTimeout(() => {
        questUI.style.visibility = 'hidden';
      }, 5000);
    }

    _UpdateQuestUI() {
      const ui = this.FindEntity('ui');
      if (!ui) return;

      const uiController = ui.GetComponent('UIController');
      if (!uiController) return;

      // Update all active quests in journal
      for (let questId of this._activeQuests) {
        const quest = this._quests[questId];
        uiController.UpdateQuest(quest);
      }
    }

    _AddQuestToJournal(quest) {
      const ui = this.FindEntity('ui').GetComponent('UIController');
      ui.AddQuest(quest);
    }

    GetQuestStatus(questId) {
      return this._quests[questId];
    }
  };

  return {
    QuestComponent: QuestComponent,
    QuestManager: QuestManager,
  };
})();