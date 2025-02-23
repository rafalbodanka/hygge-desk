import { Assets, Container, Graphics, Sprite, Texture, Ticker } from "pixi.js";
import * as PIXI from 'pixi.js';
import { Hero } from "../hero/Hero";
// import { Weapon } from "../weapons/Weapon";
import Keyboard from "../Keyboard";
import { Tree } from "../tree/Tree";
import { Log } from "../tree/Log";
import { Lumberjack } from "../lumberjack/Lumberjack";
import { Home } from "../home/Home";
import { Modal } from "../modal/Modal";
import { messages } from "../plot/Plot"
import { Desk } from "../desk/Desk";
import { Chair } from "../desk/Chair";
import { HintMessage } from "../hint/hintMessage";


export class Scene extends Container {
    private sceneHeight: number;
    private sceneWidth: number;
    public worldWidth: number;
    private cameraOffsetX: number = 0;
    private world: Sprite;
    public hero: Hero;
    public lumberjack: Lumberjack;
    // private weapon: Weapon;
    public tree: Tree;
    private maskGraphics: Graphics;
    private leftAnimationFrames: Texture[] = [];
    private groundTiles: Sprite[] = []; // Array to store ground tile sprites
    public logs: Log[] = []; // Array to store logs in the scene
    public logsCounter: Sprite;
    private logCountText: PIXI.DisplayObject;
    public logCount: number = 0;
    private logCounterContainer: Container;
    public home: Home;
    public deskReady: Boolean = false;
    public modal: Modal;
    public desk: Desk;
    public introFinished: Boolean = false;
    public canSleep: Boolean = false;
    public chair: Chair;
    public gameFinished: Boolean = false;
    public language: "en" | "pl" = "en";
    public keyboardIcon: Sprite;
    public changeLanguageButton: Container = new Container();

