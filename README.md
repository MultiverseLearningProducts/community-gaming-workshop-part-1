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
        default: 'arcade',
        arcade: {
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

