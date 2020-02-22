/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
This file defined the interaction function of main tool.
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */


// * * * * * * * * * * * * * * * * compare interface * * * * * * * * * * * * * * * * * 


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
scroll to correspond title of other corpus
INPUT: 1) string, key of clicked object
       2) string, corpus name that include clicked object
--- */
function moveDocument($key, $corpusName) {

	// find id and skip no metadata document
	var clickObj = $('.titleBlock[key=' + $key + ']');
	var id = $(clickObj[0]).attr('metaForAlign');
	if (id === 'undefined' || id === undefined) return;

	// gether parameter and move
	var info = {className: clickObj[0].className, id: id, key: $key, corpusName: $corpusName};
	var type = {className: 'titleBlock', alignStr: 'metaForAlign', highlightColor: _color.highlightblockdark, targetColor: _color.highlighttargetdark};
	move(info, type);
}


/* ---
scroll to correspond anchor of other corpus
INPUT: 1) string, refid of clicked block
	   2) string, key of clicked block
       3) string, corpus name that include clicked block
--- */
function moveAnchor($id, $key, $corpusName) {

	// skip default block
	if ($id === 'undefined' || $id === undefined) return;
	var clickObj = $('.compareInterface .textBlock[key=' + $key + ']');

	// gether parameter and move
	var info = {className: clickObj[0].className, id: $id, key: $key, corpusName: $corpusName};
	var type = {className: 'textBlock', alignStr: 'idForAlign', highlightColor: _color.highlightblock, targetColor: _color.highlighttarget};
	move(info, type);
}


