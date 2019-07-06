/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
This file defined the interaction function. (e.g. mouse click,
 button ... etc)
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */


// * * * * * * * * * * * * * * * * animation * * * * * * * * * * * * * * * * * 


/* ---
slide animation on control board
--- */
function toggleControlBoard() {

	// change btn color
	var btn = document.getElementById('controlBtn');
	if (btn.style.color == 'white') btn.style.color = '#505C67';
	else btn.style.color = 'white';

	// control board animation
	$('nav').slideToggle('slow');

}


/* ---
slide animation on block
INPUT: string, selector of collapse target
--- */
function collapse($selector) {
	$($selector).slideToggle('slow');
}


/* ---
switch the arrow icon on compare title block for collapsing metadata block
INPUT: html span, the one need to switch
--- */
function switchIcon($span) {
	if ($span.className === 'glyphicon glyphicon-chevron-down') $($span).attr('class', 'glyphicon glyphicon-chevron-up');
	else if ($span.className === 'glyphicon glyphicon-chevron-up') $($span).attr('class', 'glyphicon glyphicon-chevron-down');
}


/* ---
slide animation on metadata block
INPUT: 1) string, metadata key
	   2) html span, the one trigger collapse
--- */
function collapseMetadata($id, $span) {
	collapse('.metadataBlock[key=' + $id + ']');
	switchIcon($span);
}


/* ---
main - compare - scroll to correspond anchor of other corpus
INPUT: 1) string, refid of clicked block
	   2) string, key of clicked block
       3) string, corpus name that include clicked block
--- */
function moveAnchor($id, $key, $corpusName) {
	
	// console.log($id, $key);

	// skip default block
	if ($id === 'undefined' || $id === undefined) return;

	var clickObj = $('.compareInterface .textBlock[key=' + $key + ']');

	// click on blue block: find correspond block
	if (clickObj[0].className === 'textBlock'){

		// update color
		cleanContentBlockColor('.compareInterface');
		changeContentBlockColor('.textBlock[idForAlign=\"' + $id + '\"]', _color.highlightblock);
		changeContentBlockColor('.compareInterface .textBlock[key=' + $key + ']', _color.highlighttarget);
		scrollTo('.corpusBlock[name=\"' + $corpusName + '\"]', '.textBlock[key=' + $key + ']', true);

		// scan all other corpus
		var corpusArray = $('.corpusBlock');
		for(let i=0; i<corpusArray.length; i++) {
			let corpusName = $(corpusArray[i]).attr('name');

			// skip target corpus
			if (corpusName !== $corpusName) {
				let blocks = $('.corpusBlock[name=\"' + corpusName + '\"] .textBlock[idForAlign=\"' + $id + '\"]');
				
				// change color for tartet in each corpus
				if (blocks.length > 0) {
					let targetKey = $(blocks[0]).attr('key');
					changeContentBlockColor('.compareInterface .textBlock[key=' + targetKey + ']', _color.highlighttarget);
					scrollTo('.corpusBlock[name=\"' + corpusName + '\"]', '.textBlock[key=' + targetKey + ']', true);
				}
			}
		}

	// click on yellow block: change target block
	} else if (clickObj[0].className === 'textBlock tagged') {
		cleanContentBlockColor('.corpusBlock[name=\"' + $corpusName + '\"]');
		changeContentBlockColor('.corpusBlock[name=\"' + $corpusName + '\"] .textBlock[idForAlign=\"' + $id + '\"]', _color.highlightblock);
		changeContentBlockColor('.compareInterface .textBlock[key=' + $key + ']', _color.highlighttarget);
		scrollTo('.corpusBlock[name=\"' + $corpusName + '\"]', '.textBlock[key=' + $key + ']', true);

	// click on red block: find next block
	} else if (clickObj[0].className === 'textBlock tagged tagged') {

		// scan all other corpus
		var corpusArray = $('.corpusBlock');
		for (let i=0; i<corpusArray.length; i++) {
			let corpusName = $(corpusArray[i]).attr('name');

			// skip clicked corpus
			if (corpusName !== $corpusName) {

				// find red block
				let blocks = $('.corpusBlock[name=\"' + corpusName + '\"] .textBlock[idForAlign=\"' + $id + '\"]');
				for (let j=0; j<blocks.length; j++) {
					if (blocks[j].className === 'textBlock tagged tagged') {

						// reset color
						cleanContentBlockColor('.corpusBlock[name=\"' + corpusName + '\"]');
						changeContentBlockColor('.corpusBlock[name=\"' + corpusName + '\"] .textBlock[idForAlign=\"' + $id + '\"]', _color.highlightblock);

						// target the next block
						let index = (j + 1) % blocks.length;
						let nextTargetKey = $(blocks[index]).attr('key');
						changeContentBlockColor('.compareInterface .textBlock[key=' + nextTargetKey + ']', _color.highlighttarget);
						scrollTo('.corpusBlock[name=\"' + corpusName + '\"]', '.textBlock[key=' + nextTargetKey + ']', true);
						scrollTo('.corpusBlock[name=\"' + $corpusName + '\"]', '.textBlock[key=' + $key + ']', true);

						break;
					}
				}
			}
		}
	}
}


