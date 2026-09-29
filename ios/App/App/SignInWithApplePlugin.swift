import Foundation
import Capacitor
import AuthenticationServices
import CryptoKit

/// Sign in with Apple for the web layer (src/lib/cloud/appleAuth.js).
///
/// The nonce is generated and hashed here: Apple receives only the SHA-256 hash, and the raw value
/// is returned to JavaScript so Supabase can check the identity token was issued for this request.
@objc(SignInWithApplePlugin)
public class SignInWithApplePlugin: CAPPlugin, CAPBridgedPlugin, ASAuthorizationControllerDelegate,
                                    ASAuthorizationControllerPresentationContextProviding {
    public let identifier = "SignInWithApplePlugin"
    public let jsName = "SignInWithApple"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "authorize", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getCredentialState", returnType: CAPPluginReturnPromise)
    ]

    private var pendingCall: CAPPluginCall?
    private var rawNonce: String?
    private var controller: ASAuthorizationController?

    @objc func authorize(_ call: CAPPluginCall) {
        guard pendingCall == nil else {
            call.reject("A sign-in is already in progress", "IN_PROGRESS")
            return
        }
        guard let nonce = Self.randomNonce() else {
            call.reject("Could not create a secure nonce", "NONCE_FAILED")
            return
        }

        let request = ASAuthorizationAppleIDProvider().createRequest()
        let scopes = call.getArray("scopes", String.self) ?? []
        request.requestedScopes = scopes.compactMap { scope -> ASAuthorization.Scope? in
            switch scope {
            case "email": return .email
            case "name": return .fullName
            default: return nil
            }
        }
        request.nonce = Self.sha256(nonce)

        pendingCall = call
        rawNonce = nonce
        DispatchQueue.main.async {
            let controller = ASAuthorizationController(authorizationRequests: [request])
            controller.delegate = self
            controller.presentationContextProvider = self
            self.controller = controller
            controller.performRequests()
        }
    }

    @objc func getCredentialState(_ call: CAPPluginCall) {
        guard let user = call.getString("user"), !user.isEmpty else {
            call.reject("Missing user", "MISSING_USER")
            return
        }
        ASAuthorizationAppleIDProvider().getCredentialState(forUserID: user) { state, _ in
            let value: String
            switch state {
            case .authorized: value = "authorized"
            case .revoked: value = "revoked"
            case .notFound: value = "notFound"
            case .transferred: value = "transferred"
            @unknown default: value = "unknown"
            }
            call.resolve(["state": value])
        }
    }

    // MARK: - ASAuthorizationControllerDelegate

    public func authorizationController(controller: ASAuthorizationController,
                                        didCompleteWithAuthorization authorization: ASAuthorization) {
        defer { finish() }
        guard let call = pendingCall else { return }
        guard let credential = authorization.credential as? ASAuthorizationAppleIDCredential,
              let tokenData = credential.identityToken,
              let identityToken = String(data: tokenData, encoding: .utf8),
              let nonce = rawNonce else {
            call.reject("Apple did not return an identity token", "NO_TOKEN")
            return
        }
        var result: [String: Any] = [
            "user": credential.user,
            "identityToken": identityToken,
            "rawNonce": nonce
        ]
        if let codeData = credential.authorizationCode, let code = String(data: codeData, encoding: .utf8) {
            result["authorizationCode"] = code
        }
        if let email = credential.email {
            result["email"] = email
        }
        call.resolve(result)
    }

    public func authorizationController(controller: ASAuthorizationController, didCompleteWithError error: Error) {
        defer { finish() }
        guard let call = pendingCall else { return }
        if let authError = error as? ASAuthorizationError, authError.code == .canceled {
            call.reject("Sign in canceled", "CANCELED")
        } else {
            call.reject(error.localizedDescription, "FAILED", error)
        }
    }

    // MARK: - ASAuthorizationControllerPresentationContextProviding

    public func presentationAnchor(for controller: ASAuthorizationController) -> ASPresentationAnchor {
        if let window = bridge?.webView?.window {
            return window
        }
        let scene = UIApplication.shared.connectedScenes.compactMap { $0 as? UIWindowScene }.first
        return scene?.windows.first(where: { $0.isKeyWindow }) ?? ASPresentationAnchor()
    }

    // MARK: - Helpers

    private func finish() {
        pendingCall = nil
        rawNonce = nil
        controller = nil
    }

    /// 32 random bytes from the system CSPRNG, as a URL-safe string.
    private static func randomNonce() -> String? {
        var bytes = [UInt8](repeating: 0, count: 32)
        guard SecRandomCopyBytes(kSecRandomDefault, bytes.count, &bytes) == errSecSuccess else { return nil }
        return Data(bytes).base64EncodedString()
            .replacingOccurrences(of: "+", with: "-")
            .replacingOccurrences(of: "/", with: "_")
            .replacingOccurrences(of: "=", with: "")
    }

    /// Lowercase hex SHA-256 — the form Apple embeds in the token and Supabase checks.
    private static func sha256(_ input: String) -> String {
        SHA256.hash(data: Data(input.utf8)).map { String(format: "%02x", $0) }.joined()
    }
}