/* ---
scroll to correspond anchor of other corpus
INPUT: 1) object, clicked block information
	   2) object, parameter of clicked block according to block type
--- */
function move($info, $type) {
	var corpusArray = $('.corpusBlock');

	// click on blue block: find correspond block
	if ($info.className === $type.className){

		// update color
		cleanContentBlockColor('.compareInterface');
		changeContentBlockColor('.' + $type.className + '[' + $type.alignStr + '=\"' + $info.id + '\"]', $type.highlightColor);
		changeContentBlockColor('.compareInterface .' + $type.className + '[key=' + $info.key + ']', $type.targetColor);

		// scroll self
		scrollTo('.corpusBlock[name=\"' + $info.corpusName + '\"]', '.compareInterface .' + $type.className + '[key=' + $info.key + ']', true);

		// scan all other corpus
		for(let i=0; i<corpusArray.length; i++) {
			let corpusName = $(corpusArray[i]).attr('name');

			// skip self
			if (corpusName !== $info.corpusName) {
				let blocks = $('.corpusBlock[name=\"' + corpusName + '\"] .' + $type.className + '[' + $type.alignStr + '=\"' + $info.id + '\"]');
				
				// change color and scroll for tartet in each corpus
				if (blocks.length > 0) {
					let targetKey = $(blocks[0]).attr('key');
					changeContentBlockColor('.compareInterface .' + $type.className + '[key=' + targetKey + ']', $type.targetColor);
					scrollTo('.corpusBlock[name=\"' + corpusName + '\"]', '.compareInterface .' + $type.className + '[key=' + targetKey + ']', true);
				}
			}
		}

	// click on yellow block: change target block
	} else if ($info.className === $type.className + ' tagged') {

		// update color
		cleanContentBlockColor('.corpusBlock[name=\"' + $info.corpusName + '\"]');
		changeContentBlockColor('.corpusBlock[name=\"' + $info.corpusName + '\"] .' + $type.className + '[' + $type.alignStr + '=\"' + $info.id + '\"]', $type.highlightColor);
		changeContentBlockColor('.compareInterface .' + $type.className + '[key=' + $info.key + ']', $type.targetColor);

		// scroll self
		scrollTo('.corpusBlock[name=\"' + $info.corpusName + '\"]', '.compareInterface .' + $type.className + '[key=' + $info.key + ']', true);

		// scroll others
		for(let i=0; i<corpusArray.length; i++) {
			let corpusName = $(corpusArray[i]).attr('name');

			// skip self
			if (corpusName !== $info.corpusName) {

				// find highlight blocks
				let blocks = $('.corpusBlock[name=\"' + corpusName + '\"] .' + $type.className + '[' + $type.alignStr + '=\"' + $info.id + '\"]');
				for (let j=0; j<blocks.length; j++) {

					// find red block
					if (blocks[j].className === $type.className + ' tagged tagged') {
						scrollTo('.corpusBlock[name=\"' + corpusName + '\"]', '.compareInterface .' + $type.className + '[key=' + $(blocks[j]).attr('key') + ']', true);
						break;
					}
				}
			}
		}

	// click on red block: find next block
	} else if ($info.className === $type.className + ' tagged tagged') {

		// scroll self
		scrollTo('.corpusBlock[name=\"' + $info.corpusName + '\"]', '.compareInterface .' + $type.className + '[key=' + $info.key + ']', true);

		// scan all other corpus
		for (let i=0; i<corpusArray.length; i++) {
			let corpusName = $(corpusArray[i]).attr('name');

			// skip self
			if (corpusName !== $info.corpusName) {

				// find highlight blocks
				let blocks = $('.corpusBlock[name=\"' + corpusName + '\"] .' + $type.className + '[' + $type.alignStr + '=\"' + $info.id + '\"]');
				for (let j=0; j<blocks.length; j++) {

					// find red block and its next block
					if (blocks[j].className === $type.className + ' tagged tagged') {

						// reset color
						cleanContentBlockColor('.corpusBlock[name=\"' + corpusName + '\"]');
						changeContentBlockColor('.corpusBlock[name=\"' + corpusName + '\"] .' + $type.className + '[' + $type.alignStr + '=\"' + $info.id + '\"]', $type.highlightColor);

						// target the next block
						let index = (j + 1) % blocks.length;
						let nextTargetKey = $(blocks[index]).attr('key');
						changeContentBlockColor('.compareInterface .' + $type.className + '[key=' + nextTargetKey + ']', $type.targetColor);
						scrollTo('.corpusBlock[name=\"' + corpusName + '\"]', '.compareInterface .' + $type.className + '[key=' + nextTargetKey + ']', true);

						break;
					}
				}
			}
		}
	}
}


// * * * * * * * * * * * * * * * * search interface * * * * * * * * * * * * * * * * * 


/* ---
scroll to correspond search result block based on clicked block key
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
back to compare interface with position in correspond block
INPUT: html element, clicked object
--- */
function backToCompare($span) {
	
	// find block id in compare interface
	var key = $($span).attr('key');
	var id = getRefIdFromKey(key);
	
	if (id === 'error') {
		alert("[Error] key 與 refid 對應錯誤。");
		return;
	}

	// maintainance of hide corpus
	var corpusName = getActiveItemInList($('.controlContentBlock[id=search-corpus]'));
	var span = $('.glyphicon-eye-open[value=' + corpusName + ']');
	if (_dataset[corpusName].isShow === false) hideOrShowCorpus(span[0], corpusName);
	
	// to compare interface
	location.href = '#compareTab';
	moveAnchor(id, key, corpusName);
	
	// back to default block
	if (id === undefined) {
		cleanContentBlockColor('.compareInterface');
		changeContentBlockColor('.compareInterface .textBlock[key=' + key + ']', _color.highlighttarget);
		scrollTo('.corpusBlock[name=\"' + corpusName + '\"]', '.compareInterface .textBlock[key=' + key + ']', true);
	}
}


// * * * * * * * * * * * * * * * * explain interface * * * * * * * * * * * * * * * * * 


/* ---
scroll to correspond section based on clicked block key
INPUT: string, selector of clicked object (unique)
--- */
function jumpToSection($selector) {
	scrollTo('.explainContent', $selector, false);
}


