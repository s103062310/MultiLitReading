/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
This file's functions:
1. defined all used data structures and global variables.
2. initialization of the program.
3. other small tools.
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */


// * * * * * * * * * * * * * * * * variables * * * * * * * * * * * * * * * * *

var _url;
var _para = {};

var _docuSkyObj = null;			// global variable for accessing widget
var _allDocList = [];			// all doc list in database
var _inSystem = {};				// record the status of what data are in system
var _docID = 0;

var _color = new Color();
var _searchMode = new SearchMode();
var _dataset = new Dataset();	// data that user import from docusky
								// corpuses >> documents >> anchors

// convert metadata english name to chinese
var _metadata, _metaSky2Spec, _metaLocal2Spec;
$.getJSON('js/meta.json', function(result) {
	_metadata = result['meta2ch'];
	_metaSky2Spec = result['sky2meta'];
	_metaLocal2Spec = result['local2meta'];
});


// * * * * * * * * * * * * * * * * data structures * * * * * * * * * * * * * * * * *


/* ---
organizing method when searching
INPUT: none
OUTPUT: SearchMode
--- */
function SearchMode() {
	this['DocOrder'] = '文件順序';
	this['Term'] = '錨點類別';
}


/* ---
HEX of color
INPUT: none
OUTPUT: Color, all defined color used in system
--- */
function Color() {
	this.highlightblock = '#FCECC9';	// light-yellow
	this.highlightblockdark = '#BCA371';// dark-yellow

	this.highlighttarget = '#FCB0B3';	// light-red
	this.highlighttargetdark = '#C45B59';//dark-red

	this.controltitle = '#505C67';		// dark-black
	this.controltitlehover = '#6F7982';	// dark-medium-black
	this.controltexthover = "CED1D2";	// light-medium-black
	this.controltext = '#E2E5E7';		// light-black

	this.comparetitle = '#617E9B';		// dark-blue
	this.comparetitlehover = '#7D95AD';	// dark-medium-blue
	this.comparetexthover = '#C5D0DA';	// light-medium-blue
	this.comparetext = '#DFE7EE';		// light-blue

	this.searchtitle = '#628475';		// dark-green
	this.searchtitlehover = '#7E9A8E';	// dark-medium-green
	this.searchtexthover = '#C8D1CD';	// light-medium-green
	this.searchtext = '#DCE5E1';		// light-green

	this.explaintitle = '#756F63';		// dark-brown
	this.explaintitlehover = '#817C71';	// dark-medium-brown
	this.explaintexthover = '#BAB8B4';	// light-medium-brown
	this.explaintext = '#CCCAC6';		// light-brown
}


/* ---
Data Structure of whole dataset
INPUT: none
OUTPUT: Dataset, empty container
--- */
function Dataset() {
	this.newCorpus = function($dbName, $corpusName, $documents) {
		this[$corpusName] = new Corpus($documents, $dbName);
	}
}


/* ---
Data Structure of single corpus
INPUT: array of Document, documents in the corpus
OUTPUT: Corpus
isShow: show or hide in system
--- */
function Corpus($documents, $dbName) {
	this.isShow = true;
	this.dbName = $dbName;
	for (let i in $documents) {
		this[i] = $documents[i];
	}
}


/* ---
Data Structure of single document
INPUT: 1) array, metadata list
       2) array, content of each anchor type
OUTPUT: Document
--- */
function Document($metadata, $content) {
	this.metadata = $metadata[0];
	this.systemdata = $metadata[1];
	for (let anchorType in $content) {
		this[anchorType] = $content[anchorType];
	}
}


/* ---
Data Structure of single anchor block
INPUT: 1) Tag, information of this block
       2) string, text of anchor block
OUTPUT: AnchorBlock
--- */
function AnchorBlock($tagInfo, $text) {
	if (!$tagInfo.Type) $tagInfo.Type = 'FullText';
	this.tagInfo = $tagInfo;
	this.blockContent = $text;
}


/* ---
Data Structure of Tag
INPUT: array, attribute list of single tag
OUTPUT: Tag
--- */
function Tag($tagInfo) {
	for (let attr in $tagInfo) {
		this[attr] = $tagInfo[attr];
	}
}


// * * * * * * * * * * * * * * * * initialization * * * * * * * * * * * * * * * * *


/* ---
trigger initialization until finishing initialization when file is ready
--- */
$(document).ready(function() {
	setInterval(setDocuSkyObj, 1000);

	// parse parameter
	_url = new URL(window.location.href);

	// load source
	if (_url.searchParams.has('public')) {
		if (_url.searchParams.get('public') == '春秋三傳') {
			$('head title').empty();
			$('head title').append('春秋三傳對讀系統');
			$('#navTitle').empty();
			$('#navTitle').append('春秋三傳對讀系統');
			$('.explainInterface').load('html/exp_chunqiu.html');
		}

		$('html').append('<script src="js/proj.js"></script>');
		displayDefault();

	} else {
		$('.explainInterface').load('html/exp_general.html');
		$('html').append('<script src="js/general.js"></script>');
	}
});


/* ---
initialization, get _docuSkyObj
--- */
function setDocuSkyObj() {

	if (docuskyGetDbCorpusDocumentsSimpleUI === null) {
		alert("widget 尚未準備好，請稍等。");
	} else if (_docuSkyObj === null) {
		_docuSkyObj = docuskyGetDbCorpusDocumentsSimpleUI;
		//console.log(_docuSkyObj);
		
		// public database
		if (_url.searchParams.has('public')) {
			_docuSkyObj.getDbCorpusDocuments('OPEN', _url.searchParams.get('public'), '[ALL]', null, getEntireDbCorpusText);
		}
	}

	clearInterval(setDocuSkyObj);
}


// * * * * * * * * * * * * * * * * other small tools * * * * * * * * * * * * * * * * *


/* ---
auto generate docID for xml that upload from local
--- */
function generateID() {
	_docID += 1;
	return 'XML' + _docID.toString();
}


/* ---
initial id for each corpus that juse loading in system
INPUT: array, all corpus names
--- */
function initialCorpusID($corpusNames) {
	var corpuses = {};
	for (let i in $corpusNames) corpuses[$corpusNames[i]] = -1;
	return corpuses;
}

