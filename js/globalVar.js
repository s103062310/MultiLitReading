/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
This file's functions:
1. defined all used data structures and global variables.
2. initialization of the program.
3. other small tools.
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */


// * * * * * * * * * * * * * * * * variables * * * * * * * * * * * * * * * * *


var _docuSkyObj = null;			// global variable for accessing widget
var _allDocList = [];			// all doc list in database
var _inSystem = {};				// record the status of what data are in system
var _docID = 0;

var _color = new Color();
var _searchMode = new SearchMode();
var _dataset = new Dataset();	// data that user import from docusky
								// corpuses >> documents >> anchors

// convert metadata english name to chinese
var _metadata = {filename: '檔名', corpus: '文獻集名稱', compilation_name: '文件出處', compilation_order: '文件出處的次序', compilation_vol: '文件出處的冊數', title: '文件標題', author: '文件作者', doc_topic_l1: '文件主題階層一', doc_topic_l2: '文件主題階層二', doc_topic_l3: '文件主題階層三', geo_level1: '文件地域階層一', geo_level2: '文件地域階層二', geo_level3: '文件地域階層三', geo_longitude: '文件所在經度', geo_latitude: '文件所在緯度', doc_category_l1: '文件分類階層一', doc_category_l2: '文件分類階層二', doc_category_l3: '文件分類階層三', docclass: '文件類別', docclass_aux: '文件子類別', doctype: '文件型態', doctype_aux: '文件子型態', book_code: '文件書碼', time_orig_str: '文件時間(字串)', time_varchar: '文件時間(西曆)', time_norm_year: '文件時間(中曆)', time_era: '文件時間(年號)', time_norm_kmark: '文件時間(帝號)', year_for_grouping: '文件時間(西元年)', time_dynasty: '文件時間(朝代)', doc_seq_number: '文件順序', timeseq_not_before: '文件起始時間', timeseq_not_after: '文件結束時間', doc_source: '文件來源', doc_attachment: '文件圖檔', doc_attachment_captions: '圖說'};

var _metaSky2Spec = {docFilename: 'filename', corpus: 'corpus', docCompilation: 'compilation_name', docTitleXml: 'title', docAuthor: 'author', docTopicL1: 'doc_topic_l1', docTopicL2: 'doc_topic_l2', docTopicL3: 'doc_topic_l3', geoLevel1: 'geo_level1', geoLevel2: 'geo_level2', geoLevel3: 'geo_level3', geoX: 'geo_longitude', geoY: 'geo_latitude', docCategoryL1: 'doc_category_l1', docCategoryL2: 'doc_category_l2', docCategoryL3: 'doc_category_l3', docClass: 'docclass', docSubclass: 'docclass_aux', docType: 'doctype', docSubtype: 'doctype_aux', docBookCode: 'book_code', dateOrigStr: 'time_orig_str', dateAdDate: 'time_varchar', dateChNormYear: 'time_norm_year', dateEra: 'time_era', dateEmperorTitle: 'time_norm_kmark', dateAdYear: 'year_for_grouping', dateDynasty: 'time_dynasty', timeseqNotBefore: 'timeseq_not_before', timeseqNotAfter: 'timeseq_not_after', docSource: 'doc_source', docAttachmentList: 'doc_attachment', docAttachmentCaptions: 'doc_attachment_captions'};

var _metaLocal2Spec = {era: 'time_era'};


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

