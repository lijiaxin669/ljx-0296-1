import { RedPacketConfig } from '../types';

export const GAME_CONFIG = {
  width: 480,
  height: 720,
  gameDuration: 60,
  maxLives: 3,
  playerSpeed: 6,
  initialFallSpeed: 150,
  maxFallSpeed: 450,
  initialSpawnInterval: 1200,
  minSpawnInterval: 400,
  bombBaseChance: 0.15,
  maxBombChance: 0.35,
  comboTimeout: 1500,
  comboBonusMultiplier: 0.1,
  comboDisplayThreshold: 3,
} as const;

export const RED_PACKET_TYPES: RedPacketConfig[] = [
  {
    type: 'small',
    score: 10,
    color: 0xff9999,
    size: 35,
    weight: 60,
    label: '小',
  },
  {
    type: 'medium',
    score: 30,
    color: 0xff4444,
    size: 45,
    weight: 30,
    label: '中',
  },
  {
    type: 'large',
    score: 100,
    color: 0xffd700,
    size: 55,
    weight: 10,
    label: '大',
  },
];

export const COLORS = {
  background: 0x2c1810,
  player: 0xffd700,
  playerOutline: 0xdaa520,
  bomb: 0x333333,
  bombHighlight: 0xff4444,
  uiText: 0xffffff,
  uiAccent: 0xffd700,
  danger: 0xff4444,
  success: 0x44ff44,
} as const;

export const RANK_MESSAGES = [
  { threshold: 95, message: '神级手速！击败了 99% 的亲友！' },
  { threshold: 90, message: '手速王者！击败了 95% 的亲友！' },
  { threshold: 85, message: '超级厉害！击败了 90% 的亲友！' },
  { threshold: 80, message: '非常优秀！击败了 85% 的亲友！' },
  { threshold: 75, message: '表现不错！击败了 80% 的亲友！' },
  { threshold: 70, message: '还可以哦！击败了 75% 的亲友！' },
  { threshold: 65, message: '继续努力！击败了 68% 的亲友！' },
  { threshold: 60, message: '及格了！击败了 60% 的亲友！' },
  { threshold: 50, message: '还需练习！击败了 50% 的亲友！' },
  { threshold: 0, message: '加油！多练练手速！' },
];
