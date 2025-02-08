import { Sprite, Assets } from 'pixi.js';
import { CollisionBounds } from '../types/CollisionBounds';

export class Log extends Sprite {
    private velocityX: number = Math.random() * 2 + 1; // Random horizontal speed (left or right)
    private fallSpeed: number = 0.3; // Gravity (adjust as necessary for stronger/weaker fall)
    private direction: number = Math.random() < 0.5 ? -1 : 1; // Random direction (-1 for left, 1 for right)
    private falling: boolean = false; // Flag to track if the log is falling
    private targetY: number = 280; // Target ground position
    private velocityY: number = 0; // Vertical velocity (starts at 0)
    private initialVelocityY: number = -5; // Initial upward velocity when fall starts
    private levitationTime: number = 0;

    constructor() {
        const texture = Assets.cache.get('log'); // Assuming log texture is available in assets
        super(texture);

        if (!texture) {
            console.error('Log texture is not loaded!');
            return;
        }

        // Set the size of the log based on the texture dimensions
        this.width = texture.width * 1.5;
        this.height = texture.height * 1.5;
    }

    public getCollisionBounds(): CollisionBounds {
        const left = this.x;
        const right = left + this.width;
        const top = this.y;
        const bottom = this.y + this.height;

        return { left, right, top, bottom };
    }

    // Function to start the fall with an initial upward velocity
    public fallDown() {
        this.falling = true; // Start the falling animation
        this.velocityY = this.initialVelocityY; // Set initial upward velocity
    }

    // This method will be called every frame in the game loop
    public update(deltaTime: number) {
        if (this.falling) {
            // Move the log horizontally based on its direction
            this.x += this.velocityX * this.direction * deltaTime; // Use deltaTime for smooth movement
            
            // Apply gravity and update vertical position
            this.velocityY += this.fallSpeed * deltaTime; // Increase vertical velocity due to gravity
            this.y += this.velocityY * deltaTime; // Apply vertical movement to log

            // Check if the log has reached the ground
            if (this.y >= this.targetY) {
                this.y = this.targetY; // Make sure the log doesn't go below the ground
                this.falling = false; // Stop the falling
                this.velocityY = 0; // Reset vertical velocity once the log hits the ground
                this.levitationTime = 0;
            }
        } else {
            // Increment time for smooth oscillation
            this.levitationTime += deltaTime;
    
            // Use a sine wave for smooth up-down movement
            const levitationOffset = Math.sin(this.levitationTime * 0.05) * 5;
    
            // Apply levitation effect
            this.y = this.targetY + levitationOffset;
        }
    }
}
