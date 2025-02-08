import { AnimatedSprite, Resource, Sprite, Texture, Assets } from "pixi.js";
// import { sound } from "@pixi/sound";
// import Keyboard from "../Keyboard";
import { Weapon } from "../weapons/Weapon";
import { Tree } from "../tree/Tree";
import { CollisionBounds } from "../types/CollisionBounds";
import { Scene } from "../scenes/Scene";
import Keyboard from "../Keyboard";


export class Hero extends AnimatedSprite {
    private shadow: Sprite;
    private velocity: number = 1;
    private attackCooldown: number = 0.01;
    private currentDirection: string = 'right';
    private attackLasts: boolean = false;
    private leftAnimationIdleFrames: Texture[] = [];
    private rightAnimationIdleFrames: Texture[] = [];
    private leftAnimationMoveFrames: Texture[] = [];
    private rightAnimationMoveFrames: Texture[] = [];
    private directionChanged: boolean = false;
    private isMoving: boolean = false;
    private timeSinceLastAttack: number = 0;
    // private canPickUp: boolean = true;
    // private isWeaponEquipped: boolean = false;
    // private weapon: Weapon;
    private scene: Scene;
    private tree: Tree;
    private currentSpeed: number = 0; // Initial speed
    private acceleration: number = 0.02; // Acceleration rate
    private deceleration: number = 0.02; // Deceleration rate

    constructor(textures: Texture<Resource>[], scene: Scene, weapon: Weapon, tree: Tree) {
        // constructor(textures: Texture<Resource>[], scene: Scene, weapon: Weapon, tree: Tree) {

        super(textures);
        console.log(weapon)
        this.setupAnimations();
        this.loop = true
        this.scene = scene;
        // this.weapon = weapon;
        this.shadow = Sprite.from("shadow")
        this.tree = tree;
        this.shadow.y = 8;
        this.addChild(this.shadow)
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

    private updateAnimations(deltaTime: number): void {

        // console.log(this.texture)
        // return

        // if (Keyboard.state.get("KeyA") && !this.isMoving) {
        //     // launcing animation
        //     this.textures = this.leftAnimationMoveFrames
        //     this.animationSpeed = 0.1
        //     this.play()

        //     //moving hero on the map
        //     this.x -= Math.ceil(this.velocity * deltaTime);
        //     this.currentDirection = 'left'

        //     this.isMoving = true;
        // } else if (Keyboard.state.get("KeyD") && !this.isMoving) {
        //     // launcing animation
        //     this.textures = this.rightAnimationMoveFrames
        //     this.animationSpeed = 0.1
        //     this.play()

        //     //moving hero on the map
        //     this.x += Math.ceil(this.velocity * deltaTime);
        //     this.currentDirection = 'right'

        //     this.isMoving = true;
        // } else if (this.isMoving && !Keyboard.state.get("KeyA") && !Keyboard.state.get("KeyD")) {
        //     this.textures = this.currentDirection === 'right' ? this.rightAnimationIdleFrames : this.leftAnimationIdleFrames
        //     this.animationSpeed = 0.02;
        //     this.play()
        //     this.isMoving = false
        // }




        // console.log(this.textures, this.currentFrame, this.playing)
        // console.log(this.weapon, this.tree, this.scene, deltaTime)




        const isMovingNow =
            Keyboard.state.get("KeyW") ||
            Keyboard.state.get("KeyS") ||
            Keyboard.state.get("KeyA") ||
            Keyboard.state.get("KeyD");

        if (isMovingNow && !this.isMoving) {
            this.isMoving = true;
            this.animationSpeed = 0.15; // Set speed only when starting movement
        }

        if (this.isMoving && !isMovingNow) {
            this.animationSpeed = 0.02;
            this.textures = this.currentDirection === 'right' ? this.rightAnimationIdleFrames : this.leftAnimationIdleFrames;
            this.play();
            this.isMoving = false;
        }

        // Handle acceleration
        if (isMovingNow) {
            this.currentSpeed += this.acceleration * deltaTime;
            if (this.currentSpeed > this.velocity) {
                this.currentSpeed = this.velocity; // Clamp to max speed
            }
        } else {
            this.currentSpeed -= this.deceleration * deltaTime;
            if (this.currentSpeed < 0) {
                this.currentSpeed = 0; // Stop at zero
            }
        }

        // Move Right
        if (Keyboard.state.get("KeyD") && this.getCollisionBounds().right < this.scene.width) {
            if (this.currentDirection !== 'right' || this.directionChanged) {
                this.textures = this.rightAnimationMoveFrames;
                this.animationSpeed = 0.15; // Set animation speed only when changing direction
                this.play();
                this.directionChanged = false;
            }
            this.x += Math.ceil(this.currentSpeed * deltaTime);
            this.currentDirection = 'right';

            // Move Left
        } else if (Keyboard.state.get("KeyA") && this.getCollisionBounds().left > 0) {
            if (this.currentDirection !== 'left' || this.directionChanged) {
                this.textures = this.leftAnimationMoveFrames;
                this.animationSpeed = 0.15; // Set animation speed only when changing direction
                this.play();
                this.directionChanged = false;
            }
            this.x -= Math.ceil(this.currentSpeed * deltaTime);
            this.currentDirection = 'left';
        }

        // if (Keyboard.state.get("KeyS") && this.getCollisionBounds().bottom < this.scene.height) {
        //     this.y += Math.ceil(this.velocity * deltaTime);
        // }

        // if (Keyboard.state.get("KeyW") && this.getCollisionBounds().top > 0) {
        //     this.y -= Math.ceil(this.velocity * deltaTime);
        //     console.log(this.tree)
        // }

        this.timeSinceLastAttack += deltaTime;

        if (Keyboard.state.get("KeyJ") && this.timeSinceLastAttack / 60 >= this.attackCooldown && !this.attackLasts) {
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
}