/********************** Additional US functions - S ***************************/
function getArrayIntersection(srcArr, tarArr) {
  let invalids = new Set();
  let valids = new Array();

  for (let i = srcArr.length - 1; i >= 0; i--) {
    const sE = array[i];
    for (let j = tarArr.length - 1; j >= 0; j--) {
      const tE = array[j];
      if (sE !== tE)  invalids.add(tE);
      else  valids.add(tE);
    }
  }

  if (invalids.size > 0) {
    let tmpArr = Array.from(invalids);
    alert("{ "+ tmpArr.join(",")+" } is not specified in TEXT extraction...\n You need to add a new type !");
  }

  return valids;
}

/********************** extract info Node & Link  - S ****************/
function xtractNode(nd) {
  return {
    key: nd.key,
    text: nd.text || "",
    category: nd.category || "DefaultNode",
    isGroup: nd.isGroup || false,
    group: "" || nd["group"],
  };
}
function xtractLink(lk) {
  return {
    from: lk.from,
    to: lk.to,
    text: lk.text,
    category: lk.category || "DefaultLink",
  }
}
function xtractLinkSingle(obj) {
  return { from: obj.from, to: obj.to, category: obj.category };
}
function xtractLinkConstr(obj) {
  return {
    from: obj.from,
    to: obj.to,
    fromText: obj.fromText,
    toText: obj.toText,
    // category: obj.category || "DefaultLink",
  }
}
/********************** extract info Node & Link  - E ****************/


/************* Cluster .DataArray with extractions  - S **************/
function filterNodeByArray(res=[], array) {
  for (let i = array.length - 1; i >= 0; i--) {
    const nd = array[i];

    res.push(xtractNode(nd));
  }
}
function filterLinkByArray(res=[], array) {
  for (let i = array.length - 1; i >= 0; i--) {
    const lk = array[i];

    res.push(xtractLink(lk));
  }
}

/************* Cluster .DataArray with extractions  - E **************/


/**
 * This _makeParts a Unified Structrue for any diagram drawn by GoJS library.
 */
class UnifiedStructure {
  constructor(parent) {
    this._Name = "";
    this.KVMap = undefined;

    // US Parts - Start
    this._ME = {
      "_Nodes": [],
      "_Links": [],
    };
    this._Prec = {}; // 1.Sequential, 2. Containment, 3. Sequential && Containment
    this._Eles = {};
    this._Rels = {};
    this._CondE = null;
    this._CondR = null;

    this._ME._Nodes = parent.model.nodeDataArray;
    this._ME._Links = parent.model.linkDataArray;
    // US Parts - End 
  }

  /************* STATIC methods - S **************/
  _appendPropToObj(obj, type) {
    if (!Object.hasOwnProperty.call(obj, type)) {
      obj[type] = new Array();
    }
  }


  _insertIntoObj(obj, k, v) {
    this._appendPropToObj(obj, k);
    obj[k].push(v);
  }

  /**
   * Create basic Partial-Order by node and its "group" to form "Containment Partial Order"
   * @param {*} type    A name for property of ._Prec Object 
   */
  _setPrecByNodeGroup(type) {
    let precObj = this._Prec;

    if (!Object.hasOwnProperty.call(precObj, type)) {
      precObj[type] = new Array();
    }

    const nodes = this._ME._Nodes;
    const len = nodes.length;
    let i = len - 1;
    // let grpNodeMap = new Map();

    // for (; i >= 0; i--) {
    //   const e = nodes[i];
    //   grpNodeMap.set(e.key, e.text);
    // }

    for (i = 0; i < len; ++i) {
      const e = nodes[i];

      if (e.group) {
        // // Original version for Group relation
        precObj[type].push({ group: e.group, key: e.key });
        // Translated the .key or .group to Text for better readding
        // precObj[type].push({ key: grpNodeMap.get(e.key), group: grpNodeMap.get(e.group) });
      }
    }

  }

  // _copy(tar=[], src) {
  //   for (let i = src.length - 1; i >= 0; i--) {
  //     tar.push(array[i]);
  //   }
  // }

