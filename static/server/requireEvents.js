
// read in the JSON data from the "myRequirementDiagramSavedModel" element
function RequirementDiagramSave() {
  //### 解决points导致的连线错位 Start ###by:ljq//
  let linkDataArray = mySubDiagram.model.linkDataArray;
  for (let i = 0; i < linkDataArray.length; i++) {
    delete (linkDataArray[i].points);
  }
  //### 解决points导致的连线错位 End ###by:ljq//

  //### 更新画板大小 Start ###by:ljq//
  let parts = mySubDiagram.parts;
  while (parts.next()) {
    let data = parts.value;
    if (data.layerName === "DrawingBoard") {
      mySubDiagram.model.modelData.DrawingBoard = {
        "width": data.width,
        "height": data.height
      };
      break;
    }
  }
  //### 更新画板大小 End ###by:ljq//

  // mySubDiagram.model.modelData.finalVersion = softwareCurrentVersion; //保存整个文件的最终版本号
  document.getElementById("myRequirementDiagramSavedModel").value = mySubDiagram.model.toJson();
  mySubDiagram.isModified = false;
}

// Show the diagram's model in JSON format
function RequirementDiagramLoad() {
  // read in the JSON data from the "myRequirementDiagramSavedModel" element
  mySubDiagram.model = go.Model.fromJson(document.getElementById("myRequirementDiagramSavedModel").value);
  // softwareCurrentVersion = mySubDiagram.model.modelData.finalVersion;
  // $("#softwareCurrentVersion").html("CurrentVersion:" + softwareCurrentVersion);

  //### 更新画板大小 Start ###by:ljq//
  let drawingBoard = mySubDiagram.model.modelData.DrawingBoard;
  if (drawingBoard != undefined) {
    let parts = mySubDiagram.parts;
    while (parts.next()) {
      let data = parts.value;
      if (data.layerName === "DrawingBoard") {
        data.width = drawingBoard.width;
        data.height = drawingBoard.height;
        break;
      }
    }
  }

  showRightMenu();
  //### 更新画板大小 End ###by:ljq//
}

function TopRotatingTool() {
  go.RotatingTool.call(this);
}
go.Diagram.inherit(TopRotatingTool, go.RotatingTool);

/** @override */
TopRotatingTool.prototype.updateAdornments = function (part) {
  go.RotatingTool.prototype.updateAdornments.call(this, part);
  var adornment = part.findAdornment("Rotating");
  if (adornment !== null) {
    adornment.location = part.rotateObject.getDocumentPoint(new go.Spot(0.5, 0, 0, -30));  // above middle top
  }
};

/** @override */
TopRotatingTool.prototype.rotate = function (newangle) {
  go.RotatingTool.prototype.rotate.call(this, newangle + 90);
};
// end of TopRotatingTool class

//显示隐藏版本号
function showVersionNo() {
  for (let temp = mySubDiagram.nodes; temp.next();) {
    let tempNode = temp.value;
    if (tempNode.data.buttonOpacity == 1.0) {
      //遍历画布中所有模型元素
      for (let nit = mySubDiagram.nodes; nit.next();) {
        let node = nit.value;
        node.data.buttonOpacity = 0.0;
      }
    } else {
      for (let nit = mySubDiagram.nodes; nit.next();) {
        let node = nit.value;
        node.data.buttonText = node.data.initVersion; //显示版本号
        node.data.buttonOpacity = 1.0;
        //设置当前版本元素的版本号高亮显示
        // if(node.data.initVersion === softwareCurrentVersion) {
        //   node.data.buttonFill = "yellow";
        // } else {
        //   node.data.buttonFill = "rgb(169, 169, 169)";
        // }
      }
    }
    RequirementDiagramSave();
    RequirementDiagramLoad();
    break;
  }
}

//聚焦选中的元素
function centerErrorElement(loc) {
  highlighter.location = loc;
  highlighter.visible = true;
  mySubDiagram.scale = 0.6; //将视角放大到合适大小
  mySubDiagram.commandHandler.scrollToPart(node); //移动到node居中的位置，配合highLighter达到聚焦效果
}

