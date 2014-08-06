/*@author Mingli Guo (guomilo@gmail.com)
 * @Date 2014-03-12 
 */
define("src/tools/log",["./util"],function(a){function b(){function a(){return b.instance=this,this.write=function(){if(0!=window.debugMode)if(1==window.debugMode)for(var a in arguments)throw new Error(arguments[a]);else if(2==window.debugMode){for(var a in arguments)console.log(arguments[a]);console.log("")}else for(var a in arguments)alert(arguments[a])},this}return"undefined"==typeof b.instance?a.apply(this):b.instance}a("./util");return window.debugMode=2,new b});