import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import { auth } from "./firebase";

export async function checkAuth(token: string): Promise<DecodedIdToken | null> {
	try {
		const decodedToken = await auth.verifyIdToken(token);

		const uid = decodedToken.uid;

		return decodedToken;
	} catch (error) {
		console.error("Error verifying token:", error);
		return null;
	}
}

// export async function check

export async function isAdmin(uid: string): Promise<boolean> {
	const user = await auth.getUser(uid);
	return !!user.customClaims?.admin;
}

export async function makeAdmin(email: string): Promise<void> {
	const user = await auth.getUserByEmail(email);
	const uid = user.uid;
	await auth.setCustomUserClaims(uid, { admin: true });
}

export function isGod(email: string): boolean {
	return email.toLowerCase() === process.env.GOD_EMAIL;
}
