import 'phaser';

export default class mainScene extends Phaser.Scene{
    arrTiles;
    posTiles;
    colorTiles: Array<string>=["RED_1","BLUE_1","PURPLE_1","YELLOW_1","GREEN_1"];
    afterClick=false;
    selectedTiles;
    pointer;
    pathGraphics;
    currentColor;
    currentPaths;
    path;
    scoreText;
    levelText;
    timedEvent;
    scoreTween;
    initScore;
    startPoint;
    hpbarbg;
    bar;
    getPointFx;
    dropTileFx;
    nextLevelFx;
    backgroundFx;
    groupTiles;
	constructor()
	{
		super('hello-world');
	}

	preload()
    {     
        this.load.spritesheet('tileFx', 'assets/tiles_fx/tiles_fx.png',{frameWidth:145,frameHeight:153});
        this.load.spritesheet('tileSelectFx', 'assets/tiles_select/tiles_select.png',{frameWidth:114,frameHeight:105});
        this.load.image('BLUE_1', 'assets/tiles/BLUE_1.png');
        this.load.image('BLUE_2', 'assets/tiles/BLUE_2.png');
        this.load.image('GREEN_1', 'assets/tiles/GREEN_1.png');
        this.load.image('GREEN_2', 'assets/tiles/GREEN_2.png');
        this.load.image('PURPLE_1', 'assets/tiles/PURPLE_1.png');
        this.load.image('PURPLE_2', 'assets/tiles/PURPLE_2.png');
        this.load.image('RED_1', 'assets/tiles/RED_1.png');
        this.load.image('RED_2', 'assets/tiles/RED_2.png');
        this.load.image('YELLOW_1', 'assets/tiles/YELLOW_1.png');
        this.load.image('YELLOW_2', 'assets/tiles/YELLOW_2.png');
        this.load.image('hpBg', 'assets/hpbar/hpbar_bg.png');
        this.load.image('hpbarfill', 'assets/hpbar/hpbar_fill.png');
        this.load.image('hpbarfillwhite', 'assets/hpbar/hpbar_fill_white.png');
        this.load.image('hpbarframe', 'assets/hpbar/hpbar_frame.png');
        this.load.image('RAINBOW', 'assets/booster/RAINBOW.png');
        this.load.image('RAINBOW_off', 'assets/booster/RAINBOW_off.png');
        this.load.image('RAINBOW_on', 'assets/booster/RAINBOW_on.png');
        this.load.image('SHUFFLE', 'assets/booster/SHUFFLE.png');
        this.load.image('SHUFFLE_off', 'assets/booster/SHUFFLE_off.png');
        this.load.image('SHUFFLE_on', 'assets/booster/SHUFFLE_on.png');
        this.load.image('hpbar_bg','assets/hpbar/hpbar_bg.png');
        this.load.image('hpbar_fill','assets/hpbar/hpbar_fill.png');
        this.load.image('hpbar_fill_white','assets/hpbar/hpbar_fill_white.png');
        this.load.image('hpbar_frame','assets/hpbar/hpbar_frame.png');
        this.load.audio('backMusic', 'assets/Song/251461__joshuaempyre__arcade-music-loop.wav');
        this.load.audio('getPointFx', 'assets/Song/341695__projectsu012__coins-1.wav');
        this.load.audio('tilePointedFX', 'assets/Song/508482__junggle__water-plap.wav');
        this.load.audio('tileDropFX', 'assets/Song/243400__freakinbehemoth__woosh.wav');
        this.load.audio('nextLevelFX', 'assets/Song/403012__inspectorj__ui-confirmation-alert-a5.wav');
    }
    create()
    {
        this.initScore=[10];
        this.startPoint=[10];
        this.arrTiles= this.add.container(0, 0);
        this.posTiles=new Array();
        this.groupTiles=new Array();
        var currentColor;
        var groupPath=new Array();
        let path=new Phaser.Curves.Path();
        this.pointer = this.input.activePointer;
        this.selectedTiles;
        this.input.mouse.disableContextMenu();
        for (let x = 1; x <= 7; x++) {
            for (let y = 1; y <= 7; y++){
                const random = Math.floor(Math.random() * this.colorTiles.length);
                var xAxis,yAxis;
                if(x%2==1){
                    yAxis=120+20+(y*43);
                }else{
                    yAxis=120+(y*43);
                }
                xAxis=45+(35*x);
                var tileSprite=this.add.sprite(xAxis,yAxis,this.colorTiles[random]);
                this.posTiles.push({x:xAxis,y:yAxis});
                var frame = tileSprite.frame;
                var hitArea = new Phaser.Geom.Rectangle(frame.x, frame.y, frame.width, frame.height);
                tileSprite.setScale(0.49).setInteractive(hitArea,Phaser.Geom.Rectangle.Contains);
                this.arrTiles.add(tileSprite);
            } 
        }
        this.hpbarbg = this.add.sprite(187, 50, 'hpbar_bg').setScale(3);
        const hpbarfillwhite = this.add.sprite(187, 50, 'hpbar_fill_white').setScale(3);
        const rainbow = this.add.sprite(115, 500, 'RAINBOW').setScale(0.49).setInteractive();
        const shuffle = this.add.sprite(255, 500, 'SHUFFLE').setScale(0.49).setInteractive();
        this.levelText = this.add.text(150, 20, 'Level 1');
        this.timedEvent;
        this.bar = this.add.graphics();
        this.bar.fillRect(this.hpbarbg.getTopLeft().x+5,this.hpbarbg.getTopLeft().y+3, (this.hpbarbg.width*3)-10, (this.hpbarbg.height*3)-5);
        this.bar.fillStyle(0xff0000);
        this.scoreText = this.add.text(175, 43, '10').setTint(0x00000);
        const hpbarframe = this.add.sprite(187, 50, 'hpbar_frame').setScale(3);
        var pathGraphics = this.add.graphics();
        pathGraphics.visible=false;
        this.backgroundFx= this.sound.add('backMusic',{volume: 0.3});
        this.backgroundFx.play({loop: true});
        var tilePointedFx = this.sound.add('tilePointedFX');
        this.getPointFx = this.sound.add('getPointFx');
        this.dropTileFx= this.sound.add('tileDropFX',{volume: 2.5});
        this.nextLevelFx= this.sound.add('nextLevelFX');
        this.anims.create({
            key: "tilefxAnim",
            frameRate: 7,
            frames: this.anims.generateFrameNumbers("tileFx", { start: 0, end: 23 }),
            repeat: -1
        });
        this.anims.create({
            key: "tileSelectfxAnim",
            frameRate: 7,
            frames: this.anims.generateFrameNumbers("tileSelectFx", { start: 0, end: 23 }),
            repeat: -1
        });
        this.input.on('pointerdown', function(this,pointer,gameObject){
            if(gameObject.length == 0){
                return;
            }
            if(gameObject[0].texture.key.includes('RAINBOW')){
                gameObject[0].setTexture('RAINBOW_on');
                var rainbowTile=new Array();
                var loop=0;
                while(rainbowTile.length<3 && loop<=49){
                    const random = Math.floor(Math.random() * this.scene.arrTiles.length);
                    rainbowTile.push(this.scene.arrTiles.list[random]);
                    var currentTexture=rainbowTile[0].texture.key;
                    for(var tile of this.scene.arrTiles.list){
                        if(tile.texture.key.includes(currentTexture)&& Math.abs(tile.x-rainbowTile[rainbowTile.length-1].x)/35<=1 && Math.abs(tile.y-rainbowTile[rainbowTile.length-1].y)/43<=1){ 
                            if(rainbowTile.indexOf(tile)===-1){
                                rainbowTile.push(tile);
                            }
                        }   
                    }
                    if(rainbowTile.length>=3){
                        for(var tile of rainbowTile){
                            this.scene.arrTiles.list[this.scene.arrTiles.list.indexOf(tile)].setTexture(tile.texture.key.replace(/1$/,"2"));
                        }
                    }else{
                        rainbowTile.splice(0);
                    }
                    loop++;
                    if(loop>49){
                        this.scene.shuffleTiles();
                        break;
                    }   
                }
            }else if(gameObject[0].texture.key.includes('SHUFFLE')){
                this.scene.getPointFx.play();
                gameObject[0].setTexture('SHUFFLE_on');
                this.scene.shuffleTiles();
            }else{  
                tilePointedFx.play();
                gameObject[0][1]=this.scene.add.sprite(gameObject[0].x,gameObject[0].y,'tileSelectFx').setScale(0.49).play('tileSelectfxAnim');
                this.scene.groupTiles.push(gameObject[0][1]);
                currentColor = gameObject[0].texture.key.slice(0,-2);
                groupPath.push(gameObject[0]);
                path=new Phaser.Curves.Path(gameObject[0].x,gameObject[0].y);
                pathGraphics.visible=true;
                groupPath[groupPath.length-1].setTexture(currentColor+"_2");
            }
        });
        this.input.on('pointerup', function(this,gameObject){
            if(gameObject.length == 0){
                return;
              }
              this.scene.groupTiles.splice(0);
              shuffle.setTexture('SHUFFLE');
              pathGraphics.clear();
              groupPath.splice(0);
              path.curves.length = 0;
              pathGraphics.visible = false;
        });
        this.input.on('pointerover', function(this,pointer,gameObject){
            if(gameObject[0].texture.key.includes('SHUFFLE')){
                gameObject[0].setTexture('SHUFFLE_off');
            }
            else if(pointer.isDown){
                if(gameObject[0] && gameObject[0].texture.key.includes(currentColor)&& Math.abs(gameObject[0].x-groupPath[groupPath.length-1].x)/35<=1 && Math.abs(gameObject[0].y-groupPath[groupPath.length-1].y)/43<=1){
                    if(groupPath.indexOf(gameObject[0])===-1){
                        groupPath.push(gameObject[0]);
                        gameObject[0].setTexture(currentColor+'_2');
                        path.lineTo(groupPath[groupPath.length-1].x,groupPath[groupPath.length-1].y);
                        gameObject[0][1]=this.scene.add.sprite(gameObject[0].x,gameObject[0].y,'tileSelectFx').setScale(0.49).play('tileSelectfxAnim');
                        this.scene.groupTiles.push(gameObject[0][1]);
                        if(this.scene.groupTiles.length>=3){
                            console.log(this.scene.groupTiles.length);
                            for(var tile of this.scene.groupTiles){
                                tile.setTexture('tileFx');
                                tile.play('tilefxAnim');
                            }
                        }
                    }else{
                        if(groupPath.length!==1 && groupPath.indexOf(gameObject[0])!==groupPath.length-1){
                            groupPath[groupPath.length-1].setTexture(currentColor+"_1");
                            groupPath.pop();
                            console.log(path.curves[0]);
                            path.curves.length=0;
                            path=new Phaser.Curves.Path(groupPath[0].x,groupPath[0].y);
                            for(var obj of groupPath){
                                path.lineTo(obj.x,obj.y);
                            }
                            this.scene.groupTiles[this.scene.groupTiles.length-1][1].setTexture('tileSelectFx').play('tileSelectfxAnim');
                            this.scene.groupTiles.pop();
                        }
                    }

                    tilePointedFx.play();
                    pathGraphics.clear();
                    pathGraphics.lineStyle(2, 0xffffff, 1);
                    path.draw(pathGraphics);
                }
            }
        });
        this.input.on('pointerout', function(this,pointer,gameObject){
            if(gameObject[0].texture.key.includes('SHUFFLE')){
                gameObject[0].setTexture('SHUFFLE');
            }
        });
    }
    shuffleTiles(){
        var posUsed=new Array();
                for(var tile of this.arrTiles.list){
                    var posUsedTrue=false;
                    while(posUsedTrue===false){
                        const random = Math.floor(Math.random() * this.posTiles.length);
                        if(posUsed.indexOf(this.posTiles[random])===-1){
                            posUsed.push(this.posTiles[random]);
                            posUsedTrue=true;
                        }
                    }
                    this.tweens.add({
                        targets:tile,
                        x: posUsed[posUsed.length-1].x,
                        y: posUsed[posUsed.length-1].y,
                        duration:500
                    });
                }
    }
    update(time: number, delta: number): void {
        if(!this.pointer.isDown && this.afterClick){ 
            var selectedTiles=new Array();
            var timerEvent;
            this.timedEvent;
            for(var value of this.arrTiles.list){   
                this.selectTilesCheck(value,selectedTiles);
            }
            if(selectedTiles.length>=3){
                this.getPointFx.play();
                this.dropTiles(selectedTiles,this.arrTiles.list);
                timerEvent = this.time.delayedCall(1100, this.initTiles, [selectedTiles,this.arrTiles.list,this.posTiles,this.scoreText,this.initScore,
                    selectedTiles.length,this.startPoint,this.hpbarbg,this.bar,this.levelText,this.dropTileFx,this.nextLevelFx], this);
            }else{
                selectedTiles.splice(0);
            }
            this.afterClick=false;
        }
        if(this.pointer.isDown){
            this.afterClick=true;
        }
    }
    selectTilesCheck(value, selectedTiles){
        if(value.texture.key.slice(-1)=='2'){
            value.setTexture(value.texture.key.replace(/2$/,"1"));
            value[1].destroy();
            selectedTiles.push(value);
        }
    }

