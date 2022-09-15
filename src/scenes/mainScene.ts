import Phaser, { GameObjects, Textures, Tweens } from 'phaser'

export default class mainScene extends Phaser.Scene{
    arrTiles;
    colorTiles: Array<string>=["RED_1","BLUE_1","PURPLE_1","YELLOW_1","GREEN_1"];
    afterClick=false;
    selectedTiles;
    dropTiles;
    deepestTiles;
    pointer;
    pathGraphics;
    isDragging;
    lineStartPositionX;
    lineStartPositionY;
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
        var lineStartPosition={x:0,y:0};
        var isDragging=false;
        var currentColor;
        var groupPath:Array<Tiles>= new Array<Tiles>();;
        var currentPath:Array<Tiles>= new Array<Tiles>();;
        let path=new Phaser.Curves.Path();
        this.pointer = this.input.activePointer;
        this.selectedTiles;
        this.input.mouse.disableContextMenu();
        for (let x = 1; x <= 7; x++) {
            for (let y = 1; y <= 7; y++){
                const random = Math.floor(Math.random() * this.colorTiles.length);
                if(x%2==1){
                    var tileSprite=this.add.sprite(20+(35*x),100+20+(y*43),this.colorTiles[random]);
                }else{
                    var tileSprite=this.add.sprite(20+(35*x),100+(y*43),this.colorTiles[random]);
                }
                var frame = tileSprite.frame;
                var hitArea = new Phaser.Geom.Rectangle(frame.x, frame.y, frame.width, frame.height);
                tileSprite.setScale(0.49).setInteractive(hitArea,Phaser.Geom.Rectangle.Contains).setOrigin(0);
                this.arrTiles.add(tileSprite);
            } 
        }
        var pathGraphics = this.add.graphics();
        pathGraphics.visible=false;
        this.input.on('pointerdown', function(this,pointer,gameObject){
            if(gameObject.length == 0){
                return;
              }
              isDragging = true;
              // remember Starting Color
              currentColor = gameObject[0].texture.key.slice(0,-2);
              currentPath.push(gameObject[0]);
              path.curves.length = 0;
              path.startPoint=gameObject[0];
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
              isDragging = false;
        });
        this.input.on('pointerover', function(this,pointer,gameObject){
            if(pointer.isDown){
                if(gameObject[0] && gameObject[0].texture.key.includes(currentColor)&& Math.abs(gameObject[0].x-currentPath[currentPath.length-1].x)/35<=1 && Math.abs(gameObject[0].y-currentPath[currentPath.length-1].y)/43<=1){
                    if(currentPath.indexOf(gameObject[0])===-1){
                        console.log('a');
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
            var selectedTiles: Array<Tiles>= new Array<Tiles>();
            var dropTiles: Array<Tiles>= new Array<Tiles>();
            var deepestSelTiles: Array<Tiles>= new Array<Tiles>();
            var deepestDropTiles: Array<Tiles>= new Array<Tiles>();
            for(var value of this.arrTiles.list){   
                this.selectTilesCheck(value,selectedTiles);
            }
            if(selectedTiles.length>=3){
                this.dropTilesGroup(selectedTiles,dropTiles);
                this.deepestSelectedTilesPosition(selectedTiles,deepestSelTiles);
                this.deepestDropTilesPosition(dropTiles,deepestDropTiles);
                this.destroyTilesOrNot(selectedTiles,dropTiles,deepestSelTiles,deepestDropTiles);
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
    dropTilesGroup(selectedTiles,dropTiles){
        for(var s of selectedTiles){
            for(var v of this.arrTiles.list){
                if(v.x===s.x && v.y < s.y){
                    if(selectedTiles.indexOf(v)==-1&&dropTiles.indexOf(v)==-1)
                        dropTiles.push(v);   
                }
            }
        }    
    }
    deepestSelectedTilesPosition(selectedTiles,deepestSelTiles){
        for(var s of selectedTiles){
            const checkTiles=deepestSelTiles.filter((obj) => {
                return obj.x === s.x;
                });
            if(checkTiles.length!=0){
                for(var a of checkTiles){
                    if(a.y<s.y){
                        deepestSelTiles.pop(a);
                        deepestSelTiles.push(s)
                    }
                }
            }else{
                deepestSelTiles.push(s);
            }
        }
    }
    deepestDropTilesPosition(dropTiles,deepestDropTiles){
        for(var s of dropTiles){
            const checkTiles=deepestDropTiles.filter((obj) => {
                return obj.x === s.x;
                });
            if(checkTiles.length!=0){
                for(var a of checkTiles){
                    if(a.y<s.y){
                        deepestDropTiles.pop(a);
                        deepestDropTiles.push(s)
                    }
                }
            }else{
                deepestDropTiles.push(s);
            }
        }
    }
    destroyTilesOrNot(selectedTiles,dropTiles,deepestSelTiles,deepestDropTiles){
        var posY;
        for(var tile of dropTiles){
            for(var deepDrop of deepestDropTiles){
                if(deepDrop.x==tile.x){
                    for(var deepSel of deepestSelTiles){
                        if(deepDrop.x==deepSel.x){
                            posY='+='+ (deepSel.y-deepDrop.y).toString();  
                        }
                    }
                }
            }
            var dropTween=this.tweens.add({
                targets:this.arrTiles.list[this.arrTiles.list.indexOf(tile)],
                y:posY,
                duration:500,
                delay:500,
                onComplete:function(){
                    selectedTiles.splice(0);
                    dropTiles.splice(0);
                    dropTween.stop();
                }
            });
        }
        for(var tile of selectedTiles){
            this.tweens.add({
                targets:this.arrTiles.list[this.arrTiles.list.indexOf(tile)],
                x: 200,
                y: 0,
                duration:500,
                onComplete: function (this) { 
                    for(var obj of selectedTiles){
                        obj.destroy();
                    }
                    dropTween.resume();
                }
            });
        }
    } 
}
    
export class Tiles extends Phaser.GameObjects.Image{ 

    color:string;
    constructor(scene,x, y,color,scale) {
        super(scene,x,y,color,scale);
        this.x=x;
        this.y=y;
        this.color=color;
        this.setTexture(color).setScale(scale);
        this.setPosition(x,y);
        var shape=new Phaser.Geom.Circle(43,43,50);
        this.setInteractive(shape,Phaser.Geom.Circle.Contains);
        this.on('pointerdown', function(this){
            scene.selectedTiles=this;
            this.setTexture(color.replace(/1$/,"2"));
        });
        /*this.on('pointermove', function(this,pointer){
            if(this.texture.key.slice(-1)==="1"){
                if (pointer.isDown && color===scene.selectedTiles.color && Math.abs(x-scene.selectedTiles.x)/35<=1 && Math.abs(y-scene.selectedTiles.y)/43<=1)
                {
                    scene.selectedTiles=this;
                    this.setTexture(color.replace(/1$/,"2"));
                }
            }
        });*/
    }
}

