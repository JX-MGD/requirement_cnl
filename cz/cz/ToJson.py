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
            "name": key_and_name,
            "properties": properties,
            "text": key_and_name
        }
        nodeDataArray.append(template_data)

    # 输出转换后的模板数据
    for item in nodeDataArray:
        print(item)

    # 创建一个空列表，用于存储转换后的数据(linkData)
    linkDataArray = []

    # 遍历输入数据
    for sublist in input_data2:
        # 如果子列表长度为 4，则按照指定格式构建数据
        if len(sublist) == 4 or len(sublist[4]) <= 1:
            for from_item in sublist[2]:
                linkDataArray.append({
                    "category": sublist[3],
                    "fromtext": "",
                    "toText": "",
                    "nodeText": sublist[1],
                    "from": from_item,
                    "to": sublist[0][0],

                })
        elif len(sublist) == 5 and len(sublist[4]) > 1:
            for from_item in sublist[2]:
                fromtext = None
                totext = None

                if len(sublist[4]) == 4:
                    fromtext = "1"
                    totext = "1"
                elif len(sublist[4]) == 2:
                    fromtext = "1"

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
                if len(sublist[5]) == 1:
                    if len(sublist[4]) == 4 and sublist[5][0] == from_item:
                        fromtext = "*"
                        totext = "1"
                    elif len(sublist[4]) == 4 and sublist[5][0] == sublist[0][0]:
                        fromtext = "1"
                        totext = "*"
                # 多关系有两个对象
                elif len(sublist[5]) == 2:
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

    # ***************结果检测***************
    for item in nodeDataArray:

        # 检测空类
        if 'properties' in item and not item['properties']:
            print(f"警告:{item['key']}类没有属性值！")
        # 检查唯一键
        has_unique = any('unique' in prop.get('type', '') for prop in item['properties'])
        if not has_unique:
            print(f"警告:{item['key']}类缺少唯一键！")

        # 检测几对几的关系
    for item in linkDataArray:

        if 'fromText' in item and 'toText' in item:
            if (item['fromText'] and item['toText'] is None) or not (item['toText'] and item['fromText'] is None):
                print(f"警告:{item['from']}类与{item['to']}类之间的关系不完整！")
    # 检测独立类
    for item in nodeDataArray:
        Classname = item['key']
        found = False
        for item in linkDataArray:

            if Classname == item['from'] or Classname == item['to']:
                found = True
        if not found:
            print("警告:"+Classname+"类与其他类之间没有关联！")

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
