import type {
  PublicSiteContent,
  PublicSiteReview,
} from "@/lib/public-site/types";

function legacyReview(value: string, index: number): PublicSiteReview {
  const separator = value.lastIndexOf("—");
  const hasAuthor = separator > 0 && separator < value.length - 1;

  return {
    id: `legacy-review-${index + 1}`,
    author: hasAuthor ? value.slice(separator + 1).trim() : "Клиент",
    text: hasAuthor ? value.slice(0, separator).trim() : value.trim(),
    rating: 5,
  };
}

export function publicSiteReviews(
  content: Pick<PublicSiteContent, "reviews" | "reviews_items">,
): PublicSiteReview[] {
  if (Array.isArray(content.reviews) && content.reviews.length > 0) {
    return content.reviews
      .filter(
        (review): review is PublicSiteReview =>
          Boolean(
            review &&
              typeof review.id === "string" &&
              typeof review.author === "string" &&
              typeof review.text === "string",
          ),
      )
      .map((review) => ({
        ...review,
        rating: Math.min(5, Math.max(1, Math.round(Number(review.rating) || 5))),
      }));
  }

  return (content.reviews_items ?? "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean)
    .map(legacyReview);
}
