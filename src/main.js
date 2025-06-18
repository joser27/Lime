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
ASSET_MANAGER.downloadAll(() => {
	const canvas = document.getElementById("gameWorld");
	const ctx = canvas.getContext("2d");
	ctx.imageSmoothingEnabled = false;

	gameEngine.init(ctx);
	new SceneManager(gameEngine);
	gameEngine.start();

});
