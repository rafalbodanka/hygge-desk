import { Application } from 'pixi.js'
import { Scene } from './scenes/Scene';
import { LoaderScene } from "./scenes/LoaderScene";

const app = new Application({
    view: document.getElementById("pixi-canvas") as HTMLCanvasElement,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
    backgroundColor: 0x6495ed,
    width: 640,
    height: 360
});

const loaderScene = new LoaderScene(app.screen.width, app.screen.height);

app.stage.addChild(loaderScene);

// Initialize the loader and wait for it to complete
loaderScene.loadingCompleted.then(() => {
    // Create and add the main game scene
    const mainGameScene = new Scene();
    app.stage.addChild(mainGameScene);
});