  _mergeObjCates(obj, newCates) {
    // filter valid ones from @Param:newCates;
    let ownedProps = Object.getOwnPropertyNames(obj);
    let valids = [];
    for (let i = newCates.length - 1; i >= 0; i--) {
      let e = newCates[i];
      if (ownedProps.includes(e)) {
        valids.push(e);
      }
      // else {
      //   console.log(e + " is invalid category");
      // }
    }

    /*  Copy from smaller ones into the maximum-length one - S */
    let destArr = [];
    for (let i = valids.length - 1; i >= 0; i--) {
      const validArr = obj[valids[i]];

      for (let j = validArr.length - 1; j >= 0; j--) {
        destArr.push(validArr[j]);
      }
    }
    /*  Copy from smaller ones into the maximum-length one - E */

    return destArr;
  }
  /************* STATIC methods - E **************/


  init(){
    // let kvSize = this.buildKeyTextMap();
    // console.log(kvSize + " nodes are established in the Key-Value map.");
    
    // basic US.Elements initialization by ".category"
    this.insertArrToEle(this._ME._Nodes);
    this.insertArrToRel(this._ME._Links);

    // basic US.Relations
    // this.initRels();

    this._setPrecByNodeGroup("Containment");
  }

  buildKeyTextMap() {
    this.KVMap = new Map();

    for (let i = this._ME._Nodes.length - 1; i >= 0; i--) {
      const nd = this._ME._Nodes[i];
      this.KVMap.set(nd.key, nd.text);
    }

    return this.KVMap.size;
  }

  /**
   * Initialize all US._ME._Links into US._Rels. Especially, US._Rels pays more
   * attention to "Relation" instead of "Elements"
   *  For Element of one link data, it is {from: "uml_-1", to: "uml_-2", text: "ControlFlow"...}
   *  For Relation of one link data, it is {from: "action 1: do calling", to: "action 2: do speaking"...}
   * @param {*} str       Un-Used for now
   */
  initRels(str="") {
    let tmpArr = new Array();   // from, to ,category
    for (let i = this._ME._Links.length - 1; i >= 0; i--) {
      const lk = this._ME._Links[i];

      let xlk = xtractLinkSingle(lk);
      tmpArr.push(xlk);
    }

    this.replaceKeyToText(tmpArr);

    this.insertDataArray(this._Rels, tmpArr);
  }

  /**
   * Insert into US object by ".text" content
   * @param {*} obj       US object
   * @param {*} texts     .text content such as "extend","include"...
   * @param {*} newName   A new property name of Object
   */
  insertObjBySpecifiedLinkTexts(obj, newName="") {
    const links = this._ME._Links;
    for (let i = links.length - 1; i >= 0; i--) {
      const lk = links[i];
      let xlk = xtractLinkSingle(lk);
      this._insertIntoObj(obj, lk.text, xlk); 
    }
  }

  /**
   *  Insert each simplified item of linkDataArray into this.ELE by item's category
   */
  insertArrToEle(array) {
    for (let i = array.length - 1; i >= 0; i--) {
      const el = array[i];
      
      let obj = {
        key: el.key,
        group: el.group || "",
        text: el.text,
        /// Properties below are only available in such requirement tool
        id: el["id"],
        description: el["description"],
      };
      
      this._insertIntoObj(this._Eles, el.category, obj);
    }
  }
  /**
   *  Insert each simplified item of nodeDataArray into this.Rel by item's category/text
   */
  insertArrToRel(array) {
    for (let i = array.length - 1; i >= 0; i--) {
      const el = array[i];
      
      let obj = {
        from: el.from,
        to: el.to,
        text: el.text,
      };
      
      this._insertIntoObj(this._Rels, el.category, obj);
    }
  }

  /**
   * This creates new object data with specified properties,
   * and then insert the object data into newly named type of object
   * @param {*} obj:      Target object to insert data
   * @param {*} toProp    Properties specified in basis of GoJS json data
   * @param {*} newName   New name to insert into Target object 
   */
  insertToNewWithCusProps(obj, toProp, newName) {
    const newObjPropsLen = toProp.length;
    if (newObjPropsLen === 0)  return;

    let array = this._ME._Nodes;
    if (array.length === 0) return;

    // check whether "toProp" is globally valid enough
    const tmpNodeObj = array[0]; // this requires ME.Nodes, ME.Links universal format
    for (let j = 0; j < toProp.length; j++) {
      if (!Object.hasOwnProperty.call(tmpNodeObj, toProp[j])) {
        array = this._ME._Links;
        break;
      }
    }

    // insertion with ONLY one object creation
    this._appendPropToObj(obj, newName);
    for (let i = 0; i < array.length; i++) {
      let tmpObj = createObjWithProps(array[i], toProp);
      obj[newName].push(tmpObj);
    }
  }
  
