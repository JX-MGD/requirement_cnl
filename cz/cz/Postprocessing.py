def checkrelation(nodeDataArray_temporary, linkDataArray_temporary):
    # *****************************检测类属性关系是否为类类关系**************************************
    # 创建一个列表，用于存储不需要移动的子列表
    nodeDataArray_pre = []

    for sublist in nodeDataArray_temporary:
        # 获取子列表中的非第一个元素的值
        non_first_elements = sublist[1]

        # 检查该值是否出现在其他子列表的第一个元素中
        found = False
        # 需要传入linklist的元素
        found_list = []
        # 删除传入linklist的元素后的列表
        update_list = sublist
        for other_sublist in nodeDataArray_temporary + linkDataArray_temporary:
            for element in non_first_elements:
                if element in other_sublist[0]:
                    found = True
                    found_list.append(element)
                    update_list[1].remove(element)

        # 根据检测结果将子列表放入相应的列表
        if found:
            # 处理linklist
            linklist = []
            linklist.append(sublist[0])
            linklist.append('')
            linklist.append(found_list)
            linklist.append('Aggregate')
            linkDataArray_temporary.append(linklist)
            # 处理nodelist
            nodeDataArray_pre.append(update_list)

        else:
            nodeDataArray_pre.append(sublist)
    # 返回检测好后的linkDataArray和nodeDataArray
    checkProcess = []
    print("******************WW")

    checkProcess.append(nodeDataArray_pre)
    checkProcess.append(linkDataArray_temporary)
    print(nodeDataArray_pre)
    print(linkDataArray_temporary)
    return checkProcess


def mergelist(nodeDataArray_pre, linkDataArray_pre):
    # ****************************检测nodeDataArray丢失**************************************
    # 遍历 linkDataArray 中的每个元素
    for linkElement in linkDataArray_pre:
        # 获取 linkElement 的第一个元素
        fromNode = linkElement[0][0]
        found = False
        # 检查 fromNode 是否出现在 nodeDataArray 中的第一个位置
        for nodeElement in nodeDataArray_pre:
            # 获取 nodeElement 的第一个元素
            node = nodeElement[0][0]
            if node == fromNode:
                found = True
                break
        # 如果没找到，则将 linkElement 添加到 nodeDataArray
        if not found:
            # 套一层列表，仿照格式
            nodeDataArray_pre.append([linkElement[0],[]])
    # 额外操作:检测是否有表示类的类型的属性

    for linkData in linkDataArray_pre:
        # 1.[['床'],['大床', '单人床', '双人床']]先判断床是否都出现在了后面的列表当中，没有在走下面
        if linkData[3] == 'Generalize':
            targetchar = linkData[0][0]
            if any(targetchar in word for word in linkData[2]):
                nodelist = [linkData[0], [targetchar + '类型']]
                nodeDataArray_pre.append(nodelist)
            # 2.前后不能对应的处理手段:
            else:
                # 创建一个集合来存储所有出现过的字
                unique_chars = set()
                # 创建一个列表来存储出现相同字的类型
                duplicate_types = []
                # 遍历每个类型
                for type_str in linkData[2]:
                    # 遍历类型中的每个字
                    for char in type_str:
                        # 如果字已经在集合中出现过，说明这个字是重复的
                        if char in unique_chars:
                            duplicate_types.append(char)
                            break
                        else:
                            unique_chars.add(char)
                targetchar = duplicate_types[0]
                nodelist = [linkData[0], [targetchar + '类型']]
                nodeDataArray_pre.append(nodelist)
    # *****************************合并nodeData array**************************************
    # 创建一个字典，用于存储合并后的子列表
    mergeDataArray = {}
    for sublist in nodeDataArray_pre:
        # 获取子列表中的第一个元素作为键
        key = sublist[0][0]
        # 如果字典中已经有了该键，将子列表的第二个元素合并到现有键的值中
        if key in mergeDataArray:
            mergeDataArray[key].extend(sublist[1])
        else:
            # 如果字典中没有该键，创建一个新的键值对
            mergeDataArray[key] = sublist[1]
    # 将合并后的数据转换为列表形式
    nodeDataArray = [[[key], value] for key, value in mergeDataArray.items()]



    # *************************************合并linkData array************************************
    # 创建一个新列表来存储合并后的合并linkData array子列表
    linkDataArray_new = []
    linkDataArray = []
    # 第一次遍历先存储非重复列表
    for sublist in linkDataArray_pre:
        if sublist not in linkDataArray_new:
            linkDataArray_new.append(sublist)
    # 第二次遍历删除重复列表(第一元素和第三元素)
    for list1 in linkDataArray_new:
        if list1 not in linkDataArray:
            merged_list = list1
            element1_list1 = list1[0][0]
            element3_list1 = list1[2]

            for list2 in linkDataArray_new:
                element1_list2 = list2[0][0]
                element3_list2 = list2[2]
                # 检查条件是否满足(利用集合交集检测)
                if element1_list1 == element1_list2 and (set(element3_list1) & set(element3_list2)):
                    # 合并两个列表(列表包含则选列表长度最长的)
                    if len(element3_list1) >= len(element3_list2):
                        merged_list = list1
                    else:
                        merged_list = list2
                elif element1_list1 in element3_list2 and element3_list1 in element3_list1:
                    # 合并两个列表(列表包含则选列表长度最长的)
                    if len(element3_list1) >= len(element3_list2):
                        merged_list = list1
                    else:
                        merged_list = list2
            linkDataArray.append(merged_list)

    # 返回合并好后的linkDataArray和nodeDataArray
    mergeProcess = []
    mergeProcess.append(nodeDataArray)
    mergeProcess.append(linkDataArray)
    return mergeProcess
