import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { EMOJI_OPTIONS, EmojiOption } from "@/lib/emojis";
import { cn } from "@/lib/utils";

type EmojiPickerProps = {
	onSelect: (emoji: string) => void;
	disabled?: boolean;
	options?: EmojiOption[];
	showTooltips?: boolean;
	className?: string;
};

const EmojiPicker = ({
	onSelect,
	disabled,
	options = EMOJI_OPTIONS,
	showTooltips = false,
	className,
}: EmojiPickerProps) => {
	const grid = (
		<div className={cn("grid grid-cols-6 gap-1.5", className)}>
			{options.map((option) => {
				const button = (
					<Button
						key={option.emoji}
						type="button"
						variant="ghost"
						size="icon"
						disabled={disabled}
						className="text-2xl"
						aria-label={option.label}
						onClick={() => onSelect(option.emoji)}>
						{option.emoji}
					</Button>
				);

				if (!showTooltips) return button;

				return (
					<Tooltip key={option.emoji}>
						<TooltipTrigger asChild>{button}</TooltipTrigger>
						<TooltipContent sideOffset={6}>{option.label}</TooltipContent>
					</Tooltip>
				);
			})}
		</div>
	);

	if (!showTooltips) return grid;

	return <TooltipProvider delayDuration={3000}>{grid}</TooltipProvider>;
};

export default EmojiPicker;
