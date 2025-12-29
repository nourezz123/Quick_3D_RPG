import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118.1/build/three.module.js';

import {entity} from './entity.js';
import {gltf_component} from './gltf-component.js';
import {spatial_grid_controller} from './spatial-grid-controller.js';
import {player_input} from './player-input.js';


export const town_loader = (() => {

  class TownLoader {
    constructor(params) {
      this._scene = params.scene;
      this._entityManager = params.entityManager;
      this._grid = params.grid;
    }

    LoadTown(position) {
      console.log('Loading village at position:', position);
      
      // Create town center
      const townCenter = new THREE.Vector3(position.x, 0, position.z);
      
      // Load all buildings
      this._LoadBuildings(townCenter);
      
      // Load villagers
      this._LoadVillagers(townCenter);
      
      console.log('Village loaded successfully!');
    }

    _LoadBuildings(center) {
      // Town layout - arranged in a village style with proper spacing
      const buildings = [
        // Central bell tower
        {
          name: 'Bell_Tower.fbx',
          position: new THREE.Vector3(center.x, 0, center.z),
          rotation: 0,
          scale: 0.1
        },
        
        // Main buildings around center - well spaced
        {
          name: 'Blacksmith.fbx',
          position: new THREE.Vector3(center.x + 60, 0, center.z - 40),
          rotation: Math.PI / 4,
          scale: 0.08
        },
        {
          name: 'Inn.fbx',
          position: new THREE.Vector3(center.x - 50, 0, center.z - 50),
          rotation: -Math.PI / 6,
          scale: 0.09
        },
        {
          name: 'Mill.fbx',
          position: new THREE.Vector3(center.x + 70, 0, center.z + 60),
          rotation: Math.PI / 3,
          scale: 0.07
        },
        
        // Houses - arranged in clusters with spacing
        {
          name: 'House_1.fbx',
          position: new THREE.Vector3(center.x - 65, 0, center.z + 30),
          rotation: Math.PI / 2,
          scale: 0.07
        },
        {
          name: 'House_2.fbx',
          position: new THREE.Vector3(center.x - 65, 0, center.z + 60),
          rotation: Math.PI / 2,
          scale: 0.07
        },
        {
          name: 'House_3.fbx',
          position: new THREE.Vector3(center.x + 40, 0, center.z + 70),
          rotation: -Math.PI / 4,
          scale: 0.07
        },
        {
          name: 'House_4.fbx',
          position: new THREE.Vector3(center.x - 20, 0, center.z + 70),
          rotation: 0,
          scale: 0.07
        },
        {
          name: 'House_1.fbx',
          position: new THREE.Vector3(center.x + 60, 0, center.z - 70),
          rotation: Math.PI,
          scale: 0.07
        },
        {
          name: 'House_2.fbx',
          position: new THREE.Vector3(center.x + 20, 0, center.z - 70),
          rotation: Math.PI / 6,
          scale: 0.07
        },
        
        // Utilities - well separated
        {
          name: 'Stable.fbx',
          position: new THREE.Vector3(center.x - 70, 0, center.z - 20),
          rotation: Math.PI / 2,
          scale: 0.08
        },
        {
          name: 'Sawmill.fbx',
          position: new THREE.Vector3(center.x + 75, 0, center.z + 20),
          rotation: -Math.PI / 4,
          scale: 0.07
        },

        // ===== SINGLE CHAIR - RIGHT IN FRONT OF BELL TOWER =====
        {
          name: 'Chair_1.fbx',
          position: new THREE.Vector3(center.x, 0, center.z + 20), // Directly in front
          rotation: Math.PI, // Facing the bell tower
          scale: 0.035,
          isInteractive: true,
          type: 'chair'
        },
      ];

      // Load each building
      buildings.forEach((building, index) => {
        this._LoadBuilding(building, index);
      });
    }

    _LoadBuilding(buildingData, index) {
      const building = new entity.Entity();
      
      building.AddComponent(new gltf_component.StaticModelComponent({
        scene: this._scene,
        resourcePath: './resources/town/',
        resourceName: buildingData.name,
        scale: buildingData.scale,
        receiveShadow: true,
        castShadow: true,
      }));

      building.AddComponent(
        new spatial_grid_controller.SpatialGridController({grid: this._grid})
      );
      
      // Mark interactive objects (chairs)
      if (buildingData.isInteractive) {
        building.AddComponent(new player_input.PickableComponent());
        building._isInteractive = true;
        building._interactionType = buildingData.type;
        building._collisionRadius = 3; // Smaller collision for chairs
      } else {
        // Regular buildings have larger collision
        building._isBuilding = true;
        building._collisionRadius = 15;
      }

      building.SetPosition(buildingData.position);
      
      // Apply rotation if specified
      if (buildingData.rotation !== undefined) {
        const quaternion = new THREE.Quaternion();
        quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), buildingData.rotation);
        building.SetQuaternion(quaternion);
      }

      this._entityManager.Add(building, `town-building-${index}`);
    }

    _LoadVillagers(center) {
      // Villager configurations - all idle/standing, positioned OUTSIDE buildings
      const villagers = [
        // Near bell tower
        {
          model: 'Peasant Girl.fbx',
          animation: 'Standing Idle.fbx',
          position: new THREE.Vector3(center.x - 15, 0, center.z + 10),
          scale: 0.035
        },
        {
          model: 'Peasant Man.fbx',
          animation: 'Standing Idle.fbx',
          position: new THREE.Vector3(center.x + 18, 0, center.z - 8),
          scale: 0.035
        },
        
        // Near blacksmith
        {
          model: 'Peasant Man.fbx',
          animation: 'Standing Idle.fbx',
          position: new THREE.Vector3(center.x + 45, 0, center.z - 35),
          scale: 0.035
        },
        
        // Near inn
        {
          model: 'Peasant Girl.fbx',
          animation: 'Standing Idle.fbx',
          position: new THREE.Vector3(center.x - 35, 0, center.z - 45),
          scale: 0.035
        },
        
        // Near houses cluster 1
        {
          model: 'Peasant Man.fbx',
          animation: 'Standing Idle.fbx',
          position: new THREE.Vector3(center.x - 50, 0, center.z + 45),
          scale: 0.035
        },
        {
          model: 'Peasant Girl.fbx',
          animation: 'Standing Idle.fbx',
          position: new THREE.Vector3(center.x - 55, 0, center.z + 20),
          scale: 0.035
        },
        
        // Near houses cluster 2
        {
          model: 'Peasant Man.fbx',
          animation: 'Standing Idle.fbx',
          position: new THREE.Vector3(center.x + 30, 0, center.z + 65),
          scale: 0.035
        },
        {
          model: 'Peasant Girl.fbx',
          animation: 'Standing Idle.fbx',
          position: new THREE.Vector3(center.x - 10, 0, center.z + 65),
          scale: 0.035
        },
        
        // Near mill
        {
          model: 'Peasant Man.fbx',
          animation: 'Standing Idle.fbx',
          position: new THREE.Vector3(center.x + 60, 0, center.z + 50),
          scale: 0.035
        },
        
        // Near stable
        {
          model: 'Peasant Girl.fbx',
          animation: 'Standing Idle.fbx',
          position: new THREE.Vector3(center.x - 60, 0, center.z - 15),
          scale: 0.035
        },
        
        // Near sawmill
        {
          model: 'Peasant Man.fbx',
          animation: 'Standing Idle.fbx',
          position: new THREE.Vector3(center.x + 65, 0, center.z + 15),
          scale: 0.035
        },
        
        // Near houses cluster 3
        {
          model: 'Peasant Girl.fbx',
          animation: 'Standing Idle.fbx',
          position: new THREE.Vector3(center.x + 50, 0, center.z - 65),
          scale: 0.035
        },
        {
          model: 'Peasant Man.fbx',
          animation: 'Standing Idle.fbx',
          position: new THREE.Vector3(center.x + 10, 0, center.z - 65),
          scale: 0.035
        },
      ];

      // Load each villager
      villagers.forEach((villagerData, index) => {
        this._LoadVillager(villagerData, index);
      });
    }

    _LoadVillager(villagerData, index) {
      const villager = new entity.Entity();
      
      // Use AnimatedModelComponent but load animation from girl folder
      villager.AddComponent(new VillagerModelComponent({
        scene: this._scene,
        modelPath: './resources/villagers/',
        modelName: villagerData.model,
        animationPath: './resources/girl/',
        animationName: villagerData.animation,
        scale: villagerData.scale,
      }));

      villager.AddComponent(
        new spatial_grid_controller.SpatialGridController({grid: this._grid})
      );

      villager.SetPosition(villagerData.position);

      this._entityManager.Add(villager, `villager-${index}`);
    }
  }

  // Custom component to handle different paths for model and animation
  class VillagerModelComponent extends entity.Component {
    constructor(params) {
      super();
      this._params = params;
      this._LoadModels();
    }

    InitComponent() {
      this._RegisterHandler('update.position', (m) => { this._OnPosition(m); });
    }

    _OnPosition(m) {
      if (this._target) {
        this._target.position.copy(m.value);
        this._target.position.y = 0.35;
      }
    }

    _LoadModels() {
      const FBXLoader = window.THREE_FBXLoader || (window.THREE && window.THREE.FBXLoader);
      if (!FBXLoader) {
        // Fallback: dynamically import
        import('https://cdn.jsdelivr.net/npm/three@0.118.1/examples/jsm/loaders/FBXLoader.js').then(module => {
          this._LoadWithLoader(module.FBXLoader);
        });
      } else {
        this._LoadWithLoader(FBXLoader);
      }
    }

    _LoadWithLoader(FBXLoader) {
      const loader = new FBXLoader();
      loader.setPath(this._params.modelPath);
      loader.load(this._params.modelName, (fbx) => {
        this._target = fbx;
        this._params.scene.add(this._target);

        this._target.scale.setScalar(this._params.scale);
        this._target.position.copy(this._parent._position);
        this._target.position.y = 0.35;

        this._target.traverse(c => {
          c.castShadow = true;
          c.receiveShadow = true;
        });

        this._mixer = new THREE.AnimationMixer(this._target);

        // Load animation from different path
        const animLoader = new FBXLoader();
        animLoader.setPath(this._params.animationPath);
        animLoader.load(this._params.animationName, (anim) => {
          const clip = anim.animations[0];
          const action = this._mixer.clipAction(clip);
          action.play();
        });

        this._parent._mesh = this._target;
      });
    }

    Update(timeInSeconds) {
      if (this._mixer) {
        this._mixer.update(timeInSeconds);
      }
    }
  }

  return {
    TownLoader: TownLoader,
  };

})();