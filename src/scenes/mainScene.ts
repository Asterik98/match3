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
              isDragging = true;
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
              isDragging = false;
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
            var selectedTiles: Array<Tiles>= new Array<Tiles>();
            for(var value of this.arrTiles.list){   
                this.selectTilesCheck(value,selectedTiles);
            }
            if(selectedTiles.length>=3){
                this.dropAndInitNewTiles(selectedTiles,this.arrTiles.list);
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

    dropAndInitNewTiles(selectedTiles,arrTiles){
        var posY=0;
        for(var tile of arrTiles){
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
                onComplete:function(){
                    selectedTiles.splice(0);
                    dropTween.stop();
                }
            });
            posY=0;
        }
        for(var tile of selectedTiles){
            this.tweens.add({
                targets:tile,
                x: 200,
                y: 0,
                duration:500,
                onComplete: function (this) { 
                    for(var obj of selectedTiles){
                        obj.visible=false;
                    }

                    dropTween.resume();
                }
            });
        }
        /*for(var tile of selectedTiles){
            
            this.tweens.add({
                targets:this.arrTiles.list[this.arrTiles.list.indexOf(tile)],
                x: 200,
                y: 0,
                duration:500,
                onComplete: function (this) { 
                    for(var obj of selectedTiles){
                        obj.visible=false;
                    }

                    dropTween.resume();
                }
            });*/
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

