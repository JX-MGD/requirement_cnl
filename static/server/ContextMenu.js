//###右键操作 Start ###//

// This is the general menu command handler, parameterized by the name of the command.
function cxcommand(event, val) {
  if (val === undefined) val = event.currentTarget.id;
  switch (val) {
    case "dependencyFrom": mySubDiagram.commandHandler.dependencyFrom(); break;
    case "dependencyTo": mySubDiagram.commandHandler.dependencyTo(); break;
    case "showTheSameTypeNode": mySubDiagram.commandHandler.showTheSameTypeNode(); break;
    case "showAll": mySubDiagram.commandHandler.showAll(); break;
  }
  mySubDiagram.currentTool.stopTool();
}
//###右键操作 End ###//
function showAll() {
  console.log("showAll");
  //显示所有节点
  mySubDiagram.nodes.each(function(n) {
    n.visible = true;
  });
}

function showTheSameTypeNode() {
  let node = mySubDiagram.selection.first();
  let allNodes=[];
  let nodeType=node.category;
  mySubDiagram.nodes.each(function (n) {
    if (n.category===nodeType){
      let group = n.containingGroup;
      //如果该节点是一个category== "Systemboder"的组成员,先将所在组添加进nodes
      if (group instanceof go.Group && group.category === "SystemBorder" && !allNodes.includes(group)) {
        allNodes.push(group);
      }
      allNodes.push(n);
    }
  })
  showAllFilterNodes(allNodes);
}




function dependencyFrom() {
  console.log("from");
  let node = mySubDiagram.selection.first();
  console.log(node.data.text);
  // 查找与该节点直接相关或间接相关的所有节点
  let allNodes = findDependentFromNodes(node);
  showAllFilterNodes(allNodes);
}


function findDependentFromNodes(node, nodes) {
  nodes = nodes || [];
  // 添加选中节点
  if (!nodes.includes(node)) {
    nodes.push(node);
  }
  let group = node.containingGroup;
  //如果该节点是一个category== "Systemboder"的组成员,先将所在组添加进nodes
  if (group instanceof go.Group && group.category === "SystemBorder" && !nodes.includes(group)) {
    nodes.push(group);
  }

  // 找到所有指向当前节点的链接的起点节点
  let downstreamNodes = node.findNodesOutOf();

  downstreamNodes.each(function (downstreamNode) {
    //下级节点为空，该分支停止迭代
    if (downstreamNode !== null) {
      if (downstreamNode instanceof go.Group && downstreamNode.category === "SystemBorder") { //如果downstreamNode是一个group
        //将group组内所有节点添加进nodes数组中
        downstreamNode.memberParts.each(function (n) {
          if (!(n instanceof go.Link)){  //不包含links
            if (!nodes.includes(n)){
              nodes.push(n);
            }
            //找到group组内节点的叶节点
            findDependentFromNodes(n, nodes);
          }
        });
        //将group添加进nodes数组中，且向下迭代
        if (!nodes.includes(downstreamNode)){
          nodes.push(downstreamNode);
        }
        findDependentFromNodes(downstreamNode,nodes);
      } else {
        //将该节点添加进nodes
        if (!nodes.includes(downstreamNode)){
          nodes.push(downstreamNode);
        }
        findDependentFromNodes(downstreamNode, nodes);
      }
    }
  });
  return nodes;
}



function dependencyTo() {
  console.log("to");
  let node=mySubDiagram.selection.first();
  console.log(node.data.text);
  //查找与该节点直接相关或间接相关的所有节点
  let allNodes=findDependentToNodes(node);
  showAllFilterNodes(allNodes);
}


function findDependentToNodes(node, nodes) {
  nodes = nodes || [];
  // 添加选中节点
  if (!nodes.includes(node)) {
    nodes.push(node);
  }

  let group = node.containingGroup;
  //如果该节点是一个category== "Systemboder"的组成员,先将所在组添加进nodes
  if (group instanceof go.Group && group.category === "SystemBorder" && !nodes.includes(group)) {
    nodes.push(group);
  }

  // 找到所有指向当前节点的链接的起点节点
  let upstreamNodes = node.findNodesInto();
  upstreamNodes.each(function (upstreamNode) {
    //上级节点为空，该分支停止迭代
    if (upstreamNode !== null) {
      if (upstreamNode instanceof go.Group && upstreamNode.category === "SystemBorder") { //如果upstreamNode是一个group
        //将group组内所有节点添加进nodes数组中
        upstreamNode.memberParts.each(function (n) {
          if (!(n instanceof go.Link)){  //不包含links
            if (!nodes.includes(n)){
              nodes.push(n);
            }
            //找到group组内节点的上级节点
            findDependentToNodes(n, nodes);
          }
        });
        //将group添加进nodes数组中，且向上迭代
        if (!nodes.includes(upstreamNode)){
          nodes.push(upstreamNode);
        }
        findDependentToNodes(upstreamNode,nodes);
      }else {
        //将该节点添加进nodes
        if (!nodes.includes(upstreamNode)){
          nodes.push(upstreamNode);
        }
        findDependentToNodes(upstreamNode, nodes);
      }
    }
  });
  return nodes;
}


function showAllFilterNodes(allNodes) {
  // 隐藏所有节点
  mySubDiagram.nodes.each(function (n) {
    n.visible = false;
    //updateNodeCheckboxState(n.data.key, false);
  });
  // 如果节点属于Filter节点，则显示该节点
  for (let i = 0; i < allNodes.length; i++) {
    console.log(allNodes[i].data.text);
    // 如果当前节点是group，显示group组内节点
    if (allNodes[i] instanceof go.Group) {
      allNodes[i].memberParts.each(function (groupNode) {
        // 只显示存在allNodes中的组内节点
        if (allNodes.includes(groupNode)){
          groupNode.visible = true;
          //updateNodeCheckboxState(groupNode.data.key, true); // 更新对应选择框状态
        }
      });
    }
    allNodes[i].visible = true;
    //updateNodeCheckboxState(allNodes[i].data.key, true); // 更新对应选择框状态
  }
}

/*// 定义一个函数，用于在右侧菜单中更新节点选择框状态
function updateNodeCheckboxState(nodeKey, visible) {
  let checkbox = document.querySelector(`input[value="${nodeKey}"]`);
  console.log(checkbox);
  if (checkbox) {
    checkbox.checked = visible;
    console.log(checkbox.checked);
  }
}*/

