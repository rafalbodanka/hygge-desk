import * as PIXI from 'pixi.js';

class ExtendedContainer extends PIXI.Container {
    public hintMessage?: HintMessage | null;
}

export class HintMessage {
    public container: PIXI.Container;
    public visible: Boolean;
    private parentDisplayable: ExtendedContainer;
    private delay: number;
    private callback: Function | null;
    private offsetY: number;


    constructor(parentDisplayable: ExtendedContainer, text: string, delay: number = 0, callback: Function | null = null, offsetY: number = 0) {
        this.parentDisplayable = parentDisplayable;
        this.container = new PIXI.Container();
        this.visible = true;
        this.delay = delay;
        this.callback = callback;
        this.offsetY = offsetY;
            
        this.createText(text);
        this.createBackground();
        this.displayOnScene(parentDisplayable);
    }

    displayOnScene(parentDisplayable: PIXI.Container) {
        // this.container.position.set(5, this.parentDisplayable.height - 140); // Attach to the very top-left corner
        this.container.position.set(5, this.parentDisplayable.height + this.offsetY - 140); // Attach to the very top-left corner
        if (this.parentDisplayable.x + this.container.x + this.container.width > 640) {
            this.container.position.set(640 - this.parentDisplayable.x - this.container.width - 10, this.parentDisplayable.height - 140);
        }
        if (this.parentDisplayable.scale._x !== 0 || this.parentDisplayable.scale._y !== 0) {
            this.container.scale.set(1 / this.parentDisplayable.scale._x, 1 / this.parentDisplayable.scale._y)
        }
        setTimeout(() => {
            parentDisplayable.addChild(this.container);
            if (this.callback) {
                this.callback()
            }
        }, this.delay * 1000)
    }

    createBackground() {
        const bg = new PIXI.Graphics();

        // Get text dimensions dynamically
        const message = this.container.children[0] as PIXI.Text;
        const padding = 10;
        const width = message.width + padding * 2;
        const height = message.height + padding * 2;

        // Draw background
        bg.beginFill(0x000000, 0.8);
        bg.drawRect(0, 0, width, height);
        bg.endFill();

        // Draw border
        const border = new PIXI.Graphics();
        border.lineStyle(2, 0xFFFFFF); // White border
        border.drawRect(0, 0, width, height);

        // Place background behind the text
        this.container.addChildAt(bg, 0);
        this.container.addChild(border);
    }

    createText(text: string) {
        const style = new PIXI.TextStyle({
            fontFamily: "VT323",
            fontSize: 20,  
            fill: 0xFFFFFF,
            wordWrap: true,
            wordWrapWidth: 200, // Max width before wrapping
            fontWeight: "bold",
        });

        const message = new PIXI.Text(text, style);
        message.position.set(10, 10); // Padding from the top-left corner
        this.container.addChild(message);
    }

    public update() {
        this.displayOnScene(this.parentDisplayable);
    }

    closeModal() {
        if (this.parentDisplayable) {
            this.parentDisplayable.removeChild(this.container); // Remove from scene
        }
        this.parentDisplayable.hintMessage = null;
    }
}