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
  // other package.json stuff
  "source": "src/index.html",
  "scripts": {
    "start": "parcel",
  },
  // other package.json stuff
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
Wow, she is enormous. We can down scale her.
```javascript
this.angel.setScale(0.25)
```