from fastHan import FastHan
import split
import re

model = FastHan()
# text = ("要编辑文件，用户必须打开文件，进行更改，保存文件，然后关闭文件;管理人员必须进行打开文件，更改文件，保存文件，然后关闭文件,以便编辑文件;用户必须打开文件，更改文件，保存文件"
#         "，然后关闭文件,以编辑文件;为了对文件进行编辑，用户必须打开文件，更改文件，保存文件，然后关闭文件;为实现文件编辑操作，用户必须打开文件，更改文件，保存文件"
#         "，然后关闭文件;要编辑文件，用户必须打开文件，更改文件，然后关闭文件;为了退出应用程序，用户必须按下红色按钮;为了退出应用程序，用户必须按下红色的按钮;为了退出应用程序，用户必须按下方形的按钮;")
# text = "为了退出应用程序，用户必须按下红色按钮;为了退出应用程序，用户必须按下红色的按钮;为了退出应用程序，用户必须按下方形的按钮;"
text = "用户最多可以借三十本书;学生最少可以借二十本书，最多可以借三十本书;老师最多可以借四十本书"
# 待匹配的句子
sentences = split.split_sentences(text)
answer = model(text, target="Parsing")
# 存储匹配结果的列表
matches = []
# 定义匹配模式1
pattern1 = re.compile(r'(?:为了|为|要)对([^，]+)进行([^，]+)')

# 定义匹配模式2
pattern2 = re.compile(r'(?:为了|为|要)(?:实现|进行|可以|能够)?([^，操作]*)')
# 定义匹配模式3
pattern3 = re.compile(r',(?:以便|以)(?:实现|进行|可以|能够)?([^，操作]*)')
# 进行匹配
for idx, sentence in enumerate(sentences, start=1):
    match1 = pattern1.search(sentence)
    # match只从字符串开头匹配，search从字符串任意位置匹配
    match2 = pattern2.match(sentence)
    match3 = pattern3.search(sentence)

    # 提取匹配到的内容
    if match1:
        target = match1.group(1) + match1.group(2)
        print("匹配成功，匹配模式1，目标:", target)
        matches.append({"target": target, "sentence_index": idx})
    elif match2:
        target = match2.group(1)
        print("匹配成功，匹配模式2，目标:", target)
        matches.append({"target": target, "sentence_index": idx})
    elif match3:
        target = match3.group(1)
        print("匹配成功，匹配模式3，目标:", target)
        matches.append({"target": target, "sentence_index": idx})
    else:
        print("未匹配成功")
print(matches)
from collections import defaultdict

# 遍历 matches 列表，使用字典记录每个目标对应的句子索引
# 创建一个默认字典，合并相同目标的句子索引
target_sentences = defaultdict(list)
for match in matches:
    target = match["target"]
    sentence_index = match["sentence_index"]
    target_sentences[target].append(sentence_index)

# 存储相同目标的句子索引的列表的列表
clustered_sentences = []

# 遍历字典，找到所有具有相同目标的句子，并保存到列表中
for target, sentence_indices in target_sentences.items():
    if len(sentence_indices) > 1:
        clustered_sentences.append({"target": target, "sentence_indices": sentence_indices})

# 输出相同目标的句子索引的列表的列表
print(clustered_sentences)

# 遍历合并后的聚类列表
for i, cluster1 in enumerate(clustered_sentences):
    target1 = cluster1["target"]
    sentence_indices1 = cluster1["sentence_indices"]

    # 遍历剩余的聚类列表
    for j, cluster2 in enumerate(clustered_sentences[i + 1:], start=i + 1):
        target2 = cluster2["target"]
        sentence_indices2 = cluster2["sentence_indices"]

        # 判断是否可以合并
        if all(char in target2 for char in target1) or all(char in target1 for char in target2):
            # 合并目标和句子索引
            merged_target = target1
            merged_sentence_indices = list(set(sentence_indices1 + sentence_indices2))

            # 更新合并后的聚类
            clustered_sentences[i]["target"] = merged_target
            clustered_sentences[i]["sentence_indices"] = merged_sentence_indices

            # 删除被合并的聚类
            del clustered_sentences[j]

