import { AnimatedSprite, Assets, Container, Graphics, Sprite, Texture, Ticker } from "pixi.js";
import * as PIXI from 'pixi.js';
import { Hero } from "../hero/Hero";
import { Weapon } from "../weapons/Weapon";
import { AXE } from "../weapons/WeaponTypes";
import Keyboard from "../Keyboard";
import { Tree } from "../tree/Tree";
import { Entity } from "../types/Entity";
import { Log } from "../tree/Log";

export class Scene extends Container {

    private worldMatrix: number[][];
    private world: Sprite;
    private hero: Hero;
    private hero2: AnimatedSprite;
    private weapon: Weapon;
    private tree: Tree;
    private maskGraphics: Graphics;
    private leftAnimationFrames: Texture[] = [];
    private groundTiles: Sprite[] = []; // Array to store ground tile sprites
    private sceneHeight: number;
    private sceneWidth: number;
    public logs: Log[] = []; // Array to store logs in the scene
    public logsCounter: Sprite;
    private logCountText: PIXI.DisplayObject;
    public logCount: number = 0;
    private logCounterContainer: Container;

    constructor() {
        super();

        this.sceneWidth = 640;
        this.sceneHeight = 360;

        const matrix: number[][] = [];
        // Initialize the matrix
        for (let i = 0; i < this.sceneHeight; i++) {
            matrix[i] = [];
            for (let j = 0; j < this.sceneWidth; j++) {
                matrix[i][j] = 0; // 0 represents an empty cell
            }
        }
        this.worldMatrix = matrix;


        this.weapon = new Weapon(AXE)
        this.weapon.x = 200
        this.weapon.y = 200
        // this.world = Sprite.from("ship");
        this.world = Sprite.from("background");

        this.tree = new Tree(this)
        this.tree.x = 300
        this.tree.y = this.sceneHeight - 32 - this.tree.height
        this.world.x = 0;
        this.world.y = 0;
        const animations = Assets.cache.get('hero-idle-json').data.frames;
        const frameNames = Object.keys(animations);
        this.leftAnimationFrames = frameNames.filter(frameName => frameName.includes("right")).map(frameName => Texture.from(frameName));
        this.hero = new Hero(this.leftAnimationFrames, this, this.weapon, this.tree);
        this.hero.x = this.sceneWidth / 2;
        this.hero.y = this.sceneHeight - this.hero.height - 32
        this.hero.zIndex = 3
        this.tree.zIndex = 1
        this.weapon.zIndex = 2
        this.addChild(this.world);
        this.addChild(this.tree)
        this.addChild(this.weapon)
        this.addChild(this.hero)
        this.hero2 = new AnimatedSprite(this.leftAnimationFrames)
        this.hero2.animationSpeed = 0.05
        this.hero2.play()
        console.log(this.hero2.currentFrame)
        this.addChild(this.hero2)
        this.markArea(this.tree)
        this.markArea(this.weapon)
        this.markArea(this.hero)

        // Create a Graphics object for the mask
        this.maskGraphics = new Graphics();
        this.addChild(this.maskGraphics);

        const groundTileTexture = Texture.from("ground_tile");

        // Create and position the ground tiles at the bottom of the scene
        this.createGroundPlatform(groundTileTexture);
        this.logsCounter = new Sprite();
        this.logCountText = new PIXI.Text("") as unknown as PIXI.DisplayObject;
        this.logCounterContainer = new Container();

        this.createLogCounter();

        Keyboard.initialize()

        Ticker.shared.add(this.update, this);
    }

    private createGroundPlatform(groundTileTexture: Texture) {
        const screenWidth = this.sceneWidth; // Width of the scene
        const screenHeight = this.sceneHeight; // Height of the scene
    
        // Define the original tile dimensions (128x128px)
        const originalTileWidth = 128;
        const originalTileHeight = 128;
    
        // Define the new tile dimensions (scaled to 32x32px)
        const scaledTileWidth = 32;
        const scaledTileHeight = 32;
    
        // Calculate the number of tiles needed to cover the bottom of the screen
        const numTiles = Math.ceil(screenWidth / scaledTileWidth);
    
        // Create and position each tile
        for (let i = 0; i < numTiles; i++) {
            const groundTile = new Sprite(groundTileTexture);
            
            // Set the position of each tile
            groundTile.x = i * scaledTileWidth;
            groundTile.y = screenHeight - scaledTileHeight; // Position it at the bottom of the screen
    
            // Apply pixel-perfect scaling
            groundTile.scale.set(scaledTileWidth / originalTileWidth, scaledTileHeight / originalTileHeight);
    
            // Set scale mode to PIXI.SCALE_MODES.NEAREST for pixel-perfect scaling
            groundTile.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
    
            // Set the zIndex to make sure the tiles are behind other objects
            groundTile.zIndex = 0;
    
            // Add the ground tile to the scene
            this.groundTiles.push(groundTile);
            this.addChild(groundTile);
        }
    }

