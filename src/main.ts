import Phaser from 'phaser'

import mainScene from './scenes/mainScene'

const config: Phaser.Types.Core.GameConfig = {
	type: Phaser.AUTO,
	width: 375,
	height: 587,
	physics: {
		default: 'arcade',
		arcade: {
			gravity: { y: 200 }
		}
	},
	scene: [mainScene]

}

export default new Phaser.Game(config)
