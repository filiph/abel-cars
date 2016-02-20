
var id : int;

var FrontLeftWheel : WheelCollider;
var FrontRightWheel : WheelCollider;

var RearLeftWheel : WheelCollider;
var RearRightWheel : WheelCollider;

var bodyMaterial : Material;
var Body : GameObject;

var EngineTorque : float = 50.0;

var LowerCenterOfMassBy : float = 0.0;

var alive : boolean = true;

var isPlayerControlled : boolean = false;
var controlAxis : String;
var aiDangerousZone : float = 10.0;
var aiMeanie : float = 2.0; // the bigger the number, the more likely the ai car will stay with current target
var aiUpdateFrequency : int = 10;
private var aiCycleCounter = 0;
private var currentTargetCar : GameObject;

private var adaptedToUpsideDown : boolean = false;

private var shrinkingArena : ShrinkingArena;
private var distanceFromRim : float;

private var right : Vector3;

function Start () {
	if (bodyMaterial) {
		Body.renderer.material = bodyMaterial;
	}
	
	shrinkingArena = GameObject.Find("Arena").GetComponent(ShrinkingArena);

	// Alter the center of mass to make the car more stable. I'ts less likely to flip this way.
	rigidbody.centerOfMass.y = 0 - LowerCenterOfMassBy;
	
	aiCycleCounter = Mathf.FloorToInt( Random.value * aiUpdateFrequency );
}

function flipCar() {
	RearLeftWheel.transform.Rotate(Vector3.forward * 180);
	RearRightWheel.transform.Rotate(Vector3.forward * 180);
	FrontLeftWheel.transform.Rotate(Vector3.forward * 180);
	FrontRightWheel.transform.Rotate(Vector3.forward * 180);
		
	rigidbody.centerOfMass.y = -rigidbody.centerOfMass.y;
}


function Update () {
	if (isAlive()) {
		aiCycleCounter += 1;
		var thisFrameCanBeExpensive = aiCycleCounter > aiUpdateFrequency;
		if (thisFrameCanBeExpensive) {
			aiCycleCounter = 0;
			distanceFromRim = getDistanceFromRim();
			if (distanceFromRim < -10) {
				Die();
			}
		}
		
		var currentlyUpsideDown = Vector3.Dot(Vector3.up, transform.up) < 0;
	
		if (currentlyUpsideDown && !adaptedToUpsideDown) {
			flipCar();
			adaptedToUpsideDown = true;
		} else if (adaptedToUpsideDown && !currentlyUpsideDown) {
			flipCar();
			adaptedToUpsideDown = false;
		}
	
		var steering = null;
	
		if (isPlayerControlled) {
			steering = ApplyPlayerControl();
		} else {
			if (thisFrameCanBeExpensive) {
				steering = ApplyAIControl();
			}
		}
		
		if (steering != null) {
			FrontLeftWheel.steerAngle = 15 * steering;
			FrontRightWheel.steerAngle = 15 * steering;
		}
		
		RearLeftWheel.motorTorque = EngineTorque;
		RearRightWheel.motorTorque = EngineTorque;
		
	}
}

function ApplyPlayerControl() : float {
	return Input.GetAxis(controlAxis);
}


// returns 0 when on rim, negative number when outside
function getDistanceFromRim() : float {
	var currentRadiusOfArena = shrinkingArena.getCurrentRadius();
	var currentDistanceFromCenter = transform.position.magnitude;
	
	return currentRadiusOfArena - currentDistanceFromCenter;

}

function isAlive() : boolean {
	if (!alive) {
		return false;
	} else if (alive && transform.position.y < -1.0) {
		Die();
		return false;
	} else {
		return true;
	}
}

function Die() {
	print(transform.name + " just died.");
	this.alive = false;
	GameObject.Find("_Master").GetComponent(MainScript).dieCar(this.id);
}

function steerTowardsPosition(pos : Vector3) : float {
	var normalizedVectorToPosition = Vector3.Normalize(pos - transform.position);
	var dotProductPositionWithRight = Vector3.Dot(right, normalizedVectorToPosition);
	var dotProductPositionWithAhead = Vector3.Dot(transform.forward, normalizedVectorToPosition);
	
	var steering = 0;
	
	if (dotProductPositionWithAhead > 0 && Mathf.Abs(dotProductPositionWithRight) < 0.05) {
		steering = 0;
	} else if (dotProductPositionWithRight > 0) {
		steering = 1;
	} else {
		steering = -1;
	}
	
	return steering;
}


function ApplyAIControl() : float {
	var steering = null;
	
	var ahead = transform.forward;
	
	if (!adaptedToUpsideDown) {
		right = transform.right;
	} else {
		right = -transform.right;
	}
	
	// check if we are in trouble
	if (distanceFromRim < aiDangerousZone) {
		var normalizedVectorToCenter = -Vector3.Normalize(transform.position);
		var dotProductCenterWithAhead = Vector3.Dot(ahead, normalizedVectorToCenter);
		if (dotProductCenterWithAhead < 0) {
			steering = steerTowardsPosition(Vector3.zero);
		}
	}
	
	if (steering == null) {
		// we are not in trouble, time to find ourselves an enemy
		
		currentTargetCar = FindBestEnemy();
		
		if (currentTargetCar != null) {
			
			var normalizedVectorToCurrentPosition = Vector3.Normalize( currentTargetCar.transform.position - transform.position );
			var dotProductCurrentPositionWithAhead = Vector3.Dot(ahead, normalizedVectorToCurrentPosition);
			if (dotProductCurrentPositionWithAhead < 0) {
				// opponent is currently behind me!
				steering = steerTowardsPosition(currentTargetCar.transform.position);
			} else {
				// opponent is in front of me, let's aim for his future position
				var OpponentFuturePosition = currentTargetCar.transform.position + currentTargetCar.rigidbody.velocity * 0.5; // TODO: make sense of this constant
				var normalizedVectorToFuturePosition = Vector3.Normalize( OpponentFuturePosition - transform.position );
				
				steering = steerTowardsPosition(OpponentFuturePosition);
			}
		} else {
			// we won!
			steering = steerTowardsPosition(Vector3.zero);
		
		}
	}	
	return steering;
}


// Find the name of the closest Car
function FindBestEnemy () : GameObject {

    // Find all game objects with tag Car
    var gos : GameObject[];
    gos = GameObject.FindGameObjectsWithTag("Car"); 
    var closest : GameObject = null; 
    var distance = Mathf.Infinity; 
    var distanceToCurrentTarget : float = Mathf.Infinity;
    var position = transform.position; 
    // Iterate through them and find the closest one
    for (var go : GameObject in gos)  { 
    	if (go.transform == transform) {
    		// we don't want to attack ourselves
    		continue;
    	}
    	
 		if (!go.GetComponent(Car).alive) {
 			continue;
 		}
    	
        var diff = (go.transform.position - position);
        var curDistance = diff.sqrMagnitude; 
        if (curDistance < distance) { 
            closest = go; 
            distance = curDistance; 
        }
        if (currentTargetCar) {
 			if (go.transform == currentTargetCar.transform) {
 				distanceToCurrentTarget = curDistance;
 			}
 		} 
    } 
    
    if (currentTargetCar) {
    	if (currentTargetCar.GetComponent(Car).alive && distance > distanceToCurrentTarget * aiMeanie) {
    		return currentTargetCar;
    	}
    }
    
    return closest;
}