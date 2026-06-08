import Phaser from 'phaser';
import { GAME_CONFIG, COLORS } from '../config/gameConfig';
import { ScoreManager } from '../utils/ScoreManager';

interface GameResult {
  score: number;
  maxCombo: number;
  timeLeft: number;
}

export class GameOverScene extends Phaser.Scene {
  private result!: GameResult;
  private rankMessage!: string;
  private isNewHighScore!: boolean;

  constructor() {
    super('GameOverScene');
  }

  init(data: GameResult): void {
    this.result = data || { score: 0, maxCombo: 0, timeLeft: 0 };
    this.rankMessage = ScoreManager.getRankMessage(this.result.score);
    const highScore = ScoreManager.getHighScore();
    this.isNewHighScore = this.result.score >= highScore && this.result.score > 0;
  }

  create(): void {
    const centerX = GAME_CONFIG.width / 2;

    this.add.rectangle(0, 0, GAME_CONFIG.width, GAME_CONFIG.height, 0x2c1810, 0.9)
      .setOrigin(0, 0);

    this.addConfetti();

    const titleText = this.isNewHighScore ? '🎉 新纪录！🎉' : '游戏结束';
    const title = this.add.text(centerX, 100, titleText, {
      fontSize: this.isNewHighScore ? '42px' : '48px',
      fontFamily: 'Microsoft YaHei',
      color: this.isNewHighScore ? '#ffd700' : '#ff6b6b',
      stroke: '#000000',
      strokeThickness: 6,
    }).setOrigin(0.5);

    if (this.isNewHighScore) {
      this.tweens.add({
        targets: title,
        scale: { from: 0.8, to: 1.1 },
        duration: 600,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }

    const scoreLabel = this.add.text(centerX, 180, '本次得分', {
      fontSize: '24px',
      fontFamily: 'Microsoft YaHei',
      color: '#cccccc',
    }).setOrigin(0.5);

    const scoreValue = this.add.text(centerX, 230, String(this.result.score), {
      fontSize: '72px',
      fontFamily: 'Microsoft YaHei',
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 8,
    }).setOrigin(0.5);

    this.tweens.add({
      targets: scoreValue,
      scale: { from: 0, to: 1 },
      duration: 500,
      ease: 'Back.easeOut',
    });

    const statsContainer = this.add.container(centerX, 340);

    const highScore = ScoreManager.getHighScore();
    const stats = [
      { label: '最高连击', value: `${this.result.maxCombo} 连`, color: '#ff6b6b' },
      { label: '最高分', value: String(highScore), color: '#ffd700' },
    ];

    stats.forEach((stat, i) => {
      const y = i * 50;
      const bg = this.add.rectangle(0, y, 350, 45, 0x4a2c1f, 0.8)
        .setOrigin(0.5);
      const label = this.add.text(-150, y, stat.label, {
        fontSize: '20px',
        fontFamily: 'Microsoft YaHei',
        color: '#cccccc',
      }).setOrigin(0, 0.5);
      const value = this.add.text(150, y, stat.value, {
        fontSize: '24px',
        fontFamily: 'Microsoft YaHei',
        color: stat.color,
        stroke: '#000000',
        strokeThickness: 2,
      }).setOrigin(1, 0.5);
      statsContainer.add([bg, label, value]);
    });

    const rankBg = this.add.rectangle(centerX, 470, 400, 80, 0x6b3a2a, 0.9)
      .setOrigin(0.5);

    this.add.text(centerX, 445, '🏆 战绩评价', {
      fontSize: '20px',
      fontFamily: 'Microsoft YaHei',
      color: '#ffd700',
    }).setOrigin(0.5);

    const rankText = this.add.text(centerX, 480, this.rankMessage, {
      fontSize: '22px',
      fontFamily: 'Microsoft YaHei',
      color: '#ffffff',
      align: 'center',
      wordWrap: { width: 380 },
    }).setOrigin(0.5);

    const restartBtn = this.add.text(centerX, 580, '再来一局', {
      fontSize: '32px',
      fontFamily: 'Microsoft YaHei',
      color: '#ffffff',
      backgroundColor: '#e74c3c',
      padding: { x: 50, y: 15 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    restartBtn.on('pointerover', () => {
      restartBtn.setStyle({ backgroundColor: '#c0392b' });
    });

    restartBtn.on('pointerout', () => {
      restartBtn.setStyle({ backgroundColor: '#e74c3c' });
    });

    restartBtn.on('pointerdown', () => {
      this.scene.start('GameScene');
    });

    const menuBtn = this.add.text(centerX, 650, '返回主菜单', {
      fontSize: '22px',
      fontFamily: 'Microsoft YaHei',
      color: '#cccccc',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    menuBtn.on('pointerover', () => {
      menuBtn.setStyle({ color: '#ffffff' });
    });

    menuBtn.on('pointerout', () => {
      menuBtn.setStyle({ color: '#cccccc' });
    });

    menuBtn.on('pointerdown', () => {
      this.scene.start('MenuScene');
    });

    this.input.keyboard?.on('keydown-SPACE', () => {
      this.scene.start('GameScene');
    });

    this.input.keyboard?.on('keydown-ENTER', () => {
      this.scene.start('GameScene');
    });

    this.input.keyboard?.on('keydown-ESC', () => {
      this.scene.start('MenuScene');
    });
  }

  private addConfetti(): void {
    const colors = [0xff4444, 0xffd700, 0x44ff44, 0x4444ff, 0xff44ff, 0x44ffff];

    const particles = this.add.particles(0, 0, 'particle', {
      x: { min: 0, max: GAME_CONFIG.width },
      y: -30,
      lifespan: 3000,
      speedY: { min: 80, max: 150 },
      speedX: { min: -30, max: 30 },
      angle: { min: -10, max: 10 },
      rotate: { min: 0, max: 360 },
      quantity: 1,
      scale: { start: 0.8, end: 0.2 },
      alpha: { start: 1, end: 0 },
      tint: colors,
      bounds: { x: 0, y: 0, w: GAME_CONFIG.width, h: GAME_CONFIG.height + 100 },
    });

    this.time.delayedCall(5000, () => {
      particles.stop();
    });
  }
}
