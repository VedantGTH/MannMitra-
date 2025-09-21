export interface MoodData {
  emoji: string;
  label: string;
  color: string;
  bgColor: string;
}

export const MOOD_OPTIONS: MoodData[] = [
  { emoji: '😢', label: 'Terrible', color: 'text-red-600', bgColor: 'bg-red-100' },
  { emoji: '😟', label: 'Bad', color: 'text-orange-600', bgColor: 'bg-orange-100' },
  { emoji: '😐', label: 'Poor', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  { emoji: '🙂', label: 'Okay', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  { emoji: '😊', label: 'Good', color: 'text-green-600', bgColor: 'bg-green-100' },
  { emoji: '😄', label: 'Great', color: 'text-emerald-600', bgColor: 'bg-emerald-100' },
  { emoji: '🤩', label: 'Amazing', color: 'text-teal-600', bgColor: 'bg-teal-100' },
  { emoji: '😍', label: 'Fantastic', color: 'text-cyan-600', bgColor: 'bg-cyan-100' },
  { emoji: '🥳', label: 'Incredible', color: 'text-purple-600', bgColor: 'bg-purple-100' },
  { emoji: '🌟', label: 'Perfect', color: 'text-pink-600', bgColor: 'bg-pink-100' },
];

export const getMoodByLabel = (label: string): MoodData | undefined => {
  return MOOD_OPTIONS.find(mood => mood.label.toLowerCase() === label.toLowerCase());
};

export const getMoodByEmoji = (emoji: string): MoodData | undefined => {
  return MOOD_OPTIONS.find(mood => mood.emoji === emoji);
};