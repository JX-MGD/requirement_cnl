# Class Have Attr
def have(root_position,dependency_list,have_position,root_pos,root_mean):
    # 初始化分类列表
    Class_list = []
    Attribute_list = []
    # 判断根节点是否为 "有"
    if have_position:
        # 遍历依存关系列表，判断子列表中的数字与 root_position_in_sublist 是否相等
        for sublist in dependency_list:
            for dependency in sublist:
                # 判断子列表中的数字与 root_position_in_sublist 是否相等
                if dependency[1] == root_position:
                    # 判断是否为 "top" 或 "dobj"
                    if dependency[2] == 'top' or dependency[2] == 'nsubj' or dependency[2] == 'dep' or dependency[2] == 'root':
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
                        if dep[2] in ['top', 'nsubj','dep','dobj'] and dep_index == sublist.index(dep) + 1:
                            # 根据依存关系是 "top" 还是 "dobj" 分别加入到相应的列表中
                            if dep[2]=='top' or dep[2]=='nsubj':
                                composition = dependency[0]
                                for sub in dependency_list:
                                    for dep in sublist:
                                        if dep[2] == 'nn' and sublist.index(dep) + 1 == sublist.index(dependency):
                                            composition = dep[0] + dependency[0]

                                Class_list.append(composition)


                            elif dep[2]=='dobj':
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
    else:
        print("没有分类为 'Class' 的词汇")

    if Attribute_list:
        print("分类为 'Attribute' 的词汇：", Attribute_list)
    else:
        print("没有分类为 'Attribute_list' 的词汇")
# Class Is SpecialClass
def Is(root_position,dependency_list):
    # 初始化分类列表
    Class_list = []
    SpecialClass_list = []
    if dependency_list[0][root_position - 1][0] == '是':
        # 遍历依存关系列表，判断子列表中的数字与 root_position_in_sublist 是否相等
        for sublist in dependency_list:
            for dependency in sublist:
                # 判断子列表中的数字与 root_position_in_sublist 是否相等
                if dependency[1] == root_position:
                    # 判断是否为 "top" 或 "dobj"
                    if dependency[2] == 'top' or dependency[2] == 'nsubj':
                        # 若top前面有nn，则合并单词
                        composition = dependency[0]
                        for sub in dependency_list:
                            for dep in sublist:
                                if dep[2] == 'nn' and sublist.index(dep) + 1 == sublist.index(dependency):
                                    composition = dep[0] + dependency[0]

                        Class_list.append(composition)
                        # 若attr前面有nn，则合并单词
                    elif dependency[2] == 'attr':
                        composition = dependency[0]
                        for sub in dependency_list:
                            for dep in sublist:
                                if dep[2] == 'nn' and sublist.index(dep) + 1 == sublist.index(dependency):
                                    composition = dep[0] + dependency[0]

                        SpecialClass_list.append(composition)

        # 遍历依存关系列表，查找依存关系是 "conj" 的词汇
        for sublist in dependency_list:
            for dependency in sublist:
                if dependency[2] == 'conj':
                    # 获取当前依存关系词汇在子列表中的位置（索引）
                    dep_index = dependency[1]

                    # 遍历子列表中的所有依存关系词汇，检查它们的位置是否与当前位置相同
                    for dep in sublist:
                        # 判断是否为 "top" 或 "dobj" 并且位置与当前位置相同
                        if dep_index == sublist.index(dep) + 1:
                            # 根据依存关系是 "top" 还是 "attr" 分别加入到相应的列表中
                            if dep[2] == 'top' or dep[2] == 'nsubj':
                                composition = dependency[0]
                                for sub in dependency_list:
                                    for dep in sublist:
                                        if dep[2] == 'nn' and sublist.index(dep) + 1 == sublist.index(dependency):
                                            composition = dep[0] + dependency[0]

                                Class_list.append(composition)


                            elif dep[2] == 'attr':
                                composition = dependency[0]
                                for sub in dependency_list:
                                    for dep in sublist:
                                        if dep[2] == 'nn' and sublist.index(dep) + 1 == sublist.index(dependency):
                                            composition = dep[0] + dependency[0]
                                SpecialClass_list.append(composition)


    else:
        print("根节点不是 '是'，不执行后续操作")
    # 输出分类结果
    if Class_list:
        print("分类为 'Class' 的词汇：", Class_list)
    else:
        print("没有分类为 'Class' 的词汇")

    if SpecialClass_list:
        print("分类为 'SpecialClass' 的词汇：", SpecialClass_list)
    else:
        print("没有分类为 'SpecialClass_list' 的词汇")

