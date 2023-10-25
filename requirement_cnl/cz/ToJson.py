def to(input_data1, input_data2):
    # 创建一个空列表，用于存储转换后的模板数据

    nodeDataArray = []

    # 遍历输入数据
    for sublist in input_data1:
        # 提取第一个元素作为 key 和 name
        key_and_name = sublist[0][0]

        # 只在有剩余元素时才提取 properties 的 name
        if len(sublist) > 1:
            properties = [{'name': element.replace('unique:', ''), 'type': 'unique'} if 'unique:' in element else {
                'name': element} for element in sublist[1]]

        else:
            properties = None

        # 构建模板数据并添加到输出列表
        template_data = {
            "key": key_and_name,
            "category": "ClassDiagram",
            "name": "class",
            "properties": properties,
            "text": key_and_name
        }
        nodeDataArray.append(template_data)

    # 输出转换后的模板数据
    for item in nodeDataArray:
        print(item)

    # 创建一个空列表，用于存储转换后的数据
    linkDataArray = []

    # 遍历输入数据
    for sublist in input_data2:
        # 如果子列表长度为 3，则按照指定格式构建数据
        if len(sublist) == 4:
            for from_item in sublist[2]:
                linkDataArray.append({
                    "category": sublist[3],
                    "fromtext": "",
                    "toText": "",
                    "nodeText": sublist[1],
                    "from": from_item,
                    "to": sublist[0][0],

                })
        elif len(sublist) == 5:
            for from_item in sublist[2]:
                fromtext = None
                totext = None

                if len(sublist[4]) == 4 :
                    fromtext = "1"
                    totext = "1"
                linkDataArray.append({
                    "category": "Association_NoArrow",
                    "fromText": fromtext,
                    "toText": totext,
                    "nodeText": sublist[1],
                    "from": from_item,
                    "to": sublist[0][0],

                })

        elif len(sublist) == 6:

            for from_item in sublist[2]:
                fromtext = None
                totext = None
                # 若找到4个量词,且有'多'关系:
                # 多关系有一个对象
                if len(sublist[5])==1:
                    if len(sublist[4]) == 4 and sublist[5][0] == from_item:
                        fromtext = "*"
                        totext = "1"
                    elif len(sublist[4]) == 4 and sublist[5][0] == sublist[0][0]:
                        fromtext = "1"
                        totext = "*"
                # 多关系有两个对象
                elif len(sublist[5])==2:
                    if len(sublist[4]) == 4:
                        fromtext = "*"
                        totext = "*"
                linkDataArray.append({
                    "category": "Association_NoArrow",
                    "fromText": fromtext,
                    "toText": totext,
                    "nodeText": sublist[1],
                    "from": from_item,
                    "to": sublist[0][0],

                })

    # 输出转换后的数据
    print("************************************")
    for item in linkDataArray:
        print(item)

    import json

    # 构建最终的 JSON 数据
    data = {
        "class": "go.GraphLinksModel",
        "modelData": {"DrawingBoard": {"width": 9999, "height": 9999}},
        "nodeDataArray": nodeDataArray,
        "linkDataArray": linkDataArray
    }

    # 转换为 JSON 字符串
    json_string = json.dumps(data, ensure_ascii=False, indent=2)

    return json_string

# input_data1 = [
#     {'key': '空间', 'name': '空间', 'properties': [{'name': '面积'}, {'name': '租金成本'}]},
#     {'key': '卧室', 'name': '卧室', 'properties': [{'name': '床'}, {'name': '房间号'}]},
#     {'key': '电视机', 'name': '电视机', 'properties': [{'name': '显示尺寸'}, {'name': '序列号'}]},
#     {'key': '酒店', 'name': '酒店', 'properties': [{'name': '接待员'}]},
#     {'key': '客户', 'name': '客户', 'properties': [{'name': '地址'}, {'name': '姓名'}, {'name': '姓氏'}]},
#     {'key': '预订', 'name': '预订', 'properties': [{'name': '结束日期'}, {'name': '开始日期'}, {'name': '标识符'}]},
#     {'key': '会议室', 'name': '会议室', 'properties': [{'name': '容量'}, {'name': '名称'}, {'name': '投影屏幕'}]}
# ]
# input_data2 = [
#     {'from': '会议室', 'to': '空间', 'text': None, 'relationship': ''},
#     {'from': '酒店卧室', 'to': '空间', 'text': None, 'relationship': ''},
#     {'from': '接待员', 'to': '预订', 'text': '处理', 'relationship': ''}
# ]
# to(input_data1, input_data2)