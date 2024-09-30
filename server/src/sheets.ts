// Function to parse individual header cells
export function parseHeaderCell(cell: string): {
	key: string;
	show: boolean;
	question: string;
} {
	// cell is in format '(key, show/hide) question'
	const openingParenIndex = cell.indexOf("(");
	const closingParenIndex = cell.indexOf(")", openingParenIndex);
	if (openingParenIndex === -1 || closingParenIndex === -1) {
		throw new Error(`Invalid header cell format: ${cell}`);
	}

	// Extract the (key, show/hide)
	const insideParens = cell
		.substring(openingParenIndex + 1, closingParenIndex)
		.trim();
	const [key, showHide] = insideParens.split(",").map((s) => s.trim());
	const show = showHide.toLowerCase() === "show";

	// Extract the question
	const question = cell.substring(closingParenIndex + 1).trim();
	return { key, show, question };
}
