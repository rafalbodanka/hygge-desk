import type { ResolverManifest } from "pixi.js";

export const manifest:ResolverManifest = {
    bundles: [
        {
            name : "world-assets",
            assets:
            {
                "empty" : "./world/empty.png",
                "background" : "./world/background.jpg",
                "ground_tile" : "./world/ground_tile.png",
                "tree_big" : "./world/tree_big.png",
                "tree_big-json" : "./world/tree_big.json",
                "tree_dead_leaves" : "./world/tree_dead_leaves.png",
                "leaves" : "./world/leaves.png",
                "bed" : "./world/house.png",
                "keyboardIcon" : "./world/keyboard.png",
                "desk" : "./world/desk.png",
                "chair" : "./world/chair.png",
                "log" : "./world/log.png",
                "hero-idle" : "./hero/viking-idle.png",
                "lumberjack-idle" : "./hero/lumberjack-idle.png",
                "lumberjack-idle-json" : "./hero/lumberjack-idle.json",
                "hero-idle-json" : "./hero/viking-idle.json",
                "hero-move" : "./hero/viking-move.png",
                "hero-move-json" : "./hero/viking-move.json",
                "hero-attack-melee" : "./hero/viking-attack-melee.png",
                "hero-attack-melee-json" : "./hero/viking-attack-melee.json",
                "tree" : "./tree/tree.png",
                "tree-json" : "./tree/tree.json",
                "shadow" : "./hero/shadow.png",
                "axe" : "./hero/axe.png",
                "woosh" : "./sound/woosh.mp3",
            }
        },
    ]
}