import Phaser from 'phaser'

export default class mainScene extends Phaser.Scene{
    arrTiles: Array<Tiles>= new Array<Tiles>();
    colorTiles: Array<string>=["RED_1","BLUE_1","PURPLE_1","YELLOW_1","GREEN_1"];
    afterClick=false;
    selectedTiles;
    pointer;
    follower;path;graphics;lemming;
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
        
    }
    update(time: number, delta: number): void {
        if(!this.pointer.isDown && this.afterClick){ 
            var totalTiles: Array<Tiles>= new Array<Tiles>();
            for(var value of this.arrTiles){   
                this.selectTilesCheck(value,totalTiles);
            }
            this.destroyTilesOrNot(totalTiles);
            this.afterClick=false;
            //this.coba();
        }
        if(this.pointer.isDown){
            this.afterClick=true;
        }
        
    }
    coba(){
        this.graphics.clear();
        this.graphics.lineStyle(2, 0xffffff, 1);

        this.path.draw(this.graphics);

        this.path.getPoint(this.follower.t, this.follower.vec);
        this.graphics.fillStyle(0xff0000, 1);
        this.graphics.fill;
    }
    selectTilesCheck(value, totalTiles){
        if(value.texture.key.slice(-1)=='2'){
            value.setTexture(value.color.replace(/2$/,"1"));
            totalTiles.push(value);
        }
    }
    destroyTilesOrNot(totalTiles){
        if(totalTiles.length>=3){
            for(var value of totalTiles){
                this.graphics = this.add.graphics();
                this.path = new Phaser.Curves.Path(value.x,value.y);
                this.path.lineTo(200, 0);
                this.graphics.lineStyle(1, 0xffffff, 1);
                this.lemming = this.add.follower(this.path, value.x, value.y, value.texture);
                this.lemming.scale=0.49;
                this.lemming.startFollow({
                    duration: 1000,
                    yoyo: false,
                    repeat: 0,
                    rotateToPath: true
                });        
                this.children.list[this.children.list.indexOf(value)].destroy();
            }
        }else{
            totalTiles.splice(0);
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
        this.on('pointerover', function(this,pointer){
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
