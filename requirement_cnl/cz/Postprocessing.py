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

    # ****************************检测nodeDataArray丢失**************************************
    # 遍历 linkDataArray 中的每个元素
    for linkElement in linkDataArray_pre:
        # 获取 linkElement 的第一个元素
        fromNode = linkElement[0][0]
        found = False
        # 检查 fromNode 是否出现在 nodeDataArray 中的第一个位置
        for nodeElement in nodeDataArray:
            # 获取 nodeElement 的第一个元素
            node = nodeElement[0][0]
            if node == fromNode:
                found = True
                break
        # 如果没找到，则将 linkElement 添加到 nodeDataArray
        if not found:
            # 套一层列表，仿照格式
            nodeDataArray.append([linkElement[0]])

    # *************************************合并linkData array************************************
    # 创建一个新列表来存储合并后的合并linkData array子列表
    linkDataArray_new = []
    linkDataArray = []
    # 第一次遍历先存储非重复列表
    for sublist in linkDataArray_pre:
        if sublist not in linkDataArray_new:
            linkDataArray_new.append(sublist)
    # 第二次遍历删除重复列表
    for sublist in linkDataArray_new:
        unique = True  # 默认只出现一次为true
        for existing_sublist in linkDataArray:
            if sublist[0] == existing_sublist[2]:
                unique = False  # The sublist is not unique
                break

        if unique:
            linkDataArray.append(sublist)
    # 返回合并好后的linkDataArray和nodeDataArray
    mergeProcess = []
    mergeProcess.append(nodeDataArray)
    mergeProcess.append(linkDataArray)
    return mergeProcess
