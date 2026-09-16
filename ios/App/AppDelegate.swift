import UIKit

// Nalas Waldschule – iOS-App (WKWebView-Hülle um die gebündelte Web-App).
// Kein Storyboard, keine Scenes: schlanke AppDelegate-Fensterlogik.
@main
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication,
                     didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        window = UIWindow(frame: UIScreen.main.bounds)
        window?.rootViewController = ViewController()
        window?.makeKeyAndVisible()
        return true
    }
}
