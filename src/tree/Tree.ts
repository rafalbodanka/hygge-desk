import { AnimatedSprite, Assets, Texture } from 'pixi.js';
import { Log } from './Log'; // Assuming Log is another class in your project.
import { CollisionBounds } from '../types/CollisionBounds';
import { Scene } from '../scenes/Scene'; // Import the Scene class

export class Tree extends AnimatedSprite {
    private health: number = 4;
    private scene: Scene; // Store a reference to the scene

    constructor(scene: Scene) {
        // Pass the scene reference to the Tree
        const animations = Assets.cache.get('tree_big-json').data.frames;
        const frameNames = Object.keys(animations);
        const textures = frameNames.map(frameName => Texture.from(frameName));
        super(textures);

        // Store the scene reference
        this.scene = scene;
    }

    public getCollisionBounds(): CollisionBounds {
        const left = this.x + 200;
        const right = left + 80;
        const top = this.y + this.height - 20;
        const bottom = this.y + 300;

        return { left, right, top, bottom };
    }

    public hit(): number {
        if (this.health === 0) return 0;

        this.health -= 1;
        this.gotoAndStop(this.textures.length - this.health - 1);

        // If health reaches 0, spawn logs
        if (this.health === 0) {
            this.createLogs();
        }

        return this.health;
    }

    private createLogs() {
        // Create 5 logs and add them to the scene
        for (let i = 0; i < 5; i++) {
            const log = new Log();
            log.x = this.x + (this.width / 2) + Math.random() * 40 - 20; // Randomize x position to fall slightly left or right of the tree
            // log.y = this.y + this.height - 20 - (i * 20); // Place logs above each other from the bottom of the tree
            log.y = this.y + this.height - 50 - Math.random() * 100; // Place logs above each other from the bottom of the tree

            this.scene.addChild(log); // Add the log to the scene
            log.zIndex = 2;

            log.fallDown(); // Start the fall animation for the log

            // Push the log to the scene's logs array to track it
            this.scene.logs.push(log); // This ensures the scene keeps track of the logs for updates
        }
    }
}
