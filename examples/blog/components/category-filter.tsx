import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Category } from "@/flow";

interface CategoryFilterProps {
	categories: Category[];
	selectedCategory: string;
	onCategoryChange: (categoryId: string) => void;
}

export function CategoryFilter({ categories, selectedCategory, onCategoryChange }: CategoryFilterProps) {
	return (
		<Select value={selectedCategory} onValueChange={onCategoryChange}>
			<SelectTrigger className="w-40">
				<SelectValue placeholder="Category" />
			</SelectTrigger>
			<SelectContent>
				<SelectItem value="__all__">All Categories</SelectItem>
				{categories.map((category) => (
					<SelectItem key={category.id} value={category.id}>
						<div className="flex items-center gap-2">
							<div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
							{category.name}
						</div>
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
