/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
This file is responsible for general used.
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */


// * * * * * * * * * * * * * * * * display * * * * * * * * * * * * * * * * *


 /* ---
update the whole page
--- */
function displayAll() {

	// get information
	var firstCorpus = getFirstCorpus();
	var firstAlignType = getFirstAlignType();
	if (firstCorpus === 'error') console.log("[Error] 存取文獻集名稱錯誤，系統上已無文本。");
	if (firstAlignType === 'error') console.log("[Error] 存取段落對讀設定錯誤，系統上已無文本。");

	// para setting
	_para['metadata'] = 'filename';
	_para['aligntype'] = firstAlignType;
	_para['corpus'] = firstCorpus;
	_para['mode'] = 'DocOrder';

	// display
	displayDocuManager();
	displayMetadataList(_para['metadata']);
	displayAlignTypeList(_para['aligntype']);
	displaySearchCorpus(_para['corpus']);
	displaySearchMode(_para['mode']);
	displayCompareContent(_para['metadata'], _para['aligntype']);
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
		let deleteBtn = "<span class=\"glyphicon glyphicon-trash\" name=\"" + corpusName + "\" onclick=\"deleteCorpus('" + corpusName + "')\"></span>";
		$(".controlContentBlock[id=compare-manage] > ol").append(manageItem + hideBtn + deleteBtn);
	}
}