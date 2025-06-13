import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CheckCircle, Circle, Clock } from "lucide-react";

interface TodoStatsProps {
	stats: {
		total: number;
		completed: number;
		pending: number;
		inProgress: number;
		overdue: number;
	};
}

export function TodoStats({ stats }: TodoStatsProps) {
	const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

	return (
		<div className="grid grid-cols-2 md:grid-cols-5 gap-4">
			<Card>
				<CardHeader className="pb-2">
					<CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">Total</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex items-center justify-between">
						<span className="text-2xl font-bold">{stats.total}</span>
						<Circle className="h-5 w-5 text-gray-400" />
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="pb-2">
					<CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">Completed</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex items-center justify-between">
						<span className="text-2xl font-bold text-green-600">{stats.completed}</span>
						<CheckCircle className="h-5 w-5 text-green-500" />
					</div>
					<p className="text-xs text-gray-500 mt-1">{completionRate}% complete</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="pb-2">
					<CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">Pending</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex items-center justify-between">
						<span className="text-2xl font-bold text-blue-600">{stats.pending}</span>
						<Circle className="h-5 w-5 text-blue-500" />
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="pb-2">
					<CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">In Progress</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex items-center justify-between">
						<span className="text-2xl font-bold text-orange-600">{stats.inProgress}</span>
						<Clock className="h-5 w-5 text-orange-500" />
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="pb-2">
					<CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">Overdue</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex items-center justify-between">
						<span className="text-2xl font-bold text-red-600">{stats.overdue}</span>
						<AlertTriangle className="h-5 w-5 text-red-500" />
					</div>
					{stats.overdue > 0 && (
						<Badge variant="destructive" className="text-xs mt-1">
							Needs attention
						</Badge>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
