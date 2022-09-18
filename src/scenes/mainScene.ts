import Phaser, { GameObjects, Textures, Tweens } from 'phaser'

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
	constructor()
	{
		super('hello-world');
	}

	preload()
    {     
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
    }

    create()
    {
        this.arrTiles= this.add.container(0, 0);
        this.posTiles=new Array();
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
        const rainbow = this.add.sprite(115, 500, 'RAINBOW').setScale(0.49).setInteractive();
        const shuffle = this.add.sprite(250, 500, 'SHUFFLE').setScale(0.49).setInteractive();
        var pathGraphics = this.add.graphics();
        pathGraphics.visible=false;
        
        this.input.on('pointerdown', function(this,pointer,gameObject){
            if(gameObject.length == 0){
                return;
            }
            if(gameObject[0].texture.key.includes('SHUFFLE')){
                gameObject[0].setTexture('SHUFFLE_on');
                var posUsed=new Array();
                for(var tile of this.scene.arrTiles.list){
                    var posUsedTrue=false;
                    while(posUsedTrue===false){
                        const random = Math.floor(Math.random() * this.scene.posTiles.length);
                        if(posUsed.indexOf(this.scene.posTiles[random])===-1){
                            
                            posUsed.push(this.scene.posTiles[random]);
                            posUsedTrue=true;
                        }
                    }

                    this.scene.tweens.add({
                        targets:tile,
                        x: posUsed[posUsed.length-1].x,
                        y: posUsed[posUsed.length-1].y,
                        duration:500
                    });
                }
            }else{  
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
              rainbow.setTexture('RAINBOW');
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
                        }
                    }
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
    
    update(time: number, delta: number): void {
        if(!this.pointer.isDown && this.afterClick){ 
            var selectedTiles=new Array();
            var timerEvent;
            for(var value of this.arrTiles.list){   
                this.selectTilesCheck(value,selectedTiles);
            }
            if(selectedTiles.length>=3){
                this.dropTiles(selectedTiles,this.arrTiles.list);
                timerEvent = this.time.delayedCall(1100, this.initTiles, [selectedTiles,this.arrTiles.list,this.posTiles], this);
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
            var dropTween=this.tweens.add({
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
                    dropTween.resume();
                }
            });
        }
    }
    initTiles(selectedTiles,arrTiles,posTiles){
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
    }
}

