import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118.1/build/three.module.js';

import {entity} from './entity.js';


export const day_night_cycle = (() => {

  class DayNightCycle extends entity.Component {
    constructor(params) {
      super();
      this._params = params;
      this._sun = params.sun;
      this._scene = params.scene;
      this._hemiLight = params.hemiLight;
      this._fog = params.fog;
      
      // Time settings
      this._timeOfDay = 0.25; // Start at morning (0 = midnight, 0.5 = noon, 1.0 = midnight)
      this._dayLength = 300; // 5 minutes for full day cycle (in seconds)
      this._cycleSpeed = 1.0 / this._dayLength;
      
      // Color settings
      this._dayColors = {
        sunLight: new THREE.Color(0xFFFFFF),
        ambient: new THREE.Color(0xFFFFFF),
        fog: new THREE.Color(0x89b2eb),
        sky: new THREE.Color(0x0077ff)
      };
      
      this._nightColors = {
        sunLight: new THREE.Color(0x4444FF),
        ambient: new THREE.Color(0x222244),
        fog: new THREE.Color(0x000033),
        sky: new THREE.Color(0x000011)
      };
      
      this._sunriseColors = {
        sunLight: new THREE.Color(0xFFAA66),
        ambient: new THREE.Color(0xFFCC88),
        fog: new THREE.Color(0xFFAA88),
        sky: new THREE.Color(0xFF8844)
      };
      
      console.log('Day/Night cycle initialized');
    }

    InitComponent() {
      this._UpdateLighting();
    }

    _GetTimePhase() {
      // Determine what time of day it is
      if (this._timeOfDay < 0.15 || this._timeOfDay > 0.85) {
        return 'night';
      } else if (this._timeOfDay >= 0.15 && this._timeOfDay < 0.25) {
        return 'sunrise';
      } else if (this._timeOfDay >= 0.65 && this._timeOfDay < 0.85) {
        return 'sunset';
      } else {
        return 'day';
      }
    }

    _UpdateLighting() {
      const phase = this._GetTimePhase();
      let sunIntensity = 1.0;
      let ambientIntensity = 0.6;
      let currentColors;

      if (phase === 'night') {
        // Night time - dark and blue
        const nightProgress = this._timeOfDay < 0.5 ? 
          (0.15 - this._timeOfDay) / 0.15 : 
          (this._timeOfDay - 0.85) / 0.15;
        
        sunIntensity = 0.3;
        ambientIntensity = 0.2;
        currentColors = this._nightColors;
        
      } else if (phase === 'sunrise') {
        // Sunrise - orange/pink transition
        const sunriseProgress = (this._timeOfDay - 0.15) / 0.10;
        
        currentColors = {
          sunLight: this._nightColors.sunLight.clone().lerp(this._sunriseColors.sunLight, sunriseProgress),
          ambient: this._nightColors.ambient.clone().lerp(this._sunriseColors.ambient, sunriseProgress),
          fog: this._nightColors.fog.clone().lerp(this._sunriseColors.fog, sunriseProgress),
          sky: this._nightColors.sky.clone().lerp(this._sunriseColors.sky, sunriseProgress)
        };
        
        sunIntensity = 0.3 + (sunriseProgress * 0.7);
        ambientIntensity = 0.2 + (sunriseProgress * 0.4);
        
      } else if (phase === 'sunset') {
        // Sunset - reverse of sunrise
        const sunsetProgress = (this._timeOfDay - 0.65) / 0.20;
        
        currentColors = {
          sunLight: this._dayColors.sunLight.clone().lerp(this._sunriseColors.sunLight, sunsetProgress),
          ambient: this._dayColors.ambient.clone().lerp(this._sunriseColors.ambient, sunsetProgress),
          fog: this._dayColors.fog.clone().lerp(this._sunriseColors.fog, sunsetProgress),
          sky: this._dayColors.sky.clone().lerp(this._sunriseColors.sky, sunsetProgress)
        };
        
        sunIntensity = 1.0 - (sunsetProgress * 0.7);
        ambientIntensity = 0.6 - (sunsetProgress * 0.4);
        
      } else {
        // Day time - bright and clear
        currentColors = this._dayColors;
        sunIntensity = 1.0;
        ambientIntensity = 0.6;
      }

      // Apply lighting changes
      this._sun.intensity = sunIntensity;
      this._sun.color.copy(currentColors.sunLight);
      
      if (this._hemiLight) {
        this._hemiLight.intensity = ambientIntensity;
        this._hemiLight.color.copy(currentColors.ambient);
      }
      
      if (this._fog) {
        this._fog.color.copy(currentColors.fog);
      }

      // Update sun position based on time
      const sunAngle = (this._timeOfDay - 0.25) * Math.PI * 2;
      const sunHeight = Math.sin(sunAngle) * 500;
      const sunDistance = Math.cos(sunAngle) * 500;
      
      this._sun.position.set(sunDistance, Math.max(sunHeight, 50), -200);
    }

    GetTimeString() {
      const hours = Math.floor(this._timeOfDay * 24);
      const minutes = Math.floor((this._timeOfDay * 24 - hours) * 60);
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }

    Update(timeElapsed) {
      // Advance time
      this._timeOfDay += this._cycleSpeed * timeElapsed;
      
      // Wrap around at end of day
      if (this._timeOfDay >= 1.0) {
        this._timeOfDay -= 1.0;
      }

      this._UpdateLighting();
    }
  };

  return {
    DayNightCycle: DayNightCycle,
  };

})();