//###导航栏功能函数 Start ###//
function newDiagram() {
  mySubDiagram.model.nodeDataArray = [];
  mySubDiagram.model.linkDataArray = [];
  RequirementDiagramSave();
  RequirementDiagramLoad();
}

function showMapButton() {
  if ($("#myButton").css("display") === "none") {
    $("#myButton").css("display", "block");
  } else {
    $("#myButton").css("display", "none");
  }
}

function experiment() {
  let number = prompt("Please enter the number of elements that need to be randomly generated(e.g. 1000):");
  if (number == undefined) {
    return;
  }
  if (number === '') {
    alert("Please enter the correct number!");
  }
  number = parseInt(number / 7);
  randomDependence(number);
}
// ###导航栏功能函数 End ###/


//Undo
function Undo() {
  mySubDiagram.commandHandler.undo();
}

//Redo
function Redo() {
  mySubDiagram.commandHandler.redo();
}

//Save
function saveJsonFile() {
  // mySubDiagram.model.modelData.finalVersion = softwareCurrentVersion;
  let jsonFile = mySubDiagram.model.toJson();
  //往服务器传json数据
  $.ajax({
    type: "POST",
    url: `http://${hostName}:3000/`,
    crossDomain: true,
    // dataType: "json", //返回的数据
    contentType: "application/json",
    data: jsonFile,
    success: function (data) {
      alert("Save to the server successfully!");
    },
    error: function (err) {
      alert("Please deploy the server!");
    }
  });
  RequirementDiagramSave();
}

//Export
function exportJsonFile() {
  let content = mySubDiagram.model.toJson();
  let blob = new Blob([content], { type: "text/json; charset=utf-8" });
  saveAs(blob, "mySubDiagram.json");
}

// 画板内容截图
function printscreen() {
  let svgWindow = window.open();
  if (!svgWindow) return;  // failure to open a new Window
  let printSize = new go.Size(1080, 700);
  let bnds = mySubDiagram.documentBounds;
  let x = bnds.x;
  let y = bnds.y;

  let svg = mySubDiagram.makeSvg({ scale: 1.0, position: new go.Point(x, y), size: printSize });
  svgWindow.document.body.appendChild(svg);
  x += printSize.width;

  setTimeout(function () { svgWindow.print(); }, 1);
}

//cut
function cutElements() {
  if (mySubDiagram.commandHandler.canCutSelection) {
    mySubDiagram.commandHandler.cutSelection();
  }
}
//copy
function copyElements() {
  if (mySubDiagram.commandHandler.canCopySelection) {
    mySubDiagram.commandHandler.copySelection();
  }
}
//paste
function pasteElements() {
  if (mySubDiagram.commandHandler.canPasteSelection) {
    mySubDiagram.commandHandler.pasteSelection();
  }
}
//delete
function deleteElements() {
  if (mySubDiagram.commandHandler.canDeleteSelection) {
    mySubDiagram.commandHandler.deleteSelection();
  }
}
//lock
function lockElements() {
  mySubDiagram.commandHandler.lockCurrentNode();
}
//unlock
function unlockElements() {
  mySubDiagram.commandHandler.unlockCurrentNode();
}
//将画板的视图调整到全局视图
function myRequirementDiagramZoomToFit() {
  mySubDiagram.zoomToFit();
}
//###上方工具条功能函数 End ###//

//###管理类功能 Start ###//
//结构模型（SM）合并
function composeStructureModel() {
  $("#composeStructureModel").click();
}

/**
 * 更改当前节点的key值，并同时将其所连的所有线对应的from或to的值进行修改
 */
