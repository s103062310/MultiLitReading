/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
This file defined the interaction function of control board.
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */


// * * * * * * * * * * * * * * * * animation * * * * * * * * * * * * * * * * * 


/* ---
close control board
--- */
function toggleControlBoard($active) {

	// set active
	$('nav').attr('class', $active);

	// start animation
	setTimeout(function() {
		$('nav').addClass('animating');
	}, 0);

	// stop animation
	setTimeout(function() {
		if ($active == 'open') $('nav').addClass('showNav');
		$('nav').removeClass($active);
		$('nav').removeClass('animating');
	}, 600);
}


/* ---
slide animation on block
INPUT: string, selector of collapse target
--- */
function collapse($selector) {
	$($selector).slideToggle('slow');
}


/* ---
main - scroll animation
INPUT: 1) string, selector of where need to scroll
	   2) string, selector of target that want to scroll to
	   3) boolean, if content scroll to the middle of screen
--- */
function scrollTo($rangeSelector, $selector, $shift) {

	// find corpus block
	var range = $($rangeSelector);

	// find anchor position
	var originRelativePosition = $(range[0].firstElementChild).offset().top;
	var relativePosition = $($selector).offset().top;
	var absolutePosition = relativePosition - originRelativePosition;
	var offset = ($shift) ?$($rangeSelector)[0].offsetHeight / 3 :0;

	// move
	$($rangeSelector).animate({
		scrollTop: absolutePosition - offset
	}, 600);
}


/* ---
switch the icon, appending when need
INPUT: html span, the one need to switch
--- */
function switchIcon($span) {
	if ($span.className === 'glyphicon glyphicon-chevron-down') $($span).attr('class', 'glyphicon glyphicon-chevron-up');
	else if ($span.className === 'glyphicon glyphicon-chevron-up') $($span).attr('class', 'glyphicon glyphicon-chevron-down');
	else if ($span.className === 'glyphicon glyphicon-eye-close') $($span).attr('class', 'glyphicon glyphicon-eye-open');
	else if ($span.className === 'glyphicon glyphicon-eye-open') $($span).attr('class', 'glyphicon glyphicon-eye-close');
}


// * * * * * * * * * * * * * * * * compare interface * * * * * * * * * * * * * * * * * 


/* ---
data loading - load data from docusky
--- */
function accessThroughDocuSky($event) {
	_docuSkyObj.getDbCorpusDocuments('', '', '', $event, getEntireDbCorpusText);
}


/* ---
document manager - hide or show button, display corpus or not
INPUT: 1) html element that user clicked
       2) string, corpus name that user want to hide/display
--- */
function hideOrShowCorpus($span, $corpusName) {

	// hide corpus
	if ($span.className === 'glyphicon glyphicon-eye-open') {
		_dataset[$corpusName].isShow = false;
		$('.compareTitleBlock h1[name="' + $corpusName + '"]').hide();
		$('.corpusBlock[name="' + $corpusName + '"]').hide();

	// show corpus
	} else if ($span.className === 'glyphicon glyphicon-eye-close') {
		_dataset[$corpusName].isShow = true;
		$('.compareTitleBlock h1[name="' + $corpusName + '"]').show();
		$('.corpusBlock[name="' + $corpusName + '"]').show();

	// raise error
	} else {
		alert("[Error] 文獻集顯示/關閉按鈕設定錯誤。");
		return;
	}

	// display
	switchIcon($span);
	var corpusNum = getShowedCorpusNum();
	if (corpusNum == 0) displayDefaultCompare();
	else {
		let cssStr = "repeat(" + corpusNum + ", 1fr)";
		$('.compareContentBlock').css('grid-template-columns', cssStr);
		$('.compareTitleBlock').css('grid-template-columns', cssStr);
		$('.compareTitleBlock h1[name="default"]').remove();
		$('.corpusBlock[name="default"]').remove();
	}
}


