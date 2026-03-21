export type ProductGender = "male" | "female";
export type GenderLabel = "Male" | "Female" | "Unisex" | null;

const MALE_KEYWORDS = ["men", "men's", "male", "boy", "boys", "gent", "gentlemen"];
const FEMALE_KEYWORDS = ["women", "women's", "female", "girl", "girls", "lady", "ladies"];
const UNISEX_KEYWORDS = ["unisex", "kids", "kid", "children", "children's"];

const normalize = (value?: string) => value?.toLowerCase().trim() || "";

const includesKeyword = (value: string, keywords: string[]) => keywords.some((keyword) => value.includes(keyword));

export const getGenderLabel = (
	gender?: ProductGender | null,
	category?: string,
	subcategory?: string,
): GenderLabel => {
	if (gender === "male") return "Male";
	if (gender === "female") return "Female";

	const searchableText = [category, subcategory].map(normalize).filter(Boolean).join(" ");

	if (!searchableText) return null;
	if (includesKeyword(searchableText, UNISEX_KEYWORDS)) return "Unisex";
	if (includesKeyword(searchableText, FEMALE_KEYWORDS)) return "Female";
	if (includesKeyword(searchableText, MALE_KEYWORDS)) return "Male";

	return null;
};
