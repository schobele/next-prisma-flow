"use client";

import { Building, ChevronDown, LogOut, Users } from "lucide-react";
import React from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth, useTenant, useUser } from "@/lib/auth-context";

export function UserSwitcher() {
	const {
		session,
		switchToUser,
		switchToCompany,
		logout,
		availableUsers,
		availableCompanies,
		loading,
	} = useAuth();

	const user = useUser();
	const tenant = useTenant();

	if (!session || !user || !tenant) {
		return null;
	}

	const handleUserSwitch = async (userId: string) => {
		const success = await switchToUser(userId);
		if (success) {
			toast.success("Switched user successfully");
		} else {
			toast.error("Failed to switch user");
		}
	};

	const handleCompanySwitch = async (companyId: string) => {
		const success = await switchToCompany(companyId);
		if (success) {
			toast.success("Switched company successfully");
		} else {
			toast.error("Failed to switch company");
		}
	};

	const handleLogout = async () => {
		await logout();
		toast.success("Logged out successfully");
	};

	// Get role color
	const getRoleColor = (role: string) => {
		switch (role) {
			case "admin":
				return "bg-red-100 text-red-800 border-red-200";
			case "member":
				return "bg-blue-100 text-blue-800 border-blue-200";
			case "viewer":
				return "bg-gray-100 text-gray-800 border-gray-200";
			default:
				return "bg-gray-100 text-gray-800 border-gray-200";
		}
	};

	// Get plan color
	const getPlanColor = (plan: string) => {
		switch (plan) {
			case "enterprise":
				return "bg-purple-100 text-purple-800 border-purple-200";
			case "pro":
				return "bg-green-100 text-green-800 border-green-200";
			case "free":
				return "bg-yellow-100 text-yellow-800 border-yellow-200";
			default:
				return "bg-gray-100 text-gray-800 border-gray-200";
		}
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild disabled={loading}>
				<Button variant="ghost" className="flex items-center gap-2 px-2">
					<div className="flex items-center gap-2">
						<Avatar className="h-8 w-8">
							<AvatarImage src={session.user.avatar} alt={session.user.name} />
							<AvatarFallback>
								{session.user.name
									.split(" ")
									.map((n) => n[0])
									.join("")
									.toUpperCase()}
							</AvatarFallback>
						</Avatar>
						<div className="hidden md:flex flex-col items-start">
							<div className="flex items-center gap-2">
								<span className="text-sm font-medium">{session.user.name}</span>
								<Badge
									variant="outline"
									className={`text-xs ${getRoleColor(session.user.role)}`}
								>
									{session.user.role}
								</Badge>
							</div>
							<div className="flex items-center gap-2">
								<span className="text-xs text-muted-foreground">
									{session.company.name}
								</span>
								<Badge
									variant="outline"
									className={`text-xs ${getPlanColor(session.company.plan)}`}
								>
									{session.company.plan}
								</Badge>
							</div>
						</div>
					</div>
					<ChevronDown className="h-4 w-4" />
				</Button>
			</DropdownMenuTrigger>

			<DropdownMenuContent align="end" className="w-80">
				{/* Current User Info */}
				<DropdownMenuLabel>
					<div className="flex items-center gap-3">
						<Avatar className="h-10 w-10">
							<AvatarImage src={session.user.avatar} alt={session.user.name} />
							<AvatarFallback>
								{session.user.name
									.split(" ")
									.map((n) => n[0])
									.join("")
									.toUpperCase()}
							</AvatarFallback>
						</Avatar>
						<div>
							<div className="flex items-center gap-2">
								<span className="font-medium">{session.user.name}</span>
								<Badge
									variant="outline"
									className={`text-xs ${getRoleColor(session.user.role)}`}
								>
									{session.user.role}
								</Badge>
							</div>
							<div className="text-sm text-muted-foreground">
								{session.user.email}
							</div>
							<div className="flex items-center gap-2 mt-1">
								<span className="text-sm text-muted-foreground">
									{session.company.name}
								</span>
								<Badge
									variant="outline"
									className={`text-xs ${getPlanColor(session.company.plan)}`}
								>
									{session.company.plan}
								</Badge>
							</div>
						</div>
					</div>
				</DropdownMenuLabel>

				<DropdownMenuSeparator />

				{/* Demo: Switch User */}
				<DropdownMenuLabel className="flex items-center gap-2">
					<Users className="h-4 w-4" />
					Demo: Switch User
				</DropdownMenuLabel>
				{availableUsers.map((u) => (
					<DropdownMenuItem
						key={u.id}
						onClick={() => handleUserSwitch(u.id)}
						className={session.user.id === u.id ? "bg-muted" : ""}
					>
						<div className="flex items-center gap-2 w-full">
							<Avatar className="h-6 w-6">
								<AvatarImage src={u.avatar} alt={u.name} />
								<AvatarFallback className="text-xs">
									{u.name
										.split(" ")
										.map((n) => n[0])
										.join("")
										.toUpperCase()}
								</AvatarFallback>
							</Avatar>
							<div className="flex-1">
								<div className="flex items-center gap-2">
									<span className="text-sm">{u.name}</span>
									<Badge
										variant="outline"
										className={`text-xs ${getRoleColor(u.role)}`}
									>
										{u.role}
									</Badge>
								</div>
								<div className="text-xs text-muted-foreground">{u.email}</div>
							</div>
							{session.user.id === u.id && (
								<Badge variant="default" className="text-xs">
									Current
								</Badge>
							)}
						</div>
					</DropdownMenuItem>
				))}

				<DropdownMenuSeparator />

				{/* Demo: Switch Company */}
				<DropdownMenuLabel className="flex items-center gap-2">
					<Building className="h-4 w-4" />
					Demo: Switch Company
				</DropdownMenuLabel>
				{availableCompanies.map((c) => (
					<DropdownMenuItem
						key={c.id}
						onClick={() => handleCompanySwitch(c.id)}
						className={session.company.id === c.id ? "bg-muted" : ""}
					>
						<div className="flex items-center gap-2 w-full">
							<div className="h-6 w-6 flex items-center justify-center text-sm bg-muted rounded">
								{c.logo}
							</div>
							<div className="flex-1">
								<div className="flex items-center gap-2">
									<span className="text-sm">{c.name}</span>
									<Badge
										variant="outline"
										className={`text-xs ${getPlanColor(c.plan)}`}
									>
										{c.plan}
									</Badge>
								</div>
								<div className="text-xs text-muted-foreground">
									{c.maxUsers} users, {(c.maxStorage / 1000).toFixed(0)}GB
								</div>
							</div>
							{session.company.id === c.id && (
								<Badge variant="default" className="text-xs">
									Current
								</Badge>
							)}
						</div>
					</DropdownMenuItem>
				))}

				<DropdownMenuSeparator />

				{/* Logout */}
				<DropdownMenuItem onClick={handleLogout} className="text-red-600">
					<LogOut className="h-4 w-4 mr-2" />
					Sign Out
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

/**
 * Developer Hints Component
 * Shows what's happening under the hood for educational purposes
 */
export function AuthDebugInfo() {
	const { session, flowCtx } = useAuth();

	if (!session || !flowCtx) return null;

	return (
		<div className="fixed bottom-4 right-4 p-4 bg-black/90 text-white text-xs rounded-lg max-w-sm">
			<div className="font-semibold mb-2">🔍 Flow Debug Info</div>
			<div>Tenant ID: {flowCtx.tenantId}</div>
			<div>User ID: {flowCtx.userId}</div>
			<div>Roles: {flowCtx.roles?.join(", ")}</div>
			<div>Company: {session.company.name}</div>
			<div>Plan: {session.company.plan}</div>
			<div className="mt-2 text-yellow-300 text-xs">
				💡 All Flow queries auto-filter by tenantId
			</div>
		</div>
	);
}
