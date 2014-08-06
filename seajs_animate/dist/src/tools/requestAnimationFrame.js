/*@author Mingli Guo (guomilo@gmail.com)
 * @Date 2014-03-12 
 */
define("src/tools/requestAnimationFrame",[],function(){for(var a,b=["ms","moz","webkit","o"],c=0;c<b.length&&!window.requestAnimationFrame;++c)window.requestAnimationFrame=window[b[c]+"RequestAnimationFrame"],window.cancelAnimationFrame=window[b[c]+"CancelAnimationFrame"]||window[b[c]+"CancelRequestAnimationFrame"];window.requestAnimationFrame||(window.requestAnimationFrame=function(b){a=setTimeout(b,16)}),window.cancelAnimationFrame||(window.cancelAnimationFrame=function(a){clearTimeout(a)})});