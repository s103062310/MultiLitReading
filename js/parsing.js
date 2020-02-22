/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
This file defined the functions that used to parse the data of 
document information.
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */


/* ---
parse document information object from docusky into Document data structure
INPUT: 1) Object, document information from DocuSky
       2) string, source of data, 'sky' = from DocuSky, 'local' = from Computer
OUTPUT: Document
--- */
function parseDocument($docuInfo, $source) {

	// parse all content
	var contentList = {};
	var contentStr = ($source === 'sky') ?'docContentXml' :'doc_content';
	var docId = $docuInfo.docId;
	var metadataList = parseDocuMetadata($docuInfo, $source);
	var parsedContent = parseDocuContent($docuInfo[contentStr])

	// initialize
	var anchorNames = getAnchorNames($docuInfo[contentStr])
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
INPUT: 1) Object, document information from DocuSky
       2) string, source of data, 'sky' = from DocuSky, 'local' = from Computer
OUTPUT: array, all metadata, [for align, for system]
--- */
function parseDocuMetadata($docuInfo, $source) {
	var parsed_meta = {}, parsed_system = {};
	var skipData = ['docId', 'docTimeCreated', 'docXmlFormatSubname', 'xmlFormatName', 'srcFilename', 'docContentXml', 'docAttachmentType', 'doc_content'];

	// for each data
	for (let item in $docuInfo) {

		// system data
		if (itemInList(item, skipData) || itemInList('Order', item)) {
			parsed_system[item] = $docuInfo[item];
			continue;
		}

		// metadata
		let meta = ($source == 'sky') ?((item in _metaSky2Spec) ?_metaSky2Spec[item] :item) :((item in _metaLocal2Spec) ?_metaLocal2Spec[item] :item);
		if (item === 'docTitleXml') parsed_meta[meta] = $docuInfo[item].substring(10, $docuInfo[item].length - 11);
		else if (item === 'docMetadataXml' || item === 'xml_metadata') Object.assign(parsed_meta, parseUdefMetadata($docuInfo[item]));
		else if (item === 'docAttachmentList' || item === 'doc_attachment') parsed_meta[meta] = "<a href=\"" + $docuInfo[item] + "\" target=\"_blank\">點我看圖片</a>";
		else if (typeof $docuInfo[item] === 'object') Object.assign(parsed_meta, parseObjMetadata($docuInfo[item]));
		else parsed_meta[meta] = $docuInfo[item];
	}

	//console.log(parsed_meta);
	//console.log(parsed_system);

	return [parsed_meta, parsed_system];
}


/* ---
extract user defined metadata from document information
INPUT: string, user defined metadata tags
OUTPUT: array, all user defined metadata
--- */
function parseUdefMetadata($content) {

	// filter xml text
	var i = 0;
	var metadataList = {};
	var content = $content.substring(13, $content.length - 14);

	while (1) {
		let tagStartPos = content.indexOf('<', i);

		// no more metadata
		if (tagStartPos === -1) {
			break;

		// extract metadata
		} else {
			let tagEndPos = content.indexOf('>', tagStartPos);
			let tagName = content.substring(tagStartPos + 1, tagEndPos).trim();
			let valueEndPos = content.indexOf('/' + tagName, tagEndPos);
			let value = content.substring(tagEndPos + 1, valueEndPos - 1).trim();
			metadataList['自訂-' + tagName] = value;
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
	var metadataList = {};
	var skipData = ['timeseqNumber', 'timeseqType'];

	for (let item in $content) {
		if (itemInList(item, skipData)) continue;
		metadataList[_metaSky2Spec[item]] = $content[item];
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
	var temp = {};
	for (let j in anchorNames) temp[anchorNames[j]] = '';

	// parse
	while (i < $docuContent.length) {

		// detect tag
		if ($docuContent[i] === '<') {

			// get whole tag information
			let tagPosEnd = $docuContent.indexOf('>', i);
			let tagStr = $docuContent.substring(i + 1, tagPosEnd).trim();
			let tagInfo = analyzeTag(tagStr);

			// end tag
			if (tagInfo.tagName[0] === '/') {
				
				// get rid of Align tag
				if (tagInfo.tagName.substring(1, 6) !== 'Align') {

					// close the latest writing flag of tag, except Align tag
					for (let j=parsed.length-1; j>=0; j--) {
						if(parsed[j].tagInfo.tagName !== 'AlignBegin' && parsed[j].isWrite) {
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
						parsed.push({tagInfo: new Tag({tagName: 'AlignBegin', Type: tagInfo.Type}), isWrite: false, content: temp[tagInfo.Type]});
						temp[tagInfo.Type] = '';
					}

					// start new block
					parsed.push({tagInfo: tagInfo, isWrite: true, content:''});

				// AlignEnd - close align tag that has correspond key
				} else if (tagInfo.tagName === 'AlignEnd') {
					for (let j in parsed) {
						if (parsed[j].tagInfo.Key === tagInfo.Key) {
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

			// fliter strange charactor (seems like new line, tab)
			if ($docuContent[i].charCodeAt() !== 9 && $docuContent[i].charCodeAt() !== 10 && $docuContent[i].charCodeAt() !== 13) {
				
				// push new charactor for each writable tag block
				let alignDetector = [];
				for (let tag in parsed) {
					if (parsed[tag].isWrite) {
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
			parsed.push({tagInfo: new Tag({tagName: 'AlignBegin', Type: type}), isWrite: false, content: temp[type]});
	}
	
	// console.log(parsed);

	return parsed;
}


/* ---
transform tag string into Tag data structure
INPUT: string, XML tag string (<....>)
OUTPUT: Tag, array of tag name and all attribute
--- */
function analyzeTag($tagStr) {

	// extract tagName
	var tagInfo = {};
	var pos = $tagStr.indexOf(' ');

	// no attribute
	if (pos == -1) tagInfo['tagName'] = $tagStr.substring(0, $tagStr.length); 

	// has attribute
	else {
		tagInfo['tagName'] = $tagStr.substring(0, pos);

		// parse attribute
		while(pos < $tagStr.length) {
			if ($tagStr[pos]==' ' || $tagStr[pos]=='/') pos++;
			else {
				let attrNamePosEnd = $tagStr.indexOf('=', pos);
				let attrName = $tagStr.substring(pos, attrNamePosEnd).trim();
				let attrValuePosStart = $tagStr.indexOf('"', attrNamePosEnd);
				let attrValuePosEnd = $tagStr.indexOf('"', attrValuePosStart+1);
				let attrValue = $tagStr.substring(attrValuePosStart+1, attrValuePosEnd).trim();
				tagInfo[attrName] = attrValue;
				pos = attrValuePosEnd + 1;
			}
		}
	}

	return new Tag(tagInfo);
}

