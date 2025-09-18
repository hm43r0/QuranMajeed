import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useTheme } from "../ThemeContext";
import { themes } from "../themes";

export default function SettingsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { theme, currentTheme, setCurrentTheme } = useTheme();

  const themeOptions = [
    { key: "green", label: "Green Theme", color: themes.green.primary },
    { key: "red", label: "Red Theme", color: themes.red.primary },
    { key: "orange", label: "Orange Theme", color: themes.orange.primary },
  ];

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor: theme.background,
        },
      ]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>
          Settings
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          Choose Theme
        </Text>
        {themeOptions.map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.themeOption,
              {
                backgroundColor: theme.cardBackground,
                borderColor:
                  currentTheme === option.key
                    ? option.color
                    : theme.iconBackground,
                borderWidth: currentTheme === option.key ? 2 : 1,
              },
            ]}
            onPress={() => setCurrentTheme(option.key)}
          >
            <View
              style={[styles.colorIndicator, { backgroundColor: option.color }]}
            />
            <Text style={[styles.optionText, { color: theme.textDark }]}>
              {option.label}
            </Text>
            {currentTheme === option.key && (
              <Text style={[styles.selectedText, { color: option.color }]}>
                ✓
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  title: { fontSize: 24, fontWeight: "700" },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: "600", marginBottom: 12 },
  themeOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  colorIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 12,
  },
  optionText: { flex: 1, fontSize: 16 },
  selectedText: { fontSize: 18, fontWeight: "700" },
});
