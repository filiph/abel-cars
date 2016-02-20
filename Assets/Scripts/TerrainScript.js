
var terrain : Terrain;

function Start () {
	var tWidth = terrain.terrainData.heightmapWidth;
	var tHeight = 100;//terrain.terrainData.heightmapHeight;
	var terrainValues = terrain.terrainData.GetHeights(0,200,tWidth - 1,tHeight - 1);
	print("terrainValues = " + terrainValues.GetUpperBound(1));
	for (var i = 1; i < terrainValues.GetUpperBound(0); i++) {
		for (var j = 1; j < terrainValues.GetUpperBound(1); j++) {
			if ((i+j) % 2 == 0) {
				terrainValues.SetValue(Mathf.Sin(i/20.0)*Mathf.Cos(j/45.0)*0.01 + 0.01, i, j);
			}
		}
	}
	
	terrain.terrainData.SetHeights(0, 200, terrainValues); 

}

function Update () {
}