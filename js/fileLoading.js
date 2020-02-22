/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
This file defined the functions that used to load files from
computer and DocuSky.
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */


// * * * * * * * * * * * * * * * * DocuSky * * * * * * * * * * * * * * * * *


/* ---
callback function, called when click load button
get all documents in database
--- */
function getEntireDbCorpusText() {
	_allDocList = _docuSkyObj.docList;
	let param = {target: _docuSkyObj.target, db: _docuSkyObj.db, corpus: _docuSkyObj.corpus};
	getNextPage(param, processDataFromDocusky);
}


/* ---
if not all documents are loaded, continue to load data
--- */
function  getNextPage(param, callback){
	let totalPages = Math.ceil(_docuSkyObj.totalFound / _docuSkyObj.pageSize);

	// not finished
	if (_docuSkyObj.page < totalPages) {
		param.page = _docuSkyObj.page + 1;
		_docuSkyObj.getQueryResultDocuments(param, null, function() {
			_allDocList = _allDocList.concat(_docuSkyObj.docList);
			getNextPage(param, callback);
		});

	// have loaded all data
	} else {
		if (typeof callback === "function") callback();
	}
}


/* ---
process document list from Docusky
--- */
function processDataFromDocusky() {

	// get file information
	var dbName = getDBsrcFilename(_allDocList);
	var corpusNames = getCorpusNames(_allDocList);

	// process
	dataHandler(dbName, corpusNames, 'sky');
	console.log(_inSystem);
	console.log(_dataset);

	// display
	displayAll();
}


// * * * * * * * * * * * * * * * * local computer * * * * * * * * * * * * * * * * *


// listener for loading files
document.getElementById('uploadXML').addEventListener('change', uploadXMLFile, false);


/* ---
trigger when user upload files by input element
extract uploaded files and update used input by new input
INPUT: event object
--- */
function uploadXMLFile($event) {

	// progress bar
	$('#compare-load img').show();
	
	// process for each xml (database)
	var files = $event.target.files;
	for (let i=0; i<files.length; i++) {
		let dbName = files[i].name;
		let reader = new FileReader();
		reader.onload = processXMLData(dbName, i==files.length-1);
		reader.readAsText(files[i]);
	}

	// update input
	$('#uploadXML').replaceWith('<input id="uploadXML" type="file" name="uploadXML" accept=".xml" style="display: none;" multiple>');
	document.getElementById('uploadXML').addEventListener('change', uploadXMLFile, false);
}


/* ---
process document list from local computer
INPUT: 1) string, database name
       2) boolean, if the database is the last one
--- */
function processXMLData($dbName, $fin) {
	return function($event) {

		// get file information
		var data = $event.target.result;
		_allDocList = parseToDocList(data);
		var corpusNames = getCorpusNames(_allDocList);

		// process
		dataHandler($dbName, corpusNames, 'local');

		// finish loading
		if ($fin) {
			console.log(_inSystem);
			console.log(_dataset);

			// hide progress bar
			$('#compare-load img').hide();

			// display
			displayAll();
		}

	}
}


