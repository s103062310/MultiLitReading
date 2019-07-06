/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
This file is responsible for initialization of the program and
deal with data received from DocuSky.
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */


/* ---
initialization, get _docuSkyObj
--- */
function setDocuSkyObj() {

	if (docuskyGetDbCorpusDocumentsSimpleUI === null) {
		alert("widget not ready, please wait for a while");
	} else if (_docuSkyObj === null) {
		_docuSkyObj = docuskyGetDbCorpusDocumentsSimpleUI;
		//console.log(_docuSkyObj);
	}

	clearInterval(setDocuSkyObj);
}


/* ---
trigger initialization until finishing initialization when file is ready
--- */
$(document).ready(function() {
	setInterval(setDocuSkyObj, 1000);
});


// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 


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
	if (_docuSkyObj.page < totalPages) {
		param.page = _docuSkyObj.page + 1;
	  	_docuSkyObj.getQueryResultDocuments(param, null, function() {
	    	_allDocList = _allDocList.concat(_docuSkyObj.docList);
	     	getNextPage(param, callback);
	  	});
	} else {
	  if (typeof callback === "function") callback();
	}

 }


/* ---
process document list from Docusky
--- */
function processDataFromDocusky() {

	// access loading information
	console.log(_allDocList);
	dbName = getDBsrcFilename(_allDocList);
	corpusNames = getCorpusNames(_allDocList);

	// database hasn't loaded before - load all data in database
	if (!DBinSystem(dbName)) {
		_inSystem[dbName] = corpusNames;
		for (let i in corpusNames) buildCorpus(_allDocList, corpusNames[i]);

	// database has loaded before - only load data not exist in system
	} else {
		for (let i in corpusNames) {

			// corpus not in system - load one corpus
			if (!corpusInSystem(dbName, corpusNames[i])) {
				_inSystem[dbName].push(corpusNames[i]);
				buildCorpus(_allDocList, corpusNames[i]);

			// corpus in system - alert
			} else {
				alert("Corpus " + corpusNames[i] + " has already loaded in the system.");
			}
		}
	}

	console.log(_inSystem);
	console.log(_dataset);

	var firstCorpus = getFirstCorpus();
	var firstAlignType = getFirstAlignType();
	if (firstCorpus === 'error') alert("Error in get first corpus.");
	if (firstAlignType === 'error') alert("Error in get first align type.");

	// update display
	displayDocuManager();
	displayMetadataList('docFilename');
	displayAlignTypeList(firstAlignType);
	displaySearchCorpus(firstCorpus);
	displaySearchMode('DocOrder');
	displayCompareContent('docFilename', firstAlignType);

}


/* ---
convert data from docusky to local system 
INPUT: 1) array, raw data of documents list from docusky
       2) string, name of corpus that be built
OUTPUT: none, build corpus to global variable directly
--- */
function buildCorpus($docList, $corpusName) {

	var documents = [];

	// scan all documents
	for (let i in $docList) {

		// check if access correct corpus data
		let corpusName = $docList[i].docInfo.corpus;
		if (corpusName !== $corpusName) continue;

		// put document into corpus
		let parsedDocument = parseDocument($docList[i].docInfo);
		documents.push(parsedDocument);
	}

	// create new corpus
	if (_dataset[$corpusName] === undefined) {
		_dataset.newCorpus($corpusName, documents);

	// TODO: 尚未測試
	} else {
		_dataset.addDocsToCorpus($corpusName, documents);
	}

}


