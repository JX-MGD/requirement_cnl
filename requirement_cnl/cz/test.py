import ToJson
import json
import my_functions
import split
import Quantifierprocessing
from fastHan import FastHan

# 示例用法
# text = "酒店有一个空间;可出租的空间是卧室或会议室;可出租空间总是有一个特定的租金成本和面积;酒店的卧室有一个独特的房间号和一些床;酒店的卧室可能有一台电视机;每台电视机由序列号和显示尺寸组成;每家酒店至少有一名接待员;接待员处理顾客的预订;每次预订都有一个客户和一个选定的可租用空间;客户由姓名、姓氏和地址标识;预订有开始日期和结束日期;预订也有一个唯一标识符;每个会议室都有名称和最大容量;会议室可以有投影屏幕"
# text="接待员处理顾客的预订;预订有开始日期和结束日期;可出租的空间是卧室或会议室;可出租空间总是有一个特定的租金成本和面积;每台电视机由序列号和显示尺寸组成;酒店的卧室可能有一台电视机;每家酒店至少有一名接待员;每次预订都有一个客户和一个选定的可租用空间;客户由姓名、姓氏和地址标识;预订也有一个唯一标识符;每个会议室都有名称和最大容量;会议室可以有投影屏幕;酒店的卧室有一个独特的房间号和一些床;酒店提供一个空间"
# text = "学院有学院编号、名称、联系电话;院长有院长编号、姓名、职称、学院;多个学院只有一个院长;一个院长只属于一个学院。 "
text = "院长有院长编号、姓名、职称;学院有学院编号、名称、联系电话;每个学院只有一个院长;一个院长只属于一个学院;班级有班级编号和班级名称;学生有学生编号、姓名、联系方式;一个班级可以有多个学生。每个学生只属于一个班级;课程有课程编号、课程名称以及教师姓名;一个学生可以有多门课程;一门课程可以有多个学生"
sentences = split.split_sentences(text)
# 结果用两个列表封装
nodeDataArray_temporary = []
linkDataArray = []
for sentence in sentences:
    model = FastHan()
    answer = model(sentence, target="Parsing")
    pos = model(sentence, target="POS")
    print(answer)
    # 给定依存关系列表
    dependency_list = answer
    pos_list = pos

    # 查找包含 "root" 标签的子列表中的位置
    root_position = None
    prep_position = None
    have_position = None
    root_mean = None
    root_pos = None

    for dependency in dependency_list[0]:
        if 'root' in dependency:
            root_position = dependency_list[0].index(dependency) + 1
            root_mean = dependency[0]
        if '有' in dependency or '属于' in dependency:
            have_position = True
        elif 'prep' in dependency:
            prep_position = dependency_list[0].index(dependency) + 1

    # 打印 "root" 在子列表中的位置
    print("子列表中root的位置：", root_position)
    # 打印 "root" 在子列表中的含义
    print("子列表中root的意思：", root_mean)

    related_elements = None
    for dependency in pos_list[0]:
        if dependency[0] == root_mean:
            related_elements = dependency[1]
            root_pos = dependency[1]
        continue
    # 匹配相对应的pattern
    if have_position:
        nodeDataArray_temporary.append(
            my_functions.have(root_position, dependency_list, have_position, root_pos, root_mean))

        continue
    elif dependency_list[0][root_position - 1][0] == '是':
        linkDataArray.append(
            my_functions.Is(root_position, dependency_list))

        # 组成是vv，prep()优先级要高于general()
        continue
    elif dependency_list[0][root_position - 1][0] == '组成' or dependency_list[0][root_position - 1][0] == '标识':
        nodeDataArray_temporary.append(
            my_functions.prep(prep_position, root_position, dependency_list))

        continue
    elif related_elements == 'vv':
        linkDataArray.append(
            my_functions.general(related_elements, root_position, dependency_list, root_mean))
print(nodeDataArray_temporary)
print(linkDataArray)

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
    for other_sublist in nodeDataArray_temporary + linkDataArray:
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
        linkDataArray.append(linklist)
        # 处理nodelist
        nodeDataArray_pre.append(update_list)

    else:
        nodeDataArray_pre.append(sublist)

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

# 检测nodeDataArray丢失
# 遍历 linkDataArray 中的每个元素
for linkElement in linkDataArray:
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
# *******************合并linkdataarray***************
# 创建一个新列表来存储合并后的子列表
unique_list_pre = []
unique_list = []

for sublist in linkDataArray:
    if sublist not in unique_list_pre:
        unique_list_pre.append(sublist)

for sublist in unique_list_pre:
    unique = True  # Assume the sublist is unique by default
    for existing_sublist in unique_list:
        if sublist[0] == existing_sublist[2]:
            unique = False  # The sublist is not unique
            break

    if unique:
        unique_list.append(sublist)

print(unique_list)

linkDataArray = Quantifierprocessing.Quantifierprocessing(text, unique_list)
# 输出结果
print("*****************处理后的nodeDataArray************************")
for sublist in nodeDataArray:
    print(sublist)
print("*****************处理后的linkDataArray************************")
for sublist in linkDataArray:
    print(sublist)
# print(nodeDataArray)
print(ToJson.to(nodeDataArray, linkDataArray))

# 打开文件，没有文件则自动新建，将字典写入文件中
with open("my_dict.json", "w") as fp:
    fp.write(ToJson.to(nodeDataArray, linkDataArray))
    # 关闭文件
    fp.close()
