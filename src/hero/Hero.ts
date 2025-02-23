import { AnimatedSprite, Resource, Texture, Assets, Container, Sprite, Text } from "pixi.js";
import { Tree } from "../tree/Tree";
import { CollisionBounds } from "../types/CollisionBounds";
import { Scene } from "../scenes/Scene";
import Keyboard from "../Keyboard";
import { Home } from "../home/Home";
import { HintMessage } from "../hint/hintMessage";
import { messages } from "../plot/Plot";


export class Hero extends AnimatedSprite {
    // private shadow: Sprite;
    public velocity: number = 1;
    // private attackCooldown: number = 0.01;
    public currentDirection: string = 'right';
    private attackLasts: boolean = false;
    public leftAnimationIdleFrames: Texture[] = [];
    public rightAnimationIdleFrames: Texture[] = [];
    public leftAnimationMoveFrames: Texture[] = [];
    public rightAnimationMoveFrames: Texture[] = [];
    // private directionChanged: boolean = false;
    public isMoving: boolean = false;
    private timeSinceLastAttack: number = 0;
    // private canPickUp: boolean = true;
    // private isWeaponEquipped: boolean = false;
    // private weapon: Weapon;
    private scene: Scene;
    private tree: Tree;
    public home: Home;
    public currentSpeed: number = 0; // Initial speed
    private acceleration: number = 0.02; // Acceleration rate
    private deceleration: number = 0.02; // Deceleration rate
    public canPlay: Boolean = false;
    public canAttack: Boolean = false;
    private messageText: Text | null = null;
    private messageTimeout: any = null;
    public messageContainer: Container;


    constructor(textures: Texture<Resource>[], scene: Scene, tree: Tree, home: Home) {
        super(textures);
        this.setupAnimations();
        this.loop = true
        this.scene = scene;
        this.home = home;
        // this.weapon = weapon;
        // this.shadow = Sprite.from("shadow")
        this.tree = tree;
        // this.shadow.y = 8;
        // this.addChild(this.shadow)
        window.addEventListener('keydown', this.onKeyDown.bind(this));
        window.addEventListener('keyup', this.onKeyUp.bind(this));

        this.messageContainer = new Container();
    }

    private setupAnimations(): void {
        const idleAnimations = Assets.cache.get('hero-idle-json').data.frames;
        const idleFrameNames = Object.keys(idleAnimations);
        this.leftAnimationIdleFrames = idleFrameNames.filter(frameName => frameName.includes("left")).map(frameName => Texture.from(frameName));
        this.rightAnimationIdleFrames = idleFrameNames.filter(frameName => frameName.includes("right")).map(frameName => Texture.from(frameName));

        const moveAnimations = Assets.cache.get('hero-move-json').data.frames;
        const moveFrameNames = Object.keys(moveAnimations);

        this.leftAnimationMoveFrames = moveFrameNames.filter(frameName => frameName.includes("left")).map(frameName => Texture.from(frameName));
        this.rightAnimationMoveFrames = moveFrameNames.filter(frameName => frameName.includes("right")).map(frameName => Texture.from(frameName));

        let textures: Texture<Resource>[] = [];

        if (this.currentDirection === "left") {
            textures = this.leftAnimationIdleFrames;
        } else if (this.currentDirection === "right") {
            textures = this.rightAnimationIdleFrames;
        }
        this.textures = textures
        this.animationSpeed = 0.02;
        this.play();
    }

    
    private onKeyDown(event: KeyboardEvent): void {
        switch (event.code) {
            case "KeyD":
                this.startMovingRight();
                break;
            case "KeyA":
                this.startMovingLeft();
                break;
            case "KeyJ":
                this.hit();
        }
    }

    private onKeyUp(event: KeyboardEvent): void {
        switch (event.code) {
            case "KeyD":
                if (this.isMoving && this.currentDirection === 'right') {
                    this.stopMoving();
                }
                break;
            case "KeyA":
                if (this.isMoving && this.currentDirection === 'left') {
                    this.stopMoving();
                }
                break;
        }
    }

    private startMovingRight(): void {
        if (this.canPlay && (!this.isMoving || this.currentDirection === 'left')) {
            this.stopMoving(); // Stop any current movement before changing direction
            this.isMoving = true;
            this.currentDirection = 'right';
            this.textures = this.rightAnimationMoveFrames;
            this.animationSpeed = 0.15;
            this.play();
        }
    }

