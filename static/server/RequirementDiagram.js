let mySubDiagram;
// let softwareCurrentVersion = undefined; //记录软件当前版本号

// 节点类型
let NodeType=[
  "RequirementNode",//0 需求节点
  "Node",           //1 需求分解行为节点
  "Constraint",      //2 约束
  "Actor",          //3 参与者
  "SystemBorder",   //4 系统边界
  "DataEntity",     //5 数据实体
  "ClassNode",      //6 类节点
  "System",         //7 系统（暂未使用）
  "Topic"           //8 场景 （暂未使用）
]
let $$ = go.GraphObject.make;  // for conciseness in defining templates
//gojs初始化
function gojsInit() {
  mySubDiagram =
    $$(go.Diagram, "RequirementDiagramDiv",  // must name or refer to the DIV HTML element
      {
        allowDrop: true, // must be true to accept drops from the Palette
        // start everything in the middle of the viewport
        initialContentAlignment: go.Spot.Center,
        // have mouse wheel events zoom in and out instead of scroll up and down
        "toolManager.mouseWheelBehavior": go.ToolManager.WheelZoom,
        // support double-click in background creating a newNode
        // "clickCreatingTool.archetypeNodeData": { text: "newNode", category: "DefaultNode", initVersion: softwareCurrentVersion },
        "draggingTool.dragsLink": true,
        "draggingTool.isGridSnapEnabled": true,
        // "draggingTool.isCopyEnabled": false,
        "linkingTool.isUnconnectedLinkValid": true,
        "linkingTool.portGravity": 20,
        "relinkingTool.isUnconnectedLinkValid": true,
        "relinkingTool.portGravity": 20,

        // "relinkingTool.fromHandleArchetype": $$(go.Shape, "Diamond", { segmentIndex: 0, cursor: "pointer", desiredSize: new go.Size(8, 8), fill: "tomato", stroke: "darkred" }),
        // "relinkingTool.toHandleArchetype": $$(go.Shape, "Diamond", { segmentIndex: -1, cursor: "pointer", desiredSize: new go.Size(8, 8), fill: "darkred", stroke: "tomato" }),
        // "linkReshapingTool.handleArchetype": $$(go.Shape, "Diamond", { desiredSize: new go.Size(7, 7), fill: "lightblue", stroke: "deepskyblue" }),

        "rotatingTool.snapAngleMultiple": 15,
        "rotatingTool.snapAngleEpsilon": 15,

        // enable undo & redo
        "undoManager.isEnabled": true
      }
    );

  //节点取消自适应连线
  // mySubDiagram.model.linkFromPortIdProperty = "fromPort";
  // mySubDiagram.model.linkToPortIdProperty = "toPort";
  //往modelData中加入初始、结束版本对象，使版本号能在json文本中显示
  mySubDiagram.model.modelData = { "initVersion": undefined, "finalVersion": undefined };

  //返回被选中的第一个节点
  mySubDiagram.__proto__.firstSelectedNode = function () {
    for (let nit = this.nodes; nit.next();) {
      let node = nit.value;
      if (node.isSelected) {
        return node;
      }
    }
  }
  //返回被选中的节点数组
  mySubDiagram.__proto__.allSelectedNodes = function () {
    let selectedNodes = [];
    for (let nit = this.nodes; nit.next();) {
      let node = nit.value;
      if (node.isSelected) {
        selectedNodes.push(node);
      }
    }
    return selectedNodes;
  }

  // when the document is modified, add a "*" to the title and enable the "Save" button
  mySubDiagram.addDiagramListener("Modified", function (e) {
    let button = document.getElementById("SaveButton");
    if (button) button.disabled = !mySubDiagram.isModified;
    let idx = document.title.indexOf("*");
    if (mySubDiagram.isModified) {
      if (idx < 0) document.title += "*";
    } else {
      if (idx >= 0) document.title = document.title.substr(0, idx);
    }
  });

  function showSmallPorts(node, show) {
    node.ports.each(function (port) {
      if (port.portId !== "") {  // don't change the default port, which is the big shape
        port.fill = show ? "rgba(0,0,0,0.3)" : null;
      }
    }
    );
  }


  // This is the actual HTML context menu:
  let cxElement = document.getElementById("contextMenu");

  // an HTMLInfo object is needed to invoke the code to set up the HTML cxElement
  let myContextMenu = $$(go.HTMLInfo, {
    show: showContextMenu,
    hide: hideContextMenu
  });


  // helper definitions for node templates
  function nodeStyle() {
    return [
      {
        locationSpot: go.Spot.Center, // the Node.location is at the center of each node
        contextMenu: myContextMenu,
        selectable: true,
        selectionAdornmentTemplate: nodeSelectionAdornmentTemplate,
        resizable: true,
        resizeObjectName: "PANEL",
        resizeAdornmentTemplate: nodeResizeAdornmentTemplate,
        mouseEnter: function (e, node) { showSmallPorts(node, true); },
        mouseLeave: function (e, node) { showSmallPorts(node, false); }
      },
      /*特别注意：
      不能给节点数据属性的“key”属性添加双向数据绑定（默认的属性名“key”实际上是Model.nodeKeyProperty）。
      这个属性的值，必须被Model所知，且它在模型中的所有节点中必须是唯一的
      一个双向数据绑定如果改变了“key”属性的值，可能会导致很多问题。
       */
      new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify)
    ];
  }

  /**
   * Define a function for creating a "port" that is normally transparent.
   * @param name      The "name" is used as the GraphObject.portId
   * @param spot      the "spot" is used to control how links connect,and where the port is positioned on the node
   * @param output    the boolean "output" arguments
   * @param input     the boolean "input"  arguments
   * control whether the user can draw links from or to the port.
   * @returns {*}
   */
  function makePort(name, spot, output, input) {
    // the port is basically just a small transparent square
    return $$(go.Shape, "Circle",
      {
        fill: null,  // not seen, by default; set to a translucent gray by showSmallPorts, defined below
        stroke: null,
        desiredSize: new go.Size(10, 10),
        alignment: spot,  // align the port on the main Shape
        alignmentFocus: spot,  // just inside the Shape
        portId: name,  // declare this object to be a "port"
        fromSpot: spot, toSpot: spot,  // declare where links may connect at this port
        fromLinkable: output, toLinkable: input,  // declare whether the user may draw links to/from here
        cursor: "pointer"  // show a different cursor to indicate potential link point
      },
    );
  }


  let nodeSelectionAdornmentTemplate =
    $$(go.Adornment, "Auto",
      $$(go.Shape, { fill: null, stroke: "deepskyblue", strokeWidth: 1.5, strokeDashArray: [4, 2] }),
      $$(go.Placeholder)
    );


  let nodeResizeAdornmentTemplate =
    $$(go.Adornment, "Spot",
      { locationSpot: go.Spot.Right },
      $$(go.Placeholder),
      $$(go.Shape, { alignment: go.Spot.TopLeft, cursor: "nw-resize", desiredSize: new go.Size(6, 6), fill: "lightblue", stroke: "deepskyblue" }),
      // $$(go.Shape, { alignment: go.Spot.Top, cursor: "n-resize", desiredSize: new go.Size(6, 6), fill: "lightblue", stroke: "deepskyblue" }),
      $$(go.Shape, { alignment: go.Spot.TopRight, cursor: "ne-resize", desiredSize: new go.Size(6, 6), fill: "lightblue", stroke: "deepskyblue" }),

      // $$(go.Shape, { alignment: go.Spot.Left, cursor: "w-resize", desiredSize: new go.Size(6, 6), fill: "lightblue", stroke: "deepskyblue" }),
      // $$(go.Shape, { alignment: go.Spot.Right, cursor: "e-resize", desiredSize: new go.Size(6, 6), fill: "lightblue", stroke: "deepskyblue" }),

      $$(go.Shape, { alignment: go.Spot.BottomLeft, cursor: "se-resize", desiredSize: new go.Size(6, 6), fill: "lightblue", stroke: "deepskyblue" }),
      // $$(go.Shape, { alignment: go.Spot.Bottom, cursor: "s-resize", desiredSize: new go.Size(6, 6), fill: "lightblue", stroke: "deepskyblue" }),
      $$(go.Shape, { alignment: go.Spot.BottomRight, cursor: "sw-resize", desiredSize: new go.Size(6, 6), fill: "lightblue", stroke: "deepskyblue" })
    );

  let bigfont = "9pt Helvetica, Arial, sans-serif";
  let smallfont = "bold 9pt Helvetica, Arial, sans-serif";

  // Common text styling
  function textStyle() {
    return {
      margin: new go.Margin(2, 10, 2, 10),
      wrap: go.TextBlock.WrapFit,
      textAlign: "center",
      editable: false,
      font: bigfont,
    }
  }



  // define the Node template
  mySubDiagram.nodeTemplate =
    $$(go.Node, "Auto", nodeStyle(), { locationSpot: go.Spot.Center },
      new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
      $$(go.Shape, "Ellipse", { fill: null, isPanelMain: true, portId: "", fromLinkable: true, toLinkable: true, cursor: "pointer" }),
      $$(go.TextBlock, "Require", textStyle(),
        {
          font: "bold 9pt Helvetica, Arial, sans-serif",
          margin: 8,
          maxSize: new go.Size(160, NaN),
          wrap: go.TextBlock.WrapFit,
          editable: true
        },
        new go.Binding("text", "Require").makeTwoWay(),
        new go.Binding("stroke", "stroke").makeTwoWay(),
        new go.Binding("editable", "editable").makeTwoWay()),


      // four small named ports, one on each side:
      // makePort("T", go.Spot.Top, true, true),
      // makePort("L", go.Spot.Left, true, true),
      // makePort("R", go.Spot.Right, true, true),
      // makePort("B", go.Spot.Bottom, true, true),
      // makePort("TL", go.Spot.TopLeft, true, true),
      // makePort("TR", go.Spot.TopRight, true, true),
      // makePort("BL", go.Spot.BottomLeft, true, true),
      // makePort("BR", go.Spot.BottomRight, true, true)
    );



  function finishDrop(e, grp){
    var ok = (grp !== null
      ? grp.addMembers(grp.diagram.selection, true)
      : e.diagram.commandHandler.addTopLevelParts(e.diagram.selection, true));
    if (!ok) e.diagram.currentTool.doCancel();
  } 





  //需求图类
  mySubDiagram.nodeTemplateMap.add(NodeType[0],
    $$(go.Node, "Auto", nodeStyle(),
      {
        locationSpot: go.Spot.Center,
        fromSpot: go.Spot.AllSides,
        toSpot: go.Spot.AllSides
      },
      new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
      $$(go.Shape, 
        { 
          fill: "lightyellow",
          cursor: "pointer",
          isPanelMain: true,
          portId: "",
          fromLinkable: true,
          fromLinkableDuplicates: true,
          fromLinkableSelfNode: false,
          toLinkable: true,
          toLinkableDuplicates: true,
          toLinkableSelfNode: false,

        }),
      $$(go.Panel, "Table",
        { defaultRowSeparatorStroke: "black", name: "TABLE" },
        $$(go.TextBlock, "Requirement",
          {
            row: 0,
            column: 0,
            columnSpan: 3,
            margin: 3,
            alignment: go.Spot.Center,
            font: "bold 12pt sans-serif",
            isMultiline: true,
            editable: true
          },
          new go.Binding("text", "text").makeTwoWay()),
        $$(go.Panel, "Vertical", { name: "details" },
          {
            row: 1, margin: 3, stretch: go.GraphObject.Fill,
            defaultAlignment: go.Spot.Left, background: "lightyellow",
          },
          $$(go.Panel, "Horizontal",
            $$(go.TextBlock, "Id: ", { row: 1, column: 0, stroke: "black", font: "bold 9pt Arial", margin: 2, isMultiline: false, editable: false }),
            $$(go.TextBlock, "需求编号", { row: 1, column: 2, margin: 2, columnSpan: 2, font: "9pt Arial", isMultiline: false, cursor: "default", editable: true },
              new go.Binding("text", "id").makeTwoWay()),
          ),
          $$(go.Panel, "Horizontal",
            $$(go.TextBlock, "Description: ", { row: 2, column: 0, stroke: "black", font: "bold 9pt Arial", margin: 2, isMultiline: false, editable: false }),
            $$(go.TextBlock, "需求说明",
              {
                name: "ReqDetail",
                font: "9pt Arial", 
                // overflow: go.TextBlock.OverflowEllipsis,
                width: 240, 
                wrap: go.TextBlock.WrapFit,
                row: 2,
                column: 2,
                margin: 2,
                columnSpan: 2,
                isMultiline: true,
                editable: true,
                isPanelMain: true,
                cursor: "default",
              },
              new go.Binding("text", "description").makeTwoWay()),
          ),
        ),
      ),
    ),
  );

  //需求分解行为类
  mySubDiagram.nodeTemplateMap.add(NodeType[1],
    $$(go.Node, "Auto", nodeStyle(),
      {
        locationSpot: go.Spot.Center,
        fromSpot: go.Spot.AllSides,
        toSpot: go.Spot.AllSides
      },
      new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
      $$(go.Shape,
        {
          fill: "lightyellow",
          cursor: "pointer",
          isPanelMain: true,
          portId: "",
          fromLinkable: true,
          fromLinkableDuplicates: true,
          fromLinkableSelfNode: false,
          toLinkable: true,
          toLinkableDuplicates: true,
          toLinkableSelfNode: false,

        }),
      $$(go.Panel, "Table",
        { defaultRowSeparatorStroke: "black", name: "TABLE" , background: "#ffff80"},
        $$(go.TextBlock, "Requirement",
          {
            row: 0,
            column: 0,
            columnSpan: 3,
            margin: 3,
            alignment: go.Spot.Center,
            font: "bold 12pt sans-serif",
            isMultiline: true,
            editable: true,
          },
          new go.Binding("text", "text").makeTwoWay()),
        $$(go.Panel, "Vertical", { name: "details" },
          {
            row: 1, margin: 3, stretch: go.GraphObject.Fill,
            defaultAlignment: go.Spot.Left,
          },
          $$(go.Panel, "Horizontal",
            $$(go.TextBlock, "Id: ", { row: 1, column: 0, stroke: "black", font: "bold 9pt Arial", margin: 2, isMultiline: false, editable: false }),
            $$(go.TextBlock, "行为编号", { row: 1, column: 2, margin: 2, columnSpan: 2, font: "9pt Arial", isMultiline: false, cursor: "default", editable: true },
              new go.Binding("text", "id").makeTwoWay()),
          ),
          $$(go.Panel, "Horizontal",
            $$(go.TextBlock, "Description: ", { row: 2, column: 0, stroke: "black", font: "bold 9pt Arial", margin: 2, isMultiline: false, editable: false }),
            $$(go.TextBlock, "行为说明",
              {
                name: "ReqDetail",
                font: "9pt Arial",
                // overflow: go.TextBlock.OverflowEllipsis,
                width: 240,
                wrap: go.TextBlock.WrapFit,
                row: 2,
                column: 2,
                margin: 2,
                columnSpan: 2,
                isMultiline: true,
                editable: true,
                isPanelMain: true,
                cursor: "default",
              },
              new go.Binding("text", "description").makeTwoWay()),
          ),
        ),
      ),
    ),
  );


  // );
  //约束
  mySubDiagram.nodeTemplateMap.add(NodeType[2],
    $$(go.Node, "Auto", nodeStyle(),
      {
        locationSpot: go.Spot.Center,
        // fromSpot: go.Spot.AllSides,
        // toSpot: go.Spot.AllSides,
      },
      new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
      $$(go.Shape, "Rectangle", 
        { 
          fill: "white",
          portId: "",
          cursor: "pointer",
          isPanelMain: true,
          fromLinkable: true,
          fromLinkableDuplicates: true,
          fromLinkableSelfNode: false,
          toLinkable: true,
          toLinkableDuplicates: true,
          toLinkableSelfNode: false,
				}),
      $$(go.Panel, "Vertical",
        $$(go.TextBlock, textStyle(), { width: 100, wrap: go.TextBlock.WrapFit, margin: 4, editable: false, cursor: "default", },
          new go.Binding("text", "type").makeTwoWay()),
        $$(go.TextBlock, "Constraint", textStyle(), { width: 160, wrap: go.TextBlock.WrapFit, margin: 4, editable: true, cursor: "default",},
          new go.Binding("text", "text").makeTwoWay())
      ),
    ));

  // Actor
  // 使边界模型的文字置底，同时边界无法参与连线
  mySubDiagram.nodeTemplateMap.add(NodeType[3],
    $$(go.Node, "Spot", nodeStyle(),
      $$(go.Panel, "Vertical",
        { name: "PANEL", },
        new go.Binding("desiredSize", "size", go.Size.parse).makeTwoWay(go.Size.stringify),
        new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
        $$(go.Picture,
          { 
            maxSize: new go.Size(48, 65),
            source: "http://" + window.location.host + "/static/public/images/RequirementIcon/Actor.png" ,
            cursor: "pointer",
            portId: "",
            fromLinkable: true,
            fromLinkableDuplicates: true,
            fromLinkableSelfNode: false,
            toLinkable: true,
            toLinkableDuplicates: true,
            toLinkableSelfNode: false,
          },
          new go.Binding("source", "img")
        ),
        $$(go.TextBlock,
          {
            cursor: "default",
            textAlign: "center",
            font: "bold 12pt Times New Roman",
            margin: new go.Margin(3, 2, 1, 2),
            maxSize: new go.Size(80, NaN),
            isMultiline: true,
            wrap: go.TextBlock.WrapFit,
            editable: true
          },
          new go.Binding("text", "text").makeTwoWay(),
          new go.Binding("stroke", "stroke").makeTwoWay(),
          new go.Binding("editable", "editable").makeTwoWay()
        )
      ),
    )
  );


  //进组高亮
  function highlightGroup(grp, show) {
    if (!grp) return false;
    // check that the drop may really happen into the Group
    var tool = grp.diagram.toolManager.draggingTool;
    grp.isHighlighted = show && grp.canAddMembers(tool.draggingParts);
    return grp.isHighlighted;
  }
  // SystemBoder
  mySubDiagram.groupTemplateMap.add(NodeType[4],
    $$(go.Group, "Vertical",
      {
        // layerName: "Background",

        ungroupable: true,
        resizable: true, resizeObjectName: "SHAPE",
        handlesDragDropForMembers: true
      },
      // always save/load the point that is the top-left corner of the node, not the location
      new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
      // new go.Binding("position", "pos", go.Point.parse).makeTwoWay(go.Point.stringify),
      { // what to do when a drag-over or a drag-drop occurs on a Group
        mouseDragEnter: (e, grp, prev) => {
          if (!highlightGroup(grp, true)) e.diagram.currentCursor = "not-allowed"; else e.diagram.currentCursor = "";
        },
        mouseDragLeave: (e, grp, next) => highlightGroup(grp, false),
        mouseDrop: finishDrop
      },
      $$(go.Shape, "Rectangle",  // the rectangular shape around the members
        {
          portId: "",
          cursor: "pointer",
          fromLinkable: true,
          fromLinkableDuplicates: true,
          fromLinkableSelfNode: false,
          toLinkable: true,
          toLinkableDuplicates: true,
          toLinkableSelfNode: false,
          name: "SHAPE",
          fill: "rgba(113,100,100,0.2)",
          stroke: "black",
          minSize: new go.Size(50, 50),

        },
        new go.Binding("desiredSize", "size", go.Size.parse).makeTwoWay(go.Size.stringify),
        new go.Binding("fill", "isHighlighted", h => h ? dropFill : groupFill).ofObject(),
        new go.Binding("fill").makeTwoWay(),
        new go.Binding("stroke", "isHighlighted", h => h ? dropStroke : groupStroke).ofObject()),
      $$(go.TextBlock,
        {
          font: "bold 12pt Helvetica, Arial, sans-serif",
          margin: 8,
          maxSize: new go.Size(160, NaN),
          wrap: go.TextBlock.WrapFit,
          editable: true,
          text: "system"
        },
        new go.Binding("text","text").makeTwoWay()),
    ),

  );  // end Group and call to add to template Map




  //DataEntity
  mySubDiagram.nodeTemplateMap.add(NodeType[5],
    $$(go.Node, "Auto",nodeStyle(),
      {
        locationSpot: go.Spot.Center,
        fromSpot: go.Spot.AllSides,
        toSpot: go.Spot.AllSides
      },
      new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
      $$(go.Shape, { fill: null , isPanelMain: true, portId: "", fromLinkable: true, toLinkable: true, cursor: "pointer"}),
      $$(go.Panel, "Table",
        { defaultRowSeparatorStroke: "black", name:"TABLE"},
        // title
        $$(go.TextBlock,"DataEntityName",
          {
            row: 0, column:0,columnSpan: 3, margin: 3, alignment: go.Spot.Center,
            font: "bold 12pt sans-serif",
            isMultiline: false, editable: true
          },
          new go.Binding("text", "text").makeTwoWay()),
        $$(go.TextBlock,"Attribute",
          {
            width: 160, wrap: go.TextBlock.WrapFit ,
            row: 1, column:0,columnSpan: 3, margin: 3, alignment: go.Spot.Center,
            font: "bold 12pt sans-serif",overflow: go.TextBlock.OverflowEllipsis,
            isMultiline: true, editable: true,isPanelMain: true,cursor: "pointer"
          },
          new go.Binding("text", "attribute").makeTwoWay()),
        // four small named ports, one on each side:
        makePort("T", go.Spot.Top, true, true),
        makePort("L", go.Spot.Left, true, true),
        makePort("R", go.Spot.Right, true, true),
        makePort("B", go.Spot.Bottom, true, true),
        makePort("TL", go.Spot.TopLeft, true, true),
        makePort("TR", go.Spot.TopRight, true, true),
        makePort("BL", go.Spot.BottomLeft, true, true),
        makePort("BR", go.Spot.BottomRight, true, true),
      ),
    ),
  );

  // show visibility or access as a single character at the beginning of each property or method
  function convertVisibility(v) {
    switch (v) {
      case "public": return "+";
      case "private": return "-";
      case "protected": return "#";
      case "package": return "~";
      default: return v;
    }
  }

  // the item template for properties
  var propertyTemplate =
    $$(go.Panel, "Horizontal",
      $$(go.TextBlock, { //此处的文本为text convertVisbility（“visibility”）
        isMultiline: false,
        editable: true,
        // width: 12,
        margin: new go.Margin(2),
      },
        new go.Binding("text", "visibility", convertVisibility).makeTwoWay((e, v, m) => {
          /*  console.log(v) */
        })),
      $$(go.TextBlock, {  // TYPE of the attribute
        isMultiline: false,
        editable: true,
        margin: new go.Margin(2),
        },new go.Binding("text", "type").makeTwoWay()
      ),
      $$(go.TextBlock, { //此处返回的是方法名
        isMultiline: false,
        editable: true,
        margin: new go.Margin(2),
      },
        new go.Binding("text", "name").makeTwoWay(),
        new go.Binding("isUnderline", "scope", function (s) { //？？？？？？？？？？？？？
          return s[0] === 'c'
        }))
    );

  // the item template for methods
  var methodTemplate =
    $$(go.Panel, "Horizontal",
      // method visibility/access
      $$(go.TextBlock, { //此处的文本为text convertVisbility（“visibility”）
        isMultiline: false,
        editable: true,
        // width: 12,
      },
        new go.Binding("text", "visibility", convertVisibility).makeTwoWay((e, v, m) => {
          /*  console.log(v) */
        })),
      $$(go.TextBlock, {  // TYPE of the method
        isMultiline: false,
        editable: true,
        },new go.Binding("text", "type").makeTwoWay()
      ),
      /* new go.Binding("text", "visibility", convertVisibility).makeTwoWay()) */
      // method name, underlined if scope=="class" to indicate static method
      $$(go.TextBlock, { //此处返回的是方法名
        isMultiline: false,
        editable: true,

      },
        new go.Binding("text", "name").makeTwoWay(),
        new go.Binding("isUnderline", "scope", function (s) { //？？？？？？？？？？？？？
          return s[0] === 'c'
        }))
    );


  // ClassNode
  mySubDiagram.nodeTemplateMap.add(NodeType[6],
    $$(go.Node, "Auto", {
      locationSpot: go.Spot.Center,
    }, new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
      new go.Binding("desiredSize", "size", go.Size.parse).makeTwoWay(go.Size.stringify), {
      selectable: true,
      selectionAdornmentTemplate: nodeSelectionAdornmentTemplate
    }, {
      resizable: true,
      resizeObjectName: "PANEL",
      resizeAdornmentTemplate: nodeResizeAdornmentTemplate
    },
      $$(go.Shape, {
        fill: "lightyellow",
        portId: ""
      }),
      $$(go.Panel, "Table", {
        name: "PANEL",
        defaultRowSeparatorStroke: "black" //对于表格面板。获取或设置行的默认笔画（颜色）
      },
        // header
        $$(go.TextBlock, {
          row: 0,
          columnSpan: 20,
          margin: 3,
          alignment: go.Spot.Center,
          font: "bold 12pt  sans-serif",
          isMultiline: false, //是否可以换行
          editable: true
        },
          new go.Binding("text").makeTwoWay()),
        // properties


        $$(go.TextBlock, "Properties", {
          name: "pproperties",
          row: 1,
          font: "italic 10pt sans-serif", //properties的字体大小
        },
          new go.Binding("visible", "visible", function (v) {
            /* console.log(111111111) */
            return !v;
          }).ofObject("PROPERTIES")
        ),
        $$(go.Panel, "Vertical", { //具体的属性
          name: "PROPERTIES"
        },
          new go.Binding("itemArray", "properties").makeTwoWay(), {
          row: 1,
          margin: 3,
          stretch: go.GraphObject.Fill,
          defaultAlignment: go.Spot.Left,
          background: "lightyellow",
          itemTemplate: propertyTemplate,
          visible: false
        }
        ),

        $$("PanelExpanderButton", "PROPERTIES", {
          row: 1, //修饰按钮
          column: 1,
          alignment: go.Spot.TopRight,
          visible: false
        },
          new go.Binding("visible", "properties", function (arr) {
            return arr.length > 0;
          })
        ),
        // methods
        $$(go.TextBlock, "Methods", {
          row: 2,
          font: "italic 10pt sans-serif"
        },
          new go.Binding("visible", "visible", function (v) {
            return !v;
          }).ofObject("METHODS")),
        $$(go.Panel, "Vertical", {
          name: "METHODS"
        },
          new go.Binding("itemArray", "methods").makeTwoWay((e, v, m) => {
            /*   console.log(v) */
          }), {
          row: 2,
          margin: 3,
          stretch: go.GraphObject.Fill,
          defaultAlignment: go.Spot.Left,
          background: "lightyellow",
          itemTemplate: methodTemplate,
          visible: false
        }
        ),
        $$("PanelExpanderButton", "METHODS", {
          row: 2,
          column: 1,
          alignment: go.Spot.TopRight,
          visible: false
        },
          new go.Binding("visible", "methods", function (arr) {
            return arr.length > 0;
          })
        ),
      ),
      makePort("T", go.Spot.Top, true, true),
      makePort("L", go.Spot.Left, true, true),
      makePort("R", go.Spot.Right, true, true),
      makePort("B", go.Spot.Bottom, true, true), { // handle mouse enter/leave events to show/hide the ports
      mouseEnter: function (e, node) {
        showSmallPorts(node, true);
      },
      mouseLeave: function (e, node) {
        showSmallPorts(node, false);
      }
    }
    ));


  // 使边界模型的文字置底，同时边界无法参与连线
  // "System" 系统（暂未使用）
  mySubDiagram.nodeTemplateMap.add(NodeType[7],
    $$(go.Node, "Spot", nodeStyle(),
      $$(go.Panel, "Vertical",
        { name: "PANEL", fromLinkable: true, toLinkable: true, cursor: "pointer" },
        new go.Binding("desiredSize", "size", go.Size.parse).makeTwoWay(go.Size.stringify),
        new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
        $$(go.Shape, "Terminal",  // the rectangular shape around the members
          {
            name: "SHAPE",
            fill: "rgba(128,128,128,0.2)",
            stroke: "black",
            minSize: new go.Size(50, 50),
            fromLinkable: true,
            fromLinkableDuplicates: true,
            fromLinkableSelfNode: false,
            toLinkable: true,
            toLinkableDuplicates: true,
            toLinkableSelfNode: false,
          },
          new go.Binding("desiredSize", "size", go.Size.parse).makeTwoWay(go.Size.stringify),
          new go.Binding("fill", "isHighlighted", h => h ? "rgba(128,255,255,0.2)" : "rgba(128,128,128,0.2)").ofObject(),
          new go.Binding("fill").makeTwoWay(),
          new go.Binding("stroke", "isHighlighted", h => h ? "red" : "gray").ofObject()),
        $$(go.TextBlock,
          {
            textAlign: "center",
            font: "bold 12pt Times New Roman",
            margin: new go.Margin(3, 2, 1, 2),
            maxSize: new go.Size(80, NaN),
            isMultiline: true,
            wrap: go.TextBlock.WrapFit,
            editable: true
          },
          new go.Binding("text", "text").makeTwoWay(),
          new go.Binding("stroke", "stroke").makeTwoWay(),
          new go.Binding("editable", "editable").makeTwoWay()
        )
      ),
    )
  );


  // "Topic" 场景 （暂未使用）
  mySubDiagram.groupTemplateMap.add(NodeType[8],
    $$(go.Group, "Vertical",
      {
        ungroupable: true,
        resizable: true, resizeObjectName: "SHAPE",
        handlesDragDropForMembers: true
      },
      // always save/load the point that is the top-left corner of the node, not the location
      new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
      // new go.Binding("position", "pos", go.Point.parse).makeTwoWay(go.Point.stringify),
      { // what to do when a drag-over or a drag-drop occurs on a Group
        mouseDragEnter: (e, grp, prev) => {
          if (!highlightGroup(grp, true)) e.diagram.currentCursor = "not-allowed"; else e.diagram.currentCursor = "";
        },
        mouseDragLeave: (e, grp, next) => highlightGroup(grp, false),
        mouseDrop: finishDrop
      },
      $$(go.Shape, "Ellipse",  // the rectangular shape around the members
        {
          name: "SHAPE",
          fill: "rgba(128,128,128,0.2)",
          stroke: null,
          minSize: new go.Size(200, 150),
          fromLinkable: true,
          fromLinkableDuplicates: true,
          fromLinkableSelfNode: false,
          toLinkable: true,
          toLinkableDuplicates: true,
          toLinkableSelfNode: false,
        },
        new go.Binding("desiredSize", "size", go.Size.parse).makeTwoWay(go.Size.stringify),
        new go.Binding("fill", "isHighlighted", h => h ? "rgba(128,255,255,0.2)" : "rgba(128,128,128,0.2)").ofObject(),
        new go.Binding("fill").makeTwoWay(),
        new go.Binding("stroke", "isHighlighted", h => h ? "red" : "gray").ofObject()),
      $$(go.TextBlock,
        {
          stroke: "white",
          textAlign: "left",
          verticalAlignment: go.Spot.Top,
          font: "bold 12pt Helvetica, Arial, sans-serif",
          margin: new go.Margin(2, 0, 0, 2),
          maxSize: new go.Size(160, NaN),
          wrap: go.TextBlock.WrapFit,
          editable: true,
        },
        new go.Binding("text").makeTwoWay()),
    ));  // end Group and call to add to template Map





  mySubDiagram.linkTemplate =
    $$(go.Link,  // the whole link panel
      {
        fromShortLength: 2,
        toShortLength: 3,
        adjusting: go.Link.Stretch,
        reshapable: true,
        relinkableFrom: true,
        relinkableTo: true, //设置线条可调整长度
        doubleClick: function (e, pnl) {
          e.diagram.commandHandler.editTextBlock(pnl.findObject("TYPE"));
        }
      },
      new go.Binding("points").makeTwoWay(),
      $$(go.Shape, // the link path shape
        { 
          strokeWidth: 2, 
        },
        new go.Binding("stroke", "linkStroke").makeTwoWay(),
        new go.Binding("strokeWidth", "linkStrokeWidth").makeTwoWay()
      ),
      $$(go.Shape, // the arrowhead
        { toArrow: "Boomerang", stroke: null, scale: 1.6, },
        new go.Binding("toArrow", "toArrow").makeTwoWay(),
        new go.Binding("stroke", "linkStroke").makeTwoWay()
      ),
      $$(go.Panel, "Auto",
        // 标签背景，其边缘变得透明
        $$(go.Shape, { fill: null, stroke: null }),
        $$(go.TextBlock, "", textStyle(),// the label text
          {
            name: "TYPE",
            textAlign: "center",
            font: "9pt helvetica, arial, sans-serif",
            margin: 4,
            editable: true  // enable in-place editing
          },
          // editing the text automatically updates the model data
          new go.Binding("text", "text").makeTwoWay(),
          new go.Binding("stroke", "textStroke").makeTwoWay()
        )
      )
    );

  //依赖关系
  mySubDiagram.linkTemplateMap.add("Relation",
    $$(go.Link, // the whole link panel
      {
        fromShortLength: 2,
        toShortLength: 3,
        reshapable: true,
        relinkableFrom: true,
        relinkableTo: true, //设置线条可调整长度
        doubleClick: function (e, pnl) {
          e.diagram.commandHandler.editTextBlock(pnl.findObject("TYPE"));
        }
      },
      new go.Binding("points").makeTwoWay(),
      $$(go.Shape, // the link path shape
        { 
          strokeWidth: 2, 
          strokeDashArray: [3, 2],
        },
        new go.Binding("stroke", "linkStroke").makeTwoWay(),
        new go.Binding("strokeWidth", "linkStrokeWidth").makeTwoWay()
      ),
      $$(go.Shape, // the arrowhead
        { toArrow: "Boomerang", stroke: null, scale: 1.6,},
        new go.Binding("toArrow", "toArrow").makeTwoWay(),
        new go.Binding("stroke", "linkStroke").makeTwoWay()
      ),
      $$(go.Panel, "Auto",
        $$(go.Shape, // the label background, which becomes transparent around the edges
          {
            fill: $$(go.Brush, "Radial", { 0: "rgb(255, 255, 255)", 0.9: "rgb(255, 255, 255)", 1: "rgba(255, 255, 255, 0.0)" }),
            stroke: null
          }
        ),
        $$(go.TextBlock, textStyle(), // the label text
          {
            name: "TYPE",
            textAlign: "center",
            font: "9pt helvetica, arial, sans-serif",
            margin: 4,
            isMultiline: true, 
            editable: true,
          },
          // editing the text automatically updates the model data
          new go.Binding("text", "text").makeTwoWay(),
          new go.Binding("stroke", "textStroke").makeTwoWay()
        )
      )
    )
  );



  //################ 画图区域Part样式 Start ################ by:ljq//
  // The background Part showing the sheet of paper;
  // it includes the fixed bounds of the diagram contents
  const pageSize = new go.Size(2000, 2000); // landscape, or new go.Size(width, height) for portrait
  const usableMargin = new go.Margin(16); // padding inside sheet border
  const pageBounds = new go.Rect(-usableMargin.left, -usableMargin.top, pageSize.width, pageSize.height);

  mySubDiagram.add(
    $$(go.Part,
      {
        selectable: true, selectionAdornmentTemplate: nodeSelectionAdornmentTemplate,
        resizable: true, resizeObjectName: "PANEL", resizeAdornmentTemplate: nodeResizeAdornmentTemplate,
        copyable: false, movable: false,
        layerName: "DrawingBoard",
        position: pageBounds.position,
        desiredSize: pageSize,
        isShadowed: true,
        background: "white"
      },
      $$(go.Shape, "LineH", { stroke: "lightgray", strokeWidth: 0.5 }),
      $$(go.Shape, "LineV", { stroke: "lightgray", strokeWidth: 0.5 })
    ));
  //################ 画图区域Part End ################//

  // // 在myRequirementDiagram的背景中创建一个部分，以突出所选节点
  // highlighter =
  //   $$(go.Part, "Auto",
  //     {
  //       layerName: "HighlighterBackground",
  //       selectable: false,
  //       isInDocumentBounds: false,
  //       locationSpot: go.Spot.Center,
  //       visible: false
  //     },
  //     $$(go.Shape, "Ellipse",
  //       {
  //         fill: $$(go.Brush, "Radial", { 0.0: "red", 1.0: "white" }),
  //         stroke: null,
  //         desiredSize: new go.Size(400, 400)
  //       })
  //   );
  // mySubDiagram.add(highlighter);

  //给左侧节点新添li 并添加拖拽绑定
  function appendItemToPalette(cate, name) {
    if (!name||name==""||name == undefined || name == null || (name.length>0 && name.trim().length == 0) ){
      alert("Invalid name for [ " + cate + " ]");
      return;
    }
    let str =`<li type="${cate}" class="RequirementDiagramDraggableElement ui-draggable ui-draggable-handle" \
            style="position: relative; z-index: 2; left: 0px; top: 0px;"><a><img src="${STATIC_URL}public/images/RequirementIcon/${cate}.png"><span>${name}</span></a></li>`;
    console.log(12312)
    switch (cate) {
      case "RequirementNode":
        document.getElementById("RequirementNodeNav").innerHTML += str;
        break;
      case "Node":
        document.getElementById("NodeNav").innerHTML += str;
        break;
      case "Actor":
        document.getElementById("ActorNav").innerHTML += str;
        break;
      case "Constraint":
        document.getElementById("ConstraintNav").innerHTML += str;
        break;
      case "Relation":
        document.getElementById("RelationNav").innerHTML += str;
        break;
      case "DataEntity":
        document.getElementById("DataEntityNav").innerHTML += str;
        break;
      case "ClassNode":
        document.getElementById("ClassNodeNav").innerHTML += str;
        break;
      case "SystemBorder":
        document.getElementById("SystemBorderNav").innerHTML += str;
        break;
      default:
        break;
    }

    //给新添加的li标签添加拖拽绑定
    $('.RequirementDiagramNavContent li').draggable({
      stack: "#RequirementDiagramDiv",
      revert: true,
      revertDuration: 0
    });
  }


  function addNodeAndLinkData(model,category,paletteItemName,q,q2,softwareCurrentVersion) {
    model.startTransaction("drop");
    switch (category) {
      case "RequirementNode":
        model.addNodeData({
          loc: go.Point.stringify(q),
          category: category,
          // description: "Req: One",
          // id: "Req1_",
          text: paletteItemName,
        });
        break;
      case "Node":
        model.addNodeData({
          loc: go.Point.stringify(q),
          category: category,
          // description: "Req: One",
          // id: "Req1_",
          text: paletteItemName,
        });
        break;
      case "Actor":
        model.addNodeData({
          loc: go.Point.stringify(q),
          category: category,
          text: paletteItemName,
        });
        break;
      case "System":
        model.addNodeData({
          loc: go.Point.stringify(q),
          category: category,
          text: paletteItemName,
        });
        break;
      case "SystemBorder":
        //console.log(q);
        model.addNodeData({
          text: paletteItemName,
          loc: go.Point.stringify(q),
          category: category,
          initVersion: softwareCurrentVersion,
          isGroup: true,
          size: "100 100"
        }); break;
      case "Topic":
        model.addNodeData({
          loc: go.Point.stringify(q),
          category: category,
          text: paletteItemName,
        });
        break;
      case "DataEntity":
        model.addNodeData({
          loc: go.Point.stringify(q),
          category: category,
          text: paletteItemName,
        });
        break;
      case "ClassNode":
        model.addNodeData({
          loc: go.Point.stringify(q),
          category: category,
          text: paletteItemName,
        });
        break;
      case "Constraint":
        model.addNodeData({
          loc: go.Point.stringify(q),
          category: category,
          type: "<<constraint>>",
          text: paletteItemName,
        });
        break;
      case "Relation":
        model.addLinkData({
          category: category,
          points: new go.List(go.Point).addAll([q2, q]),
          text: paletteItemName,
        });
        break;
      //包含关系
      case "Containment":
        model.addLinkData({
          category: "Containment",
          points: new go.List(go.Point).addAll([q2, q]),
          text: paletteItemName
        });
        break;
      //6大基本关系
      case "DeriveReqt":
        model.addLinkData({
          category: "Dependency",
          points: new go.List(go.Point).addAll([q2, q]),
          text: paletteItemName
        });
        break;
      case "Refine":
        model.addLinkData({
          category: "Dependency",
          points: new go.List(go.Point).addAll([q2, q]),
          text: paletteItemName
        });
        break;
      case "Satisfy":
        model.addLinkData({
          category: "Dependency",
          points: new go.List(go.Point).addAll([q2, q]),
          text: paletteItemName
        });
        break;
      case "Verify":
        model.addLinkData({
          category: "Dependency",
          points: new go.List(go.Point).addAll([q2, q]),
          text: paletteItemName
        });
        break;
      case "Copy":
        model.addLinkData({
          category: "Dependency",
          points: new go.List(go.Point).addAll([q2, q]),
          text: paletteItemName
        });
        break;
      case "Trace":
        model.addLinkData({
          category: "Dependency",
          points: new go.List(go.Point).addAll([q2, q]),
          text: paletteItemName
        });
        break;

      default:
        break;
    }
    model.commitTransaction("drop");

  }

  //#弹窗#
  function promptBoxInput(){
    return new Promise((resolve, reject) => {
      //打开自定义弹窗
      document.getElementsByClassName("promptBox")[0].className="promptBox open";
      document.getElementsByClassName("bgBox")[0].className="bgBox open";
      $("#promptBoxInput").focus();

      //点击X，关闭弹窗
      let close=document.getElementsByClassName("promptBox_close")[0];
      close.addEventListener('click',function(){
        document.getElementsByClassName("promptBox")[0].className="promptBox";
        document.getElementsByClassName("bgBox")[0].className="bgBox";
        reject();
      });
      let submit=document.getElementsByClassName("submit")[0];
      //点击确定后，获取输入的值
      const submitFunction = () => {
        //debugger
        let paletteItemName=document.getElementById("promptBoxInput").value;
        document.getElementsByClassName("promptBox")[0].className="promptBox";
        document.getElementsByClassName("bgBox")[0].className="bgBox";
        resolve(paletteItemName);
        document.getElementById("promptBoxInput").value="";
        submit.removeEventListener('click', submitFunction);
      }
      submit.addEventListener('click',submitFunction);
    })

  }


  //#gojs模型元素和连线绑定html标签#//
  $('.RequirementDiagramNavContent li').draggable({
    stack: "#RequirementDiagramDiv",
    revert: true,
    revertDuration: 0
  });

  //#html标签拖到gojs画板#//
  $('#RequirementDiagramDiv').droppable({
    activeClass: "ui-Requirement-highlight", //拖动时高亮显示
    // tolerance: 'touch', //拖动就会显示到界面，取消后需要拖到画板上才显示
    accept: '.RequirementDiagramDraggableElement', //允许拖入的元素类型

    drop: function (_event, ui) {
    //drop: async function (_event, ui) {
      let elt = ui.draggable.first();
      let x = ui.offset.left - $(this).offset().left;
      let y = ui.offset.top - $(this).offset().top;
      let p = new go.Point(x, y);
      let p2 = new go.Point(x + 90, y + 45);
      let q = mySubDiagram.transformViewToDoc(p);
      let q2 = mySubDiagram.transformViewToDoc(p2);
      let model = mySubDiagram.model;
      let softwareCurrentVersion = $('#softwareCurrentVersion', parent.document).text().split(':')[1];
      //获取到选取li的class值
      // console.log(elt[0].attributes["class"].value);
      // Get text value from draggable HTML element which can be dynamically incremented.
      // 获取到新增节点的类型
      let category = elt[0].attributes["type"].value;
      let paletteItemName;
      //判断是新增工具类 还是节点类
      if (elt[0].attributes["class"].value.indexOf("newTool") == -1) {
        //获取点击li中的文本
        paletteItemName = ui.draggable.find("a span").text();
        addNodeAndLinkData(model, category, paletteItemName,q,q2,softwareCurrentVersion);
      } else {
        promptBoxInput().then((paletteItemName) => {
          //paletteItemName = prompt("Input " + category + " new name: ", "");
          appendItemToPalette(category, paletteItemName);
          addNodeAndLinkData(model, category, paletteItemName,q,q2,softwareCurrentVersion);
        });
      }
    }
  });

  //######右键点击事件监听--Start--######//
  //右键操作菜单

  mySubDiagram.contextMenu = myContextMenu;
  // We don't want the div acting as a context menu to have a (browser) context menu!
  cxElement.addEventListener("contextmenu", function(e) {
    e.preventDefault();
    return false;
  }, false);


  function hideCX() {
    if (mySubDiagram.currentTool instanceof go.ContextMenuTool) {
      mySubDiagram.currentTool.doCancel();
    }
  }

  function showContextMenu(obj, diagram, tool) {

    // 在当前状态下，只显示相关的按钮 Show only the relevant buttons given the current state.
    let cmd = diagram.commandHandler;
    let hasMenuItem = false;
    function maybeShowItem(elt, pred) {
      if (pred) {
        elt.style.display = "block";
        hasMenuItem = true;
      } else {
        elt.style.display = "none";
      }
    }

    let isLocked = false;
    if (obj !== null) {
      if (obj.data.lockedStatus === true) {
        isLocked = true;
      }
    }

    maybeShowItem(document.getElementById("dependencyFrom"), cmd.canCopySelection() && isLocked === false);
    maybeShowItem(document.getElementById("dependencyTo"), cmd.canCopySelection() && isLocked === false);
    maybeShowItem(document.getElementById("showTheSameTypeNode"), cmd.canCopySelection() && isLocked === false);
    maybeShowItem(document.getElementById("showAll"), cmd.canCopySelection() && isLocked === false);
    // 现在显示整个上下文菜单元素 Now show the whole context menu element
    if (hasMenuItem) {
      cxElement.classList.add("show-menu");
      // 我们不需要重写positionContextMenu，我们只是在这里做
      let mousePt = diagram.lastInput.viewPoint;
      cxElement.style.left = mousePt.x + 170 + "px";
      cxElement.style.top = mousePt.y + 70 + "px";
    }

    // Optional: Use a `window` click listener with event capture to
    //           remove the context menu if the user clicks elsewhere on the page
    window.addEventListener("click", hideCX, true);
  }

  function hideContextMenu() {
    cxElement.classList.remove("show-menu");
    // Optional: Use a `window` click listener with event capture to
    // remove the context menu if the user clicks elsewhere on the page
    window.removeEventListener("click", hideCX, true);
  }

  //dependencyFrom Strat
  mySubDiagram.commandHandler.dependencyFrom=function() {
    dependencyFrom();
  }
  //dependencyFrom End

  //dependencyTo Start
  mySubDiagram.commandHandler.dependencyTo=function() {
    dependencyTo();
  }
  //dependencyTo End

  //showAll Start
  mySubDiagram.commandHandler.showAll=function() {
    showAll();
  }
  //showAll End

  //showTheSameTypeNode Start
  mySubDiagram.commandHandler.showTheSameTypeNode=function() {
    showTheSameTypeNode();
  }
  //showTheSameTypeNode End


  navExhibit();

  mySubDiagram.model.linkKeyProperty = "id";
      //######右键点击事件监听--End--######//

//######右侧选择框--Start--######//

// 注册模型事件监听器 (在模型发生变化时更新右侧菜单)
/*mySubDiagram.addModelChangedListener(function(evt) {
    if (evt.isTransactionFinished) {// 只在事务完成后更新右侧菜单
        showRightMenu();
    }
});*/

    showRightMenu();

// 监测 GoJS 模型中元素的可见性更改事件
mySubDiagram.addChangedListener(function(e) {
  if (e.propertyName === "visible") {
    // 获取发生更改的元素
    let element = e.object;
    // 获取元素对应的右侧菜单选择框
    let checkbox = document.querySelector(`input[value="${element.key}"]`);
    if (checkbox) {
      // 更新选择框状态
      checkbox.checked = element.visible;
    }
  }
});

// ######右侧选择框--End--######//

} // end init