    dropTiles(selectedTiles,arrTiles){
        for(var tile of arrTiles){
            var posY=0;
            for(var sel of selectedTiles){
                if(tile.x===sel.x && tile.y<sel.y && tile.visible===true){
                    posY=posY+43;
                }
            }
            this.tweens.add({
                targets:tile,
                y:'+='+posY.toString(),
                duration:500,
                delay:500,
            });
            posY=0;
        }
        for(var sel of selectedTiles){
            this.tweens.add({
                targets:arrTiles[arrTiles.indexOf(sel)],
                x: 200,
                y: 0,
                duration:500,
                onComplete: function (this) { 
                    for(var obj of selectedTiles){
                        arrTiles[arrTiles.indexOf(obj)].visible=false;
                    }
                }
            });
        }
    }
    initTiles(selectedTiles,arrTiles,posTiles,scoreText,initScore,length,startPoint,hpbarbg,bar,levelText,dropTileFx,nextLevelFx){
        dropTileFx.play();
        var emptyPos= new Array();
        for(var tile of posTiles){
            if(arrTiles.find((obj)=>{return obj.x===tile.x&&obj.y===tile.y})===undefined){
                emptyPos.push(tile);
            }
        }
        for(var i=0;i<selectedTiles.length;i++){
            const random = Math.floor(Math.random() * this.colorTiles.length);
            arrTiles[arrTiles.indexOf(selectedTiles[i])].setTexture(this.colorTiles[random]);
            arrTiles[arrTiles.indexOf(selectedTiles[i])].visible=true;
            this.tweens.add({
                targets:arrTiles[arrTiles.indexOf(selectedTiles[i])],
                x:emptyPos[i].x,
                y:emptyPos[i].y,
                duration:500,
            });
        }
        
        var scoreRedTween=this.tweens.addCounter({
            from:startPoint[0],
            to: Math.max(0,startPoint-(length*20)),
            duration:500,
            onUpdate:function(this){
                scoreText.setText(Math.floor(scoreRedTween.getValue()).toString());
                bar.commandBuffer[3]=hpbarbg.width*(scoreRedTween.getValue()/initScore[0])*3+10;
            },
            onComplete:function(this){
                if(scoreRedTween.getValue()===0){
                    initScore[0]=initScore[0]*2;
                    scoreText.setText(initScore[0]);
                    startPoint[0]=initScore[0];
                    levelText.text="Level "+(parseInt(levelText.text.slice(-1))+1).toString();
                    nextLevelFx.play();
                    scoreAddTween.resume();
                }else{
                    startPoint[0]=scoreRedTween.getValue();
                }
            },
        });
        var scoreAddTween=this.tweens.addCounter({
            from:0,
            to: initScore[0]*2,
            duration:500,
            paused:true,
            onUpdate:function(this){
                scoreText.setText(Math.floor(scoreAddTween.getValue()).toString());
                bar.commandBuffer[3]=(hpbarbg.width*scoreAddTween.progress)*3-10;
            },
        });
    }
}