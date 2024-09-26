type JSONValue = string | number | boolean | JSONObject | JSONArray;

interface JSONObject {
	[x: string ]: JSONValue;
}

interface JSONArray extends Array<JSONValue> {}

interface Page {
	pdf: string;
	placeHolders: JSONObject;
}

interface Entity {
	X: number;
	Y: number;
	type: string;
	option: JSONObject;
}
