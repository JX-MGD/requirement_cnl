//服务端文件管理器

//###上方工具条功能函数 Start ###//
//##打开文件 Start ##//
//前端读取本地文件的内容   下面代码中的this.result即为获取到的内容
function importJsonFile() {
    $("#importFile").click();
    console.log("引入文件");
}
function uploadJson(input) {  //支持chrome IE10
    if (window.FileReader) {
        let file = input.files[0];
        let reader = new FileReader();
        reader.onload = function() {
            $("#myRequirementDiagramSavedModel").text(this.result);
            RequirementDiagramLoad();
        }
        reader.readAsText(file);
    }
    //支持IE 7 8 9 10
    else if (typeof window.ActiveXObject != 'undefined'){
        let xmlDoc;
        xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
        xmlDoc.async = false;
        xmlDoc.load(input.value);
        $("#myRequirementDiagramSavedModel").text(xmlDoc.xml);
        RequirementDiagramLoad();
    }
    //支持FF
    else if (document.implementation && document.implementation.createDocument) {
        let xmlDoc;
        xmlDoc = document.implementation.createDocument("", "", null);
        xmlDoc.async = false;
        xmlDoc.load(input.value);
        $("#myRequirementDiagramSavedModel").text(xmlDoc.xml);
        RequirementDiagramLoad();
    } else {
        alert('error');
    }
}
//##打开文件 End ##//

function exportJsonFile(){
    let content = mySubDiagram.model.toJson();
    let blob = new Blob([content], {type: "text/json; charset=utf-8"});
    saveAs(blob, "mySubDiagram.json");
}

//读文件
function readServerFile(e) {
    let fileName = e.innerText;
    $.ajax({
        type: "POST",
        url: `http://${hostName}:3000/readServerFile`,
        crossDomain: true,
        dataType: "json", //返回的数据
        contentType: "application/json",
        data: JSON.stringify({
            "fileName": fileName
        }),
        success: function(data) {
            $("#myRequirementDiagramSavedModel").html(data);
            load();
        },
        error: function(err) {
            alert("File opening failed Please try again!");
        }
    });
}

function readServerFileManager(relativePath) {
    $.ajax({
        type: "POST",
        url: `http://${hostName}:3000/readServerDirectory`,
        crossDomain: true,
        dataType: "json",
        contentType: "application/json",
        data: "",
        success: function(files) {
            let content;

            for (let num in files) {
                content += `
          <tr>
            <td data-value="apple/"><a class="icon dir" onclick='readServerFile(this)'">${files[num]}</a></td>
          </tr>
        `;
            }
            $("#readServerFileTbody").html('');
            $("#readServerFileTbody").html(content);

            $("#readServerFileDraggable").css("display", "block");
            setTimeout(function(){
                $("#readServerFileDraggable").addClass("infoDraggable-click-transiton");
            }, 300);
            $("#readServerFileDraggable").draggable({ handle: "#readServerFileDraggableHandle" });
        },
        error: function(err) {
            alert("Failed to read!");
        }
    });
}

//写文件
function writeServerFileManager() {

}