    private startMovingLeft(): void {
        if (this.canPlay && (!this.isMoving || this.currentDirection === 'right')) {
            this.stopMoving(); // Stop any current movement before changing direction
            this.isMoving = true;
            this.currentDirection = 'left';
            this.textures = this.leftAnimationMoveFrames;
            this.animationSpeed = 0.15;
            this.play();
        }
    }

    private stopMoving(): void {
        this.isMoving = false;
        if (this.scene.gameFinished) {
            return
        }
        this.textures = this.currentDirection === 'right' ? this.rightAnimationIdleFrames : this.leftAnimationIdleFrames;
        this.animationSpeed = 0.02;
        this.play();
    }

    private updateAnimations(deltaTime: number): void {
        if (!this.canPlay || this.scene.gameFinished) {
            return;
        }

        const isMovingNow = this.isMoving; // Use the isMoving flag instead

        if (isMovingNow) {
            // Handle movement logic
            if (this.currentDirection === 'right') {
                this.x += Math.ceil(this.currentSpeed * deltaTime);
            } else if (this.currentDirection === 'left') {
                this.x -= Math.ceil(this.currentSpeed * deltaTime);
            }

            // Handle acceleration
            this.currentSpeed += this.acceleration * deltaTime;
            if (this.currentSpeed > this.velocity) {
                this.currentSpeed = this.velocity; // Clamp to max speed
            }
        } else {
            // Handle deceleration
            this.currentSpeed -= this.deceleration * deltaTime;
            if (this.currentSpeed < 0) {
                this.currentSpeed = 0; // Stop at zero
            }
        }

        this.timeSinceLastAttack += deltaTime;

        // console.log(isMovingNow, this.isMoving)
        // console.log(this.isMoving, isMovingNow)
        if (!isMovingNow && this.isMoving) {
            this.animationSpeed = 0.02;
            this.textures = this.currentDirection === 'right' ? this.rightAnimationIdleFrames : this.leftAnimationIdleFrames;
            this.play();
            this.isMoving = false; // Set isMoving to false
        }

        // if (Keyboard.state.get("KeyC") && this.isWeaponEquipped) {
        //     this.isWeaponEquipped = false;
        //     this.weapon.x = this.x;
        //     this.weapon.y = this.y;
        //     this.removeChild(this.weapon)
        //     this.addChild(this.weapon)
        //     if (this.scene) {
        //         this.scene.addChild(this.weapon);
        //     }
        //     setTimeout(() => {
        //         this.canPickUp = true;
        //     }, 3000)
        // }
        // console.log(this.canPickUp)
        // if (this.x > this.weapon.x - 20 && this.x < this.weapon.x + this.weapon.width + 20 && this.y > this.weapon.y - this.height - 20 && this.y < this.weapon.y + this.height + 20 && this.canPickUp) {
        //     this.removeChild(this.weapon)
        //     this.addChild(this.weapon)
        //     this.canPickUp = false;
        //     this.isWeaponEquipped = true;
        //     if (this.currentDirection === 'left') {
        //         this.weapon.scale.x = -1
        //         this.weapon.x = 0
        //         this.weapon.y = 0
        //     } else {
        //         this.weapon.scale.x = 1
        //         this.weapon.x = 24
        //         this.weapon.y = 24
        //     }
        //     if (this.scene) {
        //         this.scene.removeChild(this.weapon);
        //     }
        // }
        for (let i = this.scene.logs.length - 1; i >= 0; i--) {
            const log = this.scene.logs[i];

            // Check if the player is stepping on the log with a smaller buffer
            if ((this.x + this.width / 2) > (log.x + log.width / 2) - 20 &&
                (this.x + this.width / 2) < (log.x + log.width / 2) + 20 &&
                this.y > log.y - this.height - 10 &&
                this.y < log.y + this.height + 10) {

                // Pick up the log
                // this.removeChild(log);
                this.scene.logs.splice(i, 1); // Remove from logs array
                this.scene.logCount++; // Increase counter

                if (this.scene) {
                    this.scene.removeChild(log);
                }
            }
        }

        // Check if lumberjack nearby
        const lumberjackDistance = Math.abs(this.scene.lumberjack.x - this.x);
        if (lumberjackDistance < 50) {  // Możesz dostosować dystans
            if (Keyboard.state.get("KeyK")) {
                this.scene.lumberjack.takeWood(this.scene)
            }
        }

        // Check if home nearby
        const homeDistance = Math.abs((this.home.x + this.home.width / 2) - (this.x + this.width / 2));
        if (homeDistance < 50 && !this.scene.deskReady && (this.scene.tree.health == 0 || this.scene.lumberjack.logsTaken >= this.scene.lumberjack.logsTarget)) {  // Możesz dostosować dystans
            if (Keyboard.state.get("KeyK")) {
                this.home.goToSleep()
            }
        }

        // Check if desk nearby
        // if (this.scene.deskReady) {
            const deskDistance = Math.abs((this.scene.desk.x + this.scene.desk.width / 2) - (this.x + this.width / 2));
            if (deskDistance < 80 && this.scene.deskReady) {
                if (Keyboard.state.get("KeyK")) {
                    this.scene.desk.endGame()
                }
            }
        // }

    }

