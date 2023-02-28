https://www.codeandweb.com/free-sprite-sheet-packer

## Set up the project

```
npm i phaser
```
And then the build tools...
```sh
npm i -D parcel parcel-reporter-static-files-copy
```
make a `static` folder for assets and then in `.parcelrc` add

```json
{
  "extends": ["@parcel/config-default"],
  "reporters":  ["...", "parcel-reporter-static-files-copy"]
}
```
Create a `dist` folder a `src` folder an `src/index.html` and a `src/main.js` and load the javascript file into the html file.
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Game Demo</title>
    <style>
        body {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
        }
    </style>
</head>
<body>
    <main id="root"></main>
    <script type="module" src="main.js"></script>
</body>
</html>
```
In your `package.json` add a __"source"__ key that contains the path to your `index.html` then add a script to run parcel i.e. `npm start`
```json
{
  "...": "...other package.json stuff",
  "source": "src/index.html",
  "scripts": {
    "start": "parcel",
  },
  "...": "...other package.json stuff",
}
```

## Boilerplate Code
```javascript
// src/main.js
import Phaser from 'phaser'

function preload () {

}

function create () {

}

function update () {

}

new Phaser.Game({
    type: Phaser.AUTO,
    width: 16 * 64,
    height: 12 * 64,
    backgroundColor: '#888',
    physics: {
        default: 'matter',
        matter: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: { preload, create, update }
})
```

## Prepare the artwork

I'm using this free pack of the [Fallen Angel](https://craftpix.net/freebies/free-fallen-angel-chibi-2d-game-sprites/). When you download this you get an asset pack, all the frames are stored as individual .png. We will want to compile all the frames we want to work with into a single sprite sheet, and then create a mapping of that sheet. I am using a simple online service to facilitate this [Sprite Sheet Packer](https://www.codeandweb.com/free-sprite-sheet-packer). I have uploaded 2 different folders of images to make my idle animation sheet.

## Loading the Spritesheet

In the `preload` function load your sprites, the arguments below are

1. name or label for that texture i.e. `idle`
1. URL to the spritesheet `/idle.png`
1. URL to the `idle.json` file that acts like a map or atlas for the spritesheet

```javascript
this.load.atlas('idle', '/idle.png', '/idle.json')
```
Access the sprites in the `create` function and map the animation frames.
```javascript
console.log(this.textures.get('idle').getFrameNames())
```
Anoying they don't have a consistent naming pattern. I might rewrite the frame names with a script like this:
```javascript
const frames = require('./static/idle.json')
const path = require('path')
const fs = require('fs')
const renamed = frames.frames.map((frame, index) => Object.assign(frame, {filename: `angel_${index < 10 ? "0" : ""}${index}.png`}))
fs.writeFileSync(path.join(__dirname, "static", "idle_renamed.json"), JSON.stringify({...frames, frames: renamed}))
```
Now back in the `create` function we only need to do 3 things:

1. create an animation
1. add a labeled sprite
1. play the animation for the sprite

```javascript
    this.anims.create({
        key: 'idle',
        frames: this.anims.generateFrameNames('idle', {
            start: 0,
            end: 35,
            prefix: "angel_",
            zeroPad: 2,
            suffix: ".png"
        }),
        frameRate: 12,
        repeat: -1
    })

    this.angel = this.add.sprite(100, 200, 'angel')
    this.angel.play('idle')
```
![fallen angel sprite](https://user-images.githubusercontent.com/4499581/220946416-f4d0ed22-3da6-4480-a007-ee03c4ed0663.png)
Wow, she is enormous. We can down scale her. Update the line where we add the sprite.
```javascript
this.angel = this.add.sprite(100, 200, 'angel').setScale(0.25)
```

## The need to control

Now you see her idling don't you want to be able to move her? The programming tasks we are going to build out now are similar to what we have done above. The next thing now is starting to use the update function. Our game has an tick. Like a clock ticks every second, our game will run the update function 60 times a second. This is where the idea of a 'game engine' comes from this ticking, a programming pattern that will repeatedly call a function like the ticking of an engine. Action will be driven by these update functions. We are going to be checking for keyboard inputs, and then updating our character to have momentum that relates to a key press direction and an animation that does the same.

1. Load additional movement artwork
1. Create animations for directional movement
1. Create keyboard events
1. Update the characters state depending on keyboard inputs

## Preload

Can you figure out how to do this from the steps you have already seen?

## Create

You should be able to add the other animations, i.e. 'right-walk'. Below is the code to initialise the keyboard listeners. To apply velocity the sprite needs to be attached to the physics engine. Instead of `this.add.sprite(100, 200, 'angel').setScale(0.25)`. You will need to use `this.physics.add.sprite(100, 200, 'angel').setScale(0.25)` see there we are adding the sprite to the `this` context of the game via the `physics` engine. Now we'll be able to apply forces to our sprite.
```javascript
this.cursors = this.input.keyboard.createCursorKeys()
this.angel = this.physics.add.sprite(100, 200, 'angel').setScale(0.25)
```

## Update

```javascript
    if (this.cursors.right.isDown) {
        this.angel.flipX = false
        this.angel.setVelocityX(300)
        this.angel.play('right_walk', true)
    } else if (this.cursors.left.isDown) {
        this.angel.setVelocityX(-300)
        this.angel.play('right_walk', true)
        this.angel.flipX = true
    } else {
        this.angel.setVelocityX(0)
        this.angel.play('idle', true)       
    }
```

Do you think you can make her jump? then slash, throw etc

## Her world

Finally before leaving the character lets think a little more about the container of the world in which she lives. We can apply forces to our character that simulate gravity and this can help the feeling of being in a more realistic environment. In the game config can you see the `debug` flag. At the moment it is set to be false, can you switch it to be true?

Now you can see the physics acting on the sprite. We are going to take a moment to appreciate a few things now about the bounding box around a sprite and the way that physics acts on bodies in the world. We can start by applying gravity to the scene. In the game config, give the `y` value something like 333.

```javascript
new Phaser.Game({
    type: Phaser.AUTO,
    width: 16 * 64,
    height: 12 * 64,
    backgroundColor: '#888',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 333 },
            debug: true
        }
    },
    scene: { preload, create, update }
})
```
Now our playable character just falls out of the world. For now we can bound her in by adding `setCollideWorldBounds(true)` to the character. In the table below I'm trying to communicate to you the ways setOrigin and setSize effect the physical positioning of the character and the way it will effect the collide and interaction with other physical bodies in the world.

Here is the initial config

```javascript
    this.angel = this.physics.add.sprite(100, 200, 'idle')
        .setScale(0.25)
        .setSize(300, 600)
        .setOrigin(.5, 1)
        .setCollideWorldBounds(true, 0.2, 0.2)
