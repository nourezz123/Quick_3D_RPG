import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';

import {entity} from './entity.js';


export const third_person_camera_mouse = (() => {

  class ThirdPersonCameraMouseControl extends entity.Component {
    constructor(params) {
      super();

      this._params = params;
      this._camera = params.camera;

      this._currentPosition = new THREE.Vector3();
      this._currentLookat = new THREE.Vector3();
      
      // Mouse control
      this._yaw = 0;
      this._pitch = 0.3; // Slight downward angle by default
      this._sensitivity = 0.002;
      this._pointerLocked = false;
      
      // Camera distance from player
      this._distance = 10;
      this._minDistance = 5;
      this._maxDistance = 20;
      
      this._InitMouseControl();
    }

    _InitMouseControl() {
      // Mouse movement
      document.addEventListener('mousemove', (e) => this._OnMouseMove(e), false);
      
      // Mouse wheel for zoom
      document.addEventListener('wheel', (e) => this._OnMouseWheel(e), false);
      
      // Pointer lock
      document.addEventListener('click', () => {
        if (!this._pointerLocked) {
          document.body.requestPointerLock();
        }
      });
      
      document.addEventListener('pointerlockchange', () => {
        this._pointerLocked = document.pointerLockElement === document.body;
      }, false);
    }

    _OnMouseMove(event) {
      if (this._pointerLocked) {
        this._yaw -= event.movementX * this._sensitivity;
        this._pitch += event.movementY * this._sensitivity; // Changed from -= to +=
        
        // Clamp pitch to keep camera from going too high or low
        this._pitch = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, this._pitch));
      }
    }

    _OnMouseWheel(event) {
      this._distance += event.deltaY * 0.01;
      this._distance = Math.max(this._minDistance, Math.min(this._maxDistance, this._distance));
    }

    _CalculateIdealOffset() {
      const idealOffset = new THREE.Vector3(
        -Math.sin(this._yaw) * this._distance * Math.cos(this._pitch),
        this._distance * Math.sin(this._pitch) + 6, // Changed from 4 to 6
        -Math.cos(this._yaw) * this._distance * Math.cos(this._pitch)
      );
      return idealOffset;
    }

    _CalculateIdealLookat() {
      const idealLookat = new THREE.Vector3(0, 6, 0); // Changed from 4 to 6
      return idealLookat;
    }

    Update(timeElapsed) {
      const ideal = this._CalculateIdealOffset();
      const ideaLookat = this._CalculateIdealLookat();

      const t = 1.0 - Math.pow(0.001, timeElapsed);

      this._currentPosition.lerp(ideal, t);
      this._currentLookat.lerp(ideaLookat, t);

      const target = this._params.target._position;
      
      this._camera.position.copy(target);
      this._camera.position.add(this._currentPosition);

      const lookAtPosition = target.clone();
      lookAtPosition.add(this._currentLookat);
      this._camera.lookAt(lookAtPosition);
      
      // Update player rotation to match camera yaw
      const playerController = this._params.target.GetComponent('BasicCharacterController');
      if (playerController && playerController._target) {
        const quat = new THREE.Quaternion();
        quat.setFromAxisAngle(new THREE.Vector3(0, 1, 0), this._yaw);
        playerController._target.quaternion.copy(quat);
      }
    }
  }

  return {
    ThirdPersonCameraMouseControl: ThirdPersonCameraMouseControl,
  };

})();