function alterNodeKey(oldKey, newKey) {
  let node = mySubDiagram.findNodeForKey(oldKey);
  let nodeData = node.data;
  mySubDiagram.model.setDataProperty(nodeData, "key", newKey);
  //修改入度的to值
  let intoLinks = node.findLinksInto();
  let intoLinksCount = intoLinks.count;
  if (intoLinksCount > 0) {
    for (let nit = intoLinks; nit.next();) {
      let intoLink = nit.value;
      let intoLinkData = intoLink.data;
      intoLinkData.to = newKey;
    }
  }
  //修改出度的from值
  let outLinks = node.findLinksOutOf();
  let outLinksCount = outLinks.count;
  if (outLinksCount > 0) {
    for (let nit = outLinks; nit.next();) {
      let outLink = nit.value;
      let outLinkData = outLink.data;
      outLinkData.from = newKey;
    }
  }
}

//将图中所有重复的元素合并(以节点名为准)
function mergeRepeatNodesByName() {
  let nodeDataArray = mySubDiagram.model.nodeDataArray;
  for (let i = 0; i < nodeDataArray.length; i++) {
    for (let j = i + 1; j < nodeDataArray.length; j++) {
      if (nodeDataArray[i].category === nodeDataArray[j].category && nodeDataArray[i].text === nodeDataArray[j].text) {
        let oldKey = nodeDataArray[j].key;
        let newKey = nodeDataArray[i].key;
        alterNodeKey(oldKey, newKey);
        mySubDiagram.model.removeNodeData(nodeDataArray[j]); //从nodeDataArray中删除重复节点数据
      }
    }
  }
}

function composeJson(input) {
  //支持chrome IE10
  if (window.FileReader) {
    let files = input.files;
    let modelArray = [];
    let length = files.length;
    for (let i = 0; i < length; i++) {
      let file = files[i];
      let reader = new FileReader();
      reader.onload = function () {
        modelArray.push(go.Model.fromJson(this.result));
      }
      reader.readAsText(file);
    }
    //***暂时使用延迟到处理异步读取导致的问题，后续再解决***
    setTimeout(() => {
      // 合并json
      let myRequirementDiagramModel = modelArray[0];
      let nodeDataArray = myRequirementDiagramModel.nodeDataArray;
      let linkDataArray = myRequirementDiagramModel.linkDataArray;
      // 判断两个待合并数组的大小，用大的合并小的，减少遍历次数
      for (let i = 1; i < modelArray.length; i++) {
        let model = modelArray[i];
        let newKey = nodeDataArray[nodeDataArray.length - 1].key;
        mySubDiagram.model = model;
        for (let node of model.nodeDataArray) {
          newKey--;
          //更改当前节点的key值，并同时将其所连的所有线对应的from或to的值进行修改
          alterNodeKey(node.key, newKey);
        }
        nodeDataArray.push.apply(nodeDataArray, model.nodeDataArray);
        linkDataArray.push.apply(linkDataArray, model.linkDataArray);
      }
      mySubDiagram.model = myRequirementDiagramModel;
      //将重复的元素合并(以节点名为准)
      RequirementDiagramSave();
      RequirementDiagramLoad();
      mergeRepeatNodesByName();
      RequirementDiagramSave();
      RequirementDiagramLoad();
    }, 400);
  }
  //IE浏览器访问未支持
}
//###管理类功能 End ###//

function RequirementDiagramConfirm() {
  // missingBrackets();
  // sameConversion();
  // toEmptyFinalRequirement();
  // missingBracketsAndMeaninglessEvents();
  // timeEventParIsBool();
  // replaceChangeEvents();
  // redundantRequirement();
  // wrongSyntax();
  // mainDiagramJsonDataCall();
  // isClassDiagramMethod();
  // constructorCalls();
  // artiAddedProperties();
  // basicErrorDisplay();
  // useWhenAndAfter();
  modelingMultipleObjects();
}



/*
* @author ljq
* 将Ifram父页面传过来的json数据加载到状态图画板中
* */
function jsonDataToSubDiagram(jsonData) {
  $("#myRequirementDiagramSavedModel").text(jsonData);
  RequirementDiagramLoad();
}

