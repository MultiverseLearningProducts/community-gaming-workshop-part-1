import Phaser from 'phaser'

function preload () {
    this.load.atlas('idle', '/idle.png', '/idle.json')
    this.load.atlas('move', '/move.png', '/move.json')
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
    
    this.anims.create({
        key: 'walk',
        frames: this.anims.generateFrameNames('move', {
            start: 12,
            end: 31,
            prefix: "angel_move_",
            zeroPad: 2,
            suffix: ".png"
        }),
        frameRate: 16,
        repeat: -1
    })

    this.cursors = this.input.keyboard.createCursorKeys()
    this.angel = this.physics.add.sprite(100, 200, 'idle')
        .setScale(0.25)
        .setSize(300, 600)
        .setOrigin(.5, .5)
        .setCollideWorldBounds(true, 0.2, 0.2)
}

function update () {
    if (this.cursors.right.isDown) {
        this.angel.flipX = false
        this.angel.setVelocityX(150)
        this.angel.play('walk', true)
    } else if (this.cursors.left.isDown) {
        this.angel.setVelocityX(-150)
        this.angel.play('walk', true)
        this.angel.flipX = true
    } else {
        this.angel.setVelocityX(0)
        this.angel.play('idle', true)       
    }
}

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