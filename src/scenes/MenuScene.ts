import Phaser from 'phaser';
import { GAME_CONFIG, COLORS } from '../config/gameConfig';
import { ScoreManager } from '../utils/ScoreManager';

export class MenuScene extends Phaser.Scene {
  private startButton!: Phaser.GameObjects.Text;
  private highScoreText!: Phaser.GameObjects.Text;

  constructor() {
    super('MenuScene');
  }

  create(): void {
    const centerX = GAME_CONFIG.width / 2;
    const centerY = GAME_CONFIG.height / 2;

    this.add.rectangle(0, 0, GAME_CONFIG.width, GAME_CONFIG.height, 0x3d2317)
      .setOrigin(0, 0);

    this.addParticles();

    const title = this.add.text(centerX, 120, '抢红包大作战', {
      fontSize: '48px',
      fontFamily: 'Microsoft YaHei',
      color: '#ffd700',
      stroke: '#cc0000',
      strokeThickness: 6,
    }).setOrigin(0.5);

    this.tweens.add({
      targets: title,
      scale: { from: 1, to: 1.05 },
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    const subtitle = this.add.text(centerX, 180, '练手小游戏', {
      fontSize: '24px',
      fontFamily: 'Microsoft YaHei',
      color: '#ffffff',
    }).setOrigin(0.5);

    const instructions = [
      '← → 或 A D 键控制福袋移动',
      '触屏设备：左右滑动或点击两侧',
      '接红包得分，躲炸弹，60秒限时',
      '连击越多，得分越高！',
    ];

    instructions.forEach((text, i) => {
      this.add.text(centerX, 260 + i * 35, text, {
        fontSize: '18px',
        fontFamily: 'Microsoft YaHei',
        color: '#cccccc',
      }).setOrigin(0.5);
    });

    const highScore = ScoreManager.getHighScore();
    this.highScoreText = this.add.text(centerX, 420, `最高分: ${highScore}`, {
      fontSize: '28px',
      fontFamily: 'Microsoft YaHei',
      color: '#ffd700',
    }).setOrigin(0.5);

    this.startButton = this.add.text(centerX, 500, '开始游戏', {
      fontSize: '36px',
      fontFamily: 'Microsoft YaHei',
      color: '#ffffff',
      backgroundColor: '#e74c3c',
      padding: { x: 40, y: 15 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    this.startButton.on('pointerover', () => {
      this.startButton.setStyle({ backgroundColor: '#c0392b' });
    });

    this.startButton.on('pointerout', () => {
      this.startButton.setStyle({ backgroundColor: '#e74c3c' });
    });

    this.startButton.on('pointerdown', () => {
      this.scene.start('GameScene');
    });

    this.input.keyboard?.on('keydown-SPACE', () => {
      this.scene.start('GameScene');
    });

    this.input.keyboard?.on('keydown-ENTER', () => {
      this.scene.start('GameScene');
    });
  }

  private addParticles(): void {
    const particles = this.add.particles(0, 0, 'packet_small', {
      x: { min: 0, max: GAME_CONFIG.width },
      y: -50,
      lifespan: 4000,
      speedY: { min: 30, max: 60 },
      speedX: { min: -20, max: 20 },
      angle: { min: -15, max: 15 },
      rotate: { min: 0, max: 360 },
      quantity: 0.3,
      scale: { start: 0.5, end: 0.3 },
      alpha: { start: 0.6, end: 0.2 },
    });

    particles.setDepth(-1);
  }
}