/* ---
process document list from local computer
INPUT: string, database name
OUTPUT: array, self-made document list
--- */
function parseToDocList($data) {

	// get documents xml
	var docList = [];
	var start = $data.indexOf('<documents', 0);
	var end = $data.indexOf('</documents', start);
	var data = $data.substring($data.indexOf('>', start) + 1, end).trim();
	
	// parse for each document
	end = 0;
	while (1) {

		// see if there is a document
		start = data.indexOf('<document', end);
		if (start == -1) break;

		// filename
		let filenamePosStart = data.indexOf('filename', start);
		filenamePosStart = data.indexOf('"', filenamePosStart) + 1;
		let filenamePosEnd = data.indexOf('"', filenamePosStart);
		let filename = data.substring(filenamePosStart, filenamePosEnd).trim();

		// content
		let content = {'filename': filename, 'docId': generateID()};
		
		// single document xml
		start = data.indexOf('>', start) + 1;
		end = data.indexOf('</document', start);
		let text = data.substring(start, end).trim();
		
		// parse for each tag
		let s = 0, e = 0;
		while (1) {

			// see if there is a tag
			s = text.indexOf('<', e);
			if (s == -1) break;

			// extract tag
			e = text.indexOf('>', s);
			let tagInfo = analyzeTag(text.substring(s+1, e).trim());
			let valuePosStart = e + 1;
			let valuePosEnd = text.indexOf('</' + tagInfo.tagName, valuePosStart);
			let value = text.substring(valuePosStart, valuePosEnd).trim();

			// put value in doc info
			if (tagInfo.tagName == 'doc_content') content[tagInfo.tagName] = (!itemInList('Content', value)) ?'<Content>' + value + '</Content>' :value;
			else if (tagInfo.tagName == 'xml_metadata') content[tagInfo.tagName] = '<DocMetadata>' + value + '</DocMetadata>';
			else content[tagInfo.tagName] = value;

			e = valuePosEnd + 1;
		}

		// form document info
		docList.push({'docInfo': content});
	}

	console.log(docList);

	return docList;
}


// * * * * * * * * * * * * * * * * loading processing * * * * * * * * * * * * * * * * *


/* ---
process for every corpus after load the database (file)
INPUT: 1) string, database name
       2) string, all corpus names
       3) string, source of data, 'sky' = from DocuSky, 'local' = from Computer
--- */
function dataHandler($dbName, $corpusNames, $source) {

	// database hasn't loaded before - load all data in database
	if (!DBinSystem($dbName)) {
		_inSystem[$dbName] = initialCorpusID($corpusNames);
		for (let i in $corpusNames) buildCorpus(_allDocList, $corpusNames[i], $dbName, $source);

	// database has loaded before - only load data not exist in system
	} else {
		for (let i in $corpusNames) {

			// corpus not in system - load one corpus
			if (!corpusInSystem($dbName, $corpusNames[i])) {
				_inSystem[$dbName][$corpusNames[i]] = -1;
				buildCorpus(_allDocList, $corpusNames[i], $dbName, $source);

			// corpus in system - alert
			} else {
				alert("資料庫「" + $dbName + "」的文獻集「" + $corpusNames[i] + "」已存在。");
			}
		}
	}
}


/* ---
put raw data into data structure in the system
INPUT: 1) array, raw data of documents list from docusky
       2) string, corpus name
       3) string, database name
       4) string, source of data, 'sky' = from DocuSky, 'local' = from Computer
--- */
function buildCorpus($docList, $corpusName, $dbName, $type) {
	var documents = [];

	// scan all documents
	for (let i in $docList) {

		// check if access correct corpus data
		let corpusName = $docList[i].docInfo.corpus;
		if (corpusName !== $corpusName) continue;

		// put document into corpus
		let parsedDocument = parseDocument($docList[i].docInfo, $type);
		documents.push(parsedDocument);
	}

	// new corpus
	if (_dataset[$corpusName] === undefined) {
		_dataset.newCorpus($dbName, $corpusName, documents);
		_inSystem[$dbName][$corpusName] = 0;

	// corpus has existed
	} else {

		// record corpus id
		let id = [];
		for (let db in _inSystem) {
			for (let corpus in _inSystem[db]) {
				if (corpus == $corpusName) id.push(_inSystem[db][corpus]);
			}
		}

		// find id not used
		let i = 0;
		while (1) {
			if (!itemInList(i, id)){
				if (i == 0) _dataset.newCorpus($dbName, $corpusName, documents);
				else _dataset.newCorpus($dbName, $corpusName + '(' + i.toString() + ')', documents);
				_inSystem[$dbName][$corpusName] = i;
				break;
			}
			i++;
		}
	}
}

