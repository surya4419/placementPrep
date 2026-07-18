# Voice Recording Troubleshooting Guide

## How Voice Recording Works

The application uses the **Web Speech API** for voice-to-text conversion. When you click "Record Voice", your browser:

1. Requests microphone permission
2. Captures your audio in real-time
3. Converts speech to text using browser's speech recognition
4. Displays the transcribed text in the textarea

## Browser Requirements

Voice recording works best on:
- ✅ **Chrome** (Desktop & Android)
- ✅ **Microsoft Edge** (Desktop)
- ✅ **Safari** (Desktop & iOS - requires iOS 14.5+)
- ❌ **Firefox** - Limited/No support for Web Speech API

## Common Issues & Solutions

### 1. Microphone Permission Denied

**Symptoms:**
- Error message: "Microphone access was denied"
- Red X icon in browser address bar

**Solutions:**
- Click the 🔒 lock icon or 🎤 microphone icon in your browser address bar
- Set microphone permission to "Allow"
- Refresh the page and try again

**Chrome/Edge:**
1. Click the site settings icon (near the URL)
2. Under Microphone → Select "Allow"
3. Refresh the page

**Safari:**
1. Safari → Preferences → Websites → Microphone
2. Find your site and set to "Allow"
3. Refresh the page

### 2. No Microphone Detected

**Symptoms:**
- Error: "No microphone found"
- Recording button doesn't work

**Solutions:**
- Check if your microphone is properly connected
- Try unplugging and replugging USB microphones
- Check System Settings:
  - **Windows:** Settings → Privacy → Microphone → Allow apps
  - **Mac:** System Preferences → Security & Privacy → Microphone
- Select correct input device in browser settings

### 3. Voice Not Being Captured

**Symptoms:**
- Recording starts but no text appears
- "No speech detected" error

**Solutions:**
- Speak louder and more clearly
- Check if microphone is muted (hardware mute button)
- Reduce background noise
- Position microphone closer to your mouth
- Test microphone:
  - **Windows:** Settings → Sound → Test your microphone
  - **Mac:** System Preferences → Sound → Input

### 4. Network Error

**Symptoms:**
- Error: "Network error occurred"

**Solutions:**
- Web Speech API requires an internet connection
- Check your internet connectivity
- Try refreshing the page
- Switch to a more stable network if possible

### 5. Browser Not Supported

**Symptoms:**
- Error: "Speech recognition is not supported"
- Recording button disabled

**Solutions:**
- Use Chrome, Edge, or Safari instead of Firefox
- Update your browser to the latest version
- Use the text input field as an alternative

## Testing Your Setup

### Quick Microphone Test:

1. Visit: chrome://settings/content/microphone (Chrome/Edge)
2. Or use an online tool: https://www.onlinemictest.com/
3. Verify you see audio levels when speaking

### Test in the App:

1. Click "Record Voice" button
2. Allow microphone permission when prompted
3. Speak clearly: "This is a test recording"
4. Click "Stop Recording"
5. Verify text appears in the textarea

## Best Practices for Voice Recording

✅ **Do:**
- Use a quiet environment
- Speak clearly and at normal pace
- Position microphone 6-12 inches from your mouth
- Pause briefly between sentences
- Use Chrome or Edge for best results

❌ **Don't:**
- Rush through your speech
- Record in noisy environments
- Cover or obstruct the microphone
- Speak too quietly or too fast
- Use Firefox (limited support)

## Alternative: Type Instead

If voice recording isn't working, you can always type your response directly in the text area. The evaluation quality is the same whether you type or speak.

## HTTPS Requirement

**Important:** Voice recording requires HTTPS in production. Your Render deployment automatically uses HTTPS, but if testing locally:
- Localhost works by default
- For other local IPs, you'll need HTTPS setup

## Still Having Issues?

1. **Clear browser cache** and refresh
2. **Restart your browser** completely
3. **Try incognito/private mode** to rule out extensions
4. **Check browser console** (F12) for detailed error messages
5. **Use text input** as a workaround while troubleshooting

## Technical Details

- **API Used:** Web Speech API (SpeechRecognition)
- **Language:** English (US) - en-US
- **Mode:** Continuous recognition with interim results
- **Platform:** Client-side (runs in your browser)
- **Privacy:** Audio is processed by browser's speech service

## For Developers

If you're debugging, check:
```javascript
// Check if API is available
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
console.log('Speech Recognition available:', !!SpeechRecognition);

// Check microphone permission
navigator.permissions.query({ name: 'microphone' }).then(result => {
  console.log('Microphone permission:', result.state);
});
```

## Questions?

- Web Speech API Docs: https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API
- Browser Support: https://caniuse.com/speech-recognition
