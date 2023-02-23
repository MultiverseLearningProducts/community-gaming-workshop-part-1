import Phaser from 'phaser'

function preload () {
    this.load.atlas('idle', '/idle.png', '/idle.json')
}

function create () {
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

    this.angel = this.add.sprite(100, 200, 'angel').setScale(0.25)
    this.angel.play('idle')
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