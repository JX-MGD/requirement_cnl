import json
import my_functions
import split
from fastHan import FastHan
# 示例用法
text = "可出租的空间是酒店卧室或会议室;可出租空间总是有一个特定的租金成本和面积;酒店的卧室有一个独特的房间号和一些床;酒店的卧室可能有一台电视机;每台电视机由序列号和显示尺寸组成;每家酒店至少有一名接待员;接待员处理顾客的预订;每次预订都有一个客户和一个选定的可租用空间;客户由姓名、姓氏和地址标识;预订有开始日期和结束日期;预订也有一个唯一标识符;每个会议室都有名称和最大容量;会议室可以有投影屏幕"
sentences = split.split_sentences(text)
for sentence in sentences:
    model = FastHan()
    answer = model(sentence,target="Parsing")
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
        if '有' in dependency:
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
            break
    # 匹配相对应的pattern
    if have_position:
        my_functions.have(root_position,dependency_list,have_position,root_pos,root_mean)

    elif dependency_list[0][root_position - 1][0] == '是':
        my_functions.Is(root_position, dependency_list)
    # 组成是vv，prep()优先级要高于general()
    elif dependency_list[0][root_position - 1][0] == '组成' or dependency_list[0][root_position - 1][0] == '标识':
        my_functions.prep(prep_position,root_position,dependency_list)

    elif related_elements == 'vv':
        my_functions.general(related_elements,root_position,dependency_list,root_mean)