/* ---
main - compare - scroll to correspond title of other corpus
INPUT: 1) string, key of clicked object
       2) string, corpus name that include clicked object
--- */
function moveDocument($key, $corpusName) {

	// find id and skip no metadata document
	var clickObj = $('.titleBlock[key=' + $key + ']');
	var id = $(clickObj[0]).attr('metaForAlign');
	if (id === 'undefined' || id === undefined) return;

	// click on blue title: find correspond document
	if (clickObj[0].className === 'titleBlock'){

		// update color
		cleanContentBlockColor('.compareInterface');
		changeContentBlockColor('.titleBlock[metaForAlign=\"' + id + '\"]', _color.highlightblockdark);
		changeContentBlockColor('.titleBlock[key=' + $key + ']', _color.highlighttargetdark);

		// scan all other corpus
		var corpusArray = $('.corpusBlock');
		for(let i=0; i<corpusArray.length; i++) {
			let corpusName = $(corpusArray[i]).attr('name');

			// skip target corpus
			if (corpusName !== $corpusName) {
				let blocks = $('.corpusBlock[name=\"' + corpusName + '\"] .titleBlock[metaForAlign=\"' + id + '\"]');
				
				// change color if found correspond block
				if (blocks.length > 0) {
					let targetKey = $(blocks[0]).attr('key');
					changeContentBlockColor('.titleBlock[key=' + targetKey + ']', _color.highlighttargetdark);
					scrollTo('.corpusBlock[name=\"' + corpusName + '\"]', '.titleBlock[key=' + targetKey + ']', true);
				}
			}
		}

	// click on yellow block: change target block
	} else if (clickObj[0].className === 'titleBlock tagged') {
		cleanContentBlockColor('.corpusBlock[name=\"' + $corpusName + '\"]');
		changeContentBlockColor('.corpusBlock[name=\"' + $corpusName + '\"] .titleBlock[metaForAlign=\"' + id + '\"]', _color.highlightblockdark);
		changeContentBlockColor('.titleBlock[key=' + $key + ']', _color.highlighttargetdark);

	// click on red block: find next block
	} else if (clickObj[0].className === 'titleBlock tagged tagged') {

		// scan all other corpus
		var corpusArray = $('.corpusBlock');
		for (let i=0; i<corpusArray.length; i++) {
			let corpusName = $(corpusArray[i]).attr('name');

			// skip clicked corpus
			if (corpusName !== $corpusName) {

				// find red block
				let blocks = $('.corpusBlock[name=\"' + corpusName + '\"] .titleBlock[metaForAlign=\"' + id + '\"]');
				for (let j=0; j<blocks.length; j++) {
					if (blocks[j].className === 'titleBlock tagged tagged') {

						// reset color
						cleanContentBlockColor('.corpusBlock[name=\"' + corpusName + '\"]');
						changeContentBlockColor('.corpusBlock[name=\"' + corpusName + '\"] .titleBlock[metaForAlign=\"' + id + '\"]', _color.highlightblockdark);

						// target the next document
						let index = (j + 1) % blocks.length;
						let nextTargetKey = $(blocks[index]).attr('key');
						changeContentBlockColor('.titleBlock[key=' + nextTargetKey + ']', _color.highlighttargetdark);
						scrollTo('.corpusBlock[name=\"' + corpusName + '\"]', '.titleBlock[key=' + nextTargetKey + ']', true);

						break;
					}
				}
			}
		}
	}
}


/* ---
main - search - scroll to correspond block based on clicked block key
INPUT: string, key of clicked object (unique)
--- */
function jumpToBlock($key) {

	// clean color
	cleanContentBlockColor('.searchInterface');

	// move
	scrollTo('.searchResult', '.searchResult .textBlock[key=' + $key + ']', true);

	// update color
	changeContentBlockColor('.searchInterface .textBlock[key=' + $key + ']', _color.highlightblock);
	changeContentBlockColor('.searchItem[key=' + $key + ']', _color.highlightblock);
}


/* ---
main - explain - scroll to correspond section based on clicked block key
INPUT: string, selector of clicked object (unique)
--- */
function jumpToSection($selector) {
	scrollTo('.explainContent', $selector, false);
}


/* ---
main - scroll animation
INPUT: 1) string, selector of where need to scroll
	   2) string, selector of target that want to scroll to
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


// * * * * * * * * * * * * * * button function * * * * * * * * * * * * * * * * * 


/* ---
control board - compare - load button, load data from docusky
--- */
$("#compare-load").click(function(e) {
	_docuSkyObj.getDbCorpusDocuments('', '', '', e, getEntireDbCorpusText);
});


