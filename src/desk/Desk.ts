import { Sprite, Assets, Rectangle, Text } from 'pixi.js';
import { CollisionBounds } from '../types/CollisionBounds';
import { Scene } from '../scenes/Scene'; // Import the Scene class
import { HintMessage } from '../hint/hintMessage';
import { Modal } from '../modal/Modal';
import { messages } from '../plot/Plot';

export class Desk extends Sprite {
    private scene: Scene; // Store a reference to the scene
    public hintMessage: HintMessage | null = null;

    constructor(scene: Scene) {
        const texture = Assets.cache.get('desk'); // Assuming log texture is available in assets
        super(texture);
        this.scene = scene
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

    public endGame() {
        this.hintMessage?.closeModal();
        this.scene.gameFinished = true;
        this.scene.hero.x = this.scene.chair.x + 35;
        this.scene.hero.y -= 10;
        this.scene.hero.canPlay = false;
        this.scene.hero.canAttack = false;
        this.scene.hero.stop()
        this.scene.hero.currentDirection = "right"
        const frame = this.scene.hero.rightAnimationIdleFrames[0];
        frame.frame = new Rectangle(
            frame.frame.x,         // Keep the same X
            frame.frame.y + 1,     // Shift Y down by 1 pixel
            frame.frame.width,     // Keep the same width
            frame.frame.height - 1 // Reduce height by 1 to compensate
        );
        this.scene.hero.texture = frame;
        const targetHeight = this.scene.height * 0.4; // Target height for hero
        const targetScale = targetHeight / this.scene.hero.height; // Compute target scale
        
        const targetPivotX = this.scene.hero.x - 90; // New pivot X
        const targetPivotY = this.scene.hero.y - 30; // New pivot Y
        
        const duration = 500; // Duration in milliseconds (1 second)
        const startScale = this.scene.scale.x; // Initial scale
        const startPivotX = this.scene.pivot.x;
        const startPivotY = this.scene.pivot.y;
        const startTime = performance.now();
        
        const updateZoom = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1); // Ensure it stops at 1
        
            // Linear interpolation (lerp) for smooth transition
            this.scene.scale.set(startScale + (targetScale - startScale) * progress);
            this.scene.pivot.x = startPivotX + (targetPivotX - startPivotX) * progress;
            this.scene.pivot.y = startPivotY + (targetPivotY - startPivotY) * progress;
        
            if (progress < 1) {
                requestAnimationFrame(updateZoom); // Continue animation
            }
            
            if (progress >= 1) {
                this.scene.modal = new Modal(
                    this.scene,
                    messages['plot']['outro'][this.scene.language],
                    null,
                    true,
                    () => {this.displayNewGameButton()},
                    2,
                );
                const inverseScaleX = 1 / this.scene.scale.x;
                const inverseScaleY = 1 / this.scene.scale.y;

                this.scene.modal.container.scale.set(inverseScaleX, inverseScaleY);
                this.scene.modal.container.position.set(
                    this.scene.pivot.x,
                    this.scene.pivot.y
                );
            }
        };
        
        // Start animation
        requestAnimationFrame(updateZoom);

    }

    displayNewGameButton() {
        const buttonText = messages['worldInfo']['playAgainButton'][this.scene.language];
        
        const button = new Text(buttonText, {
            fontFamily: "VT323",
            fontSize: 26,
            fill: "#ffffff",
            fontWeight: "bold",
            align: "center",
        });
        
        button.anchor.set(0.5);
        button.eventMode = "static";
    
        button.on("pointerdown", () => {
            location.reload();
        });
        
        button.hitArea = new Rectangle(
            -10,
            -10,
            button.width + 20,
            button.height + 20
        );

        button.on('pointerover', () => {
            button.scale.set(inverseScaleX * 1.05, inverseScaleY * 1.05)
        })
        button.on('pointerout', () => {
            button.scale.set(inverseScaleX, inverseScaleY)
        })
    
        const inverseScaleX = 1 / this.scene.scale.x;
        const inverseScaleY = 1 / this.scene.scale.y;
        button.scale.set(inverseScaleX, inverseScaleY);
        
        button.position.set(265, this.scene.pivot.y + 15);
    
        let originalY = button.y;
        let levitationTime = 0;
    
        const animateFloating = () => {
            levitationTime += 1;
    
            const levitationOffset = Math.sin(levitationTime * 0.05);
            button.y = originalY + levitationOffset;
    
            requestAnimationFrame(animateFloating);
        };
    
        requestAnimationFrame(animateFloating);
    
        this.scene.addChild(button);
    }
    
}