```

|Effect|Properties|
|:-----|:---------|
![image of physics bounding box](https://user-images.githubusercontent.com/4499581/220971625-252867b8-b5c0-409d-94bc-29b2bbcd2809.png)|setSize(100,100)<br/>setOrigin(0.5,0.5)
![image of physics bounding box](https://user-images.githubusercontent.com/4499581/220971632-bf268925-3adb-49c4-be26-079af7d00144.png)|setSize(150,100)<br/>setOrigin(  0,0.5)
![image of physics bounding box](https://user-images.githubusercontent.com/4499581/220971636-6c3aa034-a861-4789-a8bc-29d33887305b.png)|setSize(150,150)<br/>setOrigin(  1, 1)
![image of physics bounding box](https://user-images.githubusercontent.com/4499581/220971639-416440de-11a6-4273-9d8d-b67a517f62b0.png)|setSize(300,600)<br/>setOrigin(  1, 1)
![image of physics bounding box](https://user-images.githubusercontent.com/4499581/220971644-7664ba13-f0a3-4b4e-ab54-c609fd0bcc42.png)|setSize(300,600)<br/>setOrigin(0.5,0.5)

## Tiled

To create a world that our player can start to explore I have been using a free program called [Tiled](https://www.mapeditor.org/). This is were we can design our level, the world for our character to explore. Download yourself a copy and find a 2D tileset to start working with. This is what I'm using.

* [https://brullov.itch.io/oak-woods](https://brullov.itch.io/oak-woods)
* [https://anokolisa.itch.io/moon-graveyard](https://anokolisa.itch.io/moon-graveyard)

Look at the tile size for the artwork you have downloaded. These packs are 32 x 32. When you open Tiled create a new map and set the tile size to match your artpack, and decide the size of map you want to create. I'm creating a long level so 72 tiles wide and 12 tiles high.

![the settings in Tiled for a new map](https://user-images.githubusercontent.com/4499581/221217536-4d70fa90-b0f5-4564-91b0-322b8a7a5ce8.png)

Now we are ready to start building our world in the form of a tiled map. Your tileset will give you pieces of artwork that you can piece together like a jigsaw puzzle. Use layers to seperate elements in your design, you will end up importing the map layer by layer in your code.

![Tiled interface labeled](https://user-images.githubusercontent.com/4499581/221217271-ed5d0faa-2f47-45fd-81fe-c8c774eeb0f9.jpg)

Now, pop on some tunes and get creative!

![working in Tiled animation](https://user-images.githubusercontent.com/4499581/221853024-8cefa5d7-4faf-4813-aa85-d6e143251535.gif)

When you are done or done enough to start testing your map goto __File -> Export As -> filename.json__ and export as a json file, you need to serve the file to your frontend code so save it into your _public_ folder or in this project it will go in the `static` folder. Any tileset artwork also needs to be served to your frontend and also needs to be in the `static` folder.

## Import the tilemap

We need both the json mapping and the artwork. We load these in the preload function, then we'll create the `map` instance and then add all the layers one by one. Below is an example of the preload function I needed. Can you spot the Tiled json file being loaded?

```javascript
function preload () {
    this.load.atlas('idle', '/idle.png', '/idle.json')
    this.load.atlas('move', '/move.png', '/move.json')
    this.load.tilemapTiledJSON('tilemap', '/moon-level.json')
    this.load.image('bg0', '/tileset_artwork/Background_0.png')
    this.load.image('bg1', '/tileset_artwork/Background_1.png')
    this.load.image('bg_brush', '/tileset_artwork/brush.png')
    this.load.image('bg_grass_1', '/tileset_artwork/Grass_background_1.png')
    this.load.image('bg_grass_2', '/tileset_artwork/Grass_background_2.png')
    this.load.image('bg_tiles', '/tileset_artwork/Tiles.png')
}
```
In the create function we will make our tilemap it's quite fun to have a look at the generated json, you should be able to guess whats going on behind the scenes in the phaser code to join the artwork with our json map.
```javascript
    const map = this.make.tilemap({key: 'tilemap'})
    
    // 'Background_0' comes from the moon-level.json - 'bg0' is my label set in the preload function
    const bg1 = map.addTilesetImage('Background_0', 'bg0')
    const bgFence = map.addTilesetImage('Background_1', 'bg1')
    const bush = map.addTilesetImage('brush', 'bg_brush')
    const grass_1 = map.addTilesetImage('Grass_background_1', 'bg_grass_1')
    const grass_2 = map.addTilesetImage('Grass_background_2', 'bg_grass_2')
    const tiles = map.addTilesetImage('Tiles', 'bg_tiles')
    // The arrays are all the art sheets a layer needs
    map.createLayer('Moon-sky', [bg1], 0, 0)
    map.createLayer('Bg-fence', [bg1, bgFence], 0, 0)
    map.createLayer('bush', [bush, grass_1, grass_2, tiles], 0, 0)
    map.createLayer('path', [tiles], 0, 0)
    map.createLayer('foreground-dressing', [bgFence, bush, grass_1, grass_2, tiles], 0, 0)
