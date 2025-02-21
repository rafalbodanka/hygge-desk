import * as PIXI from 'pixi.js';
import { Scene } from '../scenes/Scene';

export class Modal {
    public container: PIXI.Container;
    public visible: Boolean;
    public nextModal: Modal | null;
    public isDisplayed: Boolean ;
    private callbackFunction: Function;
    private brightness: 1 | 2 | 3;
    public languageModal: Boolean = false;

    constructor(
        scene: Scene,
        text: string | null,
        nextModal: Modal | null = null,
        isDisplayed = false,
        callback: Function,
        brightness: 1 | 2 | 3 = 3,
        languageModal = false
    ){
        this.container = new PIXI.Container();
        this.brightness = brightness
        this.languageModal = languageModal;
        this.createBackground();
        if (text) {
            this.createText(text);
        }

        if (languageModal) {
            this.createLanguageButtons(scene);
        } else {
            this.createOkButton(scene)
        }
        this.isDisplayed = isDisplayed;
        this.isDisplayed && this.displayOnScene(scene)
        this.visible = true;
        this.nextModal = nextModal || null;
        this.callbackFunction = callback;
    }

    displayOnScene(scene: Scene) {
        this.isDisplayed && scene.addChild(this.container);
    }

    createBackground() {
        const bg = new PIXI.Graphics();
        bg.beginFill(0x000000, 0.5 + (this.brightness / 10));
        bg.drawRect(0, 0, 640, 360);
        bg.endFill();
        
        // Add pixel border
        const border = new PIXI.Graphics();
        border.drawRect(0, 0, 640, 360);
        
        this.container.addChild(bg);
        this.container.addChild(border);
        this.container.zIndex = 11;
        this.container.position.set(0, 0);
    }

    public createText(text: string) {
        const style = new PIXI.TextStyle({
            fontFamily: "VT323", // Retro pixel font
            fontSize: 26,
            fill: 0xFFFFFF,
            wordWrap: true,
            wordWrapWidth: 640,
            fontWeight: 'bold'
        });
        
        const message = new PIXI.Text(text, style);
        if (this.languageModal) {
            message.position.set(250, 120)
        } else {
            message.position.set(10, 10);
        }
        
        this.container.addChild(message);
    }

    createOkButton(scene: Scene) {
        const style = new PIXI.TextStyle({
            fontFamily: "VT323", // Retro pixel font
            fontSize: 26,
            fill: 0xFFFFFF,
            wordWrap: true,
            wordWrapWidth: 640,
            fontWeight: 'bold'
        });
    
        const buttonText = new PIXI.Text("OK [Enter]", style);
        buttonText.position.set(280, 320);

        
        // Make it interactive
        buttonText.interactive = true;
    
        // Extend the clickable area (hit box)
        buttonText.hitArea = new PIXI.Rectangle(
            -10,  // Expand left
            -10,  // Expand top
            buttonText.width + 20, // Expand right
            buttonText.height + 20 // Expand bottom
        );
    
        // Click event listener
        buttonText.on("pointerdown", () => {
            this.closeModal(scene);
        });

        buttonText.on('pointerover', () => {
            buttonText.scale.set(1.05, 1.05)
        })
        buttonText.on('pointerout', () => {
            buttonText.scale.set(1, 1)
        })
    
        this.container.addChild(buttonText);
    }

    createLanguageButtons(scene: Scene) {
        const style = new PIXI.TextStyle({
            fontFamily: "VT323", // Retro pixel font
            fontSize: 26,
            fill: 0xFFFFFF,
            fontWeight: 'bold'
        });
    
        // Create text buttons
        const buttonPL = new PIXI.Text("Polski", style);
        const buttonEN = new PIXI.Text("English", style);
    
        // Set positions with a small gap
        const gap = 40; // Adjust spacing
        buttonPL.position.set(245, 170);
        buttonEN.position.set(buttonPL.x + buttonPL.width + gap, buttonPL.y);
    
        // Make them interactive
        buttonPL.interactive = true;
        buttonEN.interactive = true;

        [buttonPL, buttonEN].map(button => {
            button.on('pointerover', () => {
                button.scale.set(1.05, 1.05)
            })
            button.on('pointerout', () => {
                button.scale.set(1, 1)
            })
        })

    
        // Expand the clickable area (hit box)
        buttonPL.hitArea = new PIXI.Rectangle(-10, -10, buttonPL.width + 20, buttonPL.height + 20);
        buttonEN.hitArea = new PIXI.Rectangle(-10, -10, buttonEN.width + 20, buttonEN.height + 20);
    
        // Click event listeners to change language
        buttonPL.on("pointerdown", () => {
            scene.language = "pl";
            this.closeModal(scene);
        });
    
        buttonEN.on("pointerdown", () => {
            scene.language = "en";
            this.closeModal(scene);
        });
    
        // Add buttons to the container
        this.container.addChild(buttonPL);
        this.container.addChild(buttonEN);
    }
    

    closeModal(scene: Scene) {
        scene.removeChild(this.container);
        if (this.nextModal) {
            scene.modal = this.nextModal;
            this.nextModal.isDisplayed = true;
            this.nextModal.displayOnScene(scene);
        } else {
            this.visible = false;
            if (!scene.gameFinished) {
                scene.hero.canPlay = true;
            }
        }
        this.callbackFunction()
    }
}