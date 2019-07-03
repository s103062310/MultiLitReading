# MultiLitReading
[Develop Weekly Progress](https://hackmd.io/@6vl-R1QtRl-LuttqpoUdVA/HJdOAaLXN?type=view)

## Example Directory
Some example XML files that can be applied on this tool.
Remember that the files need to be uploaded to [DocuSky](http://docusky.org.tw) building as personal database, and then can display on this tool.

## Switch Interface
Utilize CSS to implement. Step of adding new interface described below:

> 1. add ```html <span id="TabName"></span>``` under ```html <!-- tab setting -->```
> 2. add ```html <a href="#compareTab">TabName</a>``` under ```html <nav> ... <div class="tabBtn">```
> 3. add ```html <div class="TabController">``` under ```html <nav> ... <div class="tabContent">```
> 4. add ```html <div class="TabInterface">``` under ```html <!-- Tab interface -->```
> 5. modify ```css grid-template-columns: repeat(TabNum, 1fr);``` in ```css .tabBtn{...}```
> 6. add ```css #TabName:target ~ nav .tabBlock .tabBtn a[href="#TabName"]``` under ```css /* highlight target or default target */```
> 7. add ```css #TabName:target ~ nav .tabBlock .tabBtn a:hover``` under ```css /* highlight when hover */```
> 8. add ```css #TabName:target ~ nav .tabBlock .tabContent .TabController``` under ```css /* display content or default content */```

## Style Class
Classes which are used to define specific style.

### notHover
Use mostly on icon. Elements which use notHover class do not show hover effects.

### pinned
Use on metadata list item. Metadata item which uses pinned class will display in light yellow and indicate that it is the reference of multi-literature reading between documents right now.

### tagged
Use on highlighting the blocks. Blocks which use tagged class will display in yellow. If uses tagged class twice, said tagged tagged, the block will display in red.

## Attribute Setting

### Control Board

1. **class** controlTitleBlock
    > - onclick="collapse('# *id of correspond controlContentBlock*')"

2. **class** controlContentBlock
    > - id="*block function name*"  => for collapse

### Compare Interface

1. **class** corpusBlock
    > - name="*corpusName*"

2. **class** titleBlock
    > - metaForAlign="*value of active metadata*"  =>  for multi-literature reading between documents
    > - key="*document ID*"  =>  unique key of each title block
    > - **span 1 - title text:** onclick="moveDocument('*document ID*', '*corpusName*')"
    > - **span 2 - [chevron-down](6.chevron-down) icon**

3. **class** metadataBlock
    > - key="*document ID*"  => for collapse
    > - **li - metadata item:** class="*metadata item* (pinned)"

4. **class** textBlock
    > - idForAlign="*RefId for block*"  =>  for multi-literature reading between paragraphs
    > - key="*Key for block*"  =>  unique key of each text block
    > - onclick="moveAnchor('*RefId for block*', '*Key for block*', '*corpusName*')"
    > - **span - term tag:** class="term"

### Search Interface

1. **class** textBlock (in Search Result)
    > - key="*Key for block*"  =>  for fast search of result item
    > - **span 1 - [chevron-left](7.chevron-left) icon**
    > - **span 2 - block text**

2. **class** titleBlock (in Search Analysis)
    > - onclick="collapse('.searchInterface div[name=*first layer of search result*]')"

3. **class** textBlock (in Search Analysis)
    > - name="*first layer of search result*"  => for collapse

4. **class** searchItem (in Search Analysis)
    > - key="*Key for block*"  =>  for fast search of result item
    > - **span 1 - item:** onclick="jumpToBlock('*Key for block*')"
    > - **span 2 - number**

### Explain Interface

1. **class** titleBlock
    > - onclick="jumpToSection('.explainContent h2[key=*first layer of table of content*]')
    > - onclick="jumpToSection('.explainContent div[key=*second layer of table of content*]')  =>  text and image
    > - onclick="jumpToSection('.explainContent h3[key=*second layer of table of content*]')  =>  subtitle

2. h2, h3, div ...
    > - key="*text that show in table of content*"  =>  for fast search of explaination

### Bootstrap Icon
Utilize method: ```html <span class="glyphicon glyphicon-IconName"></span>```

1. eye-close
    > - value="*corpusName*"
    > - onclick="hideOrShowCorpus(this, '*corpusName*')"

2. trash
    > - onclick="deleteCorpus('*corpusName*')"

3. pushpin
    > - class="pushpin notHover"

4. retweet
    > - onclick="changeMetadata('*metadata*')"  =>  in #compare-metadataSetting
    > - onclick="changeAlignType('*alignType*')"  =>  in #compare-alignSetting
    > - onclick="changeSearchCorpus('*corpusName*')"  =>  in #search-display
    > - onclick="changeSearchMode('*mode*')"  =>  in #search-mode

5. search
    > - onclick="search(this.parentElement.firstElementChild.value)"

6. chevron-down
    > - onclick="collapseMetadata('*document ID*', this)"

7. chevron-left
    > - onclick="backToCompare(this.parentElement)"
