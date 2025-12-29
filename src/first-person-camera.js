import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';

import {entity} from './entity.js';


export const first_person_camera = (() => {

  class FirstPersonCamera extends entity.Component {
    constructor(params) {
      super();

      this._params = params;
      this._camera = params.camera;
      this._target = params.target;
      
      this._currentPosition = new THREE.Vector3();
      this._currentLookat = new THREE.Vector3();
      
      // Camera offset from player position (height above ground)
      this._offset = new THREE.Vector3(0, 6, 0);
      
      // Mouse look
      this._yaw = 0;
      this._pitch = 0;
      this._sensitivity = 0.002;
      
      this._pointerLocked = false;
      
      this._InitMouseLook();
    }

    _InitMouseLook() {
      document.addEventListener('mousemove', (e) => this._OnMouseMove(e), false);
      
      // Lock pointer on click
      document.addEventListener('click', () => {
        if (!this._pointerLocked) {
          document.body.requestPointerLock();
        }
      });
      
      // Track pointer lock state
      document.addEventListener('pointerlockchange', () => {
        this._pointerLocked = document.pointerLockElement === document.body;
        console.log('Pointer locked:', this._pointerLocked);
      }, false);
    }

    _OnMouseMove(event) {
      if (this._pointerLocked) {
        this._yaw -= event.movementX * this._sensitivity;
        this._pitch -= event.movementY * this._sensitivity;
        
        // Clamp pitch to prevent camera flipping
        this._pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this._pitch));
      }
    }

    Update(timeElapsed) {
      if (!this._target) {
        return;
      }

      const targetEntity = this._target;
      
      // Get player position
      const playerPos = targetEntity._position.clone();
      
      // Calculate camera position (at player's head height)
      this._currentPosition.copy(playerPos);
      this._currentPosition.add(this._offset);

      // Calculate look direction based on mouse
      const lookDirection = new THREE.Vector3(
        Math.sin(this._yaw) * Math.cos(this._pitch),
        Math.sin(this._pitch),
        Math.cos(this._yaw) * Math.cos(this._pitch)
      );

      // Calculate where camera should look
      this._currentLookat.copy(this._currentPosition);
      this._currentLookat.add(lookDirection);

      // Update camera
      this._camera.position.copy(this._currentPosition);
      this._camera.lookAt(this._currentLookat);
      
      // Update player rotation to match camera yaw
      const playerController = targetEntity.GetComponent('BasicCharacterController');
      if (playerController && playerController._target) {
        const quat = new THREE.Quaternion();
        quat.setFromAxisAngle(new THREE.Vector3(0, 1, 0), this._yaw);
        playerController._target.quaternion.copy(quat);
      }
    }
  }

  return {
    FirstPersonCamera: FirstPersonCamera,
  };

})();