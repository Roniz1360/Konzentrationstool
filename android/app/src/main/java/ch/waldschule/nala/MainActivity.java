package ch.waldschule.nala;

import android.app.Activity;
import android.graphics.Insets;
import android.os.Build;
import android.os.Bundle;
import android.speech.tts.TextToSpeech;
import android.speech.tts.Voice;
import android.view.WindowInsets;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import java.util.Locale;
import java.util.Set;

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
    private boolean ttsFallbackTried = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Zuerst die Google-Sprachausgabe versuchen (natürlichste Stimmen),
        // sonst automatisch auf die Standard-Engine zurückfallen.
        initTts("com.google.android.tts");

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

    // TextToSpeech mit gewünschter Engine starten (null = Standard-Engine).
    private void initTts(String engine) {
        TextToSpeech.OnInitListener listener = this::onTtsInit;
        tts = (engine == null) ? new TextToSpeech(this, listener)
                               : new TextToSpeech(this, listener, engine);
    }

    private void onTtsInit(int status) {
        if (status == TextToSpeech.SUCCESS && tts != null) {
            tts.setLanguage(new Locale("de", "DE"));
            waehleNatuerlicheStimme();
            tts.setPitch(1.15f);       // etwas höher = wärmer, kindgerechter
            tts.setSpeechRate(0.95f);  // ruhig, aber nicht schleppend
            ttsReady = true;
        } else if (!ttsFallbackTried) {
            // Google-Engine nicht verfügbar -> Standard-Engine verwenden
            ttsFallbackTried = true;
            if (tts != null) { try { tts.shutdown(); } catch (Exception ignored) {} }
            initTts(null);
        }
    }

    // Wählt die natürlichste deutsche Stimme (möglichst hochwertig, weiblich, offline).
    private void waehleNatuerlicheStimme() {
        try {
            Set<Voice> voices = tts.getVoices();
            if (voices == null) return;
            Voice best = null; int bestScore = Integer.MIN_VALUE;
            for (Voice v : voices) {
                if (v.getLocale() == null || !"de".equals(v.getLocale().getLanguage())) continue;
                String n = v.getName() == null ? "" : v.getName().toLowerCase();
                int score = v.getQuality();                 // höher = besser
                if (n.contains("female") || n.contains("nfh") || n.contains("-f")) score += 300;
                if (v.getLocale().getCountry().equalsIgnoreCase("DE")) score += 100;
                if (v.isNetworkConnectionRequired()) score -= 50; // offline bevorzugen
                if (best == null || score > bestScore) { best = v; bestScore = score; }
            }
            if (best != null) tts.setVoice(best);
        } catch (Exception ignored) { /* Standardstimme behalten */ }
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
