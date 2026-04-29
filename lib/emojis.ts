export type EmojiOption = {
	emoji: string;
	label: string;
};

export const EMOJI_OPTIONS: EmojiOption[] = [
	{ emoji: "\u{1F600}", label: "Grinning" },
	{ emoji: "\u{1F604}", label: "Happy" },
	{ emoji: "\u{1F602}", label: "Laughing" },
	{ emoji: "\u{1F60A}", label: "Smiling" },
	{ emoji: "\u{1F60D}", label: "Loving" },
	{ emoji: "\u{1F60E}", label: "Cool" },
	{ emoji: "\u{1F973}", label: "Celebrating" },
	{ emoji: "\u{1F914}", label: "Thinking" },
	{ emoji: "\u{1F44D}", label: "Like" },
	{ emoji: "\u{1F44E}", label: "Dislike" },
	{ emoji: "\u{1F44F}", label: "Clapping" },
	{ emoji: "\u{1F64C}", label: "Hands raised" },
	{ emoji: "\u{1F64F}", label: "Thanks" },
	{ emoji: "\u{1F525}", label: "Fire" },
	{ emoji: "\u{2728}", label: "Sparkles" },
	{ emoji: "\u{2764}\u{FE0F}", label: "Love" },
];

export const REACTION_EMOJI_OPTIONS: EmojiOption[] = [
	{ emoji: "\u{1F44D}", label: "Like" },
	{ emoji: "\u{2764}\u{FE0F}", label: "Love" },
	{ emoji: "\u{1F602}", label: "Funny" },
	{ emoji: "\u{1F62E}", label: "Surprised" },
	{ emoji: "\u{1F622}", label: "Sad" },
	{ emoji: "\u{1F525}", label: "Fire" },
];
