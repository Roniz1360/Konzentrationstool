package ch.waldschule.nala;

import android.app.Activity;
import android.graphics.Insets;
import android.os.Build;
import android.os.Bundle;
import android.speech.tts.TextToSpeech;
import android.view.WindowInsets;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import java.util.Locale;

/**
 * Nalas Waldschule – schlanke WebView-App.
 * Lädt die im APK gebündelten Spiel-Dateien (offline) und stellt dem Web
 * eine native deutsche Vorlese-Stimme (TextToSpeech) als "AndroidTTS" bereit.
 * Keine Netzwerkzugriffe, keine Datenweitergabe.
 */
public class MainActivity extends Activity {

    private WebView web;
    private TextToSpeech tts;
    private boolean ttsReady = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        tts = new TextToSpeech(this, status -> {
            if (status == TextToSpeech.SUCCESS && tts != null) {
                tts.setLanguage(new Locale("de", "DE"));
                tts.setPitch(1.15f);        // etwas höher = wärmer, kindgerechter
                tts.setSpeechRate(0.9f);    // etwas langsamer = freundlicher
                ttsReady = true;
            }
        });

        web = new WebView(this);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);                 // localStorage
        s.setMediaPlaybackRequiresUserGesture(false); // Töne dürfen starten
        web.setWebViewClient(new WebViewClient());
        web.addJavascriptInterface(new TTSBridge(), "AndroidTTS");
        web.setBackgroundColor(0xFFEAF7EF); // Himmel-Ton, passend zum App-Hintergrund

        // Android 15 (targetSdk 35) zeigt Rand-zu-Rand: Inhalt nicht unter
        // Status-/Navigationsleiste schieben -> passenden Abstand setzen.
        web.setOnApplyWindowInsetsListener((v, insets) -> {
            int left, top, right, bottom;
            if (Build.VERSION.SDK_INT >= 30) {
                Insets bars = insets.getInsets(WindowInsets.Type.systemBars());
                left = bars.left; top = bars.top; right = bars.right; bottom = bars.bottom;
            } else {
                left = insets.getSystemWindowInsetLeft();
                top = insets.getSystemWindowInsetTop();
                right = insets.getSystemWindowInsetRight();
                bottom = insets.getSystemWindowInsetBottom();
            }
            v.setPadding(left, top, right, bottom);
            return insets;
        });

        setContentView(web);

        web.loadUrl("file:///android_asset/www/index.html");
    }

    /** Brücke: Web ruft AndroidTTS.speak(...) / AndroidTTS.stop() auf. */
    private class TTSBridge {
        @JavascriptInterface
        public void speak(String text) {
            if (ttsReady && tts != null && text != null) {
                tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, "nala");
            }
        }

        @JavascriptInterface
        public void stop() {
            if (tts != null) tts.stop();
        }
    }

    @Override
    public void onBackPressed() {
        if (web != null && web.canGoBack()) {
            web.goBack();
        } else {
            super.onBackPressed();
        }
    }

    @Override
    protected void onDestroy() {
        if (tts != null) {
            tts.stop();
            tts.shutdown();
            tts = null;
        }
        if (web != null) {
            web.destroy();
            web = null;
        }
        super.onDestroy();
    }
}
