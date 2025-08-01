"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Zap, Shield, Wrench } from "lucide-react";

export function HookComparisonSection() {
	return (
		<Card className="border-2 border-emerald-200 bg-emerald-50/50">
			<CardHeader>
				<CardTitle className="text-lg flex items-center gap-2 text-emerald-800">
					<Wrench className="h-5 w-5" />
					Specialized Form Hooks Architecture
				</CardTitle>
				<p className="text-sm text-emerald-700">Type-safe, purpose-built hooks for create and update operations</p>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{/* Create Hook */}
					<Card className="border-green-300 bg-green-50/50">
						<CardHeader className="pb-3">
							<CardTitle className="text-base flex items-center gap-2 text-green-700">
								<Zap className="h-4 w-4" />
								Create Hook
							</CardTitle>
							<Badge className="w-fit bg-green-600">v0.2.0 New</Badge>
						</CardHeader>
						<CardContent className="space-y-3">
							<div className="text-sm">
								<code className="bg-green-100 px-2 py-1 rounded">useCreateTodoForm(initial?)</code>
							</div>

							<div className="space-y-2 text-xs">
								<div className="flex items-center gap-2">
									<CheckCircle className="h-3 w-3 text-green-500" />
									<span>Dedicated create validation</span>
								</div>
								<div className="flex items-center gap-2">
									<CheckCircle className="h-3 w-3 text-green-500" />
									<span>TodoCreateInputSchema</span>
								</div>
								<div className="flex items-center gap-2">
									<CheckCircle className="h-3 w-3 text-green-500" />
									<span>Required fields enforced</span>
								</div>
								<div className="flex items-center gap-2">
									<CheckCircle className="h-3 w-3 text-green-500" />
									<span>Auto-reset after success</span>
								</div>
								<div className="flex items-center gap-2">
									<CheckCircle className="h-3 w-3 text-green-500" />
									<span>Perfect type inference</span>
								</div>
							</div>

							<div className="bg-green-100 p-2 rounded text-xs">
								<pre>{`const form = useCreateTodoForm();
// ✅ Always create mode
// ✅ title is required
// ✅ TodoCreateInputSchema`}</pre>
							</div>
						</CardContent>
					</Card>

					{/* Update Hook */}
					<Card className="border-blue-300 bg-blue-50/50">
						<CardHeader className="pb-3">
							<CardTitle className="text-base flex items-center gap-2 text-blue-700">
								<Shield className="h-4 w-4" />
								Update Hook
							</CardTitle>
							<Badge className="w-fit bg-blue-600">v0.2.0 New</Badge>
						</CardHeader>
						<CardContent className="space-y-3">
							<div className="text-sm">
								<code className="bg-blue-100 px-2 py-1 rounded">useUpdateTodoForm(id, data?)</code>
							</div>

							<div className="space-y-2 text-xs">
								<div className="flex items-center gap-2">
									<CheckCircle className="h-3 w-3 text-green-500" />
									<span>Dedicated update validation</span>
								</div>
								<div className="flex items-center gap-2">
									<CheckCircle className="h-3 w-3 text-green-500" />
									<span>TodoUpdateInputSchema</span>
								</div>
								<div className="flex items-center gap-2">
									<CheckCircle className="h-3 w-3 text-green-500" />
									<span>All fields optional</span>
								</div>
								<div className="flex items-center gap-2">
									<CheckCircle className="h-3 w-3 text-green-500" />
									<span>ID parameter included</span>
								</div>
								<div className="flex items-center gap-2">
									<CheckCircle className="h-3 w-3 text-green-500" />
									<span>Partial update support</span>
								</div>
							</div>

							<div className="bg-blue-100 p-2 rounded text-xs">
								<pre>{`const form = useUpdateTodoForm(id, data);
// ✅ Always update mode  
// ✅ All fields optional
// ✅ TodoUpdateInputSchema`}</pre>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Architecture Benefits */}
				<div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-gray-200">
					<h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
						<Zap className="h-4 w-4 text-emerald-600" />
						Specialized Hook Architecture Benefits
					</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
						<div className="space-y-1">
							<div className="font-medium text-green-700">🎯 Purpose-Built</div>
							<p className="text-gray-600">Each hook designed for specific operations</p>
						</div>
						<div className="space-y-1">
							<div className="font-medium text-blue-700">🔷 Type Safety</div>
							<p className="text-gray-600">Perfect TypeScript inference and autocomplete</p>
						</div>
						<div className="space-y-1">
							<div className="font-medium text-purple-700">⚡ Performance</div>
							<p className="text-gray-600">Optimized for specific use cases</p>
						</div>
						<div className="space-y-1">
							<div className="font-medium text-orange-700">🛡️ Validation</div>
							<p className="text-gray-600">Correct schemas for each operation type</p>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
