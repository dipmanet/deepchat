import { api } from "@/convex/_generated/api";
import { useAuth, useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { useEffect } from "react";

export function UserSyncProvider({ children }: { children: React.ReactNode }) {
	const { isSignedIn } = useAuth();
	const { user } = useUser();
	const ensureUser = useMutation(api.user.ensureUser);

	useEffect(() => {
		if (isSignedIn && user) {
			ensureUser({
				username: user.fullName || user.username || "",
				imageUrl: user.imageUrl,
				email: user.emailAddresses[0]?.emailAddress || "",
				clerkId: user.id,
			}).catch((err) => {
				console.warn("ensureUser:", err.message);
			});
		}
	}, [isSignedIn, user]);

	return <>{children}</>;
}