  /**
   * This replace all ".key" in .linkDataArray by ".text" from .nodeDataArray
   */
  replaceKeyToText(arr) {
    for (let j = arr.length - 1; j >= 0; j--) {
      let lk = arr[j];

      lk.from = this.KVMap.get(arr[j].from);
      lk.to = this.KVMap.get(arr[j].to);
    }
  }
  /**
   * This creates Prec(Partial Order) relations from US._Rels whose each single element 
   * will be added into ._Prec if its .category specified.
   *    etc. "Composition", "Aggregation"... typically stands for partial order "Containment" 
   * @param {*} cates 
   * @param {*} newName     new name to add into US._Prec
   */
  setPrecByRelCates(cates=[], newName) {
    let mergedArr = this._mergeObjCates(this._Rels, cates);
    if (!mergedArr) return;

    this._appendPropToObj(this._Prec, newName);
    for (let i = mergedArr.length - 1; i >= 0; i--) {
      let x = mergedArr[i];
      let data = xtractLinkSingle(x);

      this._Prec[newName].push(data);
    }
  }
  mergeObjCatesToNew(obj, names, newCate) {
    obj[newCate] = this._mergeObjCates(obj, names);
    // obj[newCate] = obj[newCate].concat(this._mergeObjCates(this._Eles, names));
  }

  /**
   * This allows you to create Object with custom Properties from "ME._Nodes" 
   * The Object appending into the part of US, is different from those obtained
   * by "xtract" methods
   * @param {*} obj         the part of US that owns new type
   * @param {*} props       properties to extract
   * @param {*} newName     new type name 
   */
  createByNodesProps(obj, props, newName) {
    this._appendPropToObj(obj, newName);

    for (let i = this._ME._Nodes.length - 1; i >= 0; i--) {
      const e = this._ME._Nodes[i];
      let o = {};

      for (let j = 0; j < props.length; j++) {
        const ej = props[j];
        
        if (Object.hasOwnProperty.call(e, ej)) {
          o[ej] = e[ej];
        }
      }

      obj[newName].push(o);
    }
  }

  /**
   * This is usually used to divide an relation into 2 parts, etc:
   *    (from, to, text) => (from, text) AND (to, text)
   * @param {*} relCate   Specified category name 
   * @returns 
   */
  separateRelByCate(relCate){
    const links = this._Rels[relCate];
    if (!links) return;
    
    const sP = "source"+relCate;
    const tP = "target"+relCate;

    this._appendPropToObj(this._Rels, sP);
    this._appendPropToObj(this._Rels, tP);

    for (let i = links.length - 1; i >= 0; i--) {
      const lk = links[i];
      this._Rels[sP].push({ from: lk.from, text: lk.text });
      this._Rels[tP].push({ to: lk.to, text: lk.text });
    }
  }
} // end of UnifiedStructure class


function exportUSs(arr) {
  alert("Please wait a moment for downloading...");
  let blob = new Blob(arr, {
    type: "text/json; charset=utf-8"
  });
  saveAs(blob, "US from Diagram.json");   // [Object][Object]
}

/**
 * Entry for generating a US object by @param:<go.Diagram>
 * @param {Number} diagType     1: <go.DIagam>mySubDiagram, 子图的参数都是这个；
 *                              0: <go.DIagam>myUmlDiagram, 主图的参数 
 */
function usDiag(diagType) {
  let US = new UnifiedStructure(diagType == 1 ? mySubDiagram: myUmlDiagram);

  US.init();
  /* add your operations below */
  US.insertObjBySpecifiedLinkTexts(US._Rels);

  console.log(US);

  // let resArr = [];
  // resArr.push(US);
  // exportUSs(resArr);

  return US;
}