    private hit() {
        if (!this.canAttack) {
            return
        }
        if (!this.attackLasts && !this.scene.deskReady) {
            this.attackLasts = true;
            const animations = Assets.cache.get('hero-attack-melee-json').data.frames;
            const frameNames = Object.keys(animations);
            this.textures = this.currentDirection === 'right' ?
                frameNames.filter(frameName => frameName.includes("right")).map(frameName => Texture.from(frameName))
                :
                frameNames.filter(frameName => frameName.includes("left")).map(frameName => Texture.from(frameName))
            this.animationSpeed = 0.1;
            this.loop = false
            this.play()
            this.onComplete = () => {
                this.textures = this.currentDirection === 'right' ? this.rightAnimationIdleFrames : this.leftAnimationIdleFrames
                this.animationSpeed = this.isMoving ? 0.01 : 0.02;
                this.loop = true
                this.play();
                this.attackLasts = false;
                if (this.tree.x - 20 < this.x && this.tree.x + this.tree.width - 40 > this.x) {
                    this.tree.hit();
                }
            }
            this.timeSinceLastAttack = 0;
            // sound.play('woosh');

        }
    }

    public getCollisionBounds(): CollisionBounds {
        const left = this.x;
        const right = left + this.width;
        const top = this.y + 40;
        const bottom = this.y + this.height;

        return { left: left, right: right, top: top, bottom: bottom };
    }

    public override update(deltaTime: number): void {
        super.update(deltaTime); // Calls the parent class's update method
        this.updateAnimations(deltaTime); // Adds extra behavior
    }
 
    public displayThoughts() {
        const message: string = messages['olafThoughts']['steveMention'][this.scene.language];
    
        // If the message container doesn't exist, create it
        if (!this.messageContainer) {
            this.messageContainer = new Container();
            this.addChild(this.messageContainer); // Attach container to Lumberjack
        }
    
        // Create background
        const background = new Sprite(Texture.WHITE);
        background.width = 120;
        background.height = 40;
        background.tint = 0x000000; // Black background
        background.alpha = 0.7; // Semi-transparent
        background.anchor.set(0.5);
    
        // Create text
        this.messageText = new Text(message, {
            fontFamily: "VT323",
            fontSize: 20,
            fill: "#ffffff", // White text
            fontWeight: "bold",
            // stroke: "#000000", // Black outline
            // strokeThickness: 3,
            wordWrap: true,
            wordWrapWidth: 140,
            align: "center",
        });
    
        this.messageText.anchor.set(0.5);

        background.width = this.messageText.width + 12;
        background.height = this.messageText.height + 8;
    
        // Add background and text to the container
        this.messageContainer.addChild(background);
        this.messageContainer.addChild(this.messageText);
    
        // Position the container above the Lumberjack
        this.messageContainer.position.set(0, -(this.messageContainer.height / 2) - 10);
        
        // Adjust text position to match background
        this.messageText.position.set(0, 0);

        this.addChild(this.messageContainer)
    
        // Remove message after 3 seconds
        clearTimeout(this.messageTimeout);
        this.messageTimeout = setTimeout(() => {
            this.messageContainer.removeChildren(); // Clear contents instead of destroying
            if (!this.scene.lumberjack.hintClosed)
                {
                    this.scene.lumberjack.hintMessage = new HintMessage(this.scene.lumberjack, messages['worldInfo']['giveWood'][this.scene.language], 1, ()=>{ this.scene.lumberjack.canPickUpToday = true;})
                }
        }, 5000);
    }
}