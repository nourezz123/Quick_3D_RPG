import {entity} from "./entity.js";


export const health_component = (() => {

  class HealthComponent extends entity.Component {
    constructor(params) {
      super();
      this._health = params.health;
      this._maxHealth = params.maxHealth;
      this._params = params;
      
      // Initialize death sound
      this._deathSound = new Audio('./resources/audio/death-sound.mp3');
      this._deathSound.volume = 0.5;
    }

    InitComponent() {
      this._RegisterHandler('health.damage', (m) => this._OnDamage(m));
      this._RegisterHandler('health.add-experience', (m) => this._OnAddExperience(m));

      this._UpdateUI();
    }

    IsAlive() {
      return this._health > 0;
    }

    _UpdateUI() {
      if (!this._params.updateUI) {
        return;
      }

      const bar = document.getElementById('health-bar');

      const healthAsPercentage = this._health / this._maxHealth;
      bar.style.width = Math.floor(200 * healthAsPercentage) + 'px';

      // Update stats with useful information
      const currentXP = this._params.experience;
      const requiredXP = this._ComputeLevelXPRequirement();
      const xpNeeded = requiredXP - currentXP;

      document.getElementById('stats-strength').innerText = this._params.level;
      document.getElementById('stats-wisdomness').innerText = this._params.strength;
      document.getElementById('stats-benchpress').innerText = Math.floor(this._health) + ' / ' + this._params.maxHealth;
      document.getElementById('stats-curl').innerText = xpNeeded;
      document.getElementById('stats-experience').innerText = currentXP + ' / ' + requiredXP;
    }

    _ComputeLevelXPRequirement() {
      const level = this._params.level;
      // Balanced XP progression for quest and combat rewards
      // Level 1->2: 300 XP (3 kills or partial quest)
      // Level 2->3: 800 XP (8 kills or quest 1 + 3 kills)
      // Level 3->4: 1500 XP (15 kills or quest 2 + 5 kills)
      // Level 4->5: 2500 XP (25 kills or quest 3 + 5 kills)
      // Level 5->6: 4000 XP (40 kills or quest 3 + 20 kills)
      
      const xpTable = {
        1: 300,
        2: 800,
        3: 1500,
        4: 2500,
        5: 4000,
        6: 6000,
        7: 8500,
        8: 11500,
        9: 15000,
        10: 20000
      };
      
      return xpTable[level] || 20000 + (level - 10) * 5000;
    }

    _OnAddExperience(msg) {
      this._params.experience += msg.value;
      const requiredExperience = this._ComputeLevelXPRequirement();
      if (this._params.experience < requiredExperience) {
        this._UpdateUI();
        return;
      }

      this._params.level += 1;
      this._params.strength += 1;
      this._params.wisdomness += 1;
      this._params.benchpress += 1;
      this._params.curl += 2;
      
      // Increase max health on level up
      const healthIncrease = 50; // Gain 50 HP per level
      this._params.maxHealth += healthIncrease;
      this._health += healthIncrease; // Also heal for the amount gained
      
      // Cap health at max
      if (this._health > this._params.maxHealth) {
        this._health = this._params.maxHealth;
      }

      const spawner = this.FindEntity(
          'level-up-spawner').GetComponent('LevelUpComponentSpawner');
      spawner.Spawn(this._parent._position);

      this.Broadcast({
          topic: 'health.levelGained',
          value: this._params.level,
      });

      // Notify quest manager of level gain
      const questManager = this.FindEntity('quest-manager');
      if (questManager) {
        questManager.Broadcast({
          topic: 'quest.level-gained',
          value: this._params.level,
        });
      }

      this._UpdateUI();
    }

    _OnDeath(attacker) {
      // Play death sound
      this._PlayDeathSound();
      
      if (attacker) {
        attacker.Broadcast({
            topic: 'health.add-experience',
            value: this._params.level * 100
        });

        // Notify quest manager of kill (only if player killed the enemy)
        if (attacker.Name === 'player') {
          const questManager = attacker.FindEntity('quest-manager');
          if (questManager) {
            questManager.Broadcast({
              topic: 'quest.enemy-killed',
              enemyType: 'any',
              level: this._params.level
            });
          }
        }
      }
      
      this.Broadcast({
          topic: 'health.death',
      });
      
      // Show death screen if this is the player
      if (this._params.updateUI) {
        this._ShowDeathScreen();
      }
    }

    _PlayDeathSound() {
      try {
        this._deathSound.currentTime = 0;
        this._deathSound.play().catch(err => {
          console.warn('Could not play death sound:', err);
        });
      } catch (error) {
        console.warn('Error playing death sound:', error);
      }
    }

    _ShowDeathScreen() {
      const screen = document.getElementById('death-screen');
      if (screen) {
        screen.style.display = 'flex';
        
        // Setup restart button
        const restartBtn = document.getElementById('restart-button');
        if (restartBtn) {
          restartBtn.onclick = () => {
            location.reload(); // Reload the page to restart the game
          };
        }
      }
    }

    _OnDamage(msg) {
      this._health = Math.max(0.0, this._health - msg.value);
      if (this._health == 0) {
        this._OnDeath(msg.attacker);
      }

      this.Broadcast({
        topic: 'health.update',
        health: this._health,
        maxHealth: this._maxHealth,
      });

      this._UpdateUI();
    }
  };

  return {
    HealthComponent: HealthComponent,
  };

})();
