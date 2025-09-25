package com.personalassistant.app;

import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {
    private WebView webView;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
       super.onCreate(savedInstanceState);
       webView = new WebView(this);
       setContentView(webView);
       WebSettings ws = webView.getSettings();
       ws.setJavaScriptEnabled(true);
       ws.setDomStorageEnabled(true);
       webView.setWebViewClient(new WebViewClient());
       // Load local PWA index from assets/www
       webView.loadUrl("file:///android_asset/www/index.html");
    }
    @Override
    public void onBackPressed(){
       if (webView.canGoBack()) webView.goBack(); else super.onBackPressed();
    }
}
