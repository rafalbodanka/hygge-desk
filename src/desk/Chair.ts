import { Sprite, Assets } from 'pixi.js';

export class Chair extends Sprite {

    constructor() {
        const texture = Assets.cache.get('chair'); // Assuming log texture is available in assets
        super(texture);

        this.width = texture.width * 0.2;
        this.height = texture.height * 0.2;
    }
}
