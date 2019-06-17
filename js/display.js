/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
This file is responsible for UI display, used javascript to 
modify html dynamicly.
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */


/* ---
control board - compare - document management block
--- */
function displayDocuManager() {

	// clear
	$(".controlContentBlock[id=compare-manage] > ol").empty();

	// show each corpus
	for (let corpusName in _dataset) {
		if (typeof _dataset[corpusName] === 'function') continue;
		let manageItem = "<li>" + corpusName + "</li>";
		let hideBtn = "<span class=\"glyphicon glyphicon-eye-close\" value=\"" + corpusName + "\" onclick=\"hideOrShowCorpus(this, '"+corpusName+"')\"></span>";
		let deleteBtn = "<span class=\"glyphicon glyphicon-trash\" onclick=\"deleteCorpus('" + corpusName + "')\"></span>";
		$(".controlContentBlock[id=compare-manage] > ol").append(manageItem + hideBtn + deleteBtn);
	}

}


/* ---
control board - compare - metadata setting block
INPUT: string, active metadata
--- */
function displayMetadataList($activeMetadata) {

	// prepare data and clear
	var metadataList = getMetadataList();
	$(".controlContentBlock[id=compare-metadataSetting] > ol").empty();

	// show each metadata
	for (let item in metadataList) {
		let metadata = metadataList[item];
		let metaSetting = "<li>" + metadata + "</li>";
		if ($activeMetadata === metadata) {
			metaSetting += "<span class=\"glyphicon glyphicon-pushpin notHover\"></span>";
		} else metaSetting += "<span class=\"glyphicon glyphicon-retweet\" onclick=\"changeMetadata('" + metadata + "')\"></span>";
		$(".controlContentBlock[id=compare-metadataSetting] > ol").append(metaSetting);
	}

}


/* ---
control board - compare - align setting block
INPUT: string, active align type
--- */
function displayAlignTypeList($activeAlignType) {

	// prepare data and clear
	var alignTypeList = getAlignTypeList();
	$(".controlContentBlock[id=compare-alignSetting] > ol").empty();

	// show each anchor type
	for (let anchor in alignTypeList) {
		let anchorName = alignTypeList[anchor];
		let alignSetting = "<li>" + anchorName + "</li>";
		if ($activeAlignType === anchorName) {
			alignSetting += "<span class=\"glyphicon glyphicon-pushpin notHover\"></span>";
		} else alignSetting += "<span class=\"glyphicon glyphicon-retweet\" onclick=\"changeAlignType('" + anchorName + "')\"></span>";
		$(".controlContentBlock[id=compare-alignSetting] > ol").append(alignSetting);
	}

}


/* ---
control board - search - display block
INPUT: string, active corpus
--- */
function displaySearchCorpus($activeCorpusName) {

	// clear
	$(".controlContentBlock[id=search-display] > ol").empty();

	// show each corpus
	for (let corpusName in _dataset) {
		if (typeof _dataset[corpusName] === 'function') continue;

		let displayItem = "<li>" + corpusName + "</li>";
		if ($activeCorpusName === corpusName) displayItem += "<span class=\"glyphicon glyphicon-pushpin notHover\"></span>";
		else displayItem += "<span class=\"glyphicon glyphicon-retweet\" onclick=\"changeSearchCorpus('" + corpusName + "')\"></span>";
		$(".controlContentBlock[id=search-display] > ol").append(displayItem);
	}

}


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


