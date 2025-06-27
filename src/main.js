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
ASSET_MANAGER.queueDownload("./assets/images/background10.png");

ASSET_MANAGER.queueDownload("./assets/images/grassblock.png");
ASSET_MANAGER.queueDownload("./assets/images/mrman/mrmansheet.png");
ASSET_MANAGER.queueDownload("./assets/sounds/brick-falling.mp3");
ASSET_MANAGER.queueDownload("./assets/sounds/hurt-sound.mp3");

ASSET_MANAGER.queueDownload("./assets/images/SwampTileset.png");
ASSET_MANAGER.queueDownload("./assets/swampmap.tmj");
ASSET_MANAGER.queueDownload("./assets/SwampTileset.tsx");

//swampbackgrounds
ASSET_MANAGER.queueDownload("./assets/images/swampbackgrounds/1.png");
ASSET_MANAGER.queueDownload("./assets/images/swampbackgrounds/2.png");
ASSET_MANAGER.queueDownload("./assets/images/swampbackgrounds/3.png");

ASSET_MANAGER.queueDownload("./assets/sounds/hitlanding.mp3");
ASSET_MANAGER.queueDownload("./assets/sounds/kick.mp3");
ASSET_MANAGER.queueDownload("./assets/sounds/punch.mp3");


ASSET_MANAGER.queueDownload("./assets/sounds/bomboclat.mp3");
ASSET_MANAGER.queueDownload("./assets/sounds/roblox-classic-jump.mp3");

ASSET_MANAGER.queueDownload("./assets/images/menu.png");
ASSET_MANAGER.queueDownload("./assets/images/swampbackgrounds/pixel1.png");
ASSET_MANAGER.queueDownload("./assets/images/note.png");

ASSET_MANAGER.downloadAll(() => {
	console.log("Asset loading complete!");
	console.log("Success count:", ASSET_MANAGER.successCount);
	console.log("Error count:", ASSET_MANAGER.errorCount);
	console.log("Total assets in cache:", Object.keys(ASSET_MANAGER.cache).length);
	console.log("Assets in cache:", Object.keys(ASSET_MANAGER.cache));
	
	const canvas = document.getElementById("gameWorld");
	const ctx = canvas.getContext("2d");
	ctx.imageSmoothingEnabled = false;

	// Initialize audio manager with the loaded assets
	gameEngine.audioManager = new AudioManager(ASSET_MANAGER);

	gameEngine.init(ctx);
	new SceneManager(gameEngine);
	gameEngine.start();
});
