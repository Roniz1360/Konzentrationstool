import UIKit
import WebKit

// Zeigt die im App-Bundle mitgelieferte Web-App (Ordner "www") in einer WKWebView.
// Läuft komplett offline; localStorage bleibt lokal auf dem Gerät.
// Das Vorlesen nutzt die Web-Speech-Funktion von WebKit (auf iOS vorhanden).
class ViewController: UIViewController {

    private var webView: WKWebView!

    override func loadView() {
        let config = WKWebViewConfiguration()
        config.allowsInlineMediaPlayback = true
        config.mediaTypesRequiringUserActionForPlayback = []
        webView = WKWebView(frame: .zero, configuration: config)
        webView.scrollView.bounces = false
        webView.scrollView.contentInsetAdjustmentBehavior = .never
        view = webView
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        if let url = Bundle.main.url(forResource: "index", withExtension: "html", subdirectory: "www") {
            webView.loadFileURL(url, allowingReadAccessTo: url.deletingLastPathComponent())
        }
    }

    override var preferredStatusBarStyle: UIStatusBarStyle { .darkContent }

    // Hochformat wie in der Android-App
    override var supportedInterfaceOrientations: UIInterfaceOrientationMask { .portrait }
}
