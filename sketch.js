// --- 全局变量 ---
let mic;
let vol = 0;
let smoothedVol = 0; // 用于平滑处理音量，减少抖动

// 存放三组动画的数组
let firstImages = []; // 开头待机动画
let guessImages = []; // 主交互动画（帘子）
let endImages = [];   // 结尾动画

// --- 状态控制变量 ---
let state = "intro"; // 可选状态: "intro", "main", "end"
let currentFrame = 0;
let lastFrameTime = 0;

// --- 动画速度控制 (数值越大，播放越慢) ---
const introFrameSpeed = 250; // 开头动画速度
const endFrameSpeed = 130;   // 结尾动画速度

// --- 麦克风灵敏度控制 ---
const micThreshold = 0.1;      // 判定交互开始的最低音量
// 2. 调整了最大吹气音量。将这个值调高，意味着你需要用更大的力气才能把帘子吹到最高，
// 从而实现了“分级”的效果，让轻吹和重吹有明显区别。你可以根据麦克风灵敏度调整这个值。
const maxBlowVolume = 1;      // 吹气要达到这个音量才能把帘子吹到最高

function preload() {
  // 加载开头动画
  for (let i = 1; i <= 19; i++) {
    let filename = `first-${String(i).padStart(2, '0')}.png`;
    firstImages.push(loadImage(filename));
  }

  // 加载主交互动画（帘子）
  for (let i = 1; i <= 15; i++) {
    let filename = `guess-${String(i).padStart(2, '0')}.png`;
    guessImages.push(loadImage(filename));
  }

  // 加载结尾动画
  for (let i = 1; i <= 9; i++) {
    let filename = `end-${String(i).padStart(2, '0')}.png`;
    endImages.push(loadImage(filename));
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  mic = new p5.AudioIn();
  mic.start();
  imageMode(CENTER);
}

function draw() {
  background(255);
  // 3. 使用 lerp 函数对音量进行平滑处理，能有效过滤瞬间的杂音
  vol = mic.getLevel();
  smoothedVol = lerp(smoothedVol, vol, 0.2);
  
  let now = millis();

  // --- 状态机逻辑 ---

  if (state === "intro") {
    // 状态一：播放开头/待机动画
    if (now - lastFrameTime > introFrameSpeed) {
      currentFrame = (currentFrame + 1) % firstImages.length;
      lastFrameTime = now;
    }
    showImage(firstImages[currentFrame]);

    // 如果检测到吹气，则切换到主交互状态
    if (smoothedVol > micThreshold) {
      state = "main";
      currentFrame = 0; // 重置帧计数器
    }
  } 

  else if (state === "main") {
    // 状态二：主交互过程，根据吹气强度显示帘子高度
    let frameIndex = map(smoothedVol, micThreshold, maxBlowVolume, 0, guessImages.length - 1, true);
    currentFrame = floor(frameIndex);
    
    showImage(guessImages[currentFrame]);

    // 如果帘子被吹到最高（即动画播放到最后一帧），则切换到结尾动画状态
    if (currentFrame >= guessImages.length - 1) {
      state = "end";
      currentFrame = 0; // 为结尾动画重置帧数
      lastFrameTime = now;
    }
    
    // 如果停止吹气，则回到待机状态
    if (smoothedVol < micThreshold) {
        state = "intro";
        currentFrame = 0;
    }
  } 

  else if (state === "end") {
    // 状态三：播放结尾动画
    if (now - lastFrameTime > endFrameSpeed) {
      currentFrame++;
      lastFrameTime = now;
    }
    
    // 4. 修复了结尾动画的循环逻辑
    // 检查动画是否播放完毕
    if (currentFrame >= endImages.length) {
      // 如果是，则重置状态，下一帧将播放开头动画
      state = "intro";
      currentFrame = 0;
    } else {
      // 如果还没结束，则显示当前结尾动画的帧
      showImage(endImages[currentFrame]);
    }
  }
}

// 居中缩放显示图像
  if (img && img.width > 0) {
    let scaleFactor = min(width / img.width, height / img.height) * 0.98; // 缩放因子，留出边距
    let w = img.width * scaleFactor;
    let h = img.height * scaleFactor;
    image(img, width / 2, height / 2, w, h);
  }
}
