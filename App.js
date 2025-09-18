import { StatusBar } from "expo-status-bar";
import React from "react";
import { StyleSheet } from "react-native";
import * as Font from "expo-font";
import AppLoading from "expo-app-loading";
import { NavigationContainer } from "@react-navigation/native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider } from "./src/ThemeContext";
import HomeScreen from "./src/screens/HomeScreen";
import SettingsScreen from "./src/screens/SettingsScreen";
import { Amiri_400Regular } from "@expo-google-fonts/amiri";

const Drawer = createDrawerNavigator();

export default function App() {
  const [fontsLoaded, setFontsLoaded] = React.useState(false);

  React.useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync({
          Amiri: Amiri_400Regular,
        });
      } catch (e) {
        console.warn("Error loading fonts", e);
      } finally {
        setFontsLoaded(true);
      }
    }
    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return <AppLoading />;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <NavigationContainer>
          <Drawer.Navigator
            initialRouteName="Home"
            screenOptions={{
              headerShown: false,
            }}
          >
            <Drawer.Screen name="Home" component={HomeScreen} />
            <Drawer.Screen name="Settings" component={SettingsScreen} />
          </Drawer.Navigator>
        </NavigationContainer>
        <StatusBar style="light" />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  appBackground: { flex: 1, backgroundColor: "#f6f9f4" },
});
