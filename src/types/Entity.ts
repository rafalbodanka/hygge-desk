import { CollisionBounds } from "./CollisionBounds"

export type Entity = {
    getCollisionBounds(): CollisionBounds
}