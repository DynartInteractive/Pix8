package net.dynart.pix8;

import android.app.Activity;
import android.content.Intent;
import android.database.Cursor;
import android.net.Uri;
import android.os.Environment;
import android.provider.DocumentsContract;
import android.provider.OpenableColumns;
import android.util.Base64;

import androidx.activity.result.ActivityResult;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.InputStream;
import java.io.OutputStream;

/**
 * Save As / Open through the Storage Access Framework. The system dialog
 * starts in Documents/Pix8, needs no storage permission, and lets the user
 * browse the real folder tree. (A file written straight to Documents/ is
 * indexed as a generic binary, so it never shows up under the picker's
 * "Documents" category - that is why the WebView's own file input felt
 * empty.) Data crosses the bridge as base64.
 */
@CapacitorPlugin(name = "Pix8Files")
public class FilesPlugin extends Plugin {

    private static final String FOLDER = "Pix8";

    // Bytes waiting for the Save As dialog. They are deliberately not part
    // of the saveAs() call: Capacitor parcels the launching call into the
    // activity's saved state while the dialog is up, and a file-sized
    // payload there trips TransactionTooLargeException (~500 KB limit).
    private byte[] pendingData = null;

    private Uri initialUri() {
        try {
            new File(Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOCUMENTS), FOLDER).mkdirs();
        } catch (Exception ignored) {
            // The picker simply opens at its default location.
        }
        return DocumentsContract.buildDocumentUri(
            "com.android.externalstorage.documents",
            "primary:" + Environment.DIRECTORY_DOCUMENTS + "/" + FOLDER
        );
    }

    /** Step one of a save: hand over the bytes (base64). */
    @PluginMethod
    public void stage(PluginCall call) {
        String data = call.getString("data");
        if (data == null) {
            call.reject("Missing data");
            return;
        }
        pendingData = Base64.decode(data, Base64.DEFAULT);
        call.resolve();
    }

    /** Step two: show the dialog; writes the staged bytes to the chosen file. */
    @PluginMethod
    public void saveAs(PluginCall call) {
        if (pendingData == null) {
            call.reject("Nothing staged");
            return;
        }
        Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType("application/octet-stream");
        intent.putExtra(Intent.EXTRA_TITLE, call.getString("name", "untitled"));
        intent.putExtra(DocumentsContract.EXTRA_INITIAL_URI, initialUri());
        startActivityForResult(call, intent, "saveAsResult");
    }

    @ActivityCallback
    private void saveAsResult(PluginCall call, ActivityResult result) {
        if (call == null) return;
        Uri uri = result.getData() != null ? result.getData().getData() : null;
        byte[] bytes = pendingData;
        pendingData = null;
        if (result.getResultCode() != Activity.RESULT_OK || uri == null) {
            call.reject("Cancelled", "CANCELLED");
            return;
        }
        if (bytes == null) {
            call.reject("Nothing to save: the app was restarted behind the dialog");
            return;
        }
        // "wt": truncate, or a shorter save over a longer file keeps its tail.
        try (OutputStream os = getContext().getContentResolver().openOutputStream(uri, "wt")) {
            os.write(bytes);
        } catch (Exception e) {
            call.reject("Could not write file: " + e.getMessage());
            return;
        }
        JSObject ret = new JSObject();
        ret.put("name", displayName(uri));
        call.resolve(ret);
    }

    @PluginMethod
    public void open(PluginCall call) {
        Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType("*/*");
        intent.putExtra(DocumentsContract.EXTRA_INITIAL_URI, initialUri());
        startActivityForResult(call, intent, "openResult");
    }

    @ActivityCallback
    private void openResult(PluginCall call, ActivityResult result) {
        if (call == null) return;
        Uri uri = result.getData() != null ? result.getData().getData() : null;
        if (result.getResultCode() != Activity.RESULT_OK || uri == null) {
            call.reject("Cancelled", "CANCELLED");
            return;
        }
        byte[] bytes;
        try (InputStream is = getContext().getContentResolver().openInputStream(uri);
             ByteArrayOutputStream buf = new ByteArrayOutputStream()) {
            byte[] chunk = new byte[65536];
            int n;
            while ((n = is.read(chunk)) > 0) buf.write(chunk, 0, n);
            bytes = buf.toByteArray();
        } catch (Exception e) {
            call.reject("Could not read file: " + e.getMessage());
            return;
        }
        JSObject ret = new JSObject();
        ret.put("name", displayName(uri));
        ret.put("data", Base64.encodeToString(bytes, Base64.NO_WRAP));
        call.resolve(ret);
    }

    private String displayName(Uri uri) {
        try (Cursor c = getContext().getContentResolver().query(uri, null, null, null, null)) {
            if (c != null && c.moveToFirst()) {
                int idx = c.getColumnIndex(OpenableColumns.DISPLAY_NAME);
                if (idx >= 0) {
                    String name = c.getString(idx);
                    if (name != null && !name.isEmpty()) return name;
                }
            }
        } catch (Exception ignored) {
            // fall through
        }
        String last = uri.getLastPathSegment();
        return last != null ? last.replaceAll("^.*[/:]", "") : "untitled";
    }
}
