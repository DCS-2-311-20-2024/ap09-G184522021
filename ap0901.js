//
// 応用プログラミング 第9,10回 自由課題 (ap0901.js)
// G184522021 鈴木麟音
//
"use strict"; // 厳格モード

// ライブラリをモジュールとして読み込む
import * as THREE from "three";
import { GUI } from "ili-gui";


// ３Ｄページ作成関数の定義
function init() {
  // 制御変数の定義
  const param = {
    axes: true, // 座標軸
  };

  // GUIコントローラの設定
  const gui = new GUI();
  gui.add(param, "axes").name("座標軸");

  // シーン作成
  const scene = new THREE.Scene();

  // 座標軸の設定
  const axes = new THREE.AxesHelper(18);
  scene.add(axes);

  // カメラの作成
  const camera = new THREE.PerspectiveCamera(
    50,window.innerHeight/window.innerWidth, 0.1, 400);
  camera.position.set(0,0,10);
  camera.lookAt(0,0,0);

  // レンダラの設定
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerHeight*0.75, innerWidth);
    document.getElementById("output").appendChild(renderer.domElement);

  // 描画処理
  let score = 0; // スコアの初期値
  let life = 3;  // ライフの初期値

function setScoreAndLife() {
  document.getElementById("score").innerText = String(Math.round(score)).padStart(8, "0");
  document.getElementById("life").innerText = (life > 0)
    ? "〇〇〇".substring(0, life)
    : "--- Game Over---";
}
  
  // プレイヤーの宇宙船
  let player;
  function createPlayer() {
    const material = new THREE.LineBasicMaterial({ color: 0xffffff }); //オブジェクトを使用して線を描画する

    // 宇宙船の先端部分
    const coneGeometry = new THREE.ConeGeometry(0.125, 0.5, 32);
    const cone = new THREE.LineSegments(new THREE.EdgesGeometry(coneGeometry), material);

    // 宇宙船の中央部分
    const discGeometry = new THREE.CylinderGeometry(0.25, 0.25, 0.075,  32);
    const disc = new THREE.LineSegments(new THREE.EdgesGeometry(discGeometry), material);// 線を生成する元になるgeometry
    disc.position.y = -0.25; 

    player = new THREE.Object3D();
    player.add(cone);
    player.add(disc);
    player.rotation.x = Math.PI / 2; 
    player.position.y = -3;
    scene.add(player);
  }
  //宇宙の背景を作成
  // 宇宙背景を作成 
 function createBackgroundStars() {
   const starMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
   for (let i = 0; i < 200; i++) {
       const starGeometry = new THREE.SphereGeometry(0.1, 8, 8);
       const star = new THREE.Mesh(starGeometry, starMaterial);
       star.position.set(
           (Math.random() - 0.5) * 100, // X座標
           (Math.random() - 0.5) * 100, // Y座標
           (Math.random() - 0.5) * 100  // Z座標
       );
       scene.add(star);
   }
 }
 // 弾丸を作成
 const bullets = [];
 function createBullet() {
   const bulletGeometry = new THREE.SphereGeometry(0.1, 8, 8);
   const bulletMaterial = new THREE.LineBasicMaterial({ color: 0xffff00 });
   const bullet = new THREE.LineSegments(new THREE.EdgesGeometry(bulletGeometry), bulletMaterial);
   bullet.position.set(player.position.x, player.position.y, player.position.z);
   bullets.push(bullet);
   scene.add(bullet);
 }
 // 敵を生成
 const enemies = [];
  function createEnemy() {
    const enemyGeometry = new THREE.BoxGeometry(0.25, 0.25, 0.25);
    const enemyMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const enemy = new THREE.Mesh(enemyGeometry, enemyMaterial);
    enemy.position.set((Math.random() - 0.5) * 20, 10, 0);
    enemies.push(enemy);
    scene.add(enemy);
  }
  // マウス操作でプレイヤー移動
  let mouseX = 0; 
  document.addEventListener('mousemove', (event) => {
    const mouseXNormalized = (event.clientX / window.innerWidth) * 2 - 1;  
    mouseX = mouseXNormalized * 10;  
  });
  // 弾丸移動
  function updateBullets() {
    bullets.forEach((bullet, index) => {
      bullet.position.y += 0.3; // 弾丸のスピードを調整
      if (bullet.position.y > 20) {
        scene.remove(bullet);
        bullets.splice(index, 1);
      }
    });
  }
  // 敵移動
  function updateEnemies() {
    enemies.forEach((enemy, index) => {
      enemy.position.y -= 0.02; // 落下速度
  
      // 宇宙船との衝突判定
      const distanceToPlayer = enemy.position.distanceTo(player.position);
      if (distanceToPlayer < 0.5) { //衝突判定
        scene.remove(enemy); // 敵をシーンから削除
        enemies.splice(index, 1); // 敵を配列から削除
  
        life -= 1; // ライフを1減らす
        setScoreAndLife(); // ライフの表示を更新
  
        if (life <= 0) {
          console.log("Game Over");
          stopGame();
        }
        return; // 衝突した敵はこれ以上処理しない
      }
  
      // 敵が画面下に到達した場合の処理
      if (enemy.position.y < -20) {
        scene.remove(enemy);
        enemies.splice(index, 1);
      }
    });
  }
        //弾丸と敵の衝突判定
    function checkCollisions() {
      bullets.forEach((bullet, bulletIndex) => {
        enemies.forEach((enemy, enemyIndex) => {
          const distance = bullet.position.distanceTo(enemy.position);
          if (distance < 1) { // 衝突判定
            scene.remove(bullet);// 弾丸をシーンから削除
            scene.remove(enemy);// 敵をシーンから削除
            bullets.splice(bulletIndex, 1);// 弾丸を配列から削除
            enemies.splice(enemyIndex, 1);// 敵を配列から削除
            score += 100; // スコアを増加
            setScoreAndLife(); // スコアとライフの表示を更新
          }
        });
      });
    }
    function stopGame() {
      gameOver = true;  // ゲームオーバーフラグを立てる
    
      // アニメーションフレームの停止
      cancelAnimationFrame(animationFrameId);
    
      // 敵の生成を停止
      clearInterval(enemyIntervalId);
    
      // 入力イベントの無効化（キー操作、マウス操作）
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('mousemove', onMouseMove);
    }
    


  // 描画関数
  function render() {
    // プレイヤーの位置更新（マウスX座標に基づく）
    player.position.x = mouseX;
    // 座標軸の表示
    axes.visible = param.axes;
    // 弾丸と敵の更新
    updateBullets();
    updateEnemies();
    checkCollisions()
    // 描画
    renderer.render(scene, camera);
    // 次のフレームでの描画要請
    requestAnimationFrame(render);
  }
  //初期化
  createPlayer();
  createBackgroundStars();

  // スペースキーで弾を発射
  document.addEventListener('keydown', (event) => {
    if (event.key === ' ') {
      createBullet();
    }
  });

  // 敵を一定間隔で生成
  setInterval(createEnemy, 2000);
  // 描画開始
  render();
}

init();