/* ---
main - compare interface
INPUT: 1) string, active metadata
	   2) string, active align type
--- */
function displayCompareContent($activeMetadata, $activeAlignType) {

	var corpusNum = 0;

	// clear
	$(".compareContentBlock").empty();
	$(".compareTitleBlock").empty();

	// show all data
	for (let corpusName in _dataset) {
		if (typeof _dataset[corpusName] === 'function') continue;

		// skip hided corpus
		if (!_dataset[corpusName].isShow) continue;

		// create corpus column
		corpusNum++;
		let corpusBlock = "<div class=\"corpusBlock\" name=\"" + corpusName + "\">";
		for (let doc in _dataset[corpusName]) {
			if (typeof _dataset[corpusName][doc] !== 'object') continue;

			// title of single document
			let singleDocument = _dataset[corpusName][doc];
			let docId = singleDocument.systemdata.docId;
			let docMeta = singleDocument.metadata[$activeMetadata];
			let docTitle = singleDocument.metadata.docTitleXml;
			let titleBlock = "<div><div class=\"titleBlock\" metaForAlign=\"" + docMeta + "\" key=\"" + docId + "\"><span onclick=\"moveDocument('" + docId + "', '" + corpusName + "')\">" + docTitle + "</span><span class=\"glyphicon glyphicon-chevron-down\" onclick=\"collapseMetadata('" + docId + "', this)\"></span></div>";
			corpusBlock += titleBlock;

			// metadata of single document
			let metadataBlock = "<div class=\"metadataBlock\" key=\"" + docId + "\">";
			for (item in singleDocument.metadata) {
				if (item === $activeMetadata) metadataBlock += "<li class=\"" + item + " pinned\">" + item + ": " + singleDocument.metadata[item] + "</li>";
				else metadataBlock += "<li class=\"" + item + "\">" + item + ": " + singleDocument.metadata[item] + "</li>";
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
		$(".compareTitleBlock").append("<h1>" + corpusName + "</h1>");

		// collapse metadatablock
		for (let doc in _dataset[corpusName]) {
			if (typeof _dataset[corpusName][doc] !== 'object') continue;
			collapse(".metadataBlock[key=" + _dataset[corpusName][doc].systemdata.docId + "]");
		}
	}

	// default showup when no corpus is shown
	if (corpusNum === 0) {
		let corpusBlockBegin = "<div class=\"corpusBlock\"><div>";
		let titleBlock = "<div class=\"titleBlock\"><span class=\"docuCompareBtn\">文件標題</span><span class=\"glyphicon glyphicon-chevron-up\" onclick=\"collapseMetadata('metadata', this)\"></span></div>";
		let metaBlock = "<div class=\"metadataBlock\" key=\"metadata\"><li class=\"metadata1 pinned\">metadata1: 1</li><li class=\"metadata2\">metadata2: 2</li></div>";
		let textBlock1 = "<div class=\"textBlock\">內文1</div>"
		let textBlock2 = "<div class=\"textBlock\">內文2</div>"
		let corpusBlockEnd = "</div></div>";
		let corpusBlock = corpusBlockBegin + titleBlock + textBlock1 + textBlock2 + corpusBlockEnd;
		$(".compareContentBlock").append(corpusBlock);
		$(".compareTitleBlock").append("<h1>文本名稱</h1>");
		corpusNum++;
	}

	// modify css column
	var compareContentBlock = document.getElementsByClassName("compareContentBlock");
	var compareTitleBlock = document.getElementsByClassName("compareTitleBlock");
	compareContentBlock[0].style.gridTemplateColumns = "repeat(" + corpusNum + ", 1fr)";
	compareTitleBlock[0].style.gridTemplateColumns = "repeat(" + corpusNum + ", 1fr)";

}


/* ---
main - search results
INPUT: 1) target corpus
	   2) object, search results data structure
       3) string, keyword
--- */
function displaySearchResult($corpusName, $results, $query) {

	// console.log($results);

	// clear
	$(".searchInterface > h1").empty();
	$(".searchResult").empty();

	// change title
	$(".searchInterface > h1").append("檢索結果 ｜ " + $corpusName);

	// common var
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
			let textBlock = "<div class=\"textBlock\" key=\"" + anchorKey + "\">" + backBtn + "<span>" + blockText + "</span></div>"
			resultBlocks += textBlock;
		}
	}

	$(".searchResult").append(resultBlocks);

}


/* ---
main - search analysis
INPUT: 1) object, search results data structure
	   2) string, analysis mode
       3) string, keyword
--- */
function displaySearchAnalysis($results, $mode, $query) {

	// console.log($results);

	// clear
	$(".searchAnalysis").empty();

	var keyword = new RegExp($query, 'g');
	var analysisBlock = "<h2>" + $mode + "</h2>";

	// show each document
	for (let doc in $results) {

		// content
		let totalKeywordNum = 0;
		let contentBlock = "";
		for (let i in $results[doc]) {
			let queryNum = $results[doc][i].blockContent.match(keyword).length;
			let anchorType = $results[doc][i].tagInfo.Type;
			let anchorKey = $results[doc][i].tagInfo.Key;
			let anchorID = (!$results[doc][i].tagInfo.RefId) ?" " :$results[doc][i].tagInfo.RefId;
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


/* ---
highlight the hit block
INPUT: 1) string, selector keyword
       2) string, HEX of color that be changed
--- */
function changeContentBlockColor($selector, $color) {
	$($selector).attr('style', "background-color: " + $color + ";");
	$($selector).attr('class', $($selector).attr("class") + " tagged");
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