/*左右导航栏Start*/
function navExhibit(){
    //左侧菜单栏收展
    $(function(){
        $(".subNav").click(function() {
            $(this).toggleClass("currentDd").siblings(".subNav").removeClass("currentDd");
            $(this).toggleClass("currentDt").siblings(".subNav").removeClass("currentDt");
            // 修改数字控制速度， slideUp(400)控制卷起速度
            // subNav下有哪个Nav就收展哪一个Nav
            $(this).next("#toolNav").slideToggle(400).siblings("#toolNav").slideUp(400);
            $(this).next("#NodeNav").slideToggle(400).siblings("#NodeNav").slideUp(400);
            $(this).next("#ActorNav").slideToggle(400).siblings("#ActorNav").slideUp(400);
            $(this).next("#ConstraintNav").slideToggle(400).siblings("#ConstraintNav").slideUp(400);
            $(this).next("#RelationNav").slideToggle(400).siblings("#RelationNav").slideUp(400);
            $(this).next("#ClassNodeNav").slideToggle(400).siblings("#StateNav").slideUp(400);
            $(this).next("#SystemBorderNav").slideToggle(400).siblings("#StateNav").slideUp(400);
        });
    });

    //左侧菜单栏隐藏
    $('#FunctionDiv .delete').click(function() {
        $("#FunctionDiv").css("display", "none");
        mySubDiagram.commandHandler.increaseZoom(1.1); //放大myUmlDiagram画布为1.1倍
    });
    //左侧菜单栏显示
    $('#recoverButton').click(function() {
        $("#FunctionDiv").css("display", "block");
        mySubDiagram.commandHandler.decreaseZoom(0.9); //缩小myUmlDiagram画布为0.9倍
    });


    //右侧菜单栏隐藏
    $("#rightMenuCloseButton").click(function() {
        $(".rightMenu").css("display", "none");
        $("#myButton").css("right", "8.5px");
        $(".myOverviewDiv").css("right", "8.5px");
        mySubDiagram.commandHandler.increaseZoom(1.1); //放大myUmlDiagram画布为1.1倍
    });
}
/*左右侧导航栏End*/

/*右侧导航栏Start*/

