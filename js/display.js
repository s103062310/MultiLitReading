/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
This file is responsible for UI display, used javascript to 
modify html dynamicly.
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */


/* ---
highlight the hit block
INPUT: 1) string, selector keyword
       2) string, HEX of color that be changed
--- */
function changeContentBlockColor($selector, $color, $className) {
	$($selector).css('background-color', $color);
	$($selector).attr('class', $className);
}


/* ---
clean all highlight color in blocks
INPUT: html range that need to clean color
--- */
function cleanContentBlockColor($range) {
	let taggedArray = $($range + " .tagged");
	for(let i=0; i<taggedArray.length; i++) {
		$(taggedArray[i]).removeClass('tagged');
		$(taggedArray[i]).removeAttr('style');
	}
}


// displayAll


// * * * * * * * * * * * * * * * * control board * * * * * * * * * * * * * * * * *


// displayDocuManager


/* ---
compare - metadata setting block
INPUT: string, active metadata
--- */
function displayMetadataList($activeMetadata) {

	// prepare data and clear
	var metadataList = getMetadataList();
	$(".controlContentBlock[id=compare-metadataSetting] > ol").empty();

	// show each metadata
	for (let item in metadataList) {
		let metadata = metadataList[item];
		let metaName = (metadata in _metadata) ?_metadata[metadata] :metadata;
		let metaSetting = "<li>" + metaName + "</li>";
		if ($activeMetadata === metadata) {
			metaSetting += "<span class=\"glyphicon glyphicon-pushpin notHover\"></span>";
		} else metaSetting += "<span class=\"glyphicon glyphicon-retweet\" onclick=\"changeMetadata('" + metadata + "')\"></span>";
		$(".controlContentBlock[id=compare-metadataSetting] > ol").append(metaSetting);
	}
}


/* ---
compare - align setting block
INPUT: string, active align type
--- */
function displayAlignTypeList($activeAlignType) {

	// prepare data and clear
	var alignTypeList = getAlignTypeList();
	$(".controlContentBlock[id=compare-alignSetting] > ol").empty();

	// show each anchor type
	for (let anchor in alignTypeList) {
		let alignType = alignTypeList[anchor];
		let alignSetting = "<li>" + alignType + "</li>";
		if ($activeAlignType === alignType) {
			alignSetting += "<span class=\"glyphicon glyphicon-pushpin notHover\"></span>";
		} else alignSetting += "<span class=\"glyphicon glyphicon-retweet\" onclick=\"changeAlignType('" + alignType + "')\"></span>";
		$(".controlContentBlock[id=compare-alignSetting] > ol").append(alignSetting);
	}
}


/* ---
search - target corpus of search
INPUT: string, active corpus
--- */
function displaySearchCorpus($activeCorpusName) {

	// clear
	$(".controlContentBlock[id=search-corpus] > ol").empty();

	// show each corpus
	for (let corpusName in _dataset) {
		if (typeof _dataset[corpusName] !== 'object') continue;

		let displayItem = "<li>" + corpusName + "</li>";
		if ($activeCorpusName === corpusName) displayItem += "<span class=\"glyphicon glyphicon-pushpin notHover\"></span>";
		else displayItem += "<span class=\"glyphicon glyphicon-retweet\" onclick=\"changeSearchCorpus('" + corpusName + "')\"></span>";
		$(".controlContentBlock[id=search-corpus] > ol").append(displayItem);
	}
}


/* ---
search - search mode setting
INPUT: string, active corpus
--- */
function displaySearchMode($activeMode) {

	// clear
	$(".controlContentBlock[id=search-mode] > ol").empty();

	// show each mode
	for (let mode in _searchMode) {
		let displayItem = "<li>" + _searchMode[mode] + "</li>";
		if ($activeMode === mode) displayItem += "<span class=\"glyphicon glyphicon-pushpin notHover\"></span>";
		else displayItem += "<span class=\"glyphicon glyphicon-retweet\" onclick=\"changeSearchMode('" + mode + "')\"></span>";
		$(".controlContentBlock[id=search-mode] > ol").append(displayItem);
	}
}


// * * * * * * * * * * * * * * * * compare interface * * * * * * * * * * * * * * * * *


