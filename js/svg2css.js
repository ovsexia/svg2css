/*
 * author: ovsexia
 * version: 1.2.0
 * describe: 将svg代码与css代码互相转换
 */

;function Svg2css(config)
{
  //默认参数
  var defaults = {
    color: "",   //初始颜色
  };

  obj = new Object();
  obj = (function(obj){
    obj.color = config.color ? config.color : defaults.color;
    return obj;
  })(obj);

  //主程序
  //type: css:svg转css  svg:css转svg
  obj.code = function(code,cutdown,type){
    if(cutdown==null){
      cutdown = true;
    }
    if(type==null || type==""){
      type = "css";
    }

    //去除无用信息 p-id
    code = code.replace(/p\-id\=\"[0-9]*\"/g,'');
    
    //把单引号转换为双引号
    code = code.replace(/\'/g,'"');

    //path
    reg = /path\s{1,}d\=\"[A-z0-9\s\.\-]*\"(\s{0,}fill\=\"(\#{0,1}[A-z0-9]*)?\")?/g;
    path = code.match(reg);
    if(!path){
      return false;
    }
    path_str = "";
    for(let i in path)
    {
      //d代码
      path_str += "%3E%3Cpath";
      reg = /d\=\"([A-z0-9\s\.\-]*)\"/;
      d = getReg(path[i],reg);
      //压缩
      if(cutdown===true){
        path_str += " d='"+cutlist(d)+"'";
      }else{
        path_str += " d='"+d+"'";
      }

      //填色
      if(this.color){
        fill = this.color;
      }else{
        reg = /fill\=\"(\#{0,1}[A-z0-9]*)?\"/;
        fill = getReg(path[i],reg);
      }
      path_str += " fill='"+fill+"'";

      path_str += "/";
    }

    add = new Array();
     //width
    reg = /width\=\"([0-9]*)\"/;
    add["width"] = getReg(code,reg);

    //height
    reg = /height\=\"([0-9]*)\"/;
    add["height"] = getReg(code,reg);

    if(type=="css"){
      var css = "data:image/svg+xml,%3Csvg";

      //viewBox
      reg = /viewBox\=\"([0-9\s]*)\"/;
      add["viewBox"] = getReg(code,reg,1);

      //xmlns
      add["xmlns"] ="http://www.w3.org/2000/svg";

      css = addfun(css,add);
      css += path_str;
      css += "%3E%3C/svg%3E";

      return css;
    }else if(type=="svg"){
      var svg = '<svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="'+add["width"]+'" height="'+add["height"]+'">';
      svg_arr = path_str.split("%3E%3C");
      for(let i in svg_arr)
      {
        if(svg_arr[i]){
          svg += '<'+svg_arr[i].replace(/\//g,'').replace(/\'/g,'"')+'></path>';
        }
      }
      svg += '</svg>';
      return svg;
    }
  };

  //计算压缩率
  obj.pernum = function(code){
    code_ori = this.code(code,false);
    code_com = this.code(code,true);
    code_ori_num = code_ori.length;
    code_com_num = code_com.length;
    pre = (code_ori_num - code_com_num)/code_ori_num*100;
    pre = pre.toFixed(2)+"%";
    return pre;
  };

  function addfun(str,array)
  {
    if(str && array){
      for(let i in array)
      {
        str += " "+i+"='"+array[i]+"'";
      }
      return str;
    }
  }

  function getReg(str,reg)
  {
    match = str.match(reg);
    if(match && match[1]){
      return match[1];
    }else{
      return "";
    }
  }

  //列表压缩
  function cutlist(d)
  {
    if(d){
      let arr = str2arr(d," ");
      let newarr = new Array();
      for(let i in arr)
      {
        nstr = cutdown(arr[i]);
        newarr.push(nstr);
      }
      newstr = newarr.join(" ");
      return newstr;
    }
  }

  //单个字符处理
  function round_single(str)
  {
    let arr = str2arr(str,".");
    let newarr = new Array();
    for(let i in arr)
    {
      if(i==0){
        newarr.push(arr[i]);
      }else{
        letter = arr[i].match(/[^0-9][A-z]*/g);
        if(letter!=null && letter.length>1){
          newarr.push(arr[i]);
        }else{
          match = arr[i].match(/([0-9]*)([A-z]*)([0-9]*)/);
          if(match[1].length>=3){
            match_1 = Number("1."+match[1]);
            match_1 = match_1.toFixed(1); //保留1位小数
            match_1 = match_1.split(".");
            num1 = match_1[1];
          }else{
            num1 = match[1];
          }

          match_num = num1+match[2]+match[3];
          newarr.push(match_num);
        }
      }
    }
    newstr = newarr.join(".");
    return newstr;
  }

  //列表字符处理
  function round_link(str)
  {
    let arr = str2arr(str,"-");
    let newarr = new Array();
    for(let i in arr)
    {
      nstr = round_single(arr[i]);
      newarr.push(nstr);
    }
    newstr = newarr.join("-");
    return newstr;
  }

  //单个压缩
  function cutdown(str)
  {
    let arr = str2arr(str,"-");
    //-号连接符类型  211.06521c-39.036245-39.722612-85.269714-71.26541-137.216891
    if(arr.length>1){
      str = round_link(str);
    }
    //单字符类型  455.241026[z]
    else{
      str = round_single(str);
    }
    return str;
  }

  function str2arr(str,mark)
  {
    str = ""+str+"";
    ifmark = str.indexOf(mark);
    let arr;
    if(ifmark==-1){
      arr = new Array();
      arr.push(str);
    }else{
      arr = str.split(mark);
    }
    return arr;
  }

  return obj;
}