/* ---
document manager - delete button, delete corpus from system
INPUT: string, corpus name that want to delete
--- */
function deleteCorpus($corpusName) {

	// delete management
	let db = _dataset[$corpusName].dbName;
	delete _inSystem[db][$corpusName.split('(')[0]];
	if (Object.keys(_inSystem[db]).length === 0) delete _inSystem[db];

	// delete data
	delete _dataset[$corpusName];
	
	//console.log(_inSystem);
	//console.log(_dataset);

	// display
	displayAll();
}


/* ---
metadata setting - change metadata for align
INPUT: string, new target for metadata alignment
--- */
function changeMetadata($metadata) {

	// display
	displayMetadataList($metadata);

	// clean highlight
	var pins = $('.pinned');
	for (let i=0; i<pins.length; i++) $(pins[i]).removeClass('pinned');

	// highlight new target
	var targets = $('li[name=' + $metadata + ']');
	$(targets).addClass('pinned');
	for (let i=0; i<targets.length; i++) {
		let metadata = $(targets[i])[0].innerText;
		let startPos = metadata.indexOf(' ');
		let value = metadata.substring(startPos+1, metadata.length);
		$(targets[i].parentElement.parentElement.firstElementChild).attr('metaForAlign', value);
	}
}


/* ---
align type setting - change align type for align
INPUT: string, new target for type alignment
--- */
function changeAlignType($alignType) {
	displayAlignTypeList($alignType);
	displayCompareContent(getActiveItemInList($('.controlContentBlock[id$=compare-metadataSetting]')), $alignType);
}


// * * * * * * * * * * * * * * * * search interface * * * * * * * * * * * * * * * * *


/* ---
input - search one word in one corpus
INPUT: string, keyword
--- */
function search($query) {
	
	// get target corpus
	var corpusName = getActiveItemInList($('.controlContentBlock[id=search-corpus]'));
	var anchorName = getActiveItemInList($('.controlContentBlock[id=compare-alignSetting]'));
	var mode = getActiveItemInList($('.controlContentBlock[id=search-mode]'));
	if (corpusName === 'error' || anchorName === 'error' || mode === 'error') {
		alert("[Error] 讀取搜尋設定錯誤。");
		return;
	}

	// pick up the block that contain keyword and show
	var searchResults = searchInCorpus(corpusName, anchorName, mode, $query);
	displaySearchResult(corpusName, searchResults, $query);
	displaySearchAnalysis(searchResults, mode, $query);
}


/* ---
corpus - choose corpus that be searched
INPUT: string, corpus name that want to show its results
--- */
function changeSearchCorpus($corpusName) {
	displaySearchCorpus($corpusName);
	var query = $('input[name=searchQuery]')[0].value;
	if (query.length > 0) search(query);
}


/* ---
mode - choose mode that results be analyzed
INPUT: string, mode of analysis method
--- */
function changeSearchMode($mode) {
	displaySearchMode($mode);
	var query = $('input[name=searchQuery]')[0].value;
	if (query.length > 0) search(query);
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
	var results = {};

	for (let doc in _dataset[$corpusName]) {
		if (typeof _dataset[$corpusName][doc] !== 'object') continue;

		// document content
		let title = _dataset[$corpusName][doc].metadata.title;
		let anchors = _dataset[$corpusName][doc][$anchorName];
		let blocks = (anchors !== undefined) ?anchors :_dataset[$corpusName][doc]['FullText'];

		// search in block
		for (let i in blocks) {
			if (itemInList($query, blocks[i].blockContent)) {

				if ($mode === '文件順序') {
					if (results[title] === undefined) results[title] = [];
					results[title].push(blocks[i]);

				} else if ($mode === '錨點類別') {
					let id = (blocks[i].tagInfo.Term === undefined) ?'未分類' :blocks[i].tagInfo.Term;
					if (results[id] === undefined) results[id] = [];
					results[id].push(blocks[i]);
				}
			}
		}
	}

	// console.log(results);

	return results;
}

