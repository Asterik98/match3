import Phaser, { GameObjects, Textures, Tweens } from 'phaser'

export default class mainScene extends Phaser.Scene{
    arrTiles: Array<Tiles>= new Array<Tiles>();
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
    line;path;
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
        var line= new Phaser.Curves.Path(0,0);
        console.log(line);
        var lineStartPosition={x:0,y:0};
        var isDragging=false;
        var currentColor;
        var currentPath=new Array();
        let path=new Phaser.Curves.Path();
        this.pointer = this.input.activePointer;
        this.selectedTiles=new Tiles(this,0,0,'',0.49);
        this.input.mouse.disableContextMenu();
        var initX=45;
        var initY=100;
        for (let x = 1; x <= 7; x++) {
            for (let y = 1; y <= 7; y++){
                const random = Math.floor(Math.random() * this.colorTiles.length);
                if(x%2==1){
                    this.arrTiles.push(new Tiles(this,initX+(35*x),initY+20+(y*43),this.colorTiles[random],0.49));
                }else{
                    this.arrTiles.push(new Tiles(this,initX+(35*x),initY+(y*43),this.colorTiles[random],0.49));
                }
            } 
        }
        for(var value of this.arrTiles)
        { 
            this.children.add(value);
        }
        var pathGraphics = this.add.graphics();
        pathGraphics.visible=false;
        this.input.on('pointerdown', function(this,pointer,gameObject){
            if(gameObject.length == 0){
                return;
              }
              isDragging = true;
              // remember Starting Color
              currentColor = gameObject[0].color;
              currentPath.push({x: gameObject[0].x, y: gameObject[0].y});
              // draw/save last segment of the path
              lineStartPosition.x = gameObject[0].x;
              lineStartPosition.y = gameObject[0].y;
              path.startPoint=gameObject[0];
              pathGraphics.visible=true;
        });
        this.input.on('pointerup', function(this,gameObject){
            if(gameObject.length == 0){
                return;
              }
              pathGraphics.clear();
              currentPath=[];
              path.destroy();
              pathGraphics.visible = false;
              isDragging = false;
        });
        this.input.on('pointermove', function(this,pointer,gameObject){
            console.log(currentPath);
            if(isDragging === true){
                if(gameObject[0] && currentColor == gameObject[0].color){
                    if(currentPath.indexOf({x: gameObject[0].x, y: gameObject[0].y})===-1){
                        console.log('a');
                        currentPath.push({x: gameObject[0].x, y: gameObject[0].y});
                        path.lineTo(currentPath[currentPath.length-1]);
                    }else if(currentPath.indexOf({x: gameObject[0].x, y: gameObject[0].y})!=-1 && currentPath.indexOf({x: gameObject[0].x, y: gameObject[0].y})!=0){
                        console.log('b');
                        currentPath.pop();
                        path.splineTo(currentPath[currentPath.length-1]);
                    }
                }
                pathGraphics.clear();
                pathGraphics.lineStyle(2, 0xffffff, 1);
                path.draw(pathGraphics);
            } 
        });
        
    }
    
    update(time: number, delta: number): void {
        //console.log(this.line);
        if(!this.pointer.isDown && this.afterClick){ 
            var selectedTiles: Array<Tiles>= new Array<Tiles>();
            var dropTiles: Array<Tiles>= new Array<Tiles>();
            var deepestSelTiles: Array<Tiles>= new Array<Tiles>();
            var deepestDropTiles: Array<Tiles>= new Array<Tiles>();
            for(var value of this.arrTiles){   
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
            value.setTexture(value.color.replace(/2$/,"1"));
            selectedTiles.push(value);
        }
    }
    dropTilesGroup(selectedTiles,dropTiles){
        for(var s of selectedTiles){
            for(var v of this.arrTiles){
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
                targets:this.arrTiles[this.arrTiles.indexOf(tile)],
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
                targets:this.arrTiles[this.arrTiles.indexOf(tile)],
                x: 200,
                y: 0,
                duration:500,
                onComplete: function (this) { 
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
        this.setInteractive();
        this.on('pointerdown', function(this){
            scene.selectedTiles=this;
            this.setTexture(color.replace(/1$/,"2"));
        });
        this.on('pointermove', function(this,pointer){
            if(this.texture.key.slice(-1)==="1"){
                if (pointer.isDown && color===scene.selectedTiles.color && Math.abs(x-scene.selectedTiles.x)/35<=1 && Math.abs(y-scene.selectedTiles.y)/43<=1)
                {
                    scene.selectedTiles=this;
                    this.setTexture(color.replace(/1$/,"2"));
                }
            }
        });
    }

   
}
