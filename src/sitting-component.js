import {entity} from './entity.js';
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';

export const sitting_component = (() => {

  class SittingController extends entity.Component {
    constructor(params) {
      super();
      this._params = params;
      this._isSitting = false;
      this._chair = null;
      this._originalPosition = new THREE.Vector3();
      this._audio = null;
      this._musicLoaded = false;
      
      this._InitAudio();
    }

    _InitAudio() {
      // Create HTML5 Audio element
      this._audio = new Audio('./resources/audio/02.Tamally_Maak.mp3');
      this._audio.loop = true;
      this._audio.volume = 0.3; // 30% volume
      
      // Listen for when audio is loaded
      this._audio.addEventListener('canplaythrough', () => {
        this._musicLoaded = true;
        console.log('Background music loaded successfully');
      });
      
      this._audio.addEventListener('error', (e) => {
        console.error('Error loading background music:', e);
      });
    }

    InitComponent() {
      this._RegisterHandler('sit.toggle', (m) => this._ToggleSitting(m));
    }

    _ToggleSitting(msg) {
      if (this._isSitting) {
        this._StandUp();
      } else {
        this._SitDown(msg.chair);
      }
    }

    _SitDown(chair) {
      if (!chair || this._isSitting) return;

      console.log('Attempting to sit down...');

      this._isSitting = true;
      this._chair = chair;

      // Get player controller
      const playerController = this.GetComponent('BasicCharacterController');
      if (!playerController || !playerController._target) {
        console.error('Could not get player controller');
        return;
      }

      // Save original position
      this._originalPosition.copy(this._parent._position);

      // Move player to chair position with proper offset
      const chairPos = chair._position.clone();
      
      // Calculate offset based on chair rotation
      const chairRotation = chair._rotation || new THREE.Quaternion();
      const offset = new THREE.Vector3(0, 0, 0.5); // Slightly forward of chair center
      offset.applyQuaternion(chairRotation);
      
      chairPos.add(offset);
      chairPos.y = 0.35; // Keep character at proper ground level
      
      this._parent.SetPosition(chairPos);

      // Align player rotation with chair (face same direction as chair)
      if (chair._rotation) {
        this._parent.SetQuaternion(chair._rotation);
        
        // Update the visual model rotation too
        if (playerController._target) {
          playerController._target.quaternion.copy(chair._rotation);
        }
      }

      // Disable player movement
      const inputController = this.GetComponent('BasicCharacterControllerInput');
      if (inputController) {
        inputController._isSitting = true;
      }

      // Try to change to sitting animation (if it exists and is loaded)
      if (playerController._stateMachine && playerController._animations['sit']) {
        try {
          playerController._stateMachine.SetState('sit');
          console.log('Sitting animation triggered');
        } catch (error) {
          console.warn('Could not play sitting animation:', error);
          // Fall back to idle if sitting animation fails
          playerController._stateMachine.SetState('idle');
        }
      } else {
        console.warn('Sitting animation not available, staying in idle state');
        if (playerController._stateMachine) {
          playerController._stateMachine.SetState('idle');
        }
      }

      // Play background music
      this._PlayMusic();

      // Show UI prompt
      this._ShowMessage('Relaxing... Press E to stand up');

      console.log('Player is now sitting on chair');
    }

    _StandUp() {
      if (!this._isSitting) return;

      console.log('Standing up...');

      this._isSitting = false;

      // Re-enable player movement
      const inputController = this.GetComponent('BasicCharacterControllerInput');
      if (inputController) {
        inputController._isSitting = false;
      }

      // Return to idle state
      const playerController = this.GetComponent('BasicCharacterController');
      if (playerController && playerController._stateMachine) {
        try {
          playerController._stateMachine.SetState('idle');
          console.log('Returned to idle state');
        } catch (error) {
          console.error('Error returning to idle:', error);
        }
      }

      // Stop background music
      this._StopMusic();

      // Hide message
      this._HideMessage();

      this._chair = null;

      console.log('Player stood up');
    }

    _PlayMusic() {
      if (!this._musicLoaded) {
        console.warn('Music not loaded yet');
        return;
      }

      if (this._audio) {
        this._audio.currentTime = 0;
        this._audio.play().catch(err => {
          console.error('Error playing music:', err);
        });
        console.log('Playing background music');
      }
    }

    _StopMusic() {
      if (this._audio) {
        this._audio.pause();
        this._audio.currentTime = 0;
        console.log('Stopped background music');
      }
    }

    _ShowMessage(text) {
      const messageDiv = document.getElementById('interaction-message');
      if (messageDiv) {
        messageDiv.innerText = text;
        messageDiv.style.visibility = 'visible';
      }
    }

    _HideMessage() {
      const messageDiv = document.getElementById('interaction-message');
      if (messageDiv) {
        messageDiv.style.visibility = 'hidden';
      }
    }

    Update(timeElapsed) {
      // Keep player in sitting position and visible
      if (this._isSitting && this._chair) {
        const playerController = this.GetComponent('BasicCharacterController');
        
        if (playerController && playerController._target) {
          // Ensure character stays visible and at correct position
          playerController._target.visible = true;
          
          const chairPos = this._chair._position.clone();
          const chairRotation = this._chair._rotation || new THREE.Quaternion();
          const offset = new THREE.Vector3(0, 0, 0.5);
          offset.applyQuaternion(chairRotation);
          chairPos.add(offset);
          
          // Update both entity position and visual model position
          this._parent._position.copy(chairPos);
          playerController._target.position.copy(chairPos);
          playerController._target.position.y = 0;
        }
      }
    }
  };

  return {
    SittingController: SittingController,
  };

})();