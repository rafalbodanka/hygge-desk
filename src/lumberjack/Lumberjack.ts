import { AnimatedSprite, Resource, Sprite, Texture, Assets, Text, Container } from "pixi.js";
import { CollisionBounds } from "../types/CollisionBounds";
import { Scene } from "../scenes/Scene";
import { HintMessage } from "../hint/hintMessage";
import { messages } from "../plot/Plot";

export class Lumberjack extends AnimatedSprite {
    // private shadow: Sprite;
    public currentDirection: string = 'left';
    private leftAnimationIdleFrames: Texture[] = [];
    public logsTarget: number = 15;
    public logsTaken: number = 0;
    private heroResponse: string = "";
    public canPickUpToday: boolean = false;
    private messageText: Text | null = null;
    private messageTimeout: any = null;
    public messageContainer: Container;
    public hintMessage: HintMessage | null = null;
    public hintClosed: Boolean = false;
    public scene: Scene;

    constructor(textures: Texture<Resource>[], scene: Scene) {
        super(textures);
        this.setupAnimations();
        this.loop = true;
        // this.shadow = Sprite.from("shadow");
        // this.shadow.y = 8;
        // this.addChild(this.shadow);
        this.messageContainer = new Container();
        this.scene = scene
    }

    private setupAnimations(): void {
        const idleAnimations = Assets.cache.get('lumberjack-idle-json').data.frames;
        const idleFrameNames = Object.keys(idleAnimations);
        this.leftAnimationIdleFrames = idleFrameNames.filter(frameName => frameName.includes("left"))
            .map(frameName => Texture.from(frameName));

        this.textures = this.leftAnimationIdleFrames;
        this.animationSpeed = 0.02;
        this.play();
    }

    public getCollisionBounds(): CollisionBounds {
        const left = this.x;
        const right = left + this.width;
        const top = this.y + 40;
        const bottom = this.y + this.height;
        return { left, right, top, bottom };
    }

    private showMessage(message: string): void {
        if (this.heroResponse === message) {
            return; // Do nothing if the message hasn't changed
        }
    
        this.heroResponse = message;
    
        // If the message container doesn't exist, create it
        if (!this.messageContainer) {
            this.messageContainer = new Container();
            this.addChild(this.messageContainer); // Attach container to Lumberjack
        }
    
        // Remove old text and background if they exist
        this.messageContainer.removeChildren();
    
        // Create background
        const background = new Sprite(Texture.WHITE);
        background.width = 120;
        background.height = 40;
        background.tint = 0x000000; // Black background
        background.alpha = 0.7; // Semi-transparent
        background.anchor.set(0.5);
    
        // Create text
        this.messageText = new Text(this.heroResponse, {
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
            this.heroResponse = ""; // Reset heroResponse after message disappears
        }, 4000);
    }
    

    public takeWood(scene: Scene): string {
        if (!this.canPickUpToday) {
            return ""
        }
        if (!this.hintClosed) {
            this.hintMessage?.closeModal();
            if (!scene.home.hintClosed) {
                scene.home.hintMessage = new HintMessage(scene.home, messages['worldInfo']['homeSleep'][scene.language], 4, ()=>{this.scene.canSleep = true})
            }
        }
        this.hintClosed = true;
        let newMessage = "";

        if (scene.deskReady) {
            newMessage = messages['torlofDialogue']['how_is_the_desk'][scene.language]
            this.showMessage(newMessage);
            return newMessage
        }


        if (scene.tree.health == 0 && scene.logCount >= 0 && scene.logs.length == 0) {
            this.logsTaken += scene.logCount
            scene.logCount = 0
            this.canPickUpToday = false;
            newMessage = messages['torlofDialogue']['thanks_go_to_sleep'][scene.language].replace('%s', String(this.logsTarget - this.logsTaken));
        } else if (scene.tree.health == 0 && scene.logCount > 0) {
            this.logsTaken += scene.logCount
            scene.logCount = 0
            newMessage = messages['torlofDialogue']['thanks'][scene.language].replace('%s', String(this.logsTarget - this.logsTaken));
        } else {
            this.logsTaken += scene.logCount
            scene.logCount = 0
            newMessage = messages['torlofDialogue']['thanks_all_for_day'][scene.language].replace('%s', String(this.logsTarget - this.logsTaken));
        }
        if (this.logsTaken >= this.logsTarget) {
            newMessage = messages['torlofDialogue']['thanks_desk_ready'][scene.language]
            scene.home.hintMessage = new HintMessage(scene.home, messages['worldInfo']['homeDeskReady'][scene.language], 2)
        }

        this.showMessage(newMessage);
        return newMessage;
    }
}
