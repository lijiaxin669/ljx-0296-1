import Phaser from 'phaser';
import { GAME_CONFIG, RED_PACKET_TYPES, COLORS } from '../config/gameConfig';
import { ScoreManager } from '../utils/ScoreManager';
import { GameState, RedPacketConfig } from '../types';

interface FallingItem extends Phaser.Physics.Arcade.Sprite {
  itemType?: 'redpacket' | 'bomb';
  packetConfig?: RedPacketConfig;
  baseScore?: number;
}

export class GameScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keyA!: Phaser.Input.Keyboard.Key;
  private keyD!: Phaser.Input.Keyboard.Key;
  private items!: Phaser.Physics.Arcade.Group;
  private gameState!: GameState;
  private scoreText!: Phaser.GameObjects.Text;
  private timeText!: Phaser.GameObjects.Text;
  private comboText!: Phaser.GameObjects.Text;
  private heartsContainer!: Phaser.GameObjects.Container;
  private gameTimer!: Phaser.Time.TimerEvent;
  private spawnTimer!: Phaser.Time.TimerEvent;
  private comboTimer!: Phaser.Time.TimerEvent | null;
  private lastComboTime!: number;
  private isGameActive!: boolean;
  private pointerActive!: { left: boolean; right: boolean };
  private touchStartX!: number;

  constructor() {
    super('GameScene');
  }

  init(): void {
    this.gameState = {
      score: 0,
      lives: GAME_CONFIG.maxLives,
      combo: 0,
      maxCombo: 0,
      timeLeft: GAME_CONFIG.gameDuration,
      difficulty: 0,
      isPaused: false,
    };
    this.comboTimer = null;
    this.lastComboTime = 0;
    this.isGameActive = true;
    this.pointerActive = { left: false, right: false };
  }

  create(): void {
    this.addBackground();
    this.createPlayer();
    this.createUI();
    this.createFallingItems();
    this.setupCollisions();
    this.setupInput();
    this.startGameLoop();
  }

  private addBackground(): void {
    this.add.rectangle(0, 0, GAME_CONFIG.width, GAME_CONFIG.height, 0x3d2317).setOrigin(0, 0);

    const graphics = this.add.graphics();
    for (let i = 0; i < 50; i++) {
      const x = Phaser.Math.Between(0, GAME_CONFIG.width);
      const y = Phaser.Math.Between(0, GAME_CONFIG.height);
      const size = Phaser.Math.Between(2, 6);
      graphics.fillStyle(0x4a2c1f, 0.4);
      graphics.fillCircle(x, y, size);
    }
  }

  private createPlayer(): void {
    this.player = this.physics.add.sprite(
      GAME_CONFIG.width / 2,
      GAME_CONFIG.height - 80,
      'player'
    );
    this.player.setScale(0.9);
    this.player.setCollideWorldBounds(true);
    this.player.setDepth(10);
    this.player.setImmovable(true);
  }

  private createUI(): void {
    const uiY = 20;

    this.scoreText = this.add.text(20, uiY, '得分: 0', {
      fontSize: '24px',
      fontFamily: 'Microsoft YaHei',
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0, 0);

    this.timeText = this.add.text(GAME_CONFIG.width - 20, uiY, `时间: ${GAME_CONFIG.gameDuration}s`, {
      fontSize: '24px',
      fontFamily: 'Microsoft YaHei',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(1, 0);

    this.comboText = this.add.text(GAME_CONFIG.width / 2, uiY, '', {
      fontSize: '28px',
      fontFamily: 'Microsoft YaHei',
      color: '#ff6b6b',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5, 0);

    this.heartsContainer = this.add.container(20, 60);
    this.updateHearts();
  }

  private updateHearts(): void {
    this.heartsContainer.removeAll(true);
    for (let i = 0; i < this.gameState.lives; i++) {
      const heart = this.add.image(i * 35, 0, 'heart');
      heart.setScale(0.9);
      this.heartsContainer.add(heart);
    }
  }

  private createFallingItems(): void {
    this.items = this.physics.add.group({
      defaultKey: 'packet_small',
      maxSize: 30,
    });
  }

  private setupCollisions(): void {
    this.physics.add.overlap(
      this.player,
      this.items,
      (obj1, obj2) => this.handleCollision(obj1 as Phaser.GameObjects.GameObject, obj2 as Phaser.GameObjects.GameObject),
      undefined,
      this
    );
  }

  private setupInput(): void {
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.keyA = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyD = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (!this.isGameActive) return;
      this.touchStartX = pointer.x;
      if (pointer.x < GAME_CONFIG.width / 2) {
        this.pointerActive.left = true;
        this.pointerActive.right = false;
      } else {
        this.pointerActive.right = true;
        this.pointerActive.left = false;
      }
    });

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (!this.isGameActive) return;
      if (pointer.isDown) {
        const deltaX = pointer.x - this.touchStartX;
        if (Math.abs(deltaX) > 10) {
          this.pointerActive.left = deltaX < 0;
          this.pointerActive.right = deltaX > 0;
          this.touchStartX = pointer.x;
        }
      }
    });

    this.input.on('pointerup', () => {
      this.pointerActive.left = false;
      this.pointerActive.right = false;
    });

    this.input.on('pointerupoutside', () => {
      this.pointerActive.left = false;
      this.pointerActive.right = false;
    });
  }

  private startGameLoop(): void {
    this.gameTimer = this.time.addEvent({
      delay: 1000,
      callback: this.updateGameTime,
      callbackScope: this,
      loop: true,
    });

    this.scheduleNextSpawn();
  }

  private scheduleNextSpawn(): void {
    const progress = 1 - this.gameState.timeLeft / GAME_CONFIG.gameDuration;
    const difficulty = Math.min(progress, 1);
    this.gameState.difficulty = difficulty;

    const spawnInterval = Phaser.Math.Linear(
      GAME_CONFIG.initialSpawnInterval,
      GAME_CONFIG.minSpawnInterval,
      difficulty
    );

    this.spawnTimer = this.time.delayedCall(
      spawnInterval, this.spawnItem, [], this);
  }

  private spawnItem(): void {
    if (!this.isGameActive) return;

    const difficulty = this.gameState.difficulty;
    const bombChance = Phaser.Math.Linear(
      GAME_CONFIG.bombBaseChance,
      GAME_CONFIG.maxBombChance,
      difficulty
    );

    const isBomb = Math.random() < bombChance;

    let item: FallingItem;
    const textureKey = isBomb ? 'bomb' : '';

    item = this.items.get(
      Phaser.Math.Between(40, GAME_CONFIG.width - 40),
      -50
    ) as FallingItem;

    if (!item) return;

    if (isBomb) {
      item.setTexture('bomb');
      item.itemType = 'bomb';
      item.packetConfig = undefined;
      item.baseScore = undefined;
    } else {
      const packetType = this.selectRedPacketType();
      item.setTexture(`packet_${packetType.type}`);
      item.itemType = 'redpacket';
      item.packetConfig = packetType;
      item.baseScore = packetType.score;
    }

    item.setActive(true);
    item.setVisible(true);
    item.setAngle(0);
    if (item.body) {
      item.body.reset(item.x, item.y);
      item.body.enable = true;
    }
    item.setScale(isBomb ? 1 : 1);

    const fallSpeed = Phaser.Math.Linear(
      GAME_CONFIG.initialFallSpeed,
      GAME_CONFIG.maxFallSpeed,
      difficulty
    ) * Phaser.Math.FloatBetween(0.85, 1.15);

    item.setVelocityY(fallSpeed);
    item.setVelocityX(Phaser.Math.FloatBetween(-30, 30));
    item.setAngularVelocity(Phaser.Math.FloatBetween(-50, 50));

    this.scheduleNextSpawn();
  }

  private selectRedPacketType(): RedPacketConfig {
    const totalWeight = RED_PACKET_TYPES.reduce((sum, p) => sum + p.weight, 0);
    let random = Math.random() * totalWeight;
    for (const packet of RED_PACKET_TYPES) {
      random -= packet.weight;
      if (random <= 0) {
        return packet;
      }
    }
    return RED_PACKET_TYPES[0];
  }

  private handleCollision(
    _player: Phaser.GameObjects.GameObject,
    item: Phaser.GameObjects.GameObject
  ): void {
    const fallingItem = item as FallingItem;
    if (!fallingItem.active) return;

    if (fallingItem.itemType === 'redpacket') {
      this.collectRedPacket(fallingItem);
    } else if (fallingItem.itemType === 'bomb') {
      this.hitBomb(fallingItem);
    }

    fallingItem.setActive(false);
    fallingItem.setVisible(false);
    const body = fallingItem.body as Phaser.Physics.Arcade.Body | null;
    if (body) {
      body.stop();
    }
  }

  private collectRedPacket(item: FallingItem): void {
    const now = this.time.now;

    if (now - this.lastComboTime < GAME_CONFIG.comboTimeout) {
      this.gameState.combo++;
    } else {
      this.gameState.combo = 1;
    }
    this.lastComboTime = now;

    if (this.gameState.combo > this.gameState.maxCombo) {
      this.gameState.maxCombo = this.gameState.combo;
    }

    const baseScore = item.baseScore || 10;
    const comboBonus = Math.floor(baseScore * this.gameState.combo * GAME_CONFIG.comboBonusMultiplier);
    const totalScore = baseScore + comboBonus;
    this.gameState.score += totalScore;

    this.updateScore();
    this.showCombo();
    this.showScorePopup(item.x, item.y, totalScore);

    this.cameras.main.shake(100, 0.005);

    this.resetComboTimer();

    const color = item.packetConfig?.color || 0xff4444;
    this.add.particles(item.x, item.y, 'particle', {
      speedY: { min: 50, max: 150 },
      speedX: { min: -100, max: 100 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.5, end: 0 },
      lifespan: 400,
      quantity: 10,
      tint: color,
    });
  }

  private hitBomb(item: FallingItem): void {
    this.gameState.lives--;
    this.gameState.combo = 0;
    this.updateHearts();
    this.updateComboDisplay();

    this.cameras.main.shake(300, 0.03);
    this.cameras.main.flash(200, 255, 0, 0);

    this.add.particles(item.x, item.y, 'particle', {
      speedY: { min: 100, max: 200 },
      speedX: { min: -150, max: 150 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.6, end: 0 },
      lifespan: 500,
      quantity: 20,
      tint: 0xff4444,
    });

    if (this.gameState.lives <= 0) {
      this.endGame();
    }
  }

  private showCombo(): void {
    if (this.gameState.combo >= GAME_CONFIG.comboDisplayThreshold) {
      this.tweens.add({
        targets: this.player,
        scale: { from: 1, to: 1.15 },
        duration: 150,
        yoyo: true,
        ease: 'Back.easeOut',
      });
    }
    this.updateComboDisplay();
  }

  private updateComboDisplay(): void {
    if (this.gameState.combo >= GAME_CONFIG.comboDisplayThreshold) {
      this.comboText.setText(`${this.gameState.combo} 连击!`);
      this.comboText.setAlpha(1);

      this.tweens.add({
        targets: this.comboText,
        scale: { from: 1.2, to: 1 },
        duration: 200,
        ease: 'Back.easeOut',
      });
    } else {
      this.comboText.setText('');
    }
  }

  private resetComboTimer(): void {
    if (this.comboTimer) {
      this.comboTimer.remove();
    }
    this.comboTimer = this.time.delayedCall(
      GAME_CONFIG.comboTimeout,
      () => {
        this.gameState.combo = 0;
        this.updateComboDisplay();
      },
      [],
      this
    );
  }

  private showScorePopup(x: number, y: number, score: number): void {
    const popup = this.add.text(x, y, `+${score}`, {
      fontSize: '24px',
      fontFamily: 'Microsoft YaHei',
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);

    this.tweens.add({
      targets: popup,
      y: y - 50,
      alpha: { from: 1, to: 0 },
      scale: { from: 1, to: 1.5 },
      duration: 800,
      ease: 'Cubic.Out',
      onComplete: () => popup.destroy(),
    });
  }

  private updateScore(): void {
    this.scoreText.setText(`得分: ${this.gameState.score}`);
    this.tweens.add({
      targets: this.scoreText,
      scale: { from: 1.1, to: 1 },
      duration: 150,
      ease: 'Back.easeOut',
    });
  }

  private updateGameTime(): void {
    if (!this.isGameActive) return;

    this.gameState.timeLeft--;
    this.timeText.setText(`时间: ${this.gameState.timeLeft}s`);

    if (this.gameState.timeLeft <= 10) {
      this.timeText.setColor('#ff4444');
      this.tweens.add({
        targets: this.timeText,
        scale: { from: 1.1, to: 1 },
        duration: 200,
        yoyo: true,
        repeat: -1,
      });
    }

    if (this.gameState.timeLeft <= 0) {
      this.endGame();
    }
  }

  update(): void {
    if (!this.isGameActive) return;

    let velocityX = 0;

    if (this.cursors.left.isDown || this.keyA.isDown || this.pointerActive.left) {
      velocityX = -GAME_CONFIG.playerSpeed * 60;
    } else if (this.cursors.right.isDown || this.keyD.isDown || this.pointerActive.right) {
      velocityX = GAME_CONFIG.playerSpeed * 60;
    }

    this.player.setVelocityX(velocityX);

    if (velocityX < 0) {
      this.player.setAngle(-8);
    } else if (velocityX > 0) {
      this.player.setAngle(8);
    } else {
      this.player.setAngle(0);
    }

    this.children.each((child) => {
      const item = child as FallingItem;
      if (item.active && item.y > GAME_CONFIG.height + 100) {
        item.setActive(false);
        item.setVisible(false);
        if (item.body) {
          item.body.stop();
        }
      }
      return null;
    });
  }

  private endGame(): void {
    this.isGameActive = false;

    if (this.gameTimer) this.gameTimer.remove();
    if (this.spawnTimer) this.spawnTimer.remove();
    if (this.comboTimer) this.comboTimer.remove();

    ScoreManager.saveScore(this.gameState.score, this.gameState.maxCombo);

    this.items.children.each((child) => {
      const item = child as FallingItem;
      if (item.body) {
        item.body.stop();
      }
      return null;
    });

    this.time.delayedCall(500, () => {
      this.scene.start('GameOverScene', {
        score: this.gameState.score,
        maxCombo: this.gameState.maxCombo,
        timeLeft: this.gameState.timeLeft,
      });
    }, [], this);
  }
}
