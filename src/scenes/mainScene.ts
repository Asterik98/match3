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
    }

    create()
    {
        this.arrTiles= this.add.container(0, 0);
        this.posTiles=new Array();
        var currentColor;
        var groupPath=new Array();
        var currentPath=new Array();
        let path=new Phaser.Curves.Path();
        this.pointer = this.input.activePointer;
        this.selectedTiles;
        this.input.mouse.disableContextMenu();
        for (let x = 1; x <= 7; x++) {
            for (let y = 1; y <= 7; y++){
                const random = Math.floor(Math.random() * this.colorTiles.length);
                var xAxis,yAxis;
                if(x%2==1){
                    yAxis=100+20+(y*43);
                }else{
                    yAxis=100+(y*43);
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
        var pathGraphics = this.add.graphics();
        pathGraphics.visible=false;
        this.input.on('pointerdown', function(this,pointer,gameObject){
            if(gameObject.length == 0){
                return;
              }
              // remember Starting Color
              currentColor = gameObject[0].texture.key.slice(0,-2);
              currentPath.push(gameObject[0]);
              path=new Phaser.Curves.Path(gameObject[0].x,gameObject[0].y);
              pathGraphics.visible=true;
              currentPath[currentPath.length-1].setTexture(currentColor+"_2");
        });
        this.input.on('pointerup', function(this,gameObject){
            if(gameObject.length == 0){
                return;
              }
              pathGraphics.clear();
              currentPath= [];
              groupPath=[];
              path.curves.length = 0;
              pathGraphics.visible = false;
        });
        this.input.on('pointerover', function(this,pointer,gameObject){
            if(pointer.isDown){
                if(gameObject[0] && gameObject[0].texture.key.includes(currentColor)&& Math.abs(gameObject[0].x-currentPath[currentPath.length-1].x)/35<=1 && Math.abs(gameObject[0].y-currentPath[currentPath.length-1].y)/43<=1){
                    if(currentPath.indexOf(gameObject[0])===-1){
                        groupPath.push(currentPath[currentPath.length-1]);
                        currentPath.push(gameObject[0]);
                        currentPath[currentPath.length-1].setTexture(currentColor+"_2");
                        groupPath.push(currentPath[currentPath.length-1]);
                    
                    }else{
                        if(currentPath.length!==1){
                            currentPath[currentPath.length-1].setTexture(currentColor+"_1");
                            currentPath.pop();
                            groupPath.pop();
                            path.curves.length = 0;
                        }
                    }
                    for(var curPath of groupPath){
                        path.lineTo(curPath.x,curPath.y);
                    }
                    pathGraphics.clear();
                    pathGraphics.lineStyle(2, 0xffffff, 1);
                    path.draw(pathGraphics);
                }
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
                timerEvent = this.time.delayedCall(2000, this.initTiles, [selectedTiles,this.arrTiles.list,this.posTiles], this);
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

