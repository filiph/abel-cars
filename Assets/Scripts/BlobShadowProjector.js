
var car : Transform;

function Start () {
	car = transform.parent;
}

function Update () {
	transform.position = car.position + Vector3.up*30;
	transform.rotation = Quaternion.Euler(90, 0, 0);
}