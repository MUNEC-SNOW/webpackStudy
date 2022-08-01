import count from "./js/count";
import sum from "./js/sum";
import "./css/index.css";
import "./css/iconfont.css";
import "./less/index.less";
import "./scss/index.sass";
import "./scss/index.scss";
import "./styl/index.styl";

let res1 = count(2,1);
let res2 = sum(1,2,3,4);
console.log(res1);
console.log(res2);

if (module.hot) {
    module.hot.accept("./js/count.js", function (count) {
      const result1 = count(2, 1);
      console.log(result1);
    });
  
    module.hot.accept("./js/sum.js", function (sum) {
      const result2 = sum(1, 2, 3, 4);
      console.log(result2);
    });
  }