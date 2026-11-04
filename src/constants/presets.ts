import { ColorPreset } from '../types';

export const COLOR_PRESETS: ColorPreset[] = [
  {
    id: 'pure-black',
    name: '纯黑模式 (Pure Black)',
    description: '反转差值 [1.0, 1.0, 1.0]，白底变真黑 #000000，黑字变纯白 #FFFFFF，高对比度',
    diffColor: [1.0, 1.0, 1.0],
    badgeBg: '#050505',
    badgeText: '#ffffff',
  },
  {
    id: 'soft-charcoal',
    name: '柔和深灰 (Soft Charcoal)',
    description: '反转差值 [0.88, 0.88, 0.88]，白底变柔和炭黑 #1F1F1F，黑字变柔白 #E0E0E0，护眼防刺眼',
    diffColor: [0.88, 0.88, 0.88],
    badgeBg: '#1e1e1e',
    badgeText: '#e0e0e0',
  },
  {
    id: 'cool-slate',
    name: '冷深灰 (Cool Slate)',
    description: '反转差值 [0.84, 0.87, 0.92]，白底呈冷深灰/暗藏蓝调 #14171E，黑字呈冷银白，现代干练',
    diffColor: [0.84, 0.87, 0.92],
    badgeBg: '#14171f',
    badgeText: '#d8dee9',
  },
  {
    id: 'warm-amber',
    name: '护眼暖暗 (Warm Amber)',
    description: '反转差值 [0.88, 0.85, 0.80]，白底呈温润暖暗色 #1F1D19，降低蓝光刺激，适合夜间长阅读',
    diffColor: [0.88, 0.85, 0.80],
    badgeBg: '#1d1916',
    badgeText: '#e8dcce',
  },
];
