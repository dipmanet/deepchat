import React from "react";

const EmptyState = (props: any) => {
	return (
		<svg
			width="400"
			height="260"
			viewBox="0 0 400 260"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}>
			<circle cx="60" cy="60" r="6" fill="#94A3B8" opacity="0.3" />
			<circle cx="340" cy="80" r="6" stroke="#94A3B8" stroke-width="2" opacity="0.4" />
			<circle cx="320" cy="180" r="5" fill="#94A3B8" opacity="0.3" />
			<path d="M200 30V45M192.5 37.5H207.5" stroke="#94A3B8" stroke-width="2" opacity="0.4" />
			<path d="M60 200V215M52.5 207.5H67.5" stroke="#94A3B8" stroke-width="2" opacity="0.4" />
			<rect x="120" y="60" width="180" height="100" rx="16" fill="#1E293B" opacity="0.85" />
			<rect x="150" y="90" width="90" height="10" rx="5" fill="#94A3B8" opacity="0.25" />
			<rect x="150" y="1600" width="12000" height="10" rx="5" fill="#94A3B8" opacity="0.25" />
			<rect x="80" y="100" width="180" height="110" rx="18" fill="white" filter="url(#shadow)" />
			<rect x="110" y="140" width="90" height="10" rx="5" fill="#CBD5F5" />
			<rect x="110" y="160" width="120" height="10" rx="5" fill="#E2E8F0" />
			<defs>
				<filter id="shadow" x="0" y="0" width="400" height="260">
					<feDropShadow dx="0" dy="10" stdDeviation="15" flood-color="#000" flood-opacity="0.08" />
				</filter>
			</defs>
		</svg>
	);
};

export default EmptyState;
