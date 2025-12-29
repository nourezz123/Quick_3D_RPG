import {entity} from './entity.js';


export const ui_controller = (() => {

  class UIController extends entity.Component {
    constructor(params) {
      super();
      this._params = params;
      this._quests = {};
    }
  
    InitComponent() {
      this._iconBar = {
        stats: document.getElementById('icon-bar-stats'),
        inventory: document.getElementById('icon-bar-inventory'),
        quests: document.getElementById('icon-bar-quests'),
      };

      this._ui = {
        inventory: document.getElementById('inventory'),
        stats: document.getElementById('stats'),
        quests: document.getElementById('quest-journal'),
      };

      this._iconBar.inventory.onclick = (m) => { this._OnInventoryClicked(m); };
      this._iconBar.stats.onclick = (m) => { this._OnStatsClicked(m); };
      this._iconBar.quests.onclick = (m) => { this._OnQuestsClicked(m); };
      
      this._RegisterHandler('ui.toggle.inventory', (m) => { this._OnInventoryClicked(m); });
      this._RegisterHandler('ui.toggle.quests', (m) => { this._OnQuestsClicked(m); });
      this._RegisterHandler('ui.toggle.stats', (m) => { this._OnStatsClicked(m); });
      
      this._HideUI();
    }

    AddQuest(quest) {
      if (quest.id in this._quests) {
        this.UpdateQuest(quest);
        return;
      }

      const e = document.createElement('DIV');
      e.className = 'quest-entry';
      e.id = 'quest-entry-' + quest.id;
      e.onclick = (evt) => {
        this._OnQuestSelected(quest.id);
      };
      document.getElementById('quest-journal').appendChild(e);

      this._quests[quest.id] = quest;
      this.UpdateQuest(quest);
      this._OnQuestSelected(quest.id);
    }

    UpdateQuest(quest) {
      const e = document.getElementById('quest-entry-' + quest.id);
      if (!e) return;

      let statusText = '';
      if (quest.completed) {
        statusText = ' ✓';
        e.style.backgroundColor = 'rgba(0, 255, 0, 0.3)';
      } else {
        e.style.backgroundColor = '';
      }

      e.innerText = quest.title + statusText;
      this._quests[quest.id] = quest;
    }

    _OnQuestSelected(id) {
      const quest = this._quests[id];

      const e = document.getElementById('quest-ui');
      e.style.visibility = '';

      const title = document.getElementById('quest-text-title');
      title.innerText = quest.title;

      let questText = quest.text + '\n\n';
      
      if (quest.completed) {
        questText += '✓ QUEST COMPLETED!\n\n';
        questText += 'Rewards Received:\n';
        if (quest.rewards.experience > 0) {
          questText += `- ${quest.rewards.experience} XP\n`;
        }
        if (quest.rewards.items.length > 0) {
          questText += `- Items: ${quest.rewards.items.join(', ')}\n`;
        }
      } else {
        questText += 'Objectives:\n';
        for (let objective of quest.objectives) {
          const status = objective.current >= objective.required ? '✓' : '○';
          questText += `${status} ${objective.description} (${objective.current}/${objective.required})\n`;
        }

        questText += '\nRewards:\n';
        if (quest.rewards.experience > 0) {
          questText += `- ${quest.rewards.experience} XP\n`;
        }
        if (quest.rewards.items.length > 0) {
          questText += `- Items: ${quest.rewards.items.join(', ')}\n`;
        }
      }

      const text = document.getElementById('quest-text');
      text.innerText = questText;
    }

    _HideUI() {
      this._ui.inventory.style.visibility = 'hidden';
      this._ui.stats.style.visibility = 'hidden';
      this._ui.quests.style.visibility = 'hidden';
    }
    
    _OnQuestsClicked(msg) {
      const visibility = this._ui.quests.style.visibility;
      this._HideUI();
      this._ui.quests.style.visibility = (visibility ? '' : 'hidden');
    }

    _OnStatsClicked(msg) {
      const visibility = this._ui.stats.style.visibility;
      this._HideUI();
      this._ui.stats.style.visibility = (visibility ? '' : 'hidden');
    }

    _OnInventoryClicked(msg) {
      const visibility = this._ui.inventory.style.visibility;
      this._HideUI();
      this._ui.inventory.style.visibility = (visibility ? '' : 'hidden');
    }

    Update(timeInSeconds) {
    }
  };

  return {
    UIController: UIController,
  };

})();