import { Sprite, Assets } from 'pixi.js';
import { CollisionBounds } from '../types/CollisionBounds';
import { Scene } from '../scenes/Scene'; // Import the Scene class
import { HintMessage } from '../hint/hintMessage';

export class Home extends Sprite {
    private scene: Scene; // Store a reference to the scene
    public hintMessage: HintMessage | null = null;
    public hintClosed: Boolean = false;

    constructor(scene: Scene) {
        const texture = Assets.cache.get('bed'); // Assuming log texture is available in assets
        super(texture);
        this.scene = scene

        console.log(texture)

        if (!texture) {
            console.error('Bed texture is not loaded!');
            return;
        }

        this.width = texture.width * 0.2;
        this.height = texture.height * 0.2;
    }

    public getCollisionBounds(): CollisionBounds {
        const left = this.x + 200;
        const right = left + 80;
        const top = this.y + this.height - 20;
        const bottom = this.y + 300;

        return { left, right, top, bottom };
    }

    public goToSleep() {
        if (!this.scene.canSleep) {
            return
        }
        this.hintMessage?.closeModal();
        this.hintClosed = true;
        this.scene.startNewDay()
        
    }
}
