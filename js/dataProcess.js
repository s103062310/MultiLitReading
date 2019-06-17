/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
This file defined the functions that used to process the raw
data from DocuSky (parsing) and data in system.
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */


/* ---
parse document information object from docusky into Document data structure
INPUT: Object, document information from DocuSky
OUTPUT: Document
--- */
function parseDocument($docuInfo) {

	// parse all content
	var contentList = [];
	var docId = $docuInfo.docId;
	var metadataList = parseDocuMetadata($docuInfo);
	var parsedContent = parseDocuContent($docuInfo.docContentXml)

	// initial
	var anchorNames = getAnchorNames($docuInfo.docContentXml);
	for (let alignType in anchorNames) contentList[anchorNames[alignType]] = [];
	contentList['FullText'] = [];

	// pick information of Align tag to document data structure
	for (let i in parsedContent) {
		let tag = parsedContent[i].tagInfo;
		tag['Key'] = docId.toString() + '_' + i.toString();

		// align type
		if (tag.tagName === 'AlignBegin') contentList[tag.Type].push(new AnchorBlock(tag, parsedContent[i].content));
		
		// full text
		else if (tag.tagName === 'Content') contentList['FullText'].push(new AnchorBlock(tag, parsedContent[i].content));
	}
	
	return new Document(metadataList, contentList);
}


/* ---
extract metadata from document information to a list
INPUT: Object, document information from DocuSky
OUTPUT: array, all metadata, [for align, for system]
--- */
function parseDocuMetadata($docuInfo) {

	var parsed_meta = [];
	var parsed_system = [];
	var skipData = ['docId', 'docTimeCreated', 'docXmlFormatSubname', 'xmlFormatName', 'srcFilename', 'docContentXml'];
	var space = new RegExp(' ', 'g');

	for (let item in $docuInfo) {

		// skip data
		if (itemInList(item, skipData) || itemInList('Order', item)) {
			parsed_system[item] = $docuInfo[item].replace(space, '-');
			continue;
		}

		// convert xml and object data
		if (item === 'docTitleXml') parsed_meta[item] = $docuInfo[item].substring(10, $docuInfo[item].length - 11).replace(space, '-');
		else if (item === 'docMetadataXml') parsed_meta = concate(parsed_meta, parseUdefMetadata($docuInfo[item]));
		else if (item === 'docAttachmentList') parsed_meta[item] = "<a href=\"" + $docuInfo[item] + "\" target=\"_blank\">點我看圖片</a>";
		else if (typeof $docuInfo[item] === 'object') parsed_meta = concate(parsed_meta, parseObjMetadata($docuInfo[item]));
		else parsed_meta[item] = $docuInfo[item].replace(space, '-');
	}

	// console.log(parsed);

	return [parsed_meta, parsed_system];
}


/* ---
extract user defined metadata from document information
INPUT: string, user defined metadata tags
OUTPUT: array, all user defined metadata
--- */
function parseUdefMetadata($content) {

	var i = 0;
	var metadataList = [];
	var space = new RegExp(' ', 'g');
	var content = $content.substring(13, $content.length - 14);
	// console.log(content);

	while (i < content.length) {
		let tagStartPos = content.indexOf('<', i);

		// no more metadata
		if (tagStartPos === -1) {
			break;

		// extract metadata
		} else {
			let tagEndPos = content.indexOf('>', tagStartPos);
			let tagName = content.substring(tagStartPos + 1, tagEndPos);
			let valueEndPos = content.indexOf('/' + tagName, tagEndPos);
			let value = content.substring(tagEndPos + 1, valueEndPos - 1);
			metadataList[tagName] = value.replace(space, '-');
			i = valueEndPos;
			// console.log(tagName, value, i);
		}
	}

	// console.log(metadataList);

	return metadataList;
}


/* ---
extract metadata in object format from document information
INPUT: object, small part of metadata list
OUTPUT: array, all metadata in object
--- */
function parseObjMetadata($content) {

	var metadataList = [];
	var space = new RegExp(' ', 'g');
	var skipData = ['timeseqNumber', 'timeseqType'];

	for (let item in $content) {
		if (itemInList(item, skipData)) continue;
		metadataList[item] = $content[item].replace(space, '-');
	}

	return metadataList;
}


