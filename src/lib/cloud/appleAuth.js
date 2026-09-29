// JavaScript side of the app's own native plugin (ios/App/App/SignInWithApplePlugin.swift).
// The native side creates the nonce, sends only its SHA-256 hash to Apple, and returns the raw
// value so Supabase can verify the identity token was issued for this exact request.
import { registerPlugin } from '@capacitor/core';

const SignInWithApple = registerPlugin('SignInWithApple');

// Resolves { user, identityToken, authorizationCode, rawNonce, email? }.
// Rejects with code 'CANCELED' when the player closes Apple's sheet.
export function authorizeWithApple() {
  return SignInWithApple.authorize({ scopes: ['email'] });
}

// 'authorized' | 'revoked' | 'notFound' | 'transferred'
export async function getAppleCredentialState(user) {
  const { state } = await SignInWithApple.getCredentialState({ user });
  return state;
}
