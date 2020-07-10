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
	if ($info.className === $type.className) {
		cleanContentBlockColor('.compareInterface');

		// scan all other corpus
		for (let i=0; i<corpusArray.length; i++) {
			let target = true;
			let corpusName = $(corpusArray[i]).attr('name');
			let blocks = $(corpusArray[i]).find('.' + $type.className);

			// each titleBlock/textBlock
			for (let j=0; j<blocks.length; j++) {
				let id = $(blocks[j]).attr($type.alignStr);
				let key = $(blocks[j]).attr('key');

				// highlight and scroll
				if (mapped(id, $info.id)) {
					let blockSelector = '.compareInterface .' + $type.className + '[key=' + key + ']';

					// target: scroll
					if ((key === $info.key) || (corpusName !== $info.corpusName && target)) {
						changeContentBlockColor(blockSelector, $type.targetColor, $type.className + ' tagged tagged');
						scrollTo('.corpusBlock[name="' + corpusName + '"]', blockSelector, true);
						target = false;

					// others
					} else changeContentBlockColor(blockSelector, $type.highlightColor, $type.className + ' tagged');
				} 
			}
		}

	// click on yellow block: change target block
	} else if ($info.className === $type.className + ' tagged') {

		// scan all other corpus
		for (let i=0; i<corpusArray.length; i++) {
			let corpusName = $(corpusArray[i]).attr('name');
			let blocks = $(corpusArray[i]).find('.tagged');

			// change color and scroll
			if (corpusName === $info.corpusName) {

				// red -> yellow
				for (let j=0; j<blocks.length; j++) {
					if (blocks[j].className === $type.className + ' tagged tagged') {
						let blockSelector = '.compareInterface .' + $type.className + '[key=' + $(blocks[j]).attr('key') + ']';
						changeContentBlockColor(blockSelector, $type.highlightColor, $type.className + ' tagged');
						break;
					}
				}

				// yellow -> red
				let blockSelector = '.compareInterface .' + $type.className + '[key=' + $info.key + ']';
				changeContentBlockColor(blockSelector, $type.targetColor, $type.className + ' tagged tagged');
				scrollTo('.corpusBlock[name="' + corpusName + '"]', blockSelector, true);

			// reset target position
			} else {
				for (let j=0; j<blocks.length; j++) {
					if (blocks[j].className === $type.className + ' tagged tagged') {
						let blockSelector = '.compareInterface .' + $type.className + '[key=' + $(blocks[j]).attr('key') + ']';
						scrollTo('.corpusBlock[name="' + corpusName + '"]', blockSelector, true);
						break;
					}
				}
			}
		}

	// click on red block: find next block
	} else if ($info.className === $type.className + ' tagged tagged') {

		// scan all other corpus
		for (let i=0; i<corpusArray.length; i++) {
			let corpusName = $(corpusArray[i]).attr('name');
			let blocks = $(corpusArray[i]).find('.tagged');

			// reset target position
			if (corpusName === $info.corpusName) {
				let blockSelector = '.compareInterface .' + $type.className + '[key=' + $info.key + ']';
				scrollTo('.corpusBlock[name="' + corpusName + '"]', blockSelector, true);

			// find next target
			} else {
				for (let j=0; j<blocks.length; j++) {
					if (blocks[j].className === $type.className + ' tagged tagged') {

						// red -> yellow
						let blockSelector = '.compareInterface .' + $type.className + '[key=' + $(blocks[j]).attr('key') + ']';
						changeContentBlockColor(blockSelector, $type.highlightColor, $type.className + ' tagged');

						// yellow -> red
						let index = (j + 1) % blocks.length;
						blockSelector = '.compareInterface .' + $type.className + '[key=' + $(blocks[index]).attr('key') + ']';
						changeContentBlockColor(blockSelector, $type.targetColor, $type.className + ' tagged tagged');
						scrollTo('.corpusBlock[name="' + corpusName + '"]', blockSelector, true);
						break;
					}
				}
			}
		}
	}
}


/* ---
judge if id correspond to each other
INPUT: 1) block id
	   2) clicked block id
--- */
function mapped($arg1, $arg2) {
	var pos1 = $arg1.indexOf('[');
	var pos2 = $arg1.indexOf(',');
	var pos3 = $arg1.indexOf(']');

	// range
	if (pos1 > -1 && pos2 > pos1 && pos3 > pos2) {
		let pos4 = $arg2.indexOf('[');
		let pos5 = $arg2.indexOf(',');
		let pos6 = $arg2.indexOf(']');

		let arg1_l = parseInt($arg1.substring(pos1+1, pos2));
		let arg1_h = parseInt($arg1.substring(pos2+1, pos3));
		let arg2_l = parseInt($arg2.substring(pos4+1, pos5));
		let arg2_h = parseInt($arg2.substring(pos5+1, pos6));

		if (arg1_h < arg2_l) return false;
		else if (arg2_h < arg1_l) return false;
		else return true;

	// single
	} else {
		if ($arg1 === $arg2) return true;
		else return false;
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
	changeContentBlockColor('.searchInterface .textBlock[key=' + $key + ']', _color.highlightblock, 'textBlock tagged');
	changeContentBlockColor('.searchItem[key=' + $key + ']', _color.highlightblock, 'searchItem tagged');
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
	var corpusName = _para['corpus'];
	var span = $('.glyphicon-eye-open[value=' + corpusName + ']');
	if (_dataset[corpusName].isShow === false) hideOrShowCorpus(span[0], corpusName);
	
	// to compare interface
	location.href = '#compareTab';
	moveAnchor(id, key, corpusName);
	
	// back to default block
	if (id === undefined) {
		cleanContentBlockColor('.compareInterface');
		changeContentBlockColor('.compareInterface .textBlock[key=' + key + ']', _color.highlighttarget, 'textBlock tagged tagged');
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