/* ---
INPUT: 1) string, active metadata
	   2) string, active align type
--- */
function displayCompareContent($activeMetadata, $activeAlignType) {

	// clear
	$(".compareContentBlock").empty();
	$(".compareTitleBlock").empty();

	// show all data
	for (let corpusName in _dataset) {
		if (typeof _dataset[corpusName] !== 'object') continue;

		// create corpus column
		let corpusBlock = "<div class=\"corpusBlock\" name=\"" + corpusName + "\">";
		for (let doc in _dataset[corpusName]) {
			if (typeof _dataset[corpusName][doc] !== 'object') continue;

			// title of single document
			let singleDocument = _dataset[corpusName][doc];
			let docId = singleDocument.systemdata.docId;
			let docMeta = singleDocument.metadata[$activeMetadata];
			let docTitle = singleDocument.metadata.title;
			let titleBlock = "<div><div class=\"titleBlock\" metaForAlign=\"" + docMeta + "\" key=\"" + docId + "\"><span onclick=\"moveDocument('" + docId + "', '" + corpusName + "')\">" + docTitle + "</span><span class=\"glyphicon glyphicon-chevron-down\" onclick=\"collapseMetadata('" + docId + "', this)\"></span></div>";
			corpusBlock += titleBlock;

			// metadata of single document
			let metadataBlock = "<div class=\"metadataBlock\" key=\"" + docId + "\">";
			for (item in singleDocument.metadata) {
				let metaName = (item in _metadata) ?_metadata[item] :item;
				if (item === $activeMetadata) metadataBlock += "<li class=\"" + item + " pinned\">" + metaName + ": " + singleDocument.metadata[item] + "</li>";
				else metadataBlock += "<li name=\"" + item + "\">" + metaName + ": " + singleDocument.metadata[item] + "</li>";
			}
			metadataBlock += "</div>";
			corpusBlock += metadataBlock;

			// contents of single document
			let blocks = (singleDocument[$activeAlignType] !== undefined) ?singleDocument[$activeAlignType] :singleDocument['FullText'];
			for (let block in blocks) {
				let singleBlock = blocks[block];
				let blockText = singleBlock.blockContent;
				let blockID = singleBlock.tagInfo.RefId;
				let blockKey = singleBlock.tagInfo.Key;
				let blockTerm = singleBlock.tagInfo.Term;
				let blockTag = (blockTerm === undefined) ? "" :"<span class=\"term\">" + blockTerm + "</span><br/>";
				let textBlock = "<div class=\"textBlock\" idForAlign=\"" + blockID + "\" key=\"" + blockKey + "\" onclick=\"moveAnchor('" + blockID + "', '" + blockKey + "', '" + corpusName + "')\">" + blockTag + blockText + "</div>"
				corpusBlock += textBlock;
			}
			corpusBlock += "</div>";
		}

		// display
		corpusBlock += "</div>";
		$(".compareContentBlock").append(corpusBlock);
		$(".compareTitleBlock").append("<h1 name=\"" + corpusName + "\">" + corpusName + "</h1>");

		// close hide corpus
		if (!_dataset[corpusName].isShow) {
			$('.compareTitleBlock h1[name="' + corpusName + '"]').hide();
			$('.corpusBlock[name="' + corpusName + '"]').hide();
		}

		// collapse metadatablock
		for (let doc in _dataset[corpusName]) {
			if (typeof _dataset[corpusName][doc] !== 'object') continue;
			collapse(".metadataBlock[key=" + _dataset[corpusName][doc].systemdata.docId + "]");
		}
	}

	// default showup when no corpus is shown
	var corpusNum = getShowedCorpusNum();
	if (corpusNum === 0) displayDefaultCompare();

	// modify css column
	else {
		let cssStr = "repeat(" + corpusNum + ", 1fr)";
		$('.compareContentBlock').css('grid-template-columns', cssStr);
		$('.compareTitleBlock').css('grid-template-columns', cssStr);
	}
}


