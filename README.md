# Collecti - Final Year Project Submission

Jessica Malek  
BSc(Eng) Creative Computing  
Supervisor: Paulo Rauber  

# Running the Project

## 📲 Option 1: APK Installation (Recommended)
Instant download: [_**HERE**_](https://github.com/jmalekx/collecti/releases/download/v1.0.0/collecti-release.apk)

This is the fastest way to view the application.  
The APK for Android can also be downloaded in the [**Releases**](https://github.com/jmalekx/collecti/releases/tag/v1.0.0) section.  
You can use an Android device or emulator like Android Studio to install and run the APK.
 ### Once downloaded:
1. Download directly from link onto the device, or transfer the `.apk` file to an Android device.
2. Ensure "Install from unknown sources" is enabled in settings. ([How to enable](https://www.appaloosa.io/blog/guides/how-to-install-apps-from-unknown-sources-in-android))
3. Open file to install, and then run Collecti.

## 🛠️ Option 2: Running Locally from Source Code

### Prerequisites
- [Node.js](https://nodejs.org/) (v14+) 
- [Expo CLI](https://docs.expo.dev/get-started/installation/) (`npm install -g expo-cli`)
- Android Device or Emulator (e.g. [Android Studio](https://developer.android.com/studio))
- Git

### Installation
1. Clone this repository
    ```bash
   git clone https://github.com/jmalekx/collecti.git
   cd collecti
   ```
2. Install dependencies
   ```bash
   npm install
   ```
4. Run the server
   ```bash
   npx react-native run-android
   ```
If you encounter any issues with dependencies or versions, ensure that the versions in `package.json` align with the libraries you're using, or consider deleting `node_modules` and running `npm install` again.