# FromClass Method ToClass
def general(related_elements,root_position,dependency_list,root_mean):
    # 初始化分类列表
    FromClass_list = []
    ToClass_list = []
    if related_elements == 'vv':
        # 遍历依存关系列表，判断子列表中的数字与 root_position_in_sublist 是否相等
        for sublist in dependency_list:
            for dependency in sublist:
                # 判断子列表中的数字与 root_position_in_sublist 是否相等
                if dependency[1] == root_position:
                    # 判断是否为 "top" 或 "dobj"
                    if dependency[2] == 'nsubj' or dependency[2] == 'top':
                        # 若top前面有nn，则合并单词
                        composition = dependency[0]
                        for sub in dependency_list:
                            for dep in sublist:
                                if dep[2] == 'nn' and sublist.index(dep) + 1 == sublist.index(dependency):
                                    composition = dep[0] + dependency[0]

                        FromClass_list.append(composition)
                        # 若attr前面有nn，则合并单词
                    elif dependency[2] == 'dobj':
                        composition = dependency[0]
                        for sub in dependency_list:
                            for dep in sublist:
                                if dep[2] == 'nn' and sublist.index(dep) + 1 == sublist.index(dependency):
                                    composition = dep[0] + dependency[0]

                        ToClass_list.append(composition)

        # 遍历依存关系列表，查找依存关系是 "conj" 的词汇
        for sublist in dependency_list:
            for dependency in sublist:
                if dependency[2] == 'conj':
                    # 获取当前依存关系词汇在子列表中的位置（索引）
                    dep_index = dependency[1]

                    # 遍历子列表中的所有依存关系词汇，检查它们的位置是否与当前位置相同
                    for dep in sublist:
                        # 判断是否为 "top" 或 "dobj" 并且位置与当前位置相同
                        if dep[2] in ['nsubj', 'top', 'dobj'] and dep_index == sublist.index(dep) + 1:
                            # 根据依存关系是 "top" 还是 "attr" 分别加入到相应的列表中
                            if dep[2] == 'nsubj' or dep[2] == 'top':
                                composition = dependency[0]
                                for sub in dependency_list:
                                    for dep in sublist:
                                        if dep[2] == 'nn' and sublist.index(dep) + 1 == sublist.index(dependency):
                                            composition = dep[0] + dependency[0]

                                FromClass_list.append(composition)


                            elif dep[2] == 'dobj':
                                composition = dependency[0]
                                for sub in dependency_list:
                                    for dep in sublist:
                                        if dep[2] == 'nn' and sublist.index(dep) + 1 == sublist.index(dependency):
                                            composition = dep[0] + dependency[0]
                                ToClass_list.append(composition)
    else:
        print("根节点不是vv词性，不执行后续操作")
    # 输出分类结果
    if FromClass_list:
        print("分类为 'FromClass' 的词汇：", FromClass_list)
    else:
        print("没有分类为 'FromClass' 的词汇")
    if root_mean:
        print("方法为：", root_mean)
    if ToClass_list:
        print("分类为 'ToClass' 的词汇：", ToClass_list)
    else:
        print("没有分类为 'ToClass' 的词汇")

def prep(prep_position,root_position,dependency_list):
    # 初始化分类列表
    Class_list = []
    SpecialClass_list = []
    if dependency_list[0][root_position - 1][0] == '组成' or dependency_list[0][root_position - 1][0] == '标识':
        # 遍历依存关系列表，判断子列表中的数字与 root_position_in_sublist 是否相等
        for sublist in dependency_list:
            for dependency in sublist:
                # 判断子列表中的数字与 root_position_in_sublist 是否相等
                if dependency[1] == root_position:
                    # 判断是否为 "top" 或 "dobj"
                    if dependency[2] == 'top' or dependency[2] == 'nsubj':
                        # 若top前面有nn，则合并单词
                        composition = dependency[0]
                        for sub in dependency_list:
                            for dep in sublist:
                                if dep[2] == 'nn' and sublist.index(dep) + 1 == sublist.index(dependency):
                                    composition = dep[0] + dependency[0]

                        Class_list.append(composition)
                        # 若attr前面有nn，则合并单词
                elif dependency[1] == prep_position:
                    # 判断是否为 "pobj"
                    if dependency[2] == 'pobj':
                        composition = dependency[0]
                        for sub in dependency_list:
                            for dep in sublist:
                                if dep[2] == 'nn' and sublist.index(dep) + 1 == sublist.index(dependency):
                                    composition = dep[0] + dependency[0]

                        SpecialClass_list.append(composition)

        # 遍历依存关系列表，查找依存关系是 "conj" 的词汇
        for sublist in dependency_list:
            for dependency in sublist:
                if dependency[2] == 'conj':
                    # 获取当前依存关系词汇在子列表中的位置（索引）
                    dep_index = dependency[1]

                    # 遍历子列表中的所有依存关系词汇，检查它们的位置是否与当前位置相同
                    for dep in sublist:
                        # 判断是否为 "top" 或 "dobj" 并且位置与当前位置相同
                        if dep[2] in ['top', 'nsubj', 'pobj'] and dep_index == sublist.index(dep) + 1:
                            # 根据依存关系是 "top" 还是 "attr" 分别加入到相应的列表中
                            if dep[2] == 'nsubj':
                                composition = dependency[0]
                                for sub in dependency_list:
                                    for dep in sublist:
                                        if dep[2] == 'nn' and sublist.index(dep) + 1 == sublist.index(dependency):
                                            composition = dep[0] + dependency[0]

                                Class_list.append(composition)


                            elif dep[2] == 'pobj':
                                composition = dependency[0]
                                for sub in dependency_list:
                                    for dep in sublist:
                                        if dep[2] == 'nn' and sublist.index(dep) + 1 == sublist.index(dependency):
                                            composition = dep[0] + dependency[0]
                                SpecialClass_list.append(composition)


    else:
        print("根节点不是'拥有'或'组成'，不执行后续操作")
    # 输出分类结果
    if Class_list:
        print("分类为 'Class' 的词汇：", Class_list)
    else:
        print("没有分类为 'Class' 的词汇")

    if SpecialClass_list:
        print("分类为 'Attribute' 的词汇：", SpecialClass_list)
    else:
        print("没有分类为 'Attribute' 的词汇")
