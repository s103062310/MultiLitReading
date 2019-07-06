/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
This file defined all used data structures and global variables.
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */


var _docuSkyObj = null;			// global variable for accessing widget
var _allDocList = [];			// all doc list in database
var _inSystem = [];				// record the status of what data are in system

var _color = new Color();
var _searchMode = new SearchMode();
var _dataset = new Dataset();	// data that user import from docusky
								// corpuses >> documents >> anchors


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
	this.controlhover = '#6F7982';		// dark-medium-black
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

	// create new corpus in dataset
	this.newCorpus = function($corpusName, $documents) {
		this[$corpusName] = new Corpus($documents);
	}

	// add data in existed corpus
	this.addDocsToCorpus = function($corpusName, $documents) {
		this[$corpusName]['isShow'] = true;
		for (let i in $documents) {
			this[$corpusName][i] = $documents[i];
		}
	}

}


/* ---
Data Structure of single corpus
INPUT: array of Document, documents in the corpus
OUTPUT: Corpus
isShow: show or hide in system
--- */
function Corpus($documents) {
	this['isShow'] = true;
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
	this['metadata'] = $metadata[0];
	this['systemdata'] = $metadata[1];
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

