const gameEngine = new GameEngine();

const ASSET_MANAGER = new AssetManager();
ASSET_MANAGER.queueDownload("./assets/images/Enemies.png");
ASSET_MANAGER.queueDownload("./assets/images/Employment-Job-Application.png");
ASSET_MANAGER.queueDownload("./assets/images/Job-Application.jpg");
ASSET_MANAGER.queueDownload("./assets/images/messyRoom.jpg");
ASSET_MANAGER.queueDownload("./assets/sounds/tylerlaughingatyou.mp4");
ASSET_MANAGER.queueDownload("./assets/images/childsupport.png");
ASSET_MANAGER.queueDownload("./assets/sounds/pointearned.mp3");
ASSET_MANAGER.queueDownload("./assets/sounds/warningsiren.mp3");
ASSET_MANAGER.queueDownload("./assets/images/swag.jpg");
ASSET_MANAGER.queueDownload("./assets/images/DarkCastle.png");
ASSET_MANAGER.queueDownload("./assets/images/dirtbackground1.png");
ASSET_MANAGER.queueDownload("./assets/images/background1.png");
ASSET_MANAGER.queueDownload("./assets/images/background2.png");
ASSET_MANAGER.queueDownload("./assets/images/background3.png");
ASSET_MANAGER.queueDownload("./assets/images/background4.png");
ASSET_MANAGER.queueDownload("./assets/images/background5.png");
ASSET_MANAGER.queueDownload("./assets/images/background6.png");
ASSET_MANAGER.queueDownload("./assets/images/background7.png");
ASSET_MANAGER.queueDownload("./assets/images/background8.png");
ASSET_MANAGER.queueDownload("./assets/images/background9.png");
ASSET_MANAGER.queueDownload("./assets/images/background10.png");
ASSET_MANAGER.queueDownload("./assets/images/background11.png");
ASSET_MANAGER.queueDownload("./assets/images/background12.png");
ASSET_MANAGER.queueDownload("./assets/images/background13.png");
ASSET_MANAGER.queueDownload("./assets/images/background14.png");
ASSET_MANAGER.queueDownload("./assets/images/background15.png");
ASSET_MANAGER.queueDownload("./assets/images/background16.png");
ASSET_MANAGER.queueDownload("./assets/images/background17.png");
ASSET_MANAGER.queueDownload("./assets/images/background18.png");
ASSET_MANAGER.queueDownload("./assets/images/background19.png");
ASSET_MANAGER.queueDownload("./assets/images/background20.png");
ASSET_MANAGER.queueDownload("./assets/images/background21.png");
ASSET_MANAGER.queueDownload("./assets/images/background22.png");
ASSET_MANAGER.queueDownload("./assets/images/background23.png");
ASSET_MANAGER.queueDownload("./assets/images/background24.png");

ASSET_MANAGER.queueDownload("./assets/sounds/brick-falling.mp3");

ASSET_MANAGER.downloadAll(() => {
	const canvas = document.getElementById("gameWorld");
	const ctx = canvas.getContext("2d");
	ctx.imageSmoothingEnabled = false;

	// Initialize audio manager with the loaded assets
	gameEngine.audioManager = new AudioManager(ASSET_MANAGER);

	gameEngine.init(ctx);
	new SceneManager(gameEngine);
	gameEngine.start();

});
