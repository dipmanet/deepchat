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

export const STICKER_OPTIONS: EmojiOption[] = [
	{ emoji: "\u{1F389}", label: "Party" },
	{ emoji: "\u{1F4AF}", label: "Perfect" },
	{ emoji: "\u{1F680}", label: "Launch" },
	{ emoji: "\u{1F31F}", label: "Star" },
	{ emoji: "\u{1F451}", label: "Crown" },
	{ emoji: "\u{1F48E}", label: "Gem" },
	{ emoji: "\u{1F3C6}", label: "Trophy" },
	{ emoji: "\u{1F381}", label: "Gift" },
	{ emoji: "\u{1F37F}", label: "Popcorn" },
	{ emoji: "\u{1F984}", label: "Magic" },
	{ emoji: "\u{1F308}", label: "Rainbow" },
	{ emoji: "\u{26A1}", label: "Lightning" },
];

export const REACTION_EMOJI_OPTIONS: EmojiOption[] = [
	{ emoji: "\u{1F44D}", label: "Like" },
	{ emoji: "\u{2764}\u{FE0F}", label: "Love" },
	{ emoji: "\u{1F602}", label: "Funny" },
	{ emoji: "\u{1F62E}", label: "Surprised" },
	{ emoji: "\u{1F622}", label: "Sad" },
	{ emoji: "\u{1F525}", label: "Fire" },
];
