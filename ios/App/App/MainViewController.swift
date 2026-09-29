import UIKit
import Capacitor

/// Capacitor's bridge view controller, plus the app's own native plugins.
class MainViewController: CAPBridgeViewController {
    override open func capacitorDidLoad() {
        bridge?.registerPluginInstance(SignInWithApplePlugin())
    }
}