/* ---
give XML content and parse it to elements that including tag information and text
INPUT: string, XML content
OUTPUT: array, length = number of tags in XML
		each element, -- --> tagInfo
						|--> content
--- */
function parseDocuContent($docuContent) {
	
	var i = 0;						// iterator
	var parsed = [];				// parsed data for whole content
	var anchorNames = getAnchorNames($docuContent);
	
	// store for text that don't have align tag
	var temp = [];
	for (let j in anchorNames) temp[anchorNames[j]] = '';

	//console.log($docuContent);

	// parse
	while (i < $docuContent.length) {

		// detect tag
		if ($docuContent[i] === '<') {

			// get whole tag information
			let tagPosEnd = $docuContent.indexOf('>', i);
			let tagStr = $docuContent.substring(i + 1, tagPosEnd);
			let tagInfo = analyzeTag(tagStr);
			// console.log(tagInfo);

			// end tag
			if (tagInfo.tagName[0] === '/') {
				
				// get rid of Align tag
				if (tagInfo.tagName.substring(1, 6) !== 'Align') {

					// close the latest writing flag of tag, except Align tag
					for (let j=parsed.length-1; j>=0; j--) {
						if(parsed[j].tagInfo.tagName !== 'AlignBegin' && parsed[j].isWrite === true) {
							parsed[j].isWrite = false;
							break;
						}
					}
				}

			// begin tag
			} else {

				// AlignBegin - start new align tag
				if (tagInfo.tagName === 'AlignBegin') {

					// if there are texts before Align tag, create new block for them
					if (temp[tagInfo.Type].length > 0) {
						parsed.push({tagInfo: new Tag({tagName: 'AlignBegin', Type: tagInfo.Type}), isWrite: false, content: temp});
						temp[tagInfo.Type] = '';
					}

					// start new block
					parsed.push({tagInfo: tagInfo, isWrite: true, content:''});

				// AlignEnd - close align tag that has correspond key
				} else if (tagInfo.tagName === 'AlignEnd') {
					for (let j in parsed) {
						if (parsed[j].tagInfo.Key == tagInfo.Key) {
							parsed[j].isWrite = false;
							break;
						}
					}

				// change line
				} else if (tagInfo.tagName === 'br/') {
					for (let tag in parsed) {
						if (parsed[tag].isWrite === true) parsed[tag].content += '<br>';
					}

				// normal tag
				} else {
					parsed.push({tagInfo: tagInfo, isWrite: true, content:''});
				}
			}

			i = tagPosEnd + 1;

		// normal charactor
		} else {

			// fliter strange charactor (seems like new line)
			if ($docuContent[i].charCodeAt() !== 10 && $docuContent[i].charCodeAt() !== 13) {
				
				// push new charactor for each writable tag block
				let alignDetector = [];
				for (let tag in parsed) {
					if (parsed[tag].isWrite === true) {
						parsed[tag].content += $docuContent[i];
						if (parsed[tag].tagInfo.tagName === 'AlignBegin') alignDetector.push(parsed[tag].tagInfo.Type);
					}
				}

				// if don't write to Align tag, store text into temp (user don't highlight it in document)
				for (let type in temp) {
					if (!itemInList(type, alignDetector)) temp[type] += $docuContent[i];
				}
			}

			i++;
		}
	}

	// see if there is remaining text
	for (let type in temp) {
		if (temp[type].length > 0) 
			parsed.push({tagInfo: new Tag({tagName: 'AlignBegin', Type: type}), isWrite: false, content: temp});
	}
	
	//console.log(parsed);

	return parsed;
}


/* ---
transform tag string into Tag data structure
INPUT: string, XML tag string (<....>)
OUTPUT: Tag, array of tag name and all attribute
--- */
function analyzeTag($tagStr) {
	
	// parse string
	var tagInfo = [];
	var parsed = $tagStr.split(' ');

	// analyze for each attribute
	for (let attr in parsed) {

		// tag name
		if (attr == 0) tagInfo['tagName'] = parsed[attr];

		// other attribute
		else {
			let attrNamePosEnd = parsed[attr].indexOf('=');
			let attrName = parsed[attr].substring(0, attrNamePosEnd);
			let attrValuePosStart = parsed[attr].indexOf('"');
			let attrValuePosEnd = parsed[attr].indexOf('"', attrValuePosStart+1);
			let attrValue = parsed[attr].substring(attrValuePosStart+1, attrValuePosEnd);
			tagInfo[attrName] = attrValue;
		}
	}

	return new Tag(tagInfo);
}


/* ---
concate two list
INPUT: two list to be concated
OUTPUT: list, list1 + list2
--- */
function concate(list1, list2) {
	for (let item in list2) list1[item] = list2[item];
	return list1;
}


/* ---
pick the block that contain keyword
INPUT: 1) string, target corpus name
       2) string, target anchor type name
       3) string, analysis mode
       4) string, keyword
OUTPUT: object, search results
--- */
function searchInCorpus($corpusName, $anchorName, $mode, $query) {

	var results = [];

	for (let doc in _dataset[$corpusName]) {
		if (doc == 'isShow') continue;

		// document content
		let title = _dataset[$corpusName][doc].metadata.docTitleXml;
		let anchors = _dataset[$corpusName][doc][$anchorName];
		let blocks = (anchors !== undefined) ?anchors :_dataset[$corpusName][doc]['FullText'];

		// search in block
		for (let i in blocks) {
			if (itemInList($query, blocks[i].blockContent)) {
				if ($mode === '文件順序') {
					if (results[title] === undefined) results[title] = [];
					results[title].push(blocks[i]);
				} else if ($mode === '錨點類別') {
					let id = blocks[i].tagInfo.Term;
					if (results[id] === undefined) results[id] = [];
					results[id].push(blocks[i]);
				}
			}
		}
	}

	return results;
}


