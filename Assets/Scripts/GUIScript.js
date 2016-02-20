var guiSkin: GUISkin;

var inMainMenu : boolean = true;

private var mainScript : MainScript;
private var gameSettings : GameSettings;

private var numberOfCars : int;

function Start() {
	mainScript = gameObject.GetComponent(MainScript);
	gameSettings = gameObject.GetComponent(GameSettings);
	numberOfCars = gameSettings.numberOfCars;
}

function OnGUI () {
	GUI.skin = guiSkin;

	if (inMainMenu) {
		InMainMenu();
	} else {
		InPlay();
	}
}

function InMainMenu() {
	// Continue		New Game	Players		(Music)		(Sound)		Quit

	GUI.Box(Rect(20, 20, 260, Screen.height - 40), "Sumo Cars");

	GUILayout.BeginArea(Rect(30, 60, 240, Screen.height - 60));
	GUILayout.BeginVertical();
	
	if (Time.timeScale == 0.0) {
		if (GUILayout.Button("Continue")) {
			inMainMenu = false;
			Time.timeScale = 1.0;
		}
		GUILayout.Space(20);	
	}

	if (GUILayout.Button("New Game")) {
		mainScript.demoMode = false;
		mainScript.StartNewGame();
		inMainMenu = false;
	}
	
	GUILayout.Space(20);
	
	if (gameSettings.players) {
		for (var i = 0; i < gameSettings.maxNumberOfPlayers; i++) {
			GUILayout.BeginHorizontal();
			gameSettings.players[i].enabled = GUILayout.Toggle(gameSettings.players[i].enabled, "");
			var style : String;
			if (gameSettings.players[i].enabled) {
				style = gameSettings.carColors[i];
			} else {
				style = "Gray";
			}
			GUILayout.Label("Player "+gameSettings.carColors[i], GUI.skin.GetStyle(style));
			GUILayout.Label(gameSettings.controlAxisHelpTexts[i], GUI.skin.GetStyle("RightAligned Pts"));
			GUILayout.EndHorizontal();
		}
	}
	
	GUILayout.Space(20);
	
	if (GUILayout.Button("Quit")) {
		Application.Quit();
	}
	
	GUILayout.EndVertical();
	GUILayout.EndArea();
}

function InPlay() {

	GUI.Box(Rect(10, 10, 160, 70 + (numberOfCars*20)), "Score Board");


	GUI.Label(Rect(20, 45, 110, 20), "Name");
	GUI.Label(Rect(120, 45, 30, 20), "Pts", GUI.skin.GetStyle("RightAligned Pts"));
	
	var scoreboardVerticalOffset : int = 70;
	
	for (var i = 0; i < numberOfCars; i++) {
		GUI.Label(Rect(20, scoreboardVerticalOffset + (i*20), 110, 20), mainScript.cars[i].name, GUI.skin.GetStyle(mainScript.cars[i].name));
		GUI.Label(Rect(120, scoreboardVerticalOffset+ (i*20), 30, 20), mainScript.cars[i].allTimePoints + "", GUI.skin.GetStyle("RightAligned Pts"));
		if (mainScript.cars[i].currentPoints != -1) {
			GUI.Label(Rect(160, scoreboardVerticalOffset + (i*20), 20, 15), "+" + mainScript.cars[i].currentPoints, GUI.skin.GetStyle("ThisRound"));
		}
	}
	
	var bottomButtonWidth = (Screen.width - 3*20)/3; 
	
	if (GUI.Button(Rect(10, Screen.height - 30, bottomButtonWidth, 20), "Pause [ESC]")) {
		mainScript.PauseGame();
	}

	if (mainScript.allPlayersDead && !mainScript.roundOver) {
		if (GUI.Button(Rect(Screen.width/3 + 10, Screen.height - 30, bottomButtonWidth, 20), "Fast Forward [SPACE]")) {
			mainScript.FastForwardSwitch();	
		}
	}

	if (mainScript.roundOver) {
		if (GUI.Button(Rect(Screen.width*2/3 + 10, Screen.height - 30, bottomButtonWidth, 20), "Next Round [ENTER]")) {
			mainScript.StartNewRound();
		}
	}

}