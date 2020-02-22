/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
This file defined all checker (return a boolean value) and 
getter (get some information).
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */


// * * * * * * * * * * * * * * * * checker * * * * * * * * * * * * * * * * *


/* ---
check if specific database is in the system
INPUT: string, target database source filename
OUTPUT: boolean, in system = true, not in system = false
--- */
function DBinSystem($dbName) {
	if (_inSystem[$dbName] === undefined) return false;
	else return true;
}


/* ---
check if specific corpus is in the system
INPUT: 1) string, target database source filename
       2) string, target corpus name
OUTPUT: boolean, in system = true, not in system = false
--- */
function corpusInSystem($dbName, $corpusName) {
	if (_inSystem[$dbName][$corpusName] === undefined) return false;
	else return true;
}


/* ---
check if specific item is in the list
INPUT: 1) single list element
       2) target list
OUTPUT: boolean, in list = true, not in list = false
--- */
function itemInList($item, $list) {
	if ($list.indexOf($item) === -1) return false;
	else return true;
}


// * * * * * * * * * * * * * * * * getter * * * * * * * * * * * * * * * * * * * * 


/* ---
extract source file name of database from document list
INPUT: array, documents object
OUTPUT: string, database filename
--- */
function getDBsrcFilename($docList) {
	return $docList[0].docInfo.srcFilename;
}


/* ---
extract all corpus names from document list
INPUT: array, documents object
OUTPUT: array, corpus names
--- */
function getCorpusNames($docList) {
	var corpusNames = [];

	// scan all document
	for (let i in $docList) {
		let corpusName = $docList[i].docInfo.corpus;
		if (!itemInList(corpusName, corpusNames)) corpusNames.push(corpusName);
	}

	return corpusNames;
}


/* ---
extract all anchor names from single document content
INPUT: string, document xml content
OUTPUT: array, anchor names / align types
--- */
function getAnchorNames($docuContent) {
	var i = 0;
	var anchorNames = [];

	while (i < $docuContent.length) {

		// find tag
		let tagStartPos = $docuContent.indexOf('<AlignBegin', i);
		if (tagStartPos === -1) break;

		// find anchor type
		let tagEndPos = $docuContent.indexOf('>', tagStartPos);
		let tagString = $docuContent.substring(tagStartPos + 1, tagEndPos);
		let attrStartPos = tagString.indexOf('Type');
		if (attrStartPos === -1) {
			alert("[Error] XML 格式錯誤，AlignBegin tag 中未發現 Type 屬性。");
			i = tagEndPos + 1;
			continue;
		}

		// extract anchor type
		let attrEndPos = tagString.indexOf('\"', attrStartPos + 6);
		let attrValue = tagString.substring(attrStartPos + 6, attrEndPos);

		// push into list
		if (!itemInList(attrValue, anchorNames)) anchorNames.push(attrValue);
		i = tagEndPos + 1;
	}

	return anchorNames;
}


/* ---
return first corpus name in dataset
INPUT: none, access through global variable
OUTPUT: string, corpus name
--- */
function getFirstCorpus() {
	for (let corpusName in _dataset) {
		if (typeof _dataset[corpusName] !== 'object') continue;
		return corpusName;
	}
	return 'error';
}


/* ---
return first align type in dataset
INPUT: none, access through global variable
OUTPUT: string, align type
--- */
function getFirstAlignType() {
	var corpusName = getFirstCorpus();
	if (corpusName !== 'error') {
		for (let item in _dataset[corpusName][0]) {
			if (item === 'metadata' || item === 'systemdata') continue;
			return item;
		}
	}
	return 'error';
}


/* ---
collect all align type in dataset
INPUT: none, access through global variable
OUTPUT: array, all align type
--- */
function getAlignTypeList() {
	var alignTypeList = [];

	for (let corpusName in _dataset) {
		if (typeof _dataset[corpusName] !== 'object') continue;

		let documents = _dataset[corpusName];
		for (let i in documents) {
			if (typeof documents[i] !== 'object') continue;

			for (let element in documents[i]) {
				if (element === 'metadata' || element === 'systemdata') continue;
				if (!itemInList(element, alignTypeList)) alignTypeList.push(element);
			}
		}
	}

	return alignTypeList;
}


/* ---
collect all metadata in dataset
INPUT: none, access through global variable
OUTPUT: array, all metadata
--- */
function getMetadataList() {
	var metadataList = [];

	for (let corpusName in _dataset) {
		if (typeof _dataset[corpusName] !== 'object') continue;

		let documents = _dataset[corpusName];
		for (let i in documents) {

			let list = documents[i].metadata;
			for (let item in list) {
				if (!itemInList(item, metadataList)) metadataList.push(item);
			}
		}
	}

	return metadataList;
}


/* ---
see users' choice in given list (extract information from html setting)
INPUT: list in html
OUTPUT: string, html text of active item
--- */
function getActiveItemInList($span) {
	var list = $span[0].children[0].children;
	for (let i=0; i<list.length; i++) {
		if (list[i].className === 'glyphicon glyphicon-pushpin notHover') {
			return list[i-1].innerText;
		}
	}
	return 'error';
}


/* ---
give unique key value and get correspond refid
INPUT: string, key value
OUTPUT: string, refid
--- */
function getRefIdFromKey($key) {

	// get target corpus
	var corpusName = getActiveItemInList($('.controlContentBlock[id=search-corpus]'));
	var anchorName = getActiveItemInList($('.controlContentBlock[id=compare-alignSetting]'));
	if (corpusName === 'error' || anchorName === 'error') {
		alert("[Error] 讀取對讀設定錯誤。");
		return;
	}

	// find target
	for (let doc in _dataset[corpusName]) {
		let anchors = _dataset[corpusName][doc][anchorName];
		let blocks = (anchors !== undefined) ?anchors :_dataset[corpusName][doc]['FullText'];

		for (let i in blocks) {
			if (blocks[i].tagInfo.Key === $key) return blocks[i].tagInfo.RefId;
		}
	}

	// don't find target
	return 'error';
}


/* ---
get corpus No. of 'isShow = true'
INPUT: none, access through global variable
OUTPUT: int, corpus No. of 'isShow = true'
--- */
function getShowedCorpusNum() {
	var num = 0;
	for (corpusName in _dataset) {
		if (typeof _dataset[corpusName] !== 'object') continue;
		if (_dataset[corpusName].isShow) num++;
	}
	return num;
}

