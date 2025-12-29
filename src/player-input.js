import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';

import {entity} from "./entity.js";


export const player_input = (() => {

  class PickableComponent extends entity.Component {
    constructor() {
      super();
    }

    InitComponent() {
    }
  };

  class BasicCharacterControllerInput extends entity.Component {
    constructor(params) {
      super();
      this._params = params;
      this._Init();
    }
  
    _Init() {
      this._keys = {
        forward: false,
        backward: false,
        left: false,
        right: false,
        space: false,
        shift: false,
        cameraToggle: false,
        inventory: false,
        quests: false,
        stats: false,
        interact: false,
      };
      this._isSitting = false;
      this._raycaster = new THREE.Raycaster();
      document.addEventListener('keydown', (e) => this._onKeyDown(e), false);
      document.addEventListener('keyup', (e) => this._onKeyUp(e), false);
      document.addEventListener('mouseup', (e) => this._onMouseUp(e), false);
    }
  
    _onMouseUp(event) {
      const rect = document.getElementById('threejs').getBoundingClientRect();
      const pos = {
        x: ((event.clientX - rect.left) / rect.width) * 2  - 1,
        y: ((event.clientY - rect.top ) / rect.height) * -2 + 1,
      };

      this._raycaster.setFromCamera(pos, this._params.camera);

      const pickables = this._parent._parent.Filter((e) => {
        const p = e.GetComponent('PickableComponent');
        if (!p) {
          return false;
        }
        return e._mesh;
      });

      const ray = new THREE.Ray();
      ray.origin.setFromMatrixPosition(this._params.camera.matrixWorld);
      ray.direction.set(pos.x, pos.y, 0.5).unproject(
          this._params.camera).sub(ray.origin).normalize();

      // hack
      document.getElementById('quest-ui').style.visibility = 'hidden';

      for (let p of pickables) {
        // GOOD ENOUGH
        const box = new THREE.Box3().setFromObject(p._mesh);

        if (ray.intersectsBox(box)) {
          p.Broadcast({
              topic: 'input.picked'
          });
          break;
        }
      }
    }

    _onKeyDown(event) {
      switch (event.keyCode) {
        case 87: // w
          this._keys.forward = true;
          break;
        case 65: // a
          this._keys.left = true;
          break;
        case 83: // s
          this._keys.backward = true;
          break;
        case 68: // d
          this._keys.right = true;
          break;
        case 32: // SPACE
          this._keys.space = true;
          break;
        case 16: // SHIFT
          this._keys.shift = true;
          break;
        case 67: // C key
          if (!this._keys.cameraToggle) {
            this._keys.cameraToggle = true;
            this._parent.Broadcast({
              topic: 'camera.toggle'
            });
          }
          break;
        case 73: // I key
          if (!this._keys.inventory) {
            this._keys.inventory = true;
            const ui = this._parent.FindEntity('ui');
            if (ui) {
              ui.Broadcast({
                topic: 'ui.toggle.inventory'
              });
            }
          }
          break;
        case 81: // Q key
          if (!this._keys.quests) {
            this._keys.quests = true;
            const ui = this._parent.FindEntity('ui');
            if (ui) {
              ui.Broadcast({
                topic: 'ui.toggle.quests'
              });
            }
          }
          break;
        case 70: // F key
          if (!this._keys.stats) {
            this._keys.stats = true;
            const ui = this._parent.FindEntity('ui');
            if (ui) {
              ui.Broadcast({
                topic: 'ui.toggle.stats'
              });
            }
          }
          break;
        case 69: // E key - Interact
          if (!this._keys.interact) {
            this._keys.interact = true;
            this._CheckInteraction();
          }
          break;
      }
    }
  
    _onKeyUp(event) {
      switch(event.keyCode) {
        case 87: // w
          this._keys.forward = false;
          break;
        case 65: // a
          this._keys.left = false;
          break;
        case 83: // s
          this._keys.backward = false;
          break;
        case 68: // d
          this._keys.right = false;
          break;
        case 32: // SPACE
          this._keys.space = false;
          break;
        case 16: // SHIFT
          this._keys.shift = false;
          break;
        case 67: // C
          this._keys.cameraToggle = false;
          break;
        case 73: // I
          this._keys.inventory = false;
          break;
        case 81: // Q
          this._keys.quests = false;
          break;
        case 70: // F
          this._keys.stats = false;
          break;
        case 69: // E
          this._keys.interact = false;
          break;
      }
    }

    _CheckInteraction() {
      // Don't interact while sitting
      const sittingController = this._parent.GetComponent('SittingController');
      if (sittingController && sittingController._isSitting) {
        // If already sitting, toggle to stand up
        this._parent.Broadcast({
          topic: 'sit.toggle',
          chair: null
        });
        return;
      }

      // Find nearby interactive objects (chairs)
      const player = this._parent;
      const grid = player.GetComponent('SpatialGridController');
      
      if (!grid) return;
      
      const nearby = grid.FindNearbyEntities(5);

      // Find the closest chair
      let closestChair = null;
      let closestDistance = Infinity;

      for (let item of nearby) {
        const entity = item.entity;
        if (entity._isInteractive && entity._interactionType === 'chair') {
          const distance = player._position.distanceTo(entity._position);
          if (distance < closestDistance) {
            closestDistance = distance;
            closestChair = entity;
          }
        }
      }

      // Interact with the closest chair if within range
      if (closestChair && closestDistance < 5) {
        this._parent.Broadcast({
          topic: 'sit.toggle',
          chair: closestChair
        });
      }
    }
  };

  return {
    BasicCharacterControllerInput: BasicCharacterControllerInput,
    PickableComponent: PickableComponent,
  };

})();