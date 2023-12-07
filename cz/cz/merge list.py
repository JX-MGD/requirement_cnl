nodeDataArray_temporary = [
    [['空间'], ['面积', '租金成本']],
    [['卧室'], ['床', '房间号']],
    [['卧室'], ['电视机']],
    [['电视机'], ['显示尺寸', '序列号']],
    [['酒店'], ['接待员']],
    [['预订'], ['空间', '客户']],
    [['客户'], ['地址', '姓名', '姓氏']],
    [['预订'], ['结束日期', '开始日期']],
    [['预订'], ['标识符']],
    [['会议室'], ['容量', '名称']],
    [['会议室'], ['投影屏幕']]
]

# 创建一个列表，用于存储不需要移动的子列表
nodeDataArray_pre = []

# 创建一个列表，用于存储需要移动的子列表
linkDataArray = []

for sublist in nodeDataArray_temporary:
    # 获取子列表中的非第一个元素的值
    non_first_elements = sublist[1]

    # 检查该值是否出现在其他子列表的第一个元素中
    found = False
    for other_sublist in nodeDataArray_temporary:
        if sublist != other_sublist and any(element in other_sublist[0] for element in non_first_elements):
            found = True
            break

    # 根据检测结果将子列表放入相应的列表
    if found:
        linkDataArray.append(sublist)
    else:
        nodeDataArray_pre.append(sublist)



# 创建一个字典，用于存储合并后的子列表
merged_data = {}

for sublist in nodeDataArray_pre:
    # 获取子列表中的第一个元素作为键
    key = sublist[0][0]

    # 如果字典中已经有了该键，将子列表的第二个元素合并到现有键的值中
    if key in merged_data:
        merged_data[key].extend(sublist[1])
    else:
        # 如果字典中没有该键，创建一个新的键值对
        merged_data[key] = sublist[1]

# 将合并后的数据转换为列表形式
nodeDataArray = [[ [key], value] for key, value in merged_data.items()]

