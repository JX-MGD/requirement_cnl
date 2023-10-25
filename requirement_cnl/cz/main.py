import json

from fastHan import FastHan

model = FastHan()
# sentence = "商务酒店和工作人员有睡眠沙发和工作床和商务电视机。"
sentence = "可出租空间总是有一个特定的租金成本和面积。"
# Parsing依存分析
answer = model(sentence, target="Parsing")
print(answer)
pos = model(sentence, target="POS")
print(pos)

# 给定依存关系列表
dependency_list = answer
pos_list = pos
root_pos = None
root_mean = None
have_position = None
# 查找包含 "root" 标签的子列表中的位置
root_position = None
for dependency in dependency_list[0]:
    if 'root' in dependency:
        root_position = dependency_list[0].index(dependency) + 1
        root_mean = dependency[0]
    if '有' in dependency:
        have_position = True

for dependency in pos_list[0]:
    if dependency[0] == root_mean:
        root_pos = dependency[1]
        break
# 打印 "root" 在子列表中的位置
print("子列表中root的位置：", root_position)
print(have_position)


def have(root_position, dependency_list, have_position, root_pos, root_mean):
    # 初始化分类列表
    Class_list = []
    Attribute_list = []
    node_list = []
    # 判断根节点是否为 "有"
    if have_position:
        # 遍历依存关系列表，判断子列表中的数字与 root_position_in_sublist 是否相等
        for sublist in dependency_list:
            for dependency in sublist:
                # 判断子列表中的数字与 root_position_in_sublist 是否相等
                if dependency[1] == root_position:
                    # 判断是否为 "top" 或 "dobj"
                    if dependency[2] == 'top' or dependency[2] == 'nsubj' or dependency[2] == 'dep' or dependency[
                        2] == 'root':
                        if root_pos == 've':  # 若top前面有nn，则合并单词
                            composition = dependency[0]
                            for sublist in dependency_list:
                                for dep in sublist:
                                    if dep[2] == 'nn' and sublist.index(dep) + 1 == sublist.index(dependency):
                                        composition = dep[0] + dependency[0]
                                Class_list.append(composition)

                        elif root_pos == 'vv':
                            Class_list.append(root_mean)

                        # 若dobj前面有nn，则合并单词
                    elif dependency[2] == 'dobj':
                        composition = dependency[0]
                        for sublist in dependency_list:
                            for dep in sublist:
                                if dep[2] == 'nn' and sublist.index(dep) + 1 == sublist.index(dependency):
                                    composition = dep[0] + dependency[0]

                        Attribute_list.append(composition)

        # 遍历依存关系列表，查找依存关系是 "conj" 的词汇
        for sublist in dependency_list:
            for dependency in sublist:
                if dependency[2] == 'conj':
                    # 获取当前依存关系词汇在子列表中的位置（索引）
                    dep_index = dependency[1]

                    # 遍历子列表中的所有依存关系词汇，检查它们的位置是否与当前位置相同
                    for dep in sublist:
                        # 判断是否为 "top" 或 "dobj" 并且位置与当前位置相同
                        if dep[2] in ['top', 'nsubj', 'dep', 'dobj'] and dep_index == sublist.index(dep) + 1:
                            # 根据依存关系是 "top" 还是 "dobj" 分别加入到相应的列表中
                            if dep[2] == 'top' or dep[2] == 'nsubj':
                                composition = dependency[0]
                                for sub in dependency_list:
                                    for dep in sublist:
                                        index = sublist.index(dep)
                                        if dep[2] == 'nn' and sublist.index(dep) + 1 == sublist.index(dependency):
                                            composition = dep[0] + dependency[0]
                                            # 寻找唯一键
                                            if sublist[index-1][0]=='特定' or sublist[index-2][0]=='特定' or sublist[index-1][0]=='独特' or sublist[index-2][0]=='独特' or sublist[index-1][0]=='唯一' or sublist[index-2][0]=='唯一':
                                               composition = "unique"+composition

                                Class_list.append(composition)


                            elif dep[2] == 'dobj':
                                composition = dependency[0]
                                for sub in dependency_list:
                                    for dep in sublist:
                                        if dep[2] == 'nn' and sublist.index(dep) + 1 == sublist.index(dependency):
                                            composition = dep[0] + dependency[0]
                                Attribute_list.append(composition)

    elif root_pos == 'vv':
        print("根节点是vv")
    # 输出分类结果
    else:
        print("根节点错误，不执行后续操作")
    if Class_list:
        print("分类为 'Class' 的词汇：", Class_list)
        node_list.append(Class_list)
    else:
        print("没有分类为 'Class' 的词汇")

    if Attribute_list:
        print("分类为 'Attribute' 的词汇：", Attribute_list)
        node_list.append(Attribute_list)
    else:
        print("没有分类为 'Attribute_list' 的词汇")
    return node_list



print(have(root_position, answer))
# 最外层
Classjson = {}

# Attribute_list = [{"name": attr} for attr in Attribute_list]
# Class_list = [{"key": 2, "name": attr, "properties": Attribute_list} for attr in Class_list]

link = {}
link["from"] = 12
link["to"] = 11
link["relationship"] = "generalization"

# link集合(继续加)
linkDataArray = [link]

# 默认
Classjson["class"] = "GraphLinksModel"
Classjson["copiesArrays"] = True
Classjson["copiesArrayObjects"] = True
# Classjson["nodeDataArray"] = Class_list
Classjson["linkDataArray"] = linkDataArray

json_string = json.dumps(Classjson, ensure_ascii=False)
print(json_string)

# { "class": "GraphLinksModel",
#   "copiesArrays": true,
#   "copiesArrayObjects": true,
#   "nodeDataArray": [
# {"key":1,
#  "name":"BankAccount",
#  "properties":[ {"name":"owner", "type":"String", "visibility":"public"},
#                 {"name":"balance", "type":"Currency", "visibility":"public", "default":"0"} ],
#  "methods":[ {"name":"deposit", "parameters":[ {"name":"amount", "type":"Currency"} ], "visibility":"public"},
#              {"name":"withdraw", "parameters":[ {"name":"amount", "type":"Currency"} ], "visibility":"public"} ]}




# ************************************************
# { "class": "go.GraphLinksModel",
#   "nodeDataArray": [
# {"key": "BankAccount", "name": "BankAccount","properties": [{ "name": "owner" },{ "name": "balance" }]},
# {"key": "Person", "name": "Person","properties": [{ "name": "name" },{ "name": "birth" }]},
# {"key": "Student", "name": "Student","properties": [{ "name": "classes" }] },
# {"key": "Professor", "name": "Professor","properties": [ { "name": "classes" }]},
# {"key": "Course", "name": "Course","properties": [{ "name": "name" },{ "name": "description" },{ "name": "professor" },{ "name": "location" }, { "name": "times" },{ "name": "prerequisites" }, { "name": "students" }]}
#   ] ,
#   "linkDataArray": [
#  { "from": "会议室", "to": "空间","text":"" , "relationship": "" },
# { "from": "酒店卧室", "to": "空间", "text":"" ,"relationship": "" },
#  { "from": "电视机", "to": "卧室","text":"" ,"relationship": "" },
#  { "from": "接待员", "to": "预订","text":"处理" , "relationship": "" },
#  { "from": "空间", "to": "预订","text":"" ,"relationship": "" }
#  { "from": "客户", "to": "预订","text":"" ,"relationship": "" }
# ]}
