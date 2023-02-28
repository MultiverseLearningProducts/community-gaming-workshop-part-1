import Phaser from 'phaser'

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
    
    this.angel = this.matter.add.sprite(100, 200, 'idle')
        .setScale(0.15)
        .setDepth(1)
        .setRectangle(30, 80)
        .setFixedRotation()

    this.angel.isJumping = false

    const map = this.make.tilemap({key: 'tilemap'})
    
    // 'Background_0' comes from the moon-level.json - 'bg0' is my label set in the preload function
    const bg1 = map.addTilesetImage('Background_0', 'bg0')
    const bgFence = map.addTilesetImage('Background_1', 'bg1')
    const bush = map.addTilesetImage('brush', 'bg_brush')
    const grass_1 = map.addTilesetImage('Grass_background_1', 'bg_grass_1')
    const grass_2 = map.addTilesetImage('Grass_background_2', 'bg_grass_2')
    const tiles = map.addTilesetImage('Tiles', 'bg_tiles')
    // The arrays are all the artsheets a layer needs
    map.createLayer('Moon-sky', [bg1], 0, 0)
    map.createLayer('Bg-fence', [bg1, bgFence], 0, 0)
    map.createLayer('bush', [bush, grass_1, grass_2, tiles], 0, 0)
    map.createLayer('path', [tiles], 0, 0)
    map.createLayer('foreground-dressing', [bgFence, bush, grass_1, grass_2, tiles], 0, 0)
    
    const platformOcclusion = map.findObject('occlusions', obj => obj.name === 'platform')
    const coords = platformOcclusion.polygon.map(({x, y}) => ([x, y])).flat().join(",")

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

    this.cameras.main.setBounds(0, 0, 64 * 72, 64 * 12)
    this.cameras.main.startFollow(this.angel)
}

function update () {
    if (this.cursors.right.isDown) {
        this.angel.flipX = false
        this.angel.setVelocity(5, 3)
        this.angel.play('walk', true)
    } else if (this.cursors.left.isDown) {
        this.angel.setVelocity(-5, 3)
        this.angel.play('walk', true)
        this.angel.flipX = true
    } else {
        this.angel.setVelocityX(0)
        this.angel.play('idle', true)       
    }

    if(this.cursors.up.isDown) {
        this.angel.setVelocityY(-12)
    }
}

new Phaser.Game({
    type: Phaser.AUTO,
    width: 16 * 64,
    height: 12 * 64,
    backgroundColor: '#888',
    physics: {
        default: 'matter',
        matter: {
            gravity: { y: 3 },
            debug: false
        }
    },
    scene: { preload, create, update }
})