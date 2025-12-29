import {entity} from './entity.js';
import {third_person_camera_mouse} from './third-person-camera-mouse.js';
import {first_person_camera} from './first-person-camera.js';


export const camera_manager = (() => {

  class CameraManager extends entity.Component {
    constructor(params) {
      super();
      this._params = params;
      this._camera = params.camera;
      this._target = params.target;
      this._isFirstPerson = false;
      
      // Initialize camera controllers as null
      this._thirdPersonCamera = null;
      this._firstPersonCamera = null;
      this._currentCamera = null;
      
      // Add key listener directly
      this._InitKeyListener();
    }

    _InitKeyListener() {
      document.addEventListener('keydown', (e) => {
        if (e.keyCode === 67) { // C key
          this._ToggleCamera();
        }
      }, false);
    }

    InitComponent() {
      // Create both camera controllers after component is initialized
      this._thirdPersonCamera = new third_person_camera_mouse.ThirdPersonCameraMouseControl({
        camera: this._camera,
        target: this._target
      });
      
      this._firstPersonCamera = new first_person_camera.FirstPersonCamera({
        camera: this._camera,
        target: this._target
      });
      
      // Start with third person
      this._currentCamera = this._thirdPersonCamera;
      
      console.log('Camera Manager initialized');
    }

    _ToggleCamera() {
      this._isFirstPerson = !this._isFirstPerson;
      
      if (this._isFirstPerson) {
        this._currentCamera = this._firstPersonCamera;
        console.log('Switched to First Person Camera');
        
        // Hide player model in first person
        const playerController = this._target.GetComponent('BasicCharacterController');
        if (playerController && playerController._target) {
          playerController._target.visible = false;
        }
      } else {
        this._currentCamera = this._thirdPersonCamera;
        console.log('Switched to Third Person Camera');
        
        // Show player model in third person
        const playerController = this._target.GetComponent('BasicCharacterController');
        if (playerController && playerController._target) {
          playerController._target.visible = true;
        }
      }
    }

    Update(timeElapsed) {
      if (this._currentCamera) {
        this._currentCamera.Update(timeElapsed);
      }
    }
  }

  return {
    CameraManager: CameraManager,
  };

})();