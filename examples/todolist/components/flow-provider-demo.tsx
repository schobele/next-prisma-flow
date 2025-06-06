"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFlowContext, useFlowConfig, useFlowDebug, useFlowErrorBoundary, useFlowUser } from "@/generated/flow";
import { RefreshCw, Bug, Trash2, Settings, User } from "lucide-react";
import { useState } from "react";

export function FlowProviderDemo() {
	const flowConfig = useFlowConfig();
	const flowDebug = useFlowDebug();
	const { reportError } = useFlowErrorBoundary();
	const user = useFlowUser();
	const [lastDebugInfo, setLastDebugInfo] = useState<any>(null);

	const handleGetDebugInfo = () => {
		const debugInfo = flowDebug.getDebugInfo();
		setLastDebugInfo(debugInfo);
		console.log("🐛 Flow Debug Info:", debugInfo);
	};

	const handleClearAllData = () => {
		flowDebug.clearAllData();
		console.log("🗑️ All Flow data cleared");
	};

	const handleTriggerError = () => {
		const testError = new Error("Test error from FlowProvider demo");
		reportError(testError, "Demo component test");
	};

	return (
		<Card className="border-2 border-purple-200 bg-purple-50/50">
			<CardHeader>
				<CardTitle className="text-lg flex items-center gap-2 text-purple-800">
					<Settings className="h-5 w-5" />
					FlowProvider Status & Controls
				</CardTitle>
				<p className="text-sm text-purple-700">Global state management, error handling, and development tools</p>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* Configuration Display */}
				<div>
					<h4 className="font-semibold text-sm mb-3 text-gray-700">Configuration</h4>
					<div className="grid grid-cols-2 md:grid-cols-4 gap-2">
						<Badge variant={flowConfig.devTools ? "default" : "secondary"}>
							DevTools: {flowConfig.devTools ? "ON" : "OFF"}
						</Badge>
						<Badge variant={flowConfig.errorBoundary ? "default" : "secondary"}>
							Error Boundary: {flowConfig.errorBoundary ? "ON" : "OFF"}
						</Badge>
						<Badge variant={flowConfig.autoRefresh ? "default" : "secondary"}>
							Auto Refresh: {flowConfig.autoRefresh ? "ON" : "OFF"}
						</Badge>
						<Badge variant={flowConfig.optimisticUpdates ? "default" : "secondary"}>
							Optimistic: {flowConfig.optimisticUpdates ? "ON" : "OFF"}
						</Badge>
					</div>
				</div>

				{/* User Context */}
				<div>
					<h4 className="font-semibold text-sm mb-3 text-gray-700 flex items-center gap-2">
						<User className="h-4 w-4" />
						User Context
					</h4>
					<div className="bg-gray-50 p-3 rounded-lg">
						{user ? (
							<div className="text-sm">
								<div>
									<strong>ID:</strong> {user.id}
								</div>
								<div>
									<strong>Email:</strong> {user.email || "Not provided"}
								</div>
							</div>
						) : (
							<div className="text-sm text-gray-500">No user context provided</div>
						)}
					</div>
				</div>

				{/* Debug Controls */}
				<div>
					<h4 className="font-semibold text-sm mb-3 text-gray-700">Debug Controls</h4>
					<div className="flex flex-wrap gap-2">
						<Button onClick={handleGetDebugInfo} variant="outline" size="sm" className="flex items-center gap-2">
							<Bug className="h-4 w-4" />
							Get Debug Info
						</Button>
						<Button
							onClick={handleClearAllData}
							variant="outline"
							size="sm"
							className="flex items-center gap-2 text-orange-600 border-orange-300"
						>
							<Trash2 className="h-4 w-4" />
							Clear All Data
						</Button>
						<Button
							onClick={handleTriggerError}
							variant="outline"
							size="sm"
							className="flex items-center gap-2 text-red-600 border-red-300"
						>
							<RefreshCw className="h-4 w-4" />
							Test Error Boundary
						</Button>
					</div>
				</div>

				{/* Debug Info Display */}
				{lastDebugInfo && (
					<div>
						<h4 className="font-semibold text-sm mb-3 text-gray-700">Last Debug Info</h4>
						<div className="bg-gray-50 p-4 rounded-lg">
							<pre className="text-xs text-gray-700 overflow-auto">{JSON.stringify(lastDebugInfo, null, 2)}</pre>
						</div>
					</div>
				)}

				{/* Development Notes */}
				<div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
					<h4 className="font-semibold text-sm mb-2 text-blue-800">Development Features</h4>
					<ul className="text-xs text-blue-700 space-y-1">
						<li>• Check browser console for Flow logs</li>
						<li>• Open React DevTools to see Jotai atoms</li>
						<li>
							• Access <code>window.__FLOW_DEBUG__</code> in console
						</li>
						<li>• Error boundary catches and reports all Flow errors</li>
						<li>• Global loading states are coordinated automatically</li>
					</ul>
				</div>
			</CardContent>
		</Card>
	);
}
