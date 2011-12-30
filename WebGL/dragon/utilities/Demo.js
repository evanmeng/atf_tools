function intToHexString(i, digits) {
	function toHexDigit(x) { if (x < 10) return x; return String.fromCharCode('A'.charCodeAt(0) + x - 10); }
	var hexStr = "";
	while (i > 0) {
		hexStr = toHexDigit(i & 0xF) + hexStr;
		i = i >> 4;
	}
	var paddingLength = digits - hexStr.length;
	for (var x = 0; x < paddingLength; x++) {
		hexStr = "0" + hexStr;
	}
	return hexStr;
}

function charForInt(i) {
	if (i < 32 || i >= 0x7F) return ".";
	return String.fromCharCode(i);
}

var CHUNK_SIZE = 512;

var currentBuffer;
var startAt;

function initPage() {
	if (checkCompat()) {
		var select = document.getElementById('serverFiles');
		select.value = "data/iStock_000009426004XSmall2.pcx,application/octet-stream";
		select.onchange();
	}
}

// Check that browser supports necessary functionality
function checkCompat() {
	var compatible = false;
	if (!browserInfo)
		return compatible;
	if (browserInfo.isFirefox) {
		if (browserInfo.version >= 7) {
			compatible = true;
		}
	}
	if (browserInfo.isIE) {
		if (browserInfo.version >= 10) {
			compatible = true;
		}
	}
	if (browserInfo.isChrome) {
		if (browserInfo.version >= 12) {
			compatible = true;
		}
	}
	var intro = document.getElementById('IntroWrapper');
	var warn = document.getElementById('SupportWarning');
	if (!compatible) {
		intro.style.display = "none";
		warn.style.display = "block";
	}
	else {
		intro.style.display = "block";
		warn.style.display = "none";
	}
	return compatible;
}

// Renders the hex contents of the buffer into
function renderFile(buffer) {
	/// <param name="buffer" type="ArrayBuffer"/>
	currentBuffer = buffer;
	startAt = 0;
	var str = getHexChunk(buffer, startAt);
	renderHexChunk(str);
}

// Display Hex representation of current chunk of data
function renderHexChunk(str) {
	var container = document.getElementById("hexGrid");
	container.innerHTML = "";
	var elem = document.createElement('pre');
	container.appendChild(elem);
	elem.appendChild(document.createTextNode(str));
}

function setNextState(enabled) {
	var buttonNext = document.getElementById("Next");
	if (enabled) {
		buttonNext.className = "myButton";
	}
	else {
		buttonNext.className = "myButtonGrey";
	}
}

function setPrevState(enabled) {
	var buttonPrev = document.getElementById("Prev");
	if (enabled) {
		buttonPrev.className = "myButton";
	}
	else {
		buttonPrev.className = "myButtonGrey";
	}
}

function syncButtonState() {
	if (!currentBuffer || startAt + CHUNK_SIZE >= currentBuffer.byteLength) {
		setNextState(false);
	}
	else {
		setNextState(true);
	}
	if (!currentBuffer || startAt - CHUNK_SIZE < 0) {
		setPrevState(false);
	}
	else {
		setPrevState(true);
	}
}

// Handle "Next" button click
function clickNext() {
	if (!currentBuffer || startAt + CHUNK_SIZE >= currentBuffer.byteLength) {
		syncButtonState();
		return;
	}
	startAt += CHUNK_SIZE;
	var str = getHexChunk(currentBuffer, startAt);
	syncButtonState();
	renderHexChunk(str);
}

// Handle "Prev" button click
function clickPrev() {
	if (!currentBuffer || startAt - CHUNK_SIZE < 0) {
		syncButtonState();
		return;
	}
	startAt -= CHUNK_SIZE;
	var str = getHexChunk(currentBuffer, startAt);
	syncButtonState();
	renderHexChunk(str);
}

