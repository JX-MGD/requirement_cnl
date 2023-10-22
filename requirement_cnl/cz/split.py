import re

def split_sentences(text):
    # 使用正则表达式匹配标点符号来分句
    sentences = re.split(r'[;]', text)
    # 去除空句子
    sentences = [sentence.strip() for sentence in sentences if sentence.strip()]
    return sentences


# 示例用法
text = "可出租的空间是酒店卧室或会议室;可出租空间总是有一个特定的租金成本和面积;可出租的空间是酒店卧室或会议室;酒店的卧室有一个独特的房间号和一些床;;旅馆的卧室里可能有一台电视机;;我们想记录下每台电视的序列号和显示尺寸;;每家酒店至少有一名接待员; ;接待员负责处理顾客的预订;;每次预订都有一个客户和一个选定的可租用空间;;客户由姓名、姓氏和地址标识;;预订有开始日期和结束日期;;预订也有一个唯一标识符;;每个会议室都有名称和最大容量; ;会议室可以有投影屏幕"
sentences = split_sentences(text)

# 打印分句结果
for i, sentence in enumerate(sentences, 1):
    print(f"句子 {i}: {sentence}")
