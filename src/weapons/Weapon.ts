import { Assets, Sprite } from 'pixi.js';
import { CollisionBounds } from '../types/CollisionBounds';
// import * as WeaponTypes from './WeaponTypes';

export class Weapon extends Sprite {
    private type: string;

    constructor(type: string) {
        const texture = Assets.cache.get(type)
        super(texture);
        this.type = type;
    }

    public getType(): string {
        return this.type;
    }

    public getCollisionBounds() : CollisionBounds {
        const left = this.x;
        const right = left + this.width;
        const top = this.y;
        const bottom = this.y + this.height;
        // console.log(left, right, top, bottom)
        return {left: left, right: right, top: top, bottom: bottom};
    }
}