// Convert a chunk of binary data from buffer with given offset to Hex string
function getHexChunk(buffer, startAt) {
	var chunkLength = Math.min(CHUNK_SIZE, buffer.byteLength - startAt)
	var uints = new Uint8Array(buffer, startAt, chunkLength);
	var rowString = "";
	for (var row = 0; row < uints.length; row += 16) {
		var remaining = uints.length - row;
		rowString += intToHexString(row + startAt, 8);
		rowString += "  ";
		for (var offset = 0; offset < 8 ; offset++) {
			if (offset < remaining) rowString += intToHexString(uints[row + offset], 2) + " ";
			else rowString += "   ";
		}
		rowString += " ";
		for (; offset < 16; offset++) {
			if (offset < remaining) rowString += intToHexString(uints[row + offset], 2) + " ";
			else rowString += "   ";
		}
		rowString += "  ";
		for (var offset = 0; offset < 8; offset++) {
			rowString += charForInt(uints[row + offset]);
		}
		for (; offset < 16; offset++) {
			rowString += charForInt(uints[row + offset]);
		}
		rowString += "\n";
	}
	return rowString;
}

// Read the contents of the File object into an ArryBuffer
// then call 'successCallback'.
function readFileToArrayBuffer(file, successCallback) {
	var reader = new FileReader();
	reader.onload = function (evt) {
		var buffer = reader.result;
		successCallback(buffer);
		syncButtonState();
	}
	reader.onerror = function (evt) {
		if (evt.target.error.code == evt.target.error.NOT_READABLE_ERR) {
			alert("Failed to read file: " + file.name);
		}
	}
	try {
		reader.readAsArrayBuffer(file);
	}
	catch (e) {
		alert(e);
	}
}

// Display preview
function displayBlob(blob, name) {
	var elem = document.getElementById("blobDisplay");
	elem.innerHTML = "";
	var URL = window.URL || window.webkitURL;
	if (blob.type == "image/jpeg" || blob.type == "image/png" || blob.type == "image/gif") {
		var img = document.createElement("img");
		img.src = URL.createObjectURL(blob);
		img.width = 600;
		elem.appendChild(img);
	}
	else if (blob.type == "audio/mpeg" || blob.type == "audio/mp3") {
		var div = document.createElement("div");
		div.id = "placeholder";
		var div2 = document.createElement("div");
		div2.className = "textIcon";
		div2.innerHTML = blob.type ? "<b>Mime type:</b> " + blob.type : "No preview";
		div.appendChild(div2);
		elem.appendChild(div);
		// Add audio
		var audio = document.createElement("audio");
		elem.appendChild(audio);
		audio.src = URL.createObjectURL(blob);
//      audio.controls = true;
		audio.play();
	}
	else if (blob.type == "video/mpeg" || blob.type == "video/mp4") {
		var video = document.createElement("video");
		elem.appendChild(video);
		var src = document.createElement("source");
		src.src = URL.createObjectURL(blob);
		video.appendChild(src);
//		video.controls = true;
		video.play();
	}
	else if (name[name.length - 3] == "p" && name[name.length - 2] == "c" && name[name.length - 1] == "x") {
		var div = document.createElement("div");
		div.id = "placeholder";
		if (window.DataView == undefined) {
			var div2 = document.createElement("div");
			div2.className = "textIcon";
			div2.innerHTML = "<font color='red'>Your browser doesn't support DataView</font>";
			div.appendChild(div2);
		}
		elem.appendChild(div);
		var reader = new FileReader();
		reader.onload = function () {
			var arrayBuffer = reader.result;
			var buffer = new Uint8Array(arrayBuffer);
			var pcx = new Pcx();
			pcx.load(buffer);

			var canvas = document.createElement('canvas');
			canvas.width = pcx.xSize;
			canvas.height = pcx.ySize;
			pcx.drawToCanvas(canvas);

			var sizedCanvas = document.createElement('canvas');
			var ratio = 300 / pcx.xSize;
			ratio = Math.min(ratio, 500 / pcx.ySize);
			var width = (ratio < 1)? Math.round(pcx.xSize * ratio) : pcx.xSize;
			var height = (ratio < 1)? Math.round(pcx.ySize * ratio) : pcx.ySize;
			sizedCanvas.width = width;
			sizedCanvas.height = height;
			var sizedContext = sizedCanvas.getContext("2d");
			sizedContext.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, width, height); 
			div.style.width = width + "px";
			div.style.height = height + "px";
			div.style.padding = "0px";
			div.appendChild(sizedCanvas);
		};
		reader.readAsArrayBuffer(blob);
	}
	else {
		var div = document.createElement("div");
		div.id = "placeholder";
		var div2 = document.createElement("div");
		div2.className = "textIcon";
		div2.innerHTML = blob.type ? "<b>Mime type:</b> " + blob.type : "No preview";
		div.appendChild(div2);
		elem.appendChild(div);
	}
}