    private markArea(entity: Entity) {
        const bounds = entity.getCollisionBounds();
        const left = Math.max(0, Math.floor(bounds.left));
        const right = Math.min(this.worldMatrix.length, Math.ceil(bounds.right));
        const top = Math.max(0, Math.floor(bounds.top));
        const bottom = Math.min(this.worldMatrix[0].length, Math.ceil(bounds.bottom));

        for (let i = left; i < right; i++) {
            for (let j = top; j < bottom; j++) {
                this.worldMatrix[i][j] = 1;
            }
        }
    }

    public isPositionTaken(left: number, right: number, top: number, bottom: number): boolean {
        // Convert coordinates to matrix indices
        const matrixLeft = Math.floor(left);
        const matrixRight = Math.ceil(right);
        const matrixTop = Math.floor(top);
        const matrixBottom = Math.ceil(bottom);
    
        // Define a buffer around the hero's position to focus on
        const buffer = 5; // You can adjust this value based on your needs
    
        // Adjust the region of interest based on the buffer
        const startI = Math.max(0, matrixLeft - buffer);
        const endI = Math.min(this.worldMatrix.length, matrixRight + buffer);
        const startJ = Math.max(0, matrixTop - buffer);
        const endJ = Math.min(this.worldMatrix[0].length, matrixBottom + buffer);
    
        // Check each pixel in the adjusted region
        for (let i = startI; i < endI; i++) {
            for (let j = startJ; j < endJ; j++) {
                
                // Check if the position is within the matrix bounds
                if (i >= 0 && i < this.worldMatrix.length &&
                    j >= 0 && j < this.worldMatrix[0].length) {
                    // Exclude the hero's current position from the check
                    if (this.worldMatrix[i][j] > 0) {
                        console.log(this.worldMatrix[i][j])
                        return true; // Collision detected
                    }
                } else {
                    // If the position is outside the matrix bounds, consider it as taken
                    return true; // Collision detected
                }
            }
        }
    
        // No collision detected
        return false;
    }

    private createLogCounter() {
        // Load log texture
        const logTexture = Assets.cache.get('log');
    
        // Create a container to hold both log icon and text
        this.logCounterContainer = new Container();
    
        // Create log icon
        this.logsCounter = new Sprite(logTexture);
        this.logsCounter.scale.set(2); // Scale by 2
        
        // Create text style
        // const textStyle = new PIXI.TextStyle({
        //     fontSize: 24,
        //     fill: "#ffffff",
        //     fontWeight: "bold",
        // });
        
        // Create text element for log count
        this.logCountText = new PIXI.Text(`x ${this.logCount}`, {
            fontSize: 24,
            fill: "#ffffff", // White text
            fontWeight: "bold",
            stroke: "#000000", // Black outline
            strokeThickness: 4, // Outline thickness
        });
        
        
        // Add text as a child of the container (so it can be positioned)
        this.logCounterContainer.addChild(this.logsCounter);
        this.logCounterContainer.addChild(this.logCountText);
        // Position the text relative to the log icon
        this.logsCounter.position.set(this.sceneWidth - this.logsCounter.width - 50, -10); // Set position
        this.logCountText.position.set(this.sceneWidth - this.logsCounter.width + 5, 8);
    
        // Add the container to the scene
        this.addChild(this.logCounterContainer);
    }

    private update(deltaTime: number): void {
        this.hero.update(deltaTime);
        // Clear the mask graphics
        this.maskGraphics.clear();
        for (let i = 0; i < this.sceneHeight; i++) {
            this.worldMatrix[i] = [];
            for (let j = 0; j < this.sceneWidth; j++) {
                this.worldMatrix[i][j] = 0; // 0 represents an empty cell
            }
        }
        this.markArea(this.tree)
        this.markArea(this.weapon)
        this.markArea(this.hero)
        this.logs.forEach(log => {
            log.update(deltaTime); // This calls the update method of each log
        });
        // Draw a purple rectangle for each "1" in the worldMatrix
        for (let i = 0; i < this.sceneHeight; i++) {
            for (let j = 0; j < this.sceneWidth; j++) {
                if (this.worldMatrix[i][j] === 1) {
                    this.maskGraphics.beginFill(0xFF00FF, 0.2); // Purple color with 20% opacity
                    this.maskGraphics.drawRect(i, j, 1, 1);
                    this.maskGraphics.endFill();
                }
            }
        }
        console.log(this.logCount);
        (this.logCountText as PIXI.Text).text = `x ${this.logCount}`;
    }
}