import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import { useTheme } from "../ThemeContext";
import paraData from "../data/paraData.json";
import surahData from "../data/surahData.json";
import bookmarkData from "../data/bookmarkData.json";

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState("para");
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [pageQuery, setPageQuery] = useState("");

  const tabs = ["para", "surah", "bookmark"];
  const [currentTabIndex, setCurrentTabIndex] = useState(0);

  const getCurrentData = () => {
    switch (activeTab) {
      case "para":
        return paraData;
      case "surah":
        return surahData;
      case "bookmark":
        return bookmarkData;
      default:
        return paraData;
    }
  };

  // helper: find para (juz) number for a given page by matching nearest lower-or-equal page
  const findParaForPage = (page) => {
    if (!paraData || !Array.isArray(paraData)) return null;
    // assume paraData entries are sorted by page asc
    let para = null;
    for (let i = 0; i < paraData.length; i++) {
      const p = paraData[i];
      if (page >= p.page) {
        para = p;
      } else {
        break;
      }
    }
    return para ? para.id : null;
  };

  const switchToTab = (index) => {
    if (index >= 0 && index < tabs.length) {
      setCurrentTabIndex(index);
      setActiveTab(tabs[index]);
    }
  };

  const onGestureEvent = (event) => {
    // Store the translation for later use
    const { translationX } = event.nativeEvent;
    // You can add visual feedback here if needed
  };

  const onHandlerStateChange = (event) => {
    const { translationX, state } = event.nativeEvent;

    if (state === State.END) {
      const swipeThreshold = 50; // Minimum distance for swipe

      if (translationX > swipeThreshold) {
        // Swipe right - go to previous tab
        switchToTab(currentTabIndex - 1);
      } else if (translationX < -swipeThreshold) {
        // Swipe left - go to next tab
        switchToTab(currentTabIndex + 1);
      }
    }
  };

  const renderItem = ({ item }) => {
    const isBookmark = activeTab === "bookmark";
    const paraId = isBookmark ? findParaForPage(item.page) : null;
    const labelText = isBookmark
      ? `Page: ${item.page}${paraId ? ` , Para: ${paraId}` : ""}`
      : `Page No : ${item.page}`;

    return (
      <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
        <View style={styles.leftIcons}>
          <TouchableOpacity
            style={[
              styles.iconButton,
              isBookmark
                ? { backgroundColor: theme.primary }
                : { backgroundColor: theme.iconBackground },
            ]}
            onPress={() => {
              if (isBookmark) {
                // placeholder for delete/remove action for bookmark
                console.log("remove bookmark", item.id);
              }
            }}
          >
            <MaterialIcons
              name={isBookmark ? "remove" : "menu-book"}
              size={24}
              color={isBookmark ? theme.textLight : theme.primary}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.middle}>
          <Text
            style={[
              isBookmark ? styles.bookmarkLabel : styles.pageLabel,
              isBookmark
                ? { borderColor: "#000", borderWidth: StyleSheet.hairlineWidth }
                : {
                    backgroundColor: theme.pageLabelBackground,
                    color: theme.textDark,
                  },
            ]}
          >
            {labelText}
          </Text>
        </View>

        <View style={styles.rightWrapper}>
          <View style={styles.rightColumn}>
            <Text style={[styles.arabic, { color: theme.arabicText }]}>
              {item.arabic}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.badgePill,
            { backgroundColor: theme.accent },
            isBookmark ? styles.bookmarkRibbon : {},
          ]}
        >
          <Text style={[styles.badgeText, { color: theme.textLight }]}>
            {item.id}
          </Text>
        </View>
      </View>
    );
  };

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
        <TouchableOpacity
          style={[
            styles.menuButton,
            { backgroundColor: theme.cardBackground, marginRight: 12 },
          ]}
          onPress={() => navigation.openDrawer()}
        >
          <MaterialIcons name="menu" size={20} color={theme.textDark} />
        </TouchableOpacity>

        <View>
          <Text style={[styles.appTitle, { color: theme.textPrimary }]}>
            Quran Majeed
          </Text>
          <Text style={[styles.appSubtitle, { color: theme.textSecondary }]}>
            Read & Explore
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.searchButton,
            { backgroundColor: theme.cardBackground, marginLeft: 12 },
          ]}
          onPress={() => setShowSearchInput((s) => !s)}
        >
          <MaterialIcons name="search" size={20} color={theme.textDark} />
        </TouchableOpacity>
      </View>

      {/* Search modal popup */}
      <Modal
        visible={showSearchInput}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSearchInput(false)}
      >
        <TouchableWithoutFeedback
          onPress={() => {
            Keyboard.dismiss();
            setShowSearchInput(false);
          }}
        >
          <View style={styles.modalBackdrop}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View
                style={[
                  styles.modalCard,
                  { backgroundColor: theme.cardBackground },
                ]}
              >
                <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
                  Go to Page
                </Text>
                <TextInput
                  value={pageQuery}
                  onChangeText={setPageQuery}
                  placeholder="Enter page number"
                  placeholderTextColor={theme.textSecondary}
                  keyboardType="numeric"
                  style={[styles.modalInput, { color: theme.textDark }]}
                />
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[
                      styles.modalCancel,
                      { borderColor: theme.textSecondary },
                    ]}
                    onPress={() => setShowSearchInput(false)}
                  >
                    <Text
                      style={[
                        styles.modalCancelText,
                        { color: theme.textSecondary },
                      ]}
                    >
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalGo, { backgroundColor: theme.primary }]}
                    onPress={() => {
                      console.log("Go to page", pageQuery);
                      setShowSearchInput(false);
                    }}
                  >
                    <Text
                      style={[styles.modalGoText, { color: theme.textLight }]}
                    >
                      Go
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
        activeOffsetX={[-10, 10]} // Only activate for horizontal movement
        failOffsetY={[-20, 20]} // Fail if vertical movement exceeds this
      >
        <View style={{ flex: 1 }}>
          <View style={styles.tabsRow}>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === "para" && styles.activeTab,
                {
                  backgroundColor:
                    activeTab === "para" ? theme.primary : theme.iconBackground,
                },
              ]}
              onPress={() => {
                setActiveTab("para");
                setCurrentTabIndex(0);
              }}
            >
              <Text
                style={[
                  styles.tabText,
                  {
                    color:
                      activeTab === "para" ? theme.textLight : theme.textDark,
                  },
                ]}
              >
                Para
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === "surah" && styles.activeTab,
                {
                  backgroundColor:
                    activeTab === "surah"
                      ? theme.primary
                      : theme.iconBackground,
                },
              ]}
              onPress={() => {
                setActiveTab("surah");
                setCurrentTabIndex(1);
              }}
            >
              <Text
                style={[
                  styles.tabText,
                  {
                    color:
                      activeTab === "surah" ? theme.textLight : theme.textDark,
                  },
                ]}
              >
                Surah
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === "bookmark" && styles.activeTab,
                {
                  backgroundColor:
                    activeTab === "bookmark"
                      ? theme.primary
                      : theme.iconBackground,
                },
              ]}
              onPress={() => {
                setActiveTab("bookmark");
                setCurrentTabIndex(2);
              }}
            >
              <Text
                style={[
                  styles.tabText,
                  {
                    color:
                      activeTab === "bookmark"
                        ? theme.textLight
                        : theme.textDark,
                  },
                ]}
              >
                Bookmark
              </Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={getCurrentData()}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={{ padding: 12 }}
          />
        </View>
      </PanGestureHandler>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f6f9f4" },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  appTitle: { fontSize: 22, fontWeight: "700", color: "#1b5e20" },
  appSubtitle: { fontSize: 12, color: "#556b2f", marginTop: 2 },
  headerActions: { flexDirection: "row", alignItems: "center" },
  menuButton: {
    backgroundColor: "#fff",
    padding: 8,
    borderRadius: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    marginLeft: 8,
  },
  themeButton: {
    padding: 6,
    borderRadius: 8,
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  themeButtonText: { color: "#fff", fontWeight: "700", fontSize: 12 },
  searchButton: {
    backgroundColor: "#fff",
    padding: 8,
    borderRadius: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  tabsRow: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingBottom: 10,
    justifyContent: "space-between",
  },
  tab: {
    backgroundColor: "#e9f5ec",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    minWidth: 100,
    alignItems: "center",
    marginHorizontal: 4,
  },
  activeTab: { backgroundColor: "#2e7d32" },
  tabText: { color: "#0b2e13", fontWeight: "600", fontSize: 16 },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    marginBottom: 12,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    position: "relative",
    overflow: "hidden",
  },
  leftIcons: { width: 56, alignItems: "center" },
  iconButton: {
    backgroundColor: "#f1fbf3",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  middle: { flex: 1 },
  pageLabel: {
    borderWidth: 0,
    color: "#2b2b2b",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignSelf: "flex-start",
    backgroundColor: "#f7fff8",
    fontWeight: "600",
  },
  rightWrapper: {
    flex: 0.6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingRight: 48, // reserve space inside the card for the pill
  },
  rightColumn: { alignItems: "flex-end", paddingRight: 8 },
  arabic: {
    fontSize: 22,
    lineHeight: 28,
    textAlign: "right",
    writingDirection: "rtl",
    marginBottom: 0,
    fontFamily: "NotoNaskhArabic",
    color: "#123e1a",
  },
  badgePill: {
    backgroundColor: "#f0b23a",
    minWidth: 36,
    height: 36,
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    right: 12,
    bottom: 12,
    elevation: 4,
  },
  badgeText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  bookmarkLabel: {
    borderWidth: 1,
    borderColor: "#000",
    color: "#2b2b2b",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 18,
    alignSelf: "center",
    backgroundColor: "#fff",
    fontWeight: "600",
  },
  bookmarkRibbon: {
    right: 6,
    top: 12,
    bottom: "auto",
    height: 44,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    borderTopRightRadius: 18,
    borderBottomRightRadius: 18,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(0,0,0,0.06)",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  searchLabel: { fontSize: 14, fontWeight: "600", marginRight: 8 },
  searchInputWrap: { flex: 1, marginRight: 8 },
  searchInput: {
    backgroundColor: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    fontSize: 14,
  },
  goButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  goButtonText: { fontWeight: "700" },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 12,
    padding: 18,
    elevation: 8,
  },
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
  modalInput: {
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 12,
  },
  modalActions: { flexDirection: "row", justifyContent: "flex-end" },
  modalCancel: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 8,
  },
  modalCancelText: { fontWeight: "600" },
  modalGo: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8 },
  modalGoText: { fontWeight: "700" },
});
