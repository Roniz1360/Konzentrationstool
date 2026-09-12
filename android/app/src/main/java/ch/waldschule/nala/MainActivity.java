package ch.waldschule.nala;

import android.app.Activity;
import android.os.Bundle;
import android.speech.tts.TextToSpeech;
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
