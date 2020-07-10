/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
This file is responsible for project specific used.
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */


// * * * * * * * * * * * * * * * * display * * * * * * * * * * * * * * * * *


/* ---
update the whole page
--- */
function displayAll() {

	// get information
	var firstCorpus = getFirstCorpus();
	if (firstCorpus === 'error') alert("[Error] 存取文獻集名稱錯誤，請洽工程師。");

	// para setting
	if (_url.searchParams.get('public') == '春秋三傳') {
		_para['metadata'] = 'title';
		_para['aligntype'] = 'Time';
		_para['corpus'] = '春秋';
		_para['mode'] = 'DocOrder';
	}

	// display
	displayDocuManager();
	displaySearchCorpus(_para['corpus']);
	displayCompareContent(_para['metadata'], _para['aligntype']);
}


function displayDefault() {

	// controlContentBlock
	$('#compare-load').css('display', 'none');
	$('#compare-metadataSetting').css('display', 'none');
	$('#compare-alignSetting').css('display', 'none');
	$('#compare-manage ol').css('grid-template-columns', '9fr 1fr');
	$('#search-mode').css('display', 'none');

	// controlTitleBlock
	$('.compareController .controlTitleBlock')[3].remove();
	$('.compareController .controlTitleBlock')[2].remove();
	$('.compareController .controlTitleBlock')[0].remove();
	$('.searchController .controlTitleBlock')[2].remove();
}


/* ---
compare - document management block
--- */
function displayDocuManager() {

	// clear
	$(".controlContentBlock[id=compare-manage] > ol").empty();

	// show each corpus
	for (let corpusName in _dataset) {
		if (typeof _dataset[corpusName] !== 'object') continue;
		let manageItem = "<li name=\"" + corpusName + "\">" + corpusName + "</li>";
		let className = (_dataset[corpusName].isShow) ?"glyphicon-eye-open" :"glyphicon-eye-close";
		let hideBtn = "<span class=\"glyphicon " + className + "\" name=\"" + corpusName + "\" onclick=\"hideOrShowCorpus(this, '"+corpusName+"')\"></span>";
		$(".controlContentBlock[id=compare-manage] > ol").append(manageItem + hideBtn);
	}
}