function showRightMenu(){
  // 获取gojs元素节点
let nodeDataArray = mySubDiagram.model.nodeDataArray;

// 按类别分类节点
let categorizedNodes = {};
for (let i = 0; i < nodeDataArray.length; i++) {
  let node = nodeDataArray[i];
  let category = node.category;
  if (!categorizedNodes[category]) {
    categorizedNodes[category] = [];
  }
  categorizedNodes[category].push(node);
}

/*
rightMenu
--categoryContainer
----categoryHeaderContainer
------collapseButton
------selectAllCheckbox
------categoryHeader
----nodeContainer
------nodeEntry
--------checkbox
--------nodeName
*/
// 生成右侧目录结构
let rightMenu = document.getElementById('rightMenu');
rightMenu.innerHTML = ''; //清空右侧目录结构

for (let category in categorizedNodes) {
  let categoryNodes = categorizedNodes[category];

  // 创建包含 categoryHeaderContainer 和 categoryNodesContainer 的容器 categoryContainer
  let categoryContainer = document.createElement('div');
  categoryContainer.classList.add('category-container');

  // 创建包含收缩按钮、多选按钮和分类标题的容器 categoryHeaderContainer
  let categoryHeaderContainer = document.createElement('div');
  categoryHeaderContainer.classList.add('category-header-container');

  // 创建收缩按钮
  let collapseButton = document.createElement('button');
  collapseButton.classList.add('collapse-button');
  collapseButton.textContent = '+';
  collapseButton.addEventListener('click', toggleCategoryVisibility);

  // 创建多选按钮
  let selectAllCheckbox = document.createElement('input');
  selectAllCheckbox.type = 'checkbox';
  selectAllCheckbox.classList.add('select-all-checkbox');
  selectAllCheckbox.checked = true; // 默认全选
  selectAllCheckbox.addEventListener('change', toggleAllNodesVisibility);

  // 创建类别目录
  let categoryHeader = document.createElement('h5');
  categoryHeader.classList.add('category-header');
  categoryHeader.textContent = category;

  // 将收缩按钮、多选按钮和分类标题添加categoryHeaderContainer容器中
  categoryHeaderContainer.appendChild(collapseButton);
  categoryHeaderContainer.appendChild(categoryHeader);
  categoryHeaderContainer.appendChild(selectAllCheckbox);

  // 将分类头容器添加到分类容器中
  categoryContainer.appendChild(categoryHeaderContainer);

  // 创建包含节点条目的容器 nodesContainer
  let nodesContainer = document.createElement('div');
  nodesContainer.classList.add('node-container');

  // 创建类别目录下的节点目录
  for (let j = 0; j < categoryNodes.length; j++) {
    let node = categoryNodes[j];

    // 创建节点目录条目的容器 nodeEntry
    let nodeEntry = document.createElement('div');
    nodeEntry.classList.add('node-entry');

    // 创建节点选择框
    let checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = node.key; // 将节点的唯一键作为复选框的值。
    checkbox.checked=true; // 默认选中
    checkbox.addEventListener('change', toggleNodeVisibility);

    // 创建节点名称标签
    let nodeName = document.createElement('label');
    nodeName.textContent = node.text; // 将节点的文本内容作为标签的文本内容。

    // 将节点选择框和节点名称标签添加到节点目录条目容器中
    nodeEntry.appendChild(checkbox);
    nodeEntry.appendChild(nodeName);

    // 将节点目录条目容器添加到节点目录容器中
    nodesContainer.appendChild(nodeEntry);
  }

  // 默认收缩
  // nodesContainer.style.display = 'none';
  
  // 将节点目录容器添加到分类容器中
  categoryContainer.appendChild(nodesContainer);

  // 将分类容器添加到右侧目录结构中
  rightMenu.appendChild(categoryContainer);
}

console.log("目录生成完毕");
}

// 多选框控制显示/隐藏节点的事件处理函数
function toggleNodeVisibility(event) {
  let checkbox = event.target;
  let nodeKey = checkbox.value;
  let node = mySubDiagram.findNodeForKey(nodeKey);
  if (node) {
    node.visible = checkbox.checked;
    // 获取节点容器元素和所有节点复选框元素
    let nodesContainer = checkbox.closest('.node-container');
    let checkboxes = nodesContainer.querySelectorAll('input[type="checkbox"]');
    // 获取 selectAllCheckbox 多选框元素
    let selectAllCheckbox = nodesContainer.previousElementSibling.querySelector('input[type="checkbox"]');
    // 检查是否所有节点都已选中，如果是，则设置 selectAllCheckbox 为选中状态，否则取消选中状态
    let allChecked = true;
    for (let i = 0; i < checkboxes.length; i++) {
      if (!checkboxes[i].checked) {
        allChecked = false;
        break;
      }
    }
    selectAllCheckbox.checked = allChecked;
  }
}

// 收缩/展开分类的事件处理函数
function toggleCategoryVisibility() {
  let nodesContainer = this.parentElement.nextElementSibling;
  if (nodesContainer.style.display === 'none') {
    nodesContainer.style.display = 'block';
    this.textContent = '-';
  } else {
    nodesContainer.style.display = 'none';
    this.textContent = '+';
  }
}

function toggleAllNodesVisibility() {
  // 获取 selectAllCheckbox 多选框的选中状态
  let selectAllChecked = this.checked;
  let nodesContainer = this.parentElement.nextElementSibling;
  let checkboxes = nodesContainer.querySelectorAll('input[type="checkbox"]');
  console.log(checkboxes);
  for (let i = 0; i < checkboxes.length; i++) {
    let checkbox = checkboxes[i];
    checkbox.checked = selectAllChecked;
    toggleNodeVisibility({target: checkbox});
  }
}
/*右侧导航栏End*/