```
The code above is in three stages. 

1. Create the tilemap instance (from the json)
1. Attach the artwork files to the json map
1. Now add the layers to the game window with `createLayer`

The `0, 0` in `createLayer` is the x and y coordinate to position the layer. Now you should see your Angel character rendered along with the tilemap. The feeling of our world is coming together. The final step for this workshop is to start connecting these 2 things together, the world and the character.

## Collision and occlusion

To stop the character falling through the world we need to create obstructive contact or cause the character to collide and stop on the path. For this I'm going back to the Tiled map and going to create not a tiled layer by an object layer. On this object layer we are going to create an invisible polygon (multi sided shape) that will define areas our character will be obstructed by.

![polygon tool](https://user-images.githubusercontent.com/4499581/221908252-17144325-6e7a-4c0f-9fd3-efc48a7c9803.png)

Use the polygon tool to click and create a shape. Click on the original point to complete the polygon. In the properties section (top left hand corner) give the shape a name to reference in your code later.

![polygon in Tiled](https://user-images.githubusercontent.com/4499581/221908291-cccfa828-b075-43e7-bdfe-25743959cb81.png)

Save the updated tilemap, re export as json. Now you can bring this polygon shape into your game code. First we'll find the object we just name (using it's name) then reformat the line data from this:
```javascript
[
    {
        "x":0,
        "y":0
    }, 
    {
        "x":556.655665566557,
        "y":4.40044004400443
    }, 
    {
        "x":556.655665566557,
        "y":-125.412541254125
    }
]
```
To data that looks like this:
```javascript
"0 0 556.655665566557 4.40044004400443 556.655665566557 -125.412541254125"
```
That what `coords` ends up being a string of __x, y__ values separated by spaces.
```javascript
    const platformOcclusion = map.findObject('occlusions', obj => obj.name === 'platform')
    const coords = platformOcclusion.polygon.map(({x, y}) => ([x, y])).flat().join(" ")

    const platformPolygon = this.add.polygon(platformOcclusion.x, platformOcclusion.y, coords, 0xff66ff, 0.2).setOrigin(0, 0)
    this.matter.add.gameObject(platformPolygon, {
        isStatic: true,
        shape: {
            type: 'fromVerts', 
            verts: coords,
            flagInternal: true
        }
    }).setVisible(false).setPosition(
        platformPolygon.x + platformPolygon.body.centerOffset.x,
        platformPolygon.y + platformPolygon.body.centerOffset.y
    )