# 输出合并后的聚类结果
print(clustered_sentences)
# 遍历合并后的聚类列表
for cluster in clustered_sentences:
    target = cluster["target"]
    sentence_indices = cluster["sentence_indices"]
    # 把相同目标的句子打包成一段话传给fasthan
    combined_sentence = ''
    for sentence_index in sentence_indices:
        combined_sentence = combined_sentence + ';' + sentences[sentence_index - 1]
    # 遍历 sentence_indices 列表中的数字，选择遍历第几条句子
    # 所有句子的动作链由actions保存
    actions = []
    # 所有句子的属性都由attrs保存
    attrs = []
    # 所有句子的执行者由operators保存
    operators = []
    root_position = None
    answer = model(combined_sentence, target="Parsing")
    # for answers in answer:
    #     print(answers)

    for answerlist, sentence_index in zip(answer, sentence_indices):
        # 处理相应的逻辑

        attrindex = None
        operator = None
        for dependency in answerlist[0]:
            # 找到root的位置和属性的位置(attrindex)
            if 'root' in dependency:
                if dependency[0] != '进行':
                    root_position = answerlist[0].index(dependency) + 1
                # “进行”在依存分析中不能当作连词导向
                elif dependency[0] == '进行':
                    root_position = answerlist[0].index(dependency) + 2
            # 仅做测试,属性列表暂且为按钮
            if '按钮' in dependency:
                attrindex = answerlist[0].index(dependency) + 1
            # 找到操作链的执行者
            if 'nsubj' in dependency or 'xsubj' in dependency:
                operator = dependency[0]
                # 若前面有nn连词则一并加上
                if answerlist[0][answerlist[0].index(dependency)-1][2] == 'nn':
                    operator = answerlist[0][answerlist[0].index(dependency)-1][0]+operator
                operators.append(operator)

        # 当前所在句子的动作链由actionlist保存
        actionlist = []
        # 遍历每一条需要的句子
        flag = False
        for dependency in answerlist[0]:
            action = None

            if dependency[2] == 'root' or (
                    dependency[2] in ['conj', 'dep'] and dependency[1] in [root_position, root_position + 1]):
                verb_index = answerlist[0].index(dependency) + 1
                # 若root节点或连词后跟'ccomp', 'nn', 'vmod'的情况(root节点或连词一定为'进行'且后面跟动作)
                if answerlist[0][verb_index][2] in ['ccomp', 'nn', 'vmod']:
                    action = answerlist[0][verb_index][0]
                    for noun in answerlist[0]:
                        if noun[2] == 'dobj' and noun[1] == verb_index + 1:
                            action += noun[0]
                            break
                    if action != target:
                        actionlist.append(action)
                # root节点或连词可能为'进行'且自己表动作(!)/一般动作(√)
                else:
                    # root节点或连词表一般动作
                    if answerlist[0][answerlist[0].index(dependency)][0] != '进行':
                        verb_index = answerlist[0].index(dependency)
                        action = answerlist[0][verb_index][0]
                        for noun in answerlist[0]:
                            if noun[2] == 'dobj' and noun[1] == verb_index + 1:
                                action += noun[0]
                                break
                        if action != target:
                            actionlist.append(action)
                    # root节点或连词为'进行'且自己表动作(预先的动作变为dobj!),此情况一定缺失动作对象
                    else:
                        flag = True
                        print('警告：当前' + target + '描述可能存在不完整性问题！' + '(对应句子：' + sentences[
                            sentence_index - 1] + ')')
                        break

        if flag:
            continue

        actions.append(actionlist)

        if attrindex is not None:
            for dependency in answerlist[0]:
                if dependency[1] == attrindex and dependency[2] in ['amod', 'assmod']:
                    if dependency[0] not in attrs:
                        attrs.append(dependency[0])

    # 输出所有句子的动作链
    print("*************输出描述'" + target + "'操作中所有句子的动作链*************")
    for action in actions:
        print(action)

    # 1.检查每个列表是否与其他列表相同(动作链引发的不一致性问题)
    flag = False
    for i, list1 in enumerate(actions):
        for j, list2 in enumerate(actions[i + 1:], start=i + 1):
            if len(list1) != len(list2) or any(item1 != item2 for item1, item2 in zip(list1, list2)):
                print('警告：当前' + target + '描述可能存在不一致性问题！')
                flag = True
                break
        if flag == True:
            break
    print("*************输出描述'" + target + "'操作中所有句子描述对象的属性值*************")
    if attrs:
        # 输出所有句子描述对象的属性值
        print(attrs)
        # 2.检查描述对象属性值引发的可能不一致性问题
        flag = False
        for attr in attrs:
            print("'按钮'对象是否具有可以描述'" + attr + "'值的属性")
        # 应该由用户决定，这里先做测试不做用户处理
        if not flag:
            print(f"是否存在一个{'，'.join(attrs)}的按钮")
    else:
        print("无属性值")

    # 3.检测动作链的执行者
    print("*************输出描述'" + target + "'操作中所有句子的执行者*************")
    print(operators)
    if len(set(operators)) > 1:
        print(f"警告：当前{target}描述检测到多个执行者！分别为: {', '.join(set(operators))}")