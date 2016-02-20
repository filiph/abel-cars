
var target : Transform;

function Update () {

	if (target) {
		transform.LookAt(target);
	}

}

function HighlightCar (car : Transform) {

	if (car) {
		target = car;
		print("Spotlighting car " + car.name + ".");
		transform.LookAt(car);
		this.light.range = 200;
	}

}

function SwitchOff () {
	this.light.range = 0;
}