// Display file details and preview (if supported for this type)
function fileSelected(file, name) {
	readFileToArrayBuffer(file, renderFile);
	displayBlob(file, name);
	document.getElementById("fileName").innerText = (file.name) ? file.name: name;
	document.getElementById("mimeType").innerHTML = file.type;
	document.getElementById("fileSize").innerHTML = file.size;
	if (file.lastModifiedDate) {
		var d = new Date(file.lastModifiedDate);
		document.getElementById("lastModified").innerHTML = d.toDateString();
	}
	else {
		var lastMod = document.getElementById('lastModifiedItem');
		lastMod.style.display = "none";
	}
}

function clearFileInput() 
{ 
    var oldInput = document.getElementById("fileInput");    
    var newInput = document.createElement("input"); 

    newInput.type = "file"; 
    newInput.id = oldInput.id; 
    newInput.name = oldInput.name; 
    newInput.onchange = oldInput.onchange; 

    oldInput.parentNode.replaceChild(newInput, oldInput); 
}

// Grabs the selected File object and :
// 1) read into an ArrayBuffer
// 2) attempt to display the blob contents
function localfileSelected() {
	// Update UI
	var details = document.getElementById('detailedView');
	details.style.display = "block";
	var lastMod = document.getElementById('lastModifiedItem');
	lastMod.style.display = "block";
	var serverFiles = document.getElementById('serverFiles');
	serverFiles.selectedIndex = 0;
	// Get file
	var fileInput = document.getElementsByName("fileInput")[0];
	if (fileInput && fileInput.files && fileInput.files[0]) {
		fileSelected(fileInput.files[0], fileInput.files[0].name);
	}
	else {
		alert("Please select another file.");
	}
}

// Handle drop-down control selection for server stored files
function serverfileSelected() {
	clearFileInput();
	// Update UI
	var details = document.getElementById('detailedView');
	details.style.display = "block";
	// Last modified is not available for server files
	var lastMod = document.getElementById('lastModifiedItem');
	lastMod.style.display = "none";
	// Special handling for Chrome
	if (window.WebKitBlobBuilder)
		return serverfileSelectedChrome();
	// Get file
	var serverFiles = document.getElementById('serverFiles');
	var values = serverFiles.options[serverFiles.selectedIndex].value.split(",");
	var selectedFile = values[0];
	if (selectedFile != "") {
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function () {
			if (xhr.readyState == xhr.DONE) {
				if (xhr.status == 200 && xhr.response) {
					fileSelected(xhr.response, selectedFile);
				} else {
					alert("Failed to download:" + xhr.status + " " + xhr.statusText);
				}

			}
		}
		xhr.open("GET", selectedFile, true);
		xhr.responseType = "blob";
		xhr.send();
	}
}

// Special method for Chrome - due to lack of
// xhr.responseType='blob' support, that results in no server
// communication of MIME type, forced hardcoding it to selection value
function serverfileSelectedChrome() {
	var serverFiles = document.getElementById('serverFiles');
	var values = serverFiles.options[serverFiles.selectedIndex].value.split(",");
	var selectedFile = values[0];
	var mimeType = values[1].replace(" ", "");
	if (selectedFile != "") {
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function () {
			if (xhr.readyState == xhr.DONE) {
				if (xhr.status == 200 && xhr.response) {
					var bb = new WebKitBlobBuilder();
					bb.append(xhr.response);
					var blob = bb.getBlob(mimeType);
					blob.name = selectedFile;
					fileSelected(blob, selectedFile);
				} else {
					alert("Failed to download:" + xhr.status + " " + xhr.statusText);
				}

			}
		}
		xhr.open("GET", selectedFile, true);
		xhr.responseType = "arraybuffer";
		xhr.send();
	}
}
