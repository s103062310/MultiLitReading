# MultiLitReading
[Develop Weekly Progress](https://hackmd.io/@6vl-R1QtRl-LuttqpoUdVA/HJdOAaLXN?type=view)

> 2019.06.17 | v.1.0  
> 2019.07.03 | v.1.1, add: explain interface  
> 2019.07.06 | v.1.2, fix: load complete database data  
> 2019.10.31 | v.1.3, fix: filter tab charactor and term display error  
> 2020.02.22 | v.2.0  
> 2020.05.14 | v.2.1, add: auto load database from url parameter  
> 2020.05.23 | v.2.2, mod: UI for project  
> 2020.07.14 | v.2.3, add: id for representing range and update explanation

## Example Directory
Some example XML files that can be applied on this tool. You can:
1. uploaded to [DocuSky](http://docusky.org.tw) building as personal database, and then load into the tool.
2. uploaded .xml file directly to the tool.

## Introduction of Interface
1. **compare** => main interface, for comparing different corpus
2. **search** => provide simple search function
3. **explain** => record usage of the tool
4. **control board** => switch interface and put all settings

### Switch Interface
Utilize CSS to implement. Step of adding new interface described below:

> 1. In .html, add ```<span id="TabName"></span>``` under ```<!-- tab setting -->```
> 2. In .html, add ```<a href="#compareTab">TabName</a>``` under ```<nav> ... <div class="tabBtn">```
> 3. In .html, add ```<div class="TabController">``` under ```<nav> ... <div class="tabContent">```
> 4. In .html, add ```<div class="TabInterface">``` under ```<!-- Tab interface -->```
> 5. In .css, modify ```grid-template-columns: repeat(TabNum, 1fr);``` in ```.tabBtn{...}```
> 6. In .css, add ```#TabName:target ~ nav .tabBlock .tabBtn a[href="#TabName"]``` under ```/* highlight target or default target */```
> 7. In .css, add ```#TabName:target ~ nav .tabBlock .tabBtn a:hover``` under ```/* highlight when hover */```
> 8. In .css, add ```#TabName:target ~ nav .tabBlock .tabContent .TabController``` under ```/* display content or default content */```

## HTML File
* explanation of tool for different project

## JS File
1. **globalVar.js** =>
    * defined all used data structures and global variables
    * initialization of the program
    * other small tools
2. **fileLoading.js** => defined the functions that used to load files from
computer and DocuSky
3. **parsing.js** => defined the functions that used to parse the data of 
document information
4. **display.js** => is responsible for UI display, used javascript to 
modify html dynamicly
5. **display_proj.js** => display.js for project
6. **checkergetter.js** => defined all checker (return a boolean value) and 
getter (get some information)
7. **controlFunc.js** => defined the interaction function of control board
8. **mainFunc.js** => defined the interaction function of main tool

## CSS Files
1. **main-style.css** => for main screen
2. **control-style.css** => for control board

### Self-defined Style Class

#### Classes which are used to define specific style.
1. **notHover** => use mostly on icon. Elements which use notHover class do not show hover effects.
2. **pinned** => use on metadata list item. Metadata item which uses pinned class will display in light yellow and indicate that it is the reference of multi-literature reading between documents right now.
3. **tagged** => use on highlighting the blocks. Blocks which use tagged class will display in yellow. If uses tagged class twice, said tagged tagged, the block will display in red.

#### Control Board
1. **controlTitleBlock** => ```onclick="collapse('# id of correspond controlContentBlock')"```
2. **controlContentBlock** => ```id="block function name"``` (for collapse)

#### Compare Interface
1. **corpusBlock** => ```name="corpusName"```
2. **titleBlock** =>
    * ```metaForAlign="value of active metadata"``` (for multi-literature reading between documents)
    * ```key="document ID"``` (unique key of each title block)
    * span 1: title text => ```onclick="moveDocument('document ID', 'corpusName')"```
    * span 2: chevron-down icon
3. **metadataBlock** => 
    * ```key="document ID"``` (for collapse)
    * li: metadata item => ```class="metadata item (pinned)"```
4. **textBlock** =>
    * ```idForAlign="RefId for block"``` (for multi-literature reading between paragraphs)
    * ```key="Key for block"``` (unique key of each text block)
    * ```onclick="moveAnchor('RefId for block', 'Key for block', 'corpusName')"```
    * span: term tag => ```class="term"```
 
#### Search Interface
1. **textBlock** (in Search Result) =>
    * ```key="Key for block"``` (for fast search of result item)
    * span 1: [chevron-left](#chevron-left) icon
    * span 2: block text
2. **titleBlock** (in Search Analysis) => ```onclick="collapse('.searchInterface div[name=first layer of search result]')"```
3. **textBlock** (in Search Analysis) => ```name="first layer of search result"``` (for collapse)
4. **searchItem** (in Search Analysis) =>
    * ```key="Key for block"``` (for fast search of result item)
    * span 1: item => ```onclick="jumpToBlock('Key for block')"```
    * span 2: number

#### Explain Interface
1. **titleBlock** =>
    * ```onclick="jumpToSection('.explainContent h2[key=first layer of table of content]')```
    * ```onclick="jumpToSection('.explainContent div[key=second layer of table of content]')``` (text and image)
    * ```onclick="jumpToSection('.explainContent h3[key=second layer of table of content]')``` (subtitle)
2. **h2, h3, div ...** => ```key="text that show in table of content"``` (for fast search of explaination)

### Bootstrap Icon
Utilize method: ```html <span class="glyphicon glyphicon-IconName"></span>```

1. **eye-close** =>
    * ```value="corpusName"```
    * ```onclick="hideOrShowCorpus(this, 'corpusName')"```
2. **trash** => ```onclick="deleteCorpus('corpusName')"```
3. **pushpin** => ```class="pushpin notHover"```
4. **retweet** =>
    * ```onclick="changeMetadata('metadata')"``` (in #compare-metadataSetting)
    * ```onclick="changeAlignType('alignType')"``` (in #compare-alignSetting)
    * ```onclick="changeSearchCorpus('corpusName')"``` (in #search-display)
    * ```onclick="changeSearchMode('mode')"``` (in #search-mode)
5. **search** => ```onclick="search(this.parentElement.firstElementChild.value)"```
6. **chevron-down** => ```onclick="collapseMetadata('document ID', this)"```
7. **chevron-left** => ```onclick="backToCompare(this.parentElement)"```