```
Reading the code we get our data from the tilemap, reformat it, create a polygon shape, then we attach matter physics to that shape by using it to create a `gameObject`. The chaining functions render the shape invisible, and adjust it's position because the center of the gameObject is calculated by center of mass not geometrically. So we overide that and position the shape as if the origin was it's top left-hand corner.

## Now we need to jump

Can you update the character to jump? Now we have obstacles we can climb onto! You can be more fancy and add the jumping animation that is in the artwork if you want to. Just for functionality I'm going to just listen for the up arrow key and add some vertical velocity in the update function

```javascript
    if(this.cursors.up.isDown) {
        this.angel.setVelocityY(-12)
    }
```

## Finally cameras

The level is longer that the viewport, so we can travel into the map to manage that we just need to get the camera to follow the character as we move, and offset it so the map does not appear to moved when when the camera focuses on the character. Add these 2 lines to the create function. You might need to adjust the bounds of the world depending on your map's width and height.

```javascript
    this.cameras.main.setBounds(0, 0, 64 * 72, 64 * 12)
    this.cameras.main.startFollow(this.angel)
```
## Summary

We have built a game from scratch. A playable character and a world for them to explore. Finally we have introduced collision and cameras. These tricks enable us to establish a world. In the next workshop we will need to think more about game state and starting to manage more intricate interactions.
