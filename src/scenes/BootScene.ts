import Phaser from 'phaser';
import { GAME_CONFIG, COLORS, RED_PACKET_TYPES } from '../config/gameConfig';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload(): void {
    this.load.on('complete', () => {
      this.scene.start('MenuScene');
    });
  }

  create(): void {
    this.createParticleTexture();
    this.createPlayerTexture();
    this.createRedPacketTextures();
    this.createBombTexture();
    this.createHeartTexture();
  }

  private createParticleTexture(): void {
    const graphics = this.make.graphics({ x: 0, y: 0 });
    graphics.fillStyle(0xffffff);
    graphics.beginPath();
    graphics.arc(8, 8, 6, 0, Math.PI * 2);
    graphics.fillPath();
    graphics.generateTexture('particle', 16, 16);
    graphics.destroy();
  }

  private createPlayerTexture(): void {
    const w = 90;
    const h = 90;
    const cx = w / 2;
    const cy = h / 2;

    const graphics = this.make.graphics({ x: 0, y: 0 });
    graphics.fillStyle(COLORS.player);
    graphics.lineStyle(4, COLORS.playerOutline, 1);
    graphics.beginPath();
    graphics.moveTo(cx - 40, cy - 30);
    graphics.lineTo(cx + 40, cy - 30);
    graphics.lineTo(cx + 40, cy + 20);
    graphics.lineTo(cx + 25, cy + 35);
    graphics.lineTo(cx - 25, cy + 35);
    graphics.lineTo(cx - 40, cy + 20);
    graphics.closePath();
    graphics.fillPath();
    graphics.strokePath();
    graphics.fillStyle(COLORS.playerOutline);
    graphics.fillRect(cx - 15, cy - 35, 30, 10);

    const rt = this.make.renderTexture({ x: w / 2, y: h / 2, width: w, height: h });
    rt.draw(graphics);
    rt.saveTexture('player');

    graphics.destroy();
    rt.destroy();
  }

  private createRedPacketTextures(): void {
    for (const packet of RED_PACKET_TYPES) {
      const size = packet.size;
      const w = size + 10;
      const h = size * 1.3 + 10;
      const cx = w / 2;
      const cy = h / 2;

      const graphics = this.make.graphics({ x: 0, y: 0 });
      graphics.fillStyle(packet.color);
      graphics.lineStyle(3, 0xcc0000, 1);
      graphics.fillRoundedRect(cx - size / 2, cy - size * 0.65, size, size * 1.3, 6);
      graphics.strokeRoundedRect(cx - size / 2, cy - size * 0.65, size, size * 1.3, 6);
      graphics.fillStyle(0xffcc00);
      graphics.fillCircle(cx, cy - size * 0.2, size * 0.2);

      const label = this.add.text(cx, cy + size * 0.1, packet.label, {
        fontSize: `${size * 0.4}px`,
        fontFamily: 'Microsoft YaHei',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 2,
      }).setOrigin(0.5);

      const scoreLabel = this.add.text(cx, cy + size * 0.45, `${packet.score}分`, {
        fontSize: `${size * 0.25}px`,
        fontFamily: 'Microsoft YaHei',
        color: '#ffff00',
        stroke: '#000000',
        strokeThickness: 1,
      }).setOrigin(0.5);

      const rt = this.make.renderTexture({ x: w / 2, y: h / 2, width: w, height: h });
      rt.draw(graphics);
      rt.draw(label);
      rt.draw(scoreLabel);
      rt.saveTexture(`packet_${packet.type}`);

      label.destroy();
      scoreLabel.destroy();
      graphics.destroy();
      rt.destroy();
    }
  }

  private createBombTexture(): void {
    const bombSize = 45;
    const w = bombSize + 20;
    const h = bombSize + 30;
    const cx = w / 2;
    const cy = h / 2 + 5;

    const graphics = this.make.graphics({ x: 0, y: 0 });
    graphics.fillStyle(COLORS.bomb);
    graphics.beginPath();
    graphics.arc(cx, cy, bombSize / 2, 0, Math.PI * 2);
    graphics.fillPath();
    graphics.fillStyle(0x666666);
    graphics.fillRect(cx - 3, cy - bombSize / 2 - 12, 6, 15);
    graphics.fillStyle(COLORS.bombHighlight);
    graphics.beginPath();
    graphics.arc(cx, cy - bombSize / 2 - 15, 6, 0, Math.PI * 2);
    graphics.fillPath();
    graphics.fillStyle(0x555555);
    graphics.beginPath();
    graphics.arc(cx - bombSize * 0.15, cy - bombSize * 0.15, bombSize * 0.12, 0, Math.PI * 2);
    graphics.fillPath();

    const dangerLabel = this.add.text(cx, cy, '💣', {
      fontSize: `${bombSize * 0.6}px`,
    }).setOrigin(0.5);

    const rt = this.make.renderTexture({ x: w / 2, y: h / 2, width: w, height: h });
    rt.draw(graphics);
    rt.draw(dangerLabel);
    rt.saveTexture('bomb');

    dangerLabel.destroy();
    graphics.destroy();
    rt.destroy();
  }

  private createHeartTexture(): void {
    const w = 32;
    const h = 32;
    const cx = w / 2;
    const cy = h / 2;

    const graphics = this.make.graphics({ x: 0, y: 0 });
    graphics.fillStyle(0xff4444);
    graphics.beginPath();
    graphics.arc(cx - 6, cy - 4, 7, 0, Math.PI * 2);
    graphics.arc(cx + 6, cy - 4, 7, 0, Math.PI * 2);
    graphics.moveTo(cx - 11, cy - 1);
    graphics.lineTo(cx, cy + 12);
    graphics.lineTo(cx + 11, cy - 1);
    graphics.closePath();
    graphics.fillPath();
    graphics.fillStyle(0xffffff);
    graphics.fillRect(cx - 9, cy - 3, 18, 6);
    graphics.fillRect(cx - 3, cy - 9, 6, 18);
    graphics.generateTexture('heart', w, h);
    graphics.destroy();
  }
}
