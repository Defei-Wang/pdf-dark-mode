import { ColorPreset } from '../types';

export const COLOR_PRESETS: ColorPreset[] = [
  {
    id: 'pure-black',
    name: '纯黑模式 (Pure Black)',
    description: '反转差值 [1.0, 1.0, 1.0]，白底变真黑 #000000，黑字变纯白 #FFFFFF，高对比度',
    diffColor: [1.0, 1.0, 1.0],
    badgeBg: '#000000',
    badgeText: '#ffffff',
  },
  {
    id: 'soft-charcoal',
    name: '柔和深灰 (Soft Charcoal)',
    description: '反转差值 [0.88, 0.88, 0.88]，白底变柔和炭黑 #1F1F1F，黑字变柔白 #E0E0E0，护眼防刺眼',
    diffColor: [0.88, 0.88, 0.88],
    badgeBg: '#1f1f1f',
    badgeText: '#e0e0e0',
  },
  {
    id: 'cool-slate',
    name: '冷深灰 (Cool Slate)',
    description: '反转差值 [0.92, 0.91, 0.88]，白底呈冷深灰/暗藏蓝调 #14171F，黑字呈冷银白，现代干练',
    // Difference 混合下底色 = 1 - 填充色，故蓝色通道要最低、红色通道最高才能得到偏蓝的冷灰
    diffColor: [0.92, 0.91, 0.88],
    badgeBg: '#14171f',
    badgeText: '#ebe8e0',
  },
  {
    id: 'warm-amber',
    name: '护眼暖暗 (Warm Amber)',
    description: '反转差值 [0.88, 0.89, 0.90]，白底呈温润暖暗色 #1F1C19，适合夜间阅读',
    // 同理，暖色底需要蓝色通道最高、红色通道最低
    diffColor: [0.88, 0.89, 0.9],
    badgeBg: '#1f1c19',
    badgeText: '#e0e3e6',
  },
];
