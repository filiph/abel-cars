var maxNumberOfCars : int = 40;
var numberOfCars : int;

var maxNumberOfPlayers : int = 8;
var numberOfPlayers : int;
var playerCars : int[];

class playerStruct extends System.ValueType {
	var carId : int;
	var name : String;
	var color : String;
	var enabled : boolean;
}
var players : playerStruct[];

var controlAxisArray : String[] = ["Player1", "Player2", "Player3", "Player4", "Player5", "Player6", "Player7", "Player8"];
var controlAxisHelpTexts : String[] = ["left, right", "ctrl, alt", "m, n", "q, a", "pg dn, pg up", "1, 2", "mouse buttons", "joystic buttons"];
var carColors : String[] = ["Red", "Blue", "Green", "Yellow", "Brown", "Aquamarine", "Orange", "Pink"];

function Start() {
	InitializePlayers();
}

function InitializePlayers() {
	players = new playerStruct[maxNumberOfPlayers];
	
	for (var i = 0; i < maxNumberOfPlayers; i++) {
		players[i].name = "Player " + carColors[i];
		players[i].carId = i;
		players[i].color = carColors[i];
		players[i].enabled = i < numberOfPlayers;
	}
}


// returns playerId that controls this carId
function whichPlayerIsDriving(carId : int) : int {
	for (var i = 0; i < players.Length; i++) {
		if (players[i].enabled && players[i].carId == carId) {
			return i;
		}
	}
	return -1;
}