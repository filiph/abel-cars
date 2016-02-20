var arenaCollider : Transform;
var arenaRenderer : Transform;

var speed : float;
var defaultMinScale : float;
private var minScale : float;
private var startScale : float;
private var shrinking : boolean = true;

var colliderUpdateFrequency : int;
private var cycles : int = 0;

function Start() {
	startScale = arenaRenderer.localScale.x;
	
	minScale = defaultMinScale; // TODO: DRY!
	shrinking = true;
}

function Update () {
	cycles+=1;

	if (cycles > colliderUpdateFrequency) { // we can't afford smooth transition with the collider
	 	cycles = 0;
		if (shrinking && arenaCollider.transform.localScale.x > minScale) {
			arenaCollider.transform.localScale -= Vector3(speed * Time.deltaTime, 0, speed * Time.deltaTime);
		}
	}
	
	if (shrinking && arenaRenderer.transform.localScale.x > minScale) {
		arenaRenderer.transform.localScale -= Vector3(speed / colliderUpdateFrequency * Time.deltaTime, 0, speed / colliderUpdateFrequency * Time.deltaTime);
		var scaleRatio = arenaRenderer.transform.localScale.x / startScale;
		arenaRenderer.renderer.material.SetTextureScale("_MainTex", Vector2(scaleRatio, scaleRatio));
		arenaRenderer.renderer.material.SetTextureScale("_BumpMap", Vector2(scaleRatio, scaleRatio));
		arenaRenderer.renderer.material.SetTextureOffset("_MainTex", Vector2(0.5-scaleRatio/2, 0.5-scaleRatio/2));
		arenaRenderer.renderer.material.SetTextureOffset("_BumpMap", Vector2(0.5-scaleRatio/2, 0.5-scaleRatio/2));
	}

}

function Restart () {
	arenaCollider.transform.localScale.x = startScale;
	arenaCollider.transform.localScale.z = startScale;
	arenaRenderer.transform.localScale.x = startScale;
	arenaRenderer.transform.localScale.z = startScale;
	
	minScale = defaultMinScale;
	shrinking = true;
}

function getCurrentRadius () : float {
	return arenaRenderer.transform.localScale.x / 2;
}

function setNewMinScale(scale : float) {
	minScale = scale;
}

function stopShrinking() {
	shrinking = false;
}