/* ---
control board - compare - manager - hide button, display corpus or not
INPUT: 1) html element that user clicked
       2) string, corpus name that user want to hide/display
--- */
function hideOrShowCorpus($span, $corpusName) {
	
	//console.log($span);

	// show corpus
	if ($span.className === 'glyphicon glyphicon-eye-close') {
		_dataset[$corpusName].isShow = false;
		$span.className = 'glyphicon glyphicon-eye-open';

	// hide corpus
	} else if ($span.className === 'glyphicon glyphicon-eye-open') {
		_dataset[$corpusName].isShow = true;
		$span.className = 'glyphicon glyphicon-eye-close';

	// raise error
	} else {
		alert("Button class error in hide or show corpus function.");
		return;
	}

	// get choices
	var metadata = getActiveItemInList($('.controlContentBlock[id=compare-metadataSetting]'));
	var anchorName = getActiveItemInList($('.controlContentBlock[id=compare-alignSetting]'));
	displayCompareContent(metadata, anchorName);

}


/* ---
control board - compare - manager - delete button, delete corpus from system
INPUT: string, corpus name that want to delete
--- */
function deleteCorpus($corpusName) {

	// delete data
	delete _dataset[$corpusName];

	// delete management
	for (let db in _inSystem) {
		for (let i in _inSystem[db]) {
			if (_inSystem[db][i] === $corpusName) _inSystem[db].splice(i, 1);
		}
	}

	//console.log(_inSystem);
	//console.log(_dataset);

	var firstCorpus = getFirstCorpus();
	var firstAlignType = getFirstAlignType();
	//if (firstCorpus === 'error') alert("Error in get first corpus.");
	//if (firstAlignType === 'error') alert("Error in get first align type.");

	displayDocuManager();
	displayMetadataList('docFilename');
	displayAlignTypeList(firstAlignType);
	displaySearchCorpus(firstCorpus);
	displayCompareContent('docFilename', firstAlignType);

}


/* ---
control board - compare - metadataSetting - change metadata for align
INPUT: string, new target for metadata alignment
--- */
function changeMetadata($metadata) {

	// control board
	displayMetadataList($metadata);

	// clean highlight
	var pins = $('.pinned');
	for (let i=0; i<pins.length; i++) $(pins[i]).removeClass('pinned');

	// highlight new target
	var targets = $('.' + $metadata);
	for (let i=0; i<targets.length; i++) {
		
		let metadata = $(targets[i])[0].innerText;
		let startPos = metadata.indexOf(' ');
		let value = metadata.substring(startPos+1, metadata.length);
		$(targets[i].parentElement.parentElement.firstElementChild).attr('metaForAlign', value);
		$(targets[i]).attr('class', $(targets[i]).attr('class') + ' pinned');
	}
}


/* ---
control board - compare - aligntypeSetting - change align type for align
INPUT: string, new target for type alignment
--- */
function changeAlignType($alignType) {
	displayAlignTypeList($alignType);
	displayCompareContent(getActiveItemInList($('.controlContentBlock[id$=compare-metadataSetting]')), $alignType);
}


/* ---
control board - search - search button - search one word in one corpus
INPUT: string, keyword
--- */
function search($query) {
	
	// get target corpus
	var corpusName = getActiveItemInList($('.controlContentBlock[id=search-display]'));
	var anchorName = getActiveItemInList($('.controlContentBlock[id=compare-alignSetting]'));
	var mode = getActiveItemInList($('.controlContentBlock[id=search-mode]'));
	if (corpusName === 'error' || anchorName === 'error') {
		alert('Fail to access target corpus ' + corpusName + ' or anchor type ' + anchorName + '.');
		return;
	}

	// pick up the block that contain keyword and show
	var searchResults = searchInCorpus(corpusName, anchorName, mode, $query);
	displaySearchResult(corpusName, searchResults, $query);
	displaySearchAnalysis(searchResults, mode, $query);
}


/* ---
control board - search - display - choose corpus that be searched
INPUT: string, corpus name that want to show its results
--- */
function changeSearchCorpus($corpusName) {
	displaySearchCorpus($corpusName);
	var query = $('input[name=searchQuery]')[0].value;
	if (query.length > 0) search(query);
}


/* ---
control board - search - mode - choose mode that results be analyzed
INPUT: string, mode of analysis method
--- */
function changeSearchMode($mode) {
	displaySearchMode($mode);
	var query = $('input[name=searchQuery]')[0].value;
	if (query.length > 0) search(query);
}


/* ---
main - search - back to compare interface with position in correspond block
INPUT: html element, clicked object
--- */
function backToCompare($span) {
	
	// find block id in compare interface
	var key = $($span).attr('key');
	var id = getRefIdFromKey(key);
	
	if (id === 'error') {
		alert("Something Wrong in key and refid corresponding.");
		return;
	}

	// maintainance of hide corpus
	var corpusName = getActiveItemInList($('.controlContentBlock[id=search-display]'));
	var span = $('.glyphicon-eye-open[value=' + corpusName + ']');
	if (_dataset[corpusName].isShow === false) hideOrShowCorpus(span[0], corpusName);
	
	// to compare interface
	location.href = '#compareTab';
	moveAnchor(id, key, corpusName);
	
	// back to default block
	if (id === undefined) changeContentBlockColor('.compareInterface .textBlock[key=' + key + ']', _color.highlighttarget);
}


