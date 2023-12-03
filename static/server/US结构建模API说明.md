# US(Unified Structure)使用方式
对于每一个子图mySubDiagram， 
### 1. 根据子图所在位置，正确使用<em>相对路径</em>引入js文件
```html
  <script type="text/javascript" src="../../UML.js"></script>
```
### 2. 在子图的菜单中添加相应的统一结构转换菜单，除下方示例中的‘US Generation’可以自定义外，其他<font color="red">所有子图保持完全一致！！！</font>
```html
  <a onclick="usDiag(1)">US Generation</a>
```
onClick的监听函数usDiag(1)解析：
```javascript
/**
 * Entry for generating a US object by @param:<go.Diagram>
 * @param {Number} diagType     1: <go.DIagam>mySubDiagram, 子图的参数都是这个；
 *                              0: <go.DIagam>myUmlDiagram, 主图的参数 
 */
function usDiag(diagType) {
}
```
### 3. US生成结果查看：
### 3.1 对于<font color="blue">子图</font>而言，仅有<font color="blue">一</font>种US结果，即 usDiag(1);

### 3.2 对于<font color="blue">主图</font>而言，有<font color="blue">三</font>种US结果：
#### 3.2.1 当使用主图菜单中的 Tool -> US(Group) 生成US对象时, 在弹出的输入框中,
1). 输入主图中的UML组名，比如 Sequence_Analysis 等. 那么将对主图中<font color="coral">指定的UML组</font>生成US. (待实现)
2). 不输入任何字符, 那么将对主图中<font color="coral">所有的UML组</font>分别生成US
3). 输入任意非空字符，则将对主图中<font color="coral">所有的子图节点</font>生成 US。

#### 3.2.2 当使用主图菜单中的 Tool -> US(Diagram) 生成US对象时, 将对整个主图生成一个US



# US(Unified Structure)生成
## 1. US._ME - 模型的 **节点、连线** 的集合；
> 该集合包含 US.Eles与US.Rels 的并集，但注意是已经排除掉一些相似的集合。
在创建US对象实例时，
```javascript
	let US = new UnifiedStrcture(param);
```
在类UnifiedStructure的构造函数中根据 param类型 分别筛选出全集_ME的_Nodes， _Links。
本算法中，param有三种情况：
### 1.1 模型是\<go.Diagram\>类型
⚠工具中param只可能有两个值：*myUmlDiagram* 和 *mySubDiagram*. 
他们通过一个整数参数来判断，如果参数为'1'，则 <em>param = mySubDiagram</em>；否则 <em>param = myUmlDiagram</em>

对应筛选函数：
```javascript
	filterNodeByArray([], param.model.nodeDataArray);
	filterNodeByArray([], param.model.linkDataArray);
```

### 1.2 模型是\<go.Group\>类型
对于主图中的group，每一个group就是一个实际意义上的UML模型，因此能够进行 US建模。

其遍历方法不同，思路：
> 遍历Group的每一个成员，对每一个成员类型判定：
> 	1). Node/Group类型 加入到 _ME._Nodes;
> 	2). Link类型 加入到 _ME._Links;

对应筛选出 _ME._Nodes，_ME._Links 的函数：
```javascript
	filterByIterator([], group)
```

1.3 模型是JSON \<Object\>对象类型

## 2. US.Prec - 偏序集合；
该集合中的元素都是二元关系集，暂已(from, to)表示。
表示内容目前有两种： 
### 2.1 包含 偏序
对于包含而言，其并不只意味着 组Group和其成员 的关系，不同的UML模型具有不同的“包含偏序”
```javascript
	//  活动图
	US._setPrecByNodeGroup('Containment');   // Action and its Partition etc.

	//  用例图
	US._setPrecByNodeGroup("Containment");   // UseCase and its SystemBorder
  US.insertByLinkTexts(US._Prec, ['extend'], 'Containment');

	//  类图
  US.mergeObjCatesToNew(US._Prec, ['Compose','Realization','Aggregate','Generalize'], 'Containment');
```

### 2.2 顺序 偏序
顺序的偏序关系即为全集_ME中的_Links，因此暂时未特别考虑分类

## 3. US.Eles - 节点 的集合；
归类原则：一切在图中有文本信息or可命名的元素都是Eles！
比如，带有消息名称的Message
由于原则，该集合中的数据对象不是统一格式的，但是都必须有名字，即Text属性不为空！
```javascript
  _init() {
  	// basic US.Elements
    US.insertDataArray(US._Eles, US._ME._Nodes);
    US.insertDataArray(US._Eles, US._ME._Links);
  }
```

## 4. US.Rels - 连线 的集合；
该集合考虑：
### 4.1 根据Link.category分类
	4.1.1 当category为空时，默认设置为 “DefaultLink” 类型
	4.1.2 当category不为空时，
		a). 根据category名称创建一个数组对象
```javascript
	US._createProp(US.Rels, categor名称)
```

		b). 添加到已创建数组中
```javascript
	// plan A：每次创建的时候判定 .category 是否创建。未创建则进行步骤 a)
	US._insertSingle(US._Eles, el.category, el);

	// plan B: 多个.category相同的对象，创建一次即可,后续直接添加.
    US._createProp(obj, newName);
    for (let i = 0; i < array.length; i++) {
      let tmpObj = createObjWithProps(array[i], toProp);
      obj[newName].push(tmpObj);
    }
```

### 4.2 根据Link.text分类
特别地， 对于部分行为图而言，其link可能包含多种需要的类型信息。
比如，
> 顺序图中的消息Message := @ReturnType MessageName(@Arguments)
> 活动图中的条件Guard ：= [@Guard]
> 状态图中的迁移Transition := @Trigger(@Parameter)[ @Guard ] / @Action
因此需要对Link上的内容进行格式化并提取到US.Eles中。
```javascript
	/* I. 默认一次性提取。 按照既定模板提取所有分类，返回一个对象
		{
			Trigger: [],
			Action: [],
			...
		}
	*/
	listTypesOfLinkText(str);

	// II. 指定类型提取， 返回提取到字符串。 eg “Trigger”
	getLinkTextSpecified(str, sType)
```
## 5. US.ConsE - **节点的约束**集合；

## 6. US.ConsD - **连线的约束**集合；
### 6.1 目前约束集合仅考虑到 类图中的多重性(Multiplicity)
建模实例结果: <em>((from, to),[fromText, toText])</em>. 其中fromText, toText即为多重性的标志。
多重性的建模流程：
拿到每一条具备多重性的Link的关键信息： from, to, fromText, toText;
```javascript
	filterLinkByArrayWithMulti([], Class类模型的Link数据)
```

## 7. 其他
7.1 分裂**关系**为两部分. 
比如在状态图中，迁移Transition关系(from:StateA, to:StateB, text:no-return invokation)需要生成出：
> (from:StateA, to:StateB, text:no-return invokation) =>
> >	(**from**:StateA,	text:no-return invokation)
> >	(**to**:StateB, 	text:no-return invokation)
因此，需要对应函数：
```javascript
	createObjWithProps(data, ['from', 'text'])
	createObjWithProps(data, ['to', 'text'])
```