    constructor() {
        super();

        this.sceneWidth = 640;
        this.sceneHeight = 360;
        this.worldWidth = 2400;
        this.sortableChildren = true;
        window.addEventListener("keydown", this.onKeyPress.bind(this));

        // this.weapon = new Weapon(AXE)
        // this.weapon.x = 200
        // this.weapon.y = 200
        this.world = Sprite.from("background");
        this.world.x = 0;
        this.world.y = 0;
        this.addChild(this.world);
        // Create a Graphics object for the mask
        this.maskGraphics = new Graphics();
        this.addChild(this.maskGraphics);
        
        const groundTileTexture = Texture.from("ground_tile");
        
        // Create and position the ground tiles at the bottom of the scene
        this.createGroundPlatform(groundTileTexture);

        this.desk = new Desk(this);
        this.desk.x = 200
        this.desk.y = this.sceneHeight - this.desk.height - this.groundTiles[0].height + 15

        this.chair = new Chair();
        this.chair.x = 200
        this.chair.y = this.sceneHeight - this.desk.height - this.groundTiles[0].height + 15

        this.home = new Home(this)
        this.home.x = 0
        this.home.y = this.sceneHeight - this.home.height - this.groundTiles[0].height + 8
        this.addChild(this.home)

        this.tree = new Tree(this)
        this.tree.x = 300
        this.tree.y = this.sceneHeight - 32 - this.tree.height
        const animations = Assets.cache.get('hero-idle-json').data.frames;
        const frameNames = Object.keys(animations);
        this.leftAnimationFrames = frameNames.filter(frameName => frameName.includes("right")).map(frameName => Texture.from(frameName));
        this.hero = new Hero(this.leftAnimationFrames, this, this.tree, this.home);
        this.hero.x = this.sceneWidth / 2;
        this.hero.y = this.sceneHeight - this.hero.height - 32
        this.hero.zIndex = 4
        this.tree.zIndex = 1
        // this.weapon.zIndex = 2
        this.addChild(this.tree)
        // this.addChild(this.weapon)
        this.addChild(this.hero)
        const animationsLumberjack = Assets.cache.get('lumberjack-idle-json').data.frames;
        const lumberjackFrameNames = Object.keys(animationsLumberjack);
        this.leftAnimationFrames = lumberjackFrameNames.filter(frameName => frameName.includes("left")).map(frameName => Texture.from(frameName));
        this.lumberjack = new Lumberjack(this.leftAnimationFrames, this)
        this.lumberjack.animationSpeed = 0.05
        this.lumberjack.y = this.hero.y
        this.lumberjack.x = this.sceneWidth - this.lumberjack.width - 50;
        this.lumberjack.zIndex = 3
        this.lumberjack.play()
        this.addChild(this.lumberjack)

        this.logsCounter = new Sprite();
        this.logCountText = new PIXI.Text("") as unknown as PIXI.DisplayObject;
        this.logCounterContainer = new Container();

        this.createLogCounter();

        this.finishIntro = this.finishIntro.bind(this);
        this.keyboardIcon = new Sprite(Assets.get('keyboardIcon'))
        this.keyboardIcon.scale.set(1/10, 1/10)
        this.keyboardIcon.position.x = 40
        this.addChild(this.keyboardIcon)

        this.keyboardIcon.eventMode = "static";
        this.keyboardIcon.on('pointerdown', () => {
            this.modal.visible = true;
            this.addChild(this.modal.container)
        })

        this.keyboardIcon.on('pointerover', () => {
            this.keyboardIcon.scale.set(1/9.5, 1/9.5)
        })

        this.keyboardIcon.on('pointerout', () => {
            this.keyboardIcon.scale.set(1/10, 1/10)
        })

        const hintsModal: Modal = new Modal(this, null, null, false, this.finishIntro)

        const introModal = new Modal(this, null, hintsModal, false, ()=> {})

        this.modal = new Modal(this, "Język / Language", introModal, true, ()=> {
            hintsModal.createText(messages['plot']['hints'][this.language])
            introModal.createText(messages['plot']['intro'][this.language])
        }, undefined, true)

        Keyboard.initialize()
        // this.spawnDesk()
        // this.deskReady = true

        Ticker.shared.add(this.update, this);
    }
    onKeyPress(event: KeyboardEvent) {
        if (this.modal.visible && event.code === "Enter" && !this.modal.languageModal) {
            this.modal.closeModal(this);
        }
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

    private createLogCounter() {
        // Load log texture
        const logTexture = Assets.cache.get('log');
    
        // Create a container to hold both log icon and text
        this.logCounterContainer = new Container();
    
        // Create log icon
        this.logsCounter = new Sprite(logTexture);
        this.logsCounter.scale.set(2); // Scale by 2
        
        // Create text element for log count
        this.logCountText = new PIXI.Text(`${this.lumberjack.logsTaken}/${this.lumberjack.logsTarget}`, {
            fontFamily: "VT323",
            fontSize: 32,
            fill: "#ffffff", // White text
            fontWeight: "bold",
            stroke: "#000000", // Black outline
            strokeThickness: 4, // Outline thickness
            letterSpacing: -3,
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

        this.logs.forEach(log => {
            log.update(deltaTime); // This calls the update method of each log
        });

        this.updateCamera(deltaTime);

        (this.logCountText as PIXI.Text).text = `${this.lumberjack.logsTaken + this.logCount}/${this.lumberjack.logsTarget}`;

        // if (this.modal.visible && Keyboard.state.get("Enter")) {
        //     this.modal.closeModal(this);
        // }
    }


    private updateCamera(deltaTime: number) {
        // const leftBound = 0;
        // const rightBound = this.world.width;
        let shouldMove = false;
        let shiftAmount = 0;

        const cameraMoveMargin = 150;

        if (this.hero.x < this.cameraOffsetX + cameraMoveMargin && this.hero.isMoving && this.hero.currentDirection === "left") {
            shiftAmount = this.hero.currentSpeed * deltaTime;
            this.cameraOffsetX += shiftAmount
            shouldMove = true
        } else if (this.hero.x > this.cameraOffsetX + this.world.width - this.hero.width - cameraMoveMargin && this.hero.isMoving && this.hero.currentDirection === "right") {
            shiftAmount = -this.hero.currentSpeed * deltaTime;
            this.cameraOffsetX += shiftAmount;
            shouldMove = true

        }

        if (!shouldMove) {
            return
        }

        // this.tree.x += shiftAmount;
        // this.weapon.x += shiftAmount;
        // this.logs.forEach(log => log.x += shiftAmount);
        // this.groundTiles.forEach(tile => tile.x += shiftAmount);
    }

    public startNewDay() {
        const fadeOverlay = new Graphics();
        fadeOverlay.beginFill(0x000000);
        fadeOverlay.drawRect(0, 0, this.width, this.height);
        fadeOverlay.endFill();
        fadeOverlay.alpha = 0; // Start transparent
        fadeOverlay.zIndex = 10;
        this.addChild(fadeOverlay);
    
        let fadeTime = 0; // Track fade duration
        let state = "fade-in"; // Track current phase (fade-in, update, fade-out)
    
        // Add fade effect to the shared ticker
        const fadeEffect = (delta: number) => {
            fadeTime += delta / 60; // Convert frames to seconds (approximate)
    
            if (state === "fade-in") {
                fadeOverlay.alpha += 0.05 * delta;
                if (fadeOverlay.alpha >= 1) {
                    fadeOverlay.alpha = 1;
                    state = "update"; // Move to next phase
                    fadeTime = 0;
                }
            } 
            else if (state === "update") {
                if (fadeTime >= 0.1) { // Wait 1 second
                    this.tree.revive();
                    this.lumberjack.canPickUpToday = true;
                    if (this.lumberjack.logsTaken >= this.lumberjack.logsTarget) {
                        this.deskReady = true;
                    }
                    state = "fade-out";
                    fadeTime = 0;
                    if (this.deskReady && !this.children.some(child => child instanceof Desk)) {
                        this.desk.zIndex = 1;
                        this.spawnDesk()
                    }
                    this.sortChildren(); 
                    this.lumberjack.removeChild(this.lumberjack.messageContainer)
                }
            } 
            else if (state === "fade-out") {
                fadeOverlay.alpha -= 0.05 * delta;
                if (fadeOverlay.alpha <= 0) {
                    fadeOverlay.alpha = 0;
                    this.removeChild(fadeOverlay); // Cleanup
                    Ticker.shared.remove(fadeEffect); // Stop updating
                    
                }
            }
        };

        Ticker.shared.add(fadeEffect);
    }

    public spawnDesk() {
        this.desk.zIndex = 5;
        this.addChild(this.desk);
        this.addChild(this.chair);
        this.home.hintMessage?.closeModal()
        this.desk.hintMessage = new HintMessage(this.desk, messages['worldInfo']['deskSitDown'][this.language], 0, null, -320)
    }

    public finishIntro() {
        if (!this.introFinished) {
            this.tree.displayHint();
        }
        this.introFinished = true;
    }
    
}