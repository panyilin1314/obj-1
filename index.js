function Tetris() {
  // 创建一个数据源
  this.MODELS = [
    //L型
    {
      0: {
        x: 1,
        y: 0
      },
      1: {
        x: 1,
        y: 1
      },
      2: {
        x: 1,
        y: 2
      },
      3: {
        x: 2,
        y: 2
      }
    },
    // 土字型
    {
      0: {
        x: 1,
        y: 1
      },
      1: {
        x: 0,
        y: 0
      },
      2: {
        x: 1,
        y: 0
      },
      3: {
        x: 2,
        y: 0
      }
    },
    // 田字型
    {
      0: {
        x: 1,
        y: 1
      },
      1: {
        x: 2,
        y: 1
      },
      2: {
        x: 1,
        y: 2
      },
      3: {
        x: 2,
        y: 2
      }
    },
    // 一字型
    {
      0: {
        x: 0,
        y: 0
      },
      1: {
        x: 0,
        y: 1
      },
      2: {
        x: 0,
        y: 2
      },
      3: {
        x: 0,
        y: 3
      }
    },
    // Z字型
    {
      0: {
        x: 1,
        y: 1
      },
      1: {
        x: 1,
        y: 2
      },
      2: {
        x: 2,
        y: 2
      },
      3: {
        x: 2,
        y: 3
      }
    }
  ]
  // 创建实列成员，保存当前渲染方块的数据源
  this.currentBox = null;
  // 获取box盒子
  this.box = document.querySelector('.box');
  // 设定步长
  this.STEP = 20;
  // 十六宫格的初始位置
  this.currentX = 0;
  this.currentY = 0;
  // 游戏行和列
  this.ROW = 30;
  this.COL = 20;
  // 保存当前活动的方块
  this.divs;
  // 保存固定盒子的对象
  this.fixBox = {};
  // 定时器变量
  this.timer = null;
  this.createEl();
  this.press();
}
// 1. 创建元素（方块）
Tetris.prototype.createEl = function () {
  // 先判断游戏是否结束
  if (this.isOver()) {
    clearInterval(this.timer);
    document.body.onkeydown = null;
    alert('游戏结束');
    return
  }
  // 重置十六宫格位置
  this.currentX = this.currentY = 0;
  // 随机数
  const random = Math.floor(Math.random() * this.MODELS.length)
  // 保存数据源
  this.currentBox = this.MODELS[random];
  // 循环数据源， 进行盒子创建
  for (let k in this.currentBox) {
    const div = document.createElement('div');
    // 添加到页面中
    this.box.appendChild(div);
    // 添加样式
    div.className = 'kuai';
  }
  // 设置位置
  this.location();
  // 自动下落
  this.autoDown();
}
// 2.设置方块的位置
Tetris.prototype.location = function () {
  // 获取页面的方块
  const divs = document.querySelectorAll('.kuai');
  // 保存到构造函数内， 方便其他函数使用
  this.divs = divs;
  // 循环设置偏移量
  for (let i = 0; i < divs.length; i++) {
    divs[i].style.left = (this.currentX + this.currentBox[i].x) * this.STEP + 'px';
    divs[i].style.top = (this.currentY + this.currentBox[i].y) * this.STEP + 'px';
  }
}
// 3. 让方块动起来（先注册键盘事件）
Tetris.prototype.press = function () {
  document.body.onkeydown = function (e) {
    const keyCode = e.keyCode;
    switch (keyCode) {
      case 37:
        // console.log('左');
        this.move(-1, 0);
        break;
      case 38:
        // console.log('上');
        this.rotate();
        break;
      case 39:
        // console.log('右');
        this.move(1, 0);
        break;
      case 40:
        // console.log('下');
        this.move(0, 1);
        break;
    }
  }.bind(this)
}
// 4. 让方块动起来
Tetris.prototype.move = function (x, y) {
  // 移动检查是否碰撞，如果碰撞则阻止下面代码执行
  if (this.isMeet(this.currentX + x, this.currentY + y, this.currentBox)) {
    console.log('发生触碰');
    // 如果按的是下键盘，触碰就固定盒子
    if (y == 1) {
      this.fix();
    }
    return
  }
  // 需要变量保存是六宫格的位置
  this.currentX += x;
  this.currentY += y;
  // 检查范围
  this.check();
  // 渲染盒子
  this.location();
}
// 5. 方块旋转
Tetris.prototype.rotate = function () {
  // 判断是否发生触碰， 假设交换位置之后， 通过触碰检查发现有冲突
  // 用一个新的对象保存数据源，去检查这个新对象是否有触碰
  const newCurrentBox = JSON.parse(JSON.stringify(this.currentBox));
  // 方块旋转之后的y值 是旋转前的x
  // 方块旋转之后的x值 是旋转前的 3 - y
  for (let k in newCurrentBox) {
    let temp = newCurrentBox[k].x;
    newCurrentBox[k].x = 3 - newCurrentBox[k].y;
    newCurrentBox[k].y = temp;
  }
  // 如果新对象，发生触碰
  if (this.isMeet(this.currentX, this.currentY, newCurrentBox)) {
    console.log('发生了触碰');
    return;
  }
  // 没有触碰，把新对象重新赋值给咱们数据源
  this.currentBox = newCurrentBox;
  // 越界检查
  this.check();
  // 渲染
  this.location();
}
// 6. 限定方块的移动范围
Tetris.prototype.check = function () {
  // 循环遍历数据源
  for (let k in this.currentBox) {
    // 左越界
    if (this.currentX + this.currentBox[k].x < 0) {
      // 右移动
      this.currentX++;
    }
    // 右越界
    if (this.currentX + this.currentBox[k].x >= this.COL) {
      // 左移动
      this.currentX--;
    }
    //下越界, 到了底部
    if (this.currentY + this.currentBox[k].y >= this.ROW) {
      // 左移动
      this.currentY--;
      // 固定盒子
      this.fix();
    }
  }
}
// 7. 让方块固定
Tetris.prototype.fix = function () {
  // 循环遍历方块
  for (let i = 0; i < this.divs.length; i++) {
    this.divs[i].className = 'fix';
    // 把固定盒子保存在一个对象里
    this.fixBox[(this.currentY + this.currentBox[i].y) + '-' + (this.currentX + this.currentBox[i].x)] = this.divs[i];
  }
  console.log(this.fixBox);
  // 盒子一旦固定，就查一次是否成行
  this.isLine();
  // 创建新的元素
  this.createEl();
}
// 8. 检查方块和固定的盒子是否发生冲突
Tetris.prototype.isMeet = function (x, y, model) {
  // 如果发生碰撞， 返回true
  for (let k in model) {
    // 拿方块的坐标去固定盒子内找， 如果找到了，说明发生触碰
    if (this.fixBox[(y + model[k].y) + '-' + (x + model[k].x)]) {
      return true;
    }
  }
}
// 9. 检查是否成行， 如果成行，删除这一行的节点
Tetris.prototype.isLine = function () {
  // 循环遍历每一行的每一列
  for (let i = 0; i < this.ROW; i++) {
    let flag = true;
    for (let j = 0; j < this.COL; j++) {
      // 如果这一列固定的盒子一个没找到，说明不成行, flag = false
      if (!this.fixBox[i + '-' + j]) {
        flag = false;
        break;
      }
    }
    // 这一行遍历结束，判断flag，如果是true, 说明成行
    if (flag) {
      // 成行要删除元素
      this.clearLine(i);
      // 让元素下落
      this.downLine(i);
    }
  }
}
// 10. 删除成行的元素
Tetris.prototype.clearLine = function (line) {
  for (let i = 0; i < this.COL; i++) {
    // 删除节点
    this.fixBox[line + '-' + i].remove();
    // 为了防止后面遍历出错， 删除成行的数据
    delete this.fixBox[line + '-' + i];
  }
}
// 11. 让删除行之上的元素下落
Tetris.prototype.downLine = function (line) {
  // 遍历成行之上的所有固定元素
  for (let i = line - 1; i >= 0; i--) {
    for (let j = 0; j < this.COL; j++) {
      // 先判断当前列有没有元素, 没有元素就继续，不能设置top
      if (!this.fixBox[i + '-' + j]) continue;
      // 如果有元素,让元素下落
      this.fixBox[i + '-' + j].style.top = (i + 1) * this.STEP + 'px';
      // 修改固定盒子的位置信息
      this.fixBox[(i + 1) + '-' + j] = this.fixBox[i + '-' + j];
      // 删除原来下落前盒子
      delete this.fixBox[i + '-' + j];
    }
  }
}
// 12. 游戏是否结束
Tetris.prototype.isOver = function () {
  // 方块固定住之后， 看看第0行是有固定的盒子
  for (let i = 0; i < this.COL; i++) {
    if (this.fixBox[0 + '-' + i]) {
      return true
    }
  }
}
// 13. 让盒子自动下落
Tetris.prototype.autoDown = function () {
  if (this.timer) clearInterval(this.timer);
  // 开定时器
  this.timer = setInterval(() => {
    this.move(0, 1);
  }, 300)
}