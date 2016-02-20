var carPrefab : GameObject;
var carMaterials : Material[];

private var numberOfCars : int;
private var pointsForSurvivors : int[] = [10, 5, 3, 2, 1];

private var initialArenaScale : float;

class carStruct extends System.ValueType {
	var object : GameObject;
	var script : Car;
	var name : String;
	var color : String;
	var allTimePoints : int;
	var currentPoints : int;
	// ... ?
}
var cars : carStruct[];

var shrinkingArena : ShrinkingArena;

private var statsDiedCurrent : int = 0;
private var statsRound : int = 1;
var roundOver = false;

private var gameSettings : GameSettings;
private var guiScript : GUIScript;

private var timeOfLastDeath : float;
var allPlayersDead : boolean = false;


var demoMode : boolean = true;

function Start() {
	gameSettings = gameObject.GetComponent(GameSettings);
	numberOfCars = gameSettings.numberOfCars;
	guiScript = gameObject.GetComponent(GUIScript);
	cars = new carStruct[numberOfCars];
	
	StartNewGame();
}


function DestroyAllCars() {
	var carsToDestroy = GameObject.FindGameObjectsWithTag("Car");
	
	for (var i = 0; i < carsToDestroy.Length; i++) {
		Destroy(carsToDestroy[i]);
	}

}

function SetupCars() {
	DestroyAllCars();

	var radius = 40;
	
	// position cars randomly around the perimeter
	var randomSort = new int[numberOfCars];
	for (var k = 0; k < numberOfCars; k++) {
		randomSort[k] = -1;
	}
	for (var j = 0; j < numberOfCars; j++) { // iterate all possible positions (e.g. 0..8)
		while (true) {
			var randomIndex = Mathf.FloorToInt(Random.value * randomSort.Length);
			if (randomIndex == numberOfCars) 
				continue; // slight chance that Random.value returns 1.0
			if (randomSort[randomIndex] == -1) {
				randomSort[randomIndex] = j;
				break;
			}
		}
	}
	
	for (var i = 0; i < numberOfCars; i++) {
		var position = randomSort[i];
		var angle = position * Mathf.PI * 2 / numberOfCars;
		var rotAngle = - angle - Mathf.PI / 2;
		var worldPosition = Vector3(Mathf.Cos(angle), 0, Mathf.Sin(angle)) * radius;
		var car : GameObject = Instantiate(carPrefab, worldPosition, Quaternion.Euler(0, rotAngle / Mathf.PI * 180, 0));
		if (i < carMaterials.Length) {
			car.GetComponent(Car).bodyMaterial = carMaterials[i];
		}
		cars[i].object = car;
		cars[i].script = car.GetComponent(Car);
		cars[i].script.id = i;
		if (i < gameSettings.carColors.Length) {
			cars[i].name = gameSettings.carColors[i];
		} else {
			cars[i].name = "White";
		}
		
		
		if (!demoMode) {
			cars[i].currentPoints = -1;
			
			var playerId = gameSettings.whichPlayerIsDriving(i);
			if (playerId != -1) {
				cars[i].script.isPlayerControlled = true;
				cars[i].script.controlAxis = gameSettings.controlAxisArray[playerId];
			}
		}
	}
	
	allPlayersDead = false;

	GameObject.Find("SpotlightWinner").GetComponent(Spotlight).SwitchOff();
}

function StartNewGame() {
	statsRound = 0;
	StartNewRound();
	
	for (var i = 0; i < numberOfCars; i++) {
		cars[i].allTimePoints = 0;
	}	
}

function StartNewRound() {
	SetupCars();
	shrinkingArena.Restart();
	
	statsDiedCurrent = 0;
	roundOver = false;
	timeOfLastDeath = Time.time;
	Time.timeScale = 1.0;
	
	if (!demoMode) {
		statsRound += 1;
	}
}

function dieCar(id : int) {
	statsDiedCurrent += 1;
	timeOfLastDeath = Time.time;
	
	var points : int;
	var position = numberOfCars - statsDiedCurrent;
	
	if (position < pointsForSurvivors.Length) {
		points = pointsForSurvivors[position];
	} else {
		points = 0;
	}
	
	if (statsDiedCurrent == numberOfCars) {
		// last one died, switch off the lights, and don't give him points twice
		GameObject.Find("SpotlightWinner").GetComponent(Spotlight).SwitchOff();
	} else {
		if (!demoMode) {
			cars[id].currentPoints = points;
			cars[id].allTimePoints += points;
		}
	}
	
	if (statsDiedCurrent == numberOfCars - 1) {
		// we have a winner
		for (var i = 0; i < numberOfCars; i++) {
			if (cars[i].script.alive) {
				if (!demoMode) {
					cars[i].currentPoints = pointsForSurvivors[0];
					cars[i].allTimePoints += pointsForSurvivors[0];
				}
				GameObject.Find("SpotlightWinner").GetComponent(Spotlight).HighlightCar(cars[i].object.transform);
				Time.timeScale = 1.0;
				shrinkingArena.stopShrinking();
				roundOver = true;
				
				if (demoMode) {
					StartNewRound();
				}
			}
		}
	}
	
	// check if all human players are dead so we can speed up the play
	allPlayersDead = true;
	for (var j = 0; j < gameSettings.players.length; j++) {
		if (gameSettings.players[j].enabled && cars[gameSettings.players[j].carId].script.alive) {
			allPlayersDead = false;
		}
	}
}

function FastForwardSwitch() {
	if (Time.timeScale == 1.0) {
		Time.timeScale = 2.0;
	} else {
		Time.timeScale = 1.0;
	}
}

function Update() {
	if (numberOfCars - statsDiedCurrent <= 3) {
		if (Time.time - timeOfLastDeath > 5.0) {
			shrinkingArena.setNewMinScale(shrinkingArena.defaultMinScale / 2);
		}
	}
	
	// key input
	if (allPlayersDead && !roundOver && Input.GetKeyUp(KeyCode.Space)) {
		FastForwardSwitch();		
	}
	
	if (Input.GetKeyUp(KeyCode.Escape)) {
		PauseGame();
	}
	
	if (Input.GetKeyUp(KeyCode.Return) || Input.GetKeyUp(KeyCode.KeypadEnter)) {
		StartNewRound();
	}
}

function PauseGame() {
	Time.timeScale = 0.0;
	guiScript.inMainMenu = true;
}