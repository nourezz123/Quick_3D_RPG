# 🎮 The Legend of Honeywood

A browser-based 3D action RPG built with Three.js featuring dynamic combat, quest systems, and a living fantasy world.

![Game Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Three.js](https://img.shields.io/badge/Three.js-r118-green.svg)
![License](https://img.shields.io/badge/license-MIT-orange.svg)

## 🌟 Features

### Core Gameplay
- **⚔️ Real-time Combat System** - Fluid melee combat with directional attacks and weapon variety
- **🎯 Quest System** - Progressive quest chain with 3 main quests and multiple objectives
- **📊 RPG Progression** - Level up system with XP, health increases, and stat growth
- **🎒 Inventory Management** - 24 inventory slots with drag-and-drop functionality
- **🗡️ Weapon System** - Multiple weapons with unique stats (damage multipliers, attack speeds)

### World & Environment
- **🌅 Dynamic Day/Night Cycle** - 5-minute full cycle with realistic lighting transitions
- **🏘️ Living Village** - Fully modeled town with 13 buildings and animated NPCs
- **🌲 Procedural World** - 100+ trees, clouds, and environmental objects
- **👾 Enemy Variety** - 6 different monster types with 5 difficulty levels

### Advanced Features
- **📷 Dual Camera System** - Switch between third-person and first-person views (Press C)
- **🎨 Custom Shaders** - Sky dome, particle effects, and health bar shaders
- **🔊 Animation System** - Smooth state transitions for all characters
- **⚡ Spatial Optimization** - Hash grid system for efficient collision detection

## 🎮 Controls

### Movement
- **W/A/S/D** - Move forward/left/backward/right
- **Shift + Movement** - Sprint
- **Mouse** - Look around (when pointer locked)
- **Mouse Wheel** - Zoom in/out (third-person mode)

### Actions
- **Space** - Attack
- **Left Click** - Lock pointer / Interact with NPCs
- **C** - Toggle camera mode (Third-person ↔ First-person)

### Interface
- **I** - Toggle Inventory
- **Q** - Toggle Quest Journal
- **F** - Toggle Stats Panel
- **ESC** - Exit pointer lock / Close completion screen

## 🚀 Getting Started

### Prerequisites
- Modern web browser with WebGL support
- Local web server (for loading assets)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/legend-of-honeywood.git
cd legend-of-honeywood
```

2. **Install a local server** (choose one):

Using Python 3:
```bash
python -m http.server 8000
```

Using Node.js:
```bash
npx http-server -p 8000
```

Using PHP:
```bash
php -S localhost:8000
```

3. **Open in browser**
```
http://localhost:8000
```

### Project Structure

```
legend-of-honeywood/
├── index.html              # Main HTML file
├── base.css               # UI styles
├── src/                   # Source code
│   ├── main.js           # Game initialization & loop
│   ├── entity.js         # Entity-Component system
│   ├── entity-manager.js # Entity management
│   ├── player-entity.js  # Player controller
│   ├── player-input.js   # Input handling
│   ├── player-state.js   # Animation states
│   ├── npc-entity.js     # Enemy AI
│   ├── camera-manager.js # Camera system
│   ├── third-person-camera-mouse.js
│   ├── first-person-camera.js
│   ├── health-component.js      # HP & leveling
│   ├── attacker-controller.js   # Combat logic
│   ├── inventory-controller.js  # Inventory system
│   ├── equip-weapon-component.js
│   ├── quest-component.js       # Quest system
│   ├── day-night-cycle.js       # Lighting cycle
│   ├── town-loader.js           # Town generation
│   ├── spatial-hash-grid.js     # Optimization
│   ├── particle-system.js       # VFX
│   ├── health-bar.js            # Enemy health bars
│   ├── level-up-component.js    # Level-up effects
│   ├── ui-controller.js         # UI management
│   ├── gltf-component.js        # 3D model loader
│   └── math.js                  # Utilities
└── resources/            # Game assets
    ├── guard/           # Player models & animations
    ├── girl/            # NPC animations
    ├── villagers/       # Villager models
    ├── monsters/        # Enemy models & textures
    ├── weapons/         # Weapon models
    ├── town/            # Building models
    ├── nature/          # Trees & foliage
    ├── nature2/         # Clouds
    ├── textures/        # Particle textures
    └── icons/           # UI icons
        ├── ui/          # Interface icons
        └── weapons/     # Weapon icons
```

## 🎯 Quest Guide

### Quest 1: Welcome to Honeywood
- **Objective**: Defeat 5 monsters
- **Reward**: 500 XP
- **NPC Location**: (30, 0, 0) - Girl near spawn

### Quest 2: The Monster Hunter
- **Prerequisite**: Complete Quest 1
- **Objective**: Defeat 10 monsters
- **Reward**: 1000 XP
- **NPC Location**: (-30, 0, 0) - Merchant

### Quest 3: Elite Slayer
- **Prerequisite**: Complete Quest 2
- **Objectives**: 
  - Defeat 20 monsters
  - Reach Level 3
- **Reward**: 2000 XP
- **NPC Location**: (0, 0, 30) - Elder

## ⚔️ Combat System

### Weapons
| Weapon | Damage Multiplier | Attack Speed | Best For |
|--------|------------------|--------------|----------|
| Sword  | 2x               | 0.5s (Fast)  | Quick kills |
| Axe    | 4x               | 0.9s (Slow)  | High damage |

### Enemy Levels
- **Level 1** (Green) - 40% spawn rate - 200 HP
- **Level 2** (Yellow) - 30% spawn rate - 400 HP
- **Level 3** (Orange) - 20% spawn rate - 600 HP
- **Level 4** (Red) - 8% spawn rate - 800 HP
- **Level 5** (Purple) - 2% spawn rate - 1000 HP (Elite)

### Experience & Leveling
- Gain **100 XP × Enemy Level** per kill
- Level requirements: 300 → 800 → 1500 → 2500 → 4000...
- Each level grants: +50 Max HP, +1 to all stats

## 🏗️ Architecture

The game uses a **Component-Based Entity System** inspired by Unity's architecture:

### Entity-Component Pattern
```javascript
// Example: Creating an enemy
const enemy = new Entity();
enemy.AddComponent(new NPCController({...}));
enemy.AddComponent(new HealthComponent({...}));
enemy.AddComponent(new SpatialGridController({...}));
enemy.AddComponent(new AttackController({...}));
```

### Communication via Message Broadcasting
```javascript
// Components communicate through messages
this.Broadcast({
  topic: 'health.damage',
  value: damage,
  attacker: this._parent
});
```

### Key Design Patterns
- **Entity-Component System** - Composition over inheritance
- **Observer Pattern** - Message broadcasting for inter-component communication
- **Finite State Machine** - Animation and behavior states
- **Spatial Hash Grid** - Efficient collision detection
- **Object Pool** - Particle system optimization

## 🎨 Technical Highlights

### Custom Shaders
- **Sky Dome Shader** - Atmospheric gradient effect
- **Health Bar Shader** - Smooth color interpolation
- **Particle Shader** - GPU-accelerated particle rendering

### Optimization Techniques
- Spatial hash grid (100×100 cells)
- Frustum culling on static objects
- Animation state caching
- Efficient nearby entity queries

### Day/Night System
```javascript
// Smooth transition through 4 phases:
Night (0-15%, 85-100%) → Sunrise (15-25%) → 
Day (25-65%) → Sunset (65-85%) → Night
```

## 🔧 Customization

### Adding New Weapons
```javascript
const newWeapon = new entity.Entity();
newWeapon.AddComponent(new inventory_controller.InventoryItem({
  type: 'weapon',
  damage: 3,              // Damage multiplier
  attackSpeed: 0.7,       // Attack cooldown in seconds
  renderParams: {
    name: 'WeaponName',
    scale: 0.25,
    icon: 'weapon-icon.png',
  },
}));
```

### Creating New Quests
Edit `quest-component.js` and add to `QUESTS` object:
```javascript
new_quest: {
  id: 'new_quest',
  title: 'Quest Title',
  text: 'Quest description...',
  objectives: [
    { type: 'kill', target: 'any', required: 15, current: 0, 
      description: 'Defeat 15 monsters' }
  ],
  rewards: {
    experience: 750,
    items: []
  },
  prerequisite: 'previous_quest'
}
```


## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.