/* ---
default compare interface (when there is no corpus)
--- */
function displayDefaultCompare() {

	// html
	let corpusBlockBegin = "<div class=\"corpusBlock\" name=\"default\"><div>";
	let titleBlock = "<div class=\"titleBlock\"><span class=\"docuCompareBtn\">文件標題</span><span class=\"glyphicon glyphicon-chevron-up\" onclick=\"collapseMetadata('metadata', this)\"></span></div>";
	let metaBlock = "<div class=\"metadataBlock\" key=\"metadata\"><li class=\"metadata1 pinned\">metadata1: 1</li><li class=\"metadata2\">metadata2: 2</li></div>";
	let textBlock1 = "<div class=\"textBlock\">內文1</div>"
	let textBlock2 = "<div class=\"textBlock\">內文2</div>"
	let corpusBlockEnd = "</div></div>";
	let corpusBlock = corpusBlockBegin + titleBlock + textBlock1 + textBlock2 + corpusBlockEnd;
	$(".compareContentBlock").append(corpusBlock);
	$(".compareTitleBlock").append("<h1 name=\"default\">文本名稱</h1>");

	// css
	$('.compareContentBlock').css('grid-template-columns', 'repeat(1, 1fr)');
	$('.compareTitleBlock').css('grid-template-columns', 'repeat(1, 1fr)');
}


// * * * * * * * * * * * * * * * * search interface * * * * * * * * * * * * * * * * *


/* ---
right - search results
INPUT: 1) target corpus
	   2) object, search results data structure
       3) string, keyword
--- */
function displaySearchResult($corpusName, $results, $query) {

	// clear
	$(".searchInterface > h1").empty();
	$(".searchResult").empty();

	// common var
	var keywordNum = 0;
	var resultBlocks = "";
	var keyword = new RegExp($query, 'g');
	var backBtn = "<span class=\"glyphicon glyphicon-chevron-left\" onclick=\"backToCompare(this.parentElement)\"></span>";

	for (let doc in $results) {

		// title of single document
		let titleBlock = "<div class=\"titleBlock\">" + doc + "</div>";
		resultBlocks += titleBlock;

		// contents of single document
		for (let i in $results[doc]) {
			let blockText = $results[doc][i].blockContent.replace(keyword, "<font style='background-color: " + _color.highlighttarget + ";'>"+$query+"</font>");
			let anchorKey = $results[doc][i].tagInfo.Key;
			let textBlock = "<div class=\"textBlock\" key=\"" + anchorKey + "\">" + backBtn + "<span>" + blockText + "</span></div>";
			resultBlocks += textBlock;
			keywordNum += $results[doc][i].blockContent.match(keyword).length;
		}
	}

	$(".searchResult").append(resultBlocks);

	// change title
	$(".searchInterface > h1").append("檢索結果 ｜ " + $corpusName + " | " + keywordNum);
}


/* ---
left - search analysis
INPUT: 1) object, search results data structure
	   2) string, analysis mode
       3) string, keyword
--- */
function displaySearchAnalysis($results, $mode, $query) {

	// clear
	$(".searchAnalysis").empty();

	// show each document
	var keyword = new RegExp($query, 'g');
	var analysisBlock = "<h2>" + $mode + "</h2>";
	for (let doc in $results) {

		// content
		let totalKeywordNum = 0;
		let contentBlock = "";
		for (let i in $results[doc]) {
			let queryNum = $results[doc][i].blockContent.match(keyword).length;
			let anchorType = $results[doc][i].tagInfo.Type;
			let anchorKey = $results[doc][i].tagInfo.Key;
			let anchorID = (!$results[doc][i].tagInfo.RefId) ?"no ID" :$results[doc][i].tagInfo.RefId;
			let anchorBlock = "<div class=\"searchItem\" key=\"" + anchorKey + "\"><span onclick=\"jumpToBlock('" + anchorKey + "')\">" + anchorType + " 。 " + anchorID + " 。 " + anchorKey + "</span><span>" + queryNum + "</span></div>";
			contentBlock += anchorBlock;
			totalKeywordNum += queryNum;
		}

		// title
		let titleBlock = "<span>" + doc + "</span><span>" + totalKeywordNum + "</span>";
		titleBlock = "<div class=\"titleBlock\" onclick=\"collapse('.searchInterface div[name=" + doc + "]')\">" + titleBlock + "</div>";
		contentBlock = "<div class=\"textBlock\" name=\"" + doc + "\">" + contentBlock + "</div>";
		analysisBlock = analysisBlock + titleBlock + contentBlock;
	}

	$(".searchAnalysis").append(analysisBlock);

	// collapse textblock
	for (let doc in $results) collapse(".searchInterface div[name=